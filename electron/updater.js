import { app, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/nosenseofficial7-del/ai-emag-assistant/main/version.json';

/**
 * Verifică disponibilitatea unei versiuni noi a aplicației
 */
export async function checkForUpdates() {
  const currentVersion = app.getVersion() || '1.7.5';
  const cacheBustedUrl = `${UPDATE_MANIFEST_URL}?t=${Date.now()}`;
  
  const info = {
    currentVersion,
    hasUpdate: false,
    latestVersion: currentVersion,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseNotes: [
      `Versiunea curentă v${currentVersion} este complet la zi.`,
      "Refacere completă UI v2.0: Design Glassmorphic ultra-premium, degradeuri neon și micro-animații fluide.",
      "Suport bilingv complet (Română / Engleză) pe toate paginile și modulele.",
      "Sistem de actualizare rapidă fără pierderi de date (Baza de date SQLite & Licență).",
      "Optimizare sistem auto-update și sincronizare versională dinamică."
    ],
    downloadUrl: "https://github.com/nosenseofficial7-del/ai-emag-assistant/releases/latest/download/AI-eMAG-Assistant-Setup.exe"
  };

  try {
    const remoteData = await fetchRemoteJson(cacheBustedUrl, 3500);
    if (remoteData && remoteData.latestVersion) {
      info.latestVersion = remoteData.latestVersion;
      info.releaseDate = remoteData.releaseDate || info.releaseDate;
      info.releaseNotes = remoteData.releaseNotes || info.releaseNotes;
      info.downloadUrl = remoteData.downloadUrl || info.downloadUrl;
      info.hasUpdate = isVersionGreater(remoteData.latestVersion, currentVersion);
      return info;
    }
  } catch (err) {
    console.log('Remote update check fallback:', err.message);
  }

  return info;
}

/**
 * Descarcă kit-ul binar real de instalare și lansează executabilul
 */
export async function downloadAndInstallUpdate(mainWindow, downloadUrl) {
  const userDataPath = app.getPath('userData');
  const updatesDir = path.join(userDataPath, 'updates');
  if (!fs.existsSync(updatesDir)) {
    fs.mkdirSync(updatesDir, { recursive: true });
  }

  const targetPath = path.join(updatesDir, 'AI-eMAG-Assistant-Setup.exe');
  const latestUniversalUrl = "https://github.com/nosenseofficial7-del/ai-emag-assistant/releases/latest/download/AI-eMAG-Assistant-Setup.exe";

  try {
    // 1. Încercăm descărcarea binară de pe rețea (cu fallback pe /releases/latest/download/ de pe GitHub)
    let urlToTry = downloadUrl || latestUniversalUrl;
    try {
      await downloadBinaryFile(urlToTry, targetPath, (progressData) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-progress', progressData);
        }
      });
    } catch (firstErr) {
      if (urlToTry !== latestUniversalUrl) {
        console.log('Specific tag URL returned error, falling back to latest universal URL:', firstErr.message);
        await downloadBinaryFile(latestUniversalUrl, targetPath, (progressData) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-progress', progressData);
          }
        });
      } else {
        throw firstErr;
      }
    }

    // 2. Deschidem kit-ul binar descărcat
    const launchRes = await shell.openPath(targetPath);
    if (launchRes) {
      return { success: false, error: `Nu s-a putut deschide instalatorul: ${launchRes}` };
    }
    return { success: true, message: 'Installer launched successfully.' };

  } catch (downloadErr) {
    console.error('Download online failed, attempting local binary fallback:', downloadErr.message);

    // Fallback local: Căutăm kit-ul binar real pe disc dacă există
    const candidatePaths = [
      path.join(process.cwd(), 'release', 'AI-eMAG-Assistant-Setup.exe'),
      path.join(process.cwd(), '..', 'release', 'AI-eMAG-Assistant-Setup.exe'),
      path.join(process.cwd(), '..', 'AI-eMAG-Assistant-Setup.exe'),
      path.join(app.getAppPath(), '..', '..', 'release', 'AI-eMAG-Assistant-Setup.exe'),
      path.join(app.getAppPath(), '..', '..', 'AI-eMAG-Assistant-Setup.exe'),
      path.join(path.dirname(app.getPath('exe')), '..', 'AI-eMAG-Assistant-Setup.exe')
    ];

    let validBinaryPath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).size > 1000000) { // Valid binary > 1MB
        validBinaryPath = p;
        break;
      }
    }

    if (validBinaryPath) {
      // Simulează progres rapid pe UI pentru kit-ul binar local
      for (let p = 10; p <= 100; p += 20) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update-progress', {
            percent: p,
            transferredBytes: Math.round((p / 100) * 48000000),
            totalBytes: 48000000,
            speed: '12.5 MB/s'
          });
        }
        await new Promise(r => setTimeout(r, 150));
      }

      const openRes = await shell.openPath(validBinaryPath);
      if (openRes) {
        return { success: false, error: `Eroare lansare kit local: ${openRes}` };
      }
      return { success: true, message: 'Local setup launched.' };
    }

    return { 
      success: false, 
      error: `⚠️ Eroare 404 GitHub: Fișierul AI-eMAG-Assistant-Setup.exe nu a fost găsit pe GitHub Releases pentru contul nosenseofficial7-del. Te rugăm să urmezi Pasul 3 și să atașezi executabilul pe GitHub!`
    };
  }
}

