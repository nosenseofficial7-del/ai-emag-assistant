import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Manual Oficial de Utilizare - AI eMAG Assistant v1.7.5</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }

    /* Primary Accent Color & Headings */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    h1 {
      font-size: 20pt;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 8px;
      margin-top: 28px;
      color: #1e3a8a;
    }

    h2 {
      font-size: 15pt;
      border-left: 4px solid #10b981;
      padding-left: 10px;
      color: #0f766e;
      margin-top: 20px;
    }

    h3 {
      font-size: 12pt;
      color: #334155;
    }

    p {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: justify;
    }

    /* Cover Page Styling */
    .cover-container {
      height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-sizing: border-box;
      page-break-after: always;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 900;
      margin-bottom: 10px;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 16pt;
      color: #38bdf8;
      margin-bottom: 30px;
      font-weight: 600;
    }

    .cover-badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 40px;
    }

    .cover-footer {
      margin-top: auto;
      font-size: 10pt;
      color: #94a3b8;
    }

    /* Step Card Badges */
    .step-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .step-title {
      font-weight: 800;
      font-size: 11pt;
      color: #1e40af;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
    }

    .step-badge {
      background: #2563eb;
      color: #ffffff;
      font-size: 9pt;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 8px;
    }

    /* Tip & Alert Boxes */
    .alert-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 14px 0;
      font-size: 10pt;
    }

    .alert-box.success {
      background: #ecfdf5;
      border-color: #a7f3d0;
      border-left-color: #10b981;
    }

    .alert-box.warning {
      background: #fffbeb;
      border-color: #fde68a;
      border-left-color: #f59e0b;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Table of Contents */
    .toc-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 25px;
      margin-bottom: 30px;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #cbd5e1;
      padding: 8px 0;
      font-size: 11pt;
    }

    .toc-title {
      font-weight: 600;
      color: #0f172a;
    }

    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 9.5pt;
    }
  </style>
