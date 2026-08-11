import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OWNER = 'nosenseofficial7-del';
const REPO = 'ai-emag-assistant';

const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.error('\n❌ EROARE: Lipsește GitHub Token!');
  process.exit(1);
}

const headers = {
  'User-Agent': 'AI-eMAG-Assistant-Publisher',
  'Authorization': `token ${token}`,
  'Accept': 'application/vnd.github.v3+json'
};

async function httpRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { ...headers, ...(options.headers || {}) }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (bodyData) {
      if (Buffer.isBuffer(bodyData)) {
        req.write(bodyData);
      } else if (typeof bodyData === 'string') {
        req.write(bodyData);
      } else {
        req.write(JSON.stringify(bodyData));
      }
    }
    req.end();
  });
}

async function uploadReleaseAsset(releaseId, uploadUrl, filePath) {
  const fileName = path.basename(filePath);
  const fileStats = fs.statSync(filePath);
  const fileStream = fs.readFileSync(filePath);

  // Verificăm dacă există deja asset cu acest nume pe release și îl ștergem
  if (releaseId) {
    const assetsRes = await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}/assets`);
    if (assetsRes.statusCode === 200 && Array.isArray(assetsRes.body)) {
      const existingAsset = assetsRes.body.find(a => a.name === fileName);
      if (existingAsset) {
        console.log(`🗑️ Ștergere asset vechi (ID: ${existingAsset.id})...`);
        await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${existingAsset.id}`, { method: 'DELETE' });
      }
    }
  }

  const cleanUploadUrl = uploadUrl.replace(/\{.*?\}$/, `?name=${encodeURIComponent(fileName)}`);
  console.log(`⏳ Se încarcă ${fileName} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB) pe GitHub Release...`);

  const assetHeaders = {
    'Content-Type': 'application/octet-stream',
    'Content-Length': fileStats.size
  };

  const res = await httpRequest(cleanUploadUrl, { method: 'POST', headers: assetHeaders }, fileStream);
  if (res.statusCode === 201) {
    console.log(`✅ ${fileName} a fost încărcat cu succes pe GitHub Release!`);
  } else {
    console.error(`❌ Eroare la încărcare asset (${res.statusCode}):`, res.body || res.raw);
  }
}

async function main() {
  try {
    const versionPath = path.join(projectRoot, 'version.json');
    const versionJsonStr = fs.readFileSync(versionPath, 'utf8');
    const versionData = JSON.parse(versionJsonStr);
    const versionTag = `v${versionData.latestVersion}`;

    console.log(`🚀 Pornire publicare automată GitHub pentru versiunea ${versionTag}...`);

    console.log(`\n1. Verificare versiune curentă pe GitHub (${OWNER}/${REPO})...`);
    const getContentRes = await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/contents/version.json`);
    
    let sha = null;
    if (getContentRes.statusCode === 200) {
      sha = getContentRes.body.sha;
    }

    console.log(`\n2. Actualizare version.json pe GitHub branch 'main'...`);
    const updateContentRes = await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/contents/version.json`, {
      method: 'PUT'
    }, {
      message: `release: bump version to ${versionTag}`,
      content: Buffer.from(versionJsonStr).toString('base64'),
      sha: sha || undefined
    });

    if (updateContentRes.statusCode === 200 || updateContentRes.statusCode === 201) {
      console.log(`✅ version.json actualizat cu succes pe GitHub!`);
    }

    console.log(`\n3. Creare/Preluare Release nou GitHub: ${versionTag}...`);
    const releaseRes = await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST'
    }, {
      tag_name: versionTag,
      target_commitish: 'main',
      name: `AI eMAG Assistant ${versionTag}`,
      body: `## What's Changed in ${versionTag}\n\n• ` + (versionData.releaseNotes || []).join('\n• '),
      draft: false,
      prerelease: false,
      make_latest: "true"
    });

    let uploadUrl = null;
    let releaseId = null;

    if (releaseRes.statusCode === 201) {
      console.log(`✅ GitHub Release ${versionTag} creat cu succes!`);
      uploadUrl = releaseRes.body.upload_url;
      releaseId = releaseRes.body.id;
    } else if (releaseRes.statusCode === 422) {
      const getReleaseRes = await httpRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${versionTag}`);
      if (getReleaseRes.statusCode === 200) {
        uploadUrl = getReleaseRes.body.upload_url;
        releaseId = getReleaseRes.body.id;
      }
    }

    if (uploadUrl) {
      const exePath = path.join(projectRoot, 'release', 'AI-eMAG-Assistant-Setup.exe');
      if (fs.existsSync(exePath)) {
        await uploadReleaseAsset(releaseId, uploadUrl, exePath);
      }
    }

    console.log(`\n🎉 Publicare finalizată! Aplicația este gata pentru Auto-Update direct din versiunea ${versionTag}.\n`);
  } catch (err) {
    console.error('❌ Eroare neașteptată:', err);
  }
}

main();