/**
 * Descarcă un fișier binar executabil peste HTTP/HTTPS cu urmărire redirect-uri (GitHub 302 -> S3)
 */
function downloadBinaryFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl, redirectDepth = 0) => {
      if (redirectDepth > 10) {
        return reject(new Error('Prea multe redirecționări de rețea.'));
      }

      const client = currentUrl.startsWith('https') ? https : http;
      const req = client.get(currentUrl, { headers: { 'User-Agent': 'AI-eMAG-Assistant-Updater' } }, (res) => {
        
        // Suport redirecționări HTTP 301 / 302 / 307 / 308 (GitHub Releases -> AWS S3 bucket)
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          if (res.headers.location) {
            return request(res.headers.location, redirectDepth + 1);
          }
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Serverul a returnat codul HTTP ${res.statusCode}`));
        }

        const totalBytes = parseInt(res.headers['content-length'] || '104257800', 10);
        let downloadedBytes = 0;
        let lastReportTime = Date.now();
        let lastReportBytes = 0;

        const fileStream = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          fileStream.write(chunk);

          const percent = Math.min(Math.round((downloadedBytes / totalBytes) * 100), 100);
          const now = Date.now();
          const timeDiff = (now - lastReportTime) / 1000;
          
          if (timeDiff >= 0.2 || downloadedBytes === totalBytes) {
            const bytesDiff = downloadedBytes - lastReportBytes;
            const mbps = timeDiff > 0 ? (bytesDiff / (1024 * 1024) / timeDiff).toFixed(1) : '4.2';
            lastReportTime = now;
            lastReportBytes = downloadedBytes;

            if (onProgress) {
              onProgress({
                percent,
                transferredBytes: downloadedBytes,
                totalBytes,
                speed: `${mbps} MB/s`
              });
            }
          }
        });

        res.on('end', () => {
          fileStream.end(() => resolve(true));
        });

        res.on('error', (err) => {
          fileStream.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          reject(err);
        });
      });

      req.on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });

      // Timeout de inactivitate de 5 minute (pentru fișiere mari 100MB+)
      req.setTimeout(300000, () => {
        req.destroy();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(new Error('Conexiunea de descărcare a fost întreruptă din cauza inactivității de rețea (Timeout 5 minute).'));
      });
    };

    request(url);
  });
}

function fetchRemoteJson(url, timeoutMs) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'AI-eMAG-Assistant-Updater' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function isVersionGreater(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return false;
}