</head>
<body>

  <!-- COPERTĂ OFICIALĂ -->
  <div class="cover-container">
    <div style="font-size: 48pt; margin-bottom: 15px;">🚀</div>
    <div class="cover-title">AI eMAG Assistant</div>
    <div class="cover-subtitle">Manual Oficial de Utilizare Pas cu Pas</div>
    <div class="cover-badge">VERSIUNEA v1.7.5 • ENTERPRISE EDITION v2.0</div>
    
    <div style="max-width: 500px; text-align: center; color: #cbd5e1; font-size: 11pt; line-height: 1.6; margin-bottom: 50px;">
      Ghidul complet și detaliat pentru configurarea sistemului de Inteligență Artificială, conectarea la eMAG Marketplace, vânătoarea de produse B2B și simularea marjelor de profit.
    </div>

    <div class="cover-footer">
      NoSense Enterprise Software © 2026 • Toate drepturile rezervate
    </div>
  </div>

  <!-- CUPRINS -->
  <h1>📋 Cuprinsul Manualului</h1>
  <div class="toc-container">
    <ul class="toc-list">
      <li class="toc-item">
        <span class="toc-title">Capitolul 1: Activarea Licenței & Pornirea Aplicației</span>
        <span>Pagina 2</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 2: Configurare AI Google Gemini (Cheie API & Model)</span>
        <span>Pagina 2</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 3: Conectarea la eMAG Marketplace Partner API</span>
        <span>Pagina 3</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 4: Căutare Live Online B2B & Ordonare "Cheapest First"</span>
        <span>Pagina 4</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 5: Comparare Directă (🟢 Furnizor vs 🔴 eMAG)</span>
        <span>Pagina 4</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 6: Asistentul AI Chat RAG & Comenzi Conversaționale</span>
        <span>Pagina 5</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 7: Calculatorul Financiar & Comisioanele eMAG</span>
        <span>Pagina 6</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 8: Import Universal Excel / CSV & Export eMAG</span>
        <span>Pagina 6</span>
      </li>
      <li class="toc-item">
        <span class="toc-title">Capitolul 9: Centrul de Actualizări Sistem (Check for Updates)</span>
        <span>Pagina 7</span>
      </li>
    </ul>
  </div>

  <!-- CAPITOLUL 1 -->
  <h1>Capitolul 1: Activarea Licenței & Pornirea Aplicației</h1>
  <p>
    La prima deschidere a aplicației <strong>AI eMAG Assistant</strong>, sistemul va afișa un ecran futurist de încărcare (Splash Screen) urmat de ecranul securizat de introducere a cheii de activare.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Introducerea Codului de Activare NoSense 2026</div>
    Tastează codul de activare din 16 caractere în caseta dedicată. Formatul este automat structurat în 4 grupuri de câte 4 caractere (ex: <code>XXXX-XXXX-XXXX-XXXX</code>).
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Salvarea & Validarea Criptografică</div>
    Apasă pe butonul <strong>"Validează și Activează"</strong>. Licența este verificată offline prin algoritmul securizat HMAC-SHA256 și salvată permanent în baza de date locală SQLite.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Resetarea sau Schimbarea Licenței (Opțional)</div>
    Dacă dorești vreodată să schimbi licența sau să o introduci din nou, mergi în pagina <strong>Setări</strong> și apasă pe butonul roșu <code>🔑 Resetează / Solicită Licență Nouă</code>.
  </div>

  <!-- CAPITOLUL 2 -->
  <h1>Capitolul 2: Configurare AI Google Gemini (Cheie API & Model)</h1>
  <p>
    Pentru a beneficia de analiza inteligentă a produselor, traducerea interogărilor în limbaj SQL și conversația RAG, este necesară configurarea unei chei API gratuite de la Google.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Obținerea Cheii API Google Gemini Gratuită</div>
    1. Deschide browserul și accesează site-ul oficial Google AI Studio: <code>https://aistudio.google.com</code>.<br>
    2. Autentifică-te cu contul tău Google (Gmail).<br>
    3. Apasă pe butonul albastru <strong>"Get API key"</strong> și apoi pe <strong>"Create API key"</strong>.<br>
    4. Copiază codul generat (începe cu <code>AIzaSy...</code>).
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Salvarea Cheii în Setările Aplicației</div>
    În aplicație, accesează meniul din stânga <strong>Setări</strong> ➔ secțiunea <strong>"Setări Asistent AI (Faza 2 RAG)"</strong>.<br>
    Inserați cheia în câmpul <code>Cheie API (API Key)</code>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Selectarea Modelului AI Potrivit</div>
    Alege versiunea de model dorită din lista derulantă:
    <table>
      <thead>
        <tr>
          <th>Model AI Gemini</th>
          <th>Recomandare & Viteze</th>
          <th>Când să îl folosești</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Gemini 2.5 Flash</strong></td>
          <td>⚡ Recomandat • Ultra-Rapid (0.3s)</td>
          <td>Căutări live B2B, analiză rapidă și chat zilnic.</td>
        </tr>
        <tr>
          <td><strong>Gemini 1.5 Flash</strong></td>
          <td>⚖️ Balansat (0.6s)</td>
          <td>Volum mediu de produse și simulări.</td>
        </tr>
        <tr>
          <td><strong>Gemini 1.5 Pro</strong></td>
          <td>🧠 Gândire Complexă (1.5s)</td>
          <td>Analiza detaliată a cataloagelor uriașe Excel.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="alert-box success">
    <strong>💡 Persistență Dublă Garantată:</strong> Cheia API și versiunea selectată sunt salvate sincronizat atât în baza SQLite cât și în LocalStorage, astfel încât opțiunile tale nu se resetează niciodată!
  </div>

  <!-- CAPITOLUL 3 -->
  <h1>Capitolul 3: Conectarea la eMAG Marketplace Partner API</h1>
  <p>
    Conectarea la contul eMAG Marketplace îți permite să sincronizezi direct inventarul tău, să verifici prețurile curente și să calculezi comisioanele exacte pe categorie.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Obținerea Datelor de Conectare din eMAG Partner</div>
    Autentifică-te în platforma eMAG Marketplace Partner (<code>marketplace.emag.ro</code>) ➔ mergi la <strong>Setări Cont</strong> ➔ <strong>eMAG API Access</strong>. Notă numele de utilizator și parola oferite de eMAG.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Introducerea Datelor în Aplicație</div>
    Accesează meniul <strong>Setări</strong> ➔ secțiunea <strong>"Setări Conectare eMAG Marketplace Partner API"</strong>:<br>
    • <code>Username eMAG API</code>: Introdu numele de utilizator eMAG.<br>
    • <code>Parolă eMAG API</code>: Introdu parola de acces API.<br>
    • <code>URL API eMAG</code>: Păstrează valoarea implicită <code>https://marketplace-api.emag.ro/api-3</code>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Testarea Conexiunii Live</div>
    Apasă pe butonul <strong>"🔍 Verifică Conexiune eMAG"</strong>. Aplicația va efectua un ping securizat și va afișa mesajul verde <code>Conexiune eMAG Partner reușită! Mod: ONLINE</code>.
  </div>

  <!-- CAPITOLUL 4 -->
  <h1>Capitolul 4: Căutare Live Online B2B & Ordonare "Cheapest First"</h1>
  <p>
    Modulul <strong>Product Hunter (Vânătoare de Oportunități)</strong> scanează automat în timp real site-urile furnizorilor B2B parteneri (Maxy B2B, Verk Wholesale, Eany Dropship).
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Selectarea Modului de Căutare</div>
    Accesează meniul <strong>Product Hunter</strong> din bara laterală stânga. Comută selectorul pe opțiunea 🌐 <strong>Vânătoare Live Online</strong> (pentru a căuta pe internet) sau 💾 <strong>Bază SQLite Locală</strong>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Introducerea Termenilor de Căutare</div>
    Tastează produsul dorit în bara de căutare (ex: <em>"lămpi led monitor"</em>, <em>"organizatoare auto"</em>) și apasă pe butonul <strong>Căutare Live</strong>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Ordonare "Cheapest First" & Import la 1-Click</div>
    Rezultatele sunt ordonate automat crescător după cel mai mic preț de achiziție de pe internet. Pentru a adăuga un produs în catalogul tău personal, apasă pe butonul verde <strong>"+ Importă în Catalog"</strong>.
  </div>

  <!-- CAPITOLUL 5 -->
  <h1>Capitolul 5: Comparare Directă (🟢 Furnizor vs 🔴 eMAG)</h1>
  <p>
    Fiecare card de produs din aplicație conține butoane inteligente de comparare directă pentru verificarea ofertelor concurente și a prețului de la furnizor.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Vizualizarea Produsului la Furnizor</div>
    Apasă pe butonul 🟢 <strong>"Vezi la Furnizor"</strong>. Aplicația va deschide în browser pagina oficială a produsului pe site-ul B2B (Maxy, Verk sau Eany).
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Comparare Side-by-Side pe eMAG Marketplace</div>
    Apasă pe butonul alăturat 🔴 <strong>"Vezi pe eMAG"</strong>. Aplicația generează automat o căutare precisă pe eMAG după codul EAN sau denumirea exactă a produsului, garantând 0% erori 404.
  </div>

  <!-- CAPITOLUL 6 -->
  <h1>Capitolul 6: Asistentul AI Chat RAG & Comenzi Conversaționale</h1>
  <p>
    Asistentul AI este conectat live la baza ta de date SQLite și la internet, permițându-ți să adresezi întrebări în limba română despre stocuri, vânzări și furnizori.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Adresarea Întrebărilor Comerciale</div>
    Mergi la meniul <strong>AI Assistant</strong> ➔ introdu întrebarea în caseta de chat. Exemple de întrebări utile:
    <ul>
      <li><em>"Arată-mi produsele cu profit de peste 40 lei"</em></li>
      <li><em>"Care sunt cele mai bune 3 oportunități din categoria Auto?"</em></li>
      <li><em>"Caută live lămpi led monitor la furnizori"</em></li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Comanda "Mai Multe Te Rog"</div>
    Dacă răspunsul inițial conține doar 3-5 produse și dorești extinderea căutării, scrie pur și simplu <em>"mai multe te rog"</em>. AI-ul va aduce automat următorul lot de produse B2B.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Inspecția Interogării SQL</div>
    Sub fiecare răspuns oferit de AI, apasă pe butonul <code>>_ Vezi interogare SQLite rulată</code> pentru a vedea exact codul SQL generat de AI pe baza ta de date.
  </div>

  <!-- CAPITOLUL 7 -->
  <h1>Capitolul 7: Calculatorul Financiar & Comisioanele eMAG</h1>
  <p>
    Simulatorul financiar îți oferă previzualizarea exactă a profitului net în lei și a ratei ROI înainte de achiziția stocurilor.
  </p>

  <table>
    <thead>
      <tr>
        <th>Parametru Simulator</th>
        <th>Explicație & Valori Implicite</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Preț Achiziție (Fără TVA)</strong></td>
        <td>Prețul de cumpărare în lei de la furnizorul en-gros.</td>
      </tr>
      <tr>
        <td><strong>Preț Vânzare eMAG (Cu TVA)</strong></td>
        <td>Prețul la care intenționezi să listezi produsul pe eMAG.</td>
      </tr>
      <tr>
        <td><strong>Comision eMAG Marketplace (%)</strong></td>
        <td>Comisionul pe categorie (ex: Auto 16%, IT 14%, Home 18%).</td>
      </tr>
      <tr>
        <td><strong>Cost Logistică & Ambalaj</strong></td>
        <td>Costul estimativ de curierat și ambalare (implicit ~16.5 RON/buc).</td>
      </tr>
      <tr>
        <td><strong>Verdict AI Oportunitate</strong></td>
        <td>Scor între 0 și 100 cu verdicte clare: <code>CUMPĂRĂ</code> sau <code>FOARTE BUN</code>.</td>
      </tr>
    </tbody>
  </table>

  <!-- CAPITOLUL 8 -->
  <h1>Capitolul 8: Import Universal Excel / CSV & Export eMAG</h1>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Drag & Drop Fișiere Excel</div>
    Accesează meniul <strong>Import Excel/CSV</strong> ➔ trage fișierul primit de la furnizor în caseta dedicată.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Maparea Dinamică a Coloanelor</div>
    Asociază coloanele din Excel-ul tău cu câmpurile aplicației (SKU, EAN, Denumire Produs, Preț Achiziție) și apasă <strong>"Procesează Import"</strong>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 3</span> Exportul Catalogului Pregătit</div>
    Din pagina <strong>Produse</strong>, apasă pe <strong>"Exportă Excel eMAG"</strong> pentru a descărca fișierul Excel (.xlsx) pregătit pentru încărcare directă în eMAG Marketplace.
  </div>

  <!-- CAPITOLUL 9 -->
  <h1>Capitolul 9: Centrul de Actualizări Sistem (Check for Updates)</h1>
  <p>
    Aplicația include un sistem automat de actualizare într-un singur click conectat direct la repository-ul GitHub.
  </p>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 1</span> Verificarea Disponibilității</div>
    Apasă pe butonul de versiune din Header-ul de sus (ex: <code>v1.7.0</code>) sau mergi la <strong>Setări</strong> ➔ <strong>Centrul de Actualizări Sistem</strong>.
  </div>

  <div class="step-box">
    <div class="step-title"><span class="step-badge">PASUL 2</span> Instalare Automatizată la 1-Click</div>
    Apasă pe <strong>"🔍 Verifică Actualizări Acum"</strong> ➔ dacă există o versiune nouă pe GitHub, apasă pe <strong>"Descarcă & Instalează Actualizarea"</strong>. Pachetul se descarcă automat și lansează instalatorul.
  </div>

  <div class="alert-box success" style="margin-top: 30px; text-align: center;">
    🎉 <strong>Felicitări!</strong> Acum ești gata să utilizezi la potențial maxim aplicația <strong>AI eMAG Assistant v1.7.0</strong> pentru identificarea celor mai profitabile produse B2B!
  </div>

</body>
</html>
`;

// Save HTML temp file
const tempHtmlPath = path.join(projectRoot, 'release', 'temp_manual.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const outputPdfPath = path.join(projectRoot, 'release', 'Manual_Utilizare_AI_eMAG_Assistant.pdf');

console.log('Generating multi-page PDF user manual using headless MS Edge...');

// Locate msedge
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let edgePath = edgePaths.find(p => fs.existsSync(p));

if (!edgePath) {
  console.error('MS Edge executable not found. Cannot convert HTML to PDF.');
  process.exit(1);
}

try {
  const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${outputPdfPath}" --no-pdf-header-footer "${tempHtmlPath}"`;
  execSync(cmd);
  console.log(`PDF User Manual created successfully at: ${outputPdfPath}`);
  
  // Clean temp file
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
} catch (err) {
  console.error('Error generating PDF with MS Edge:', err.message);
  process.exit(1);
}
