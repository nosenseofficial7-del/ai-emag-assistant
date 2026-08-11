import https from 'https';
import http from 'http';
import { URL } from 'url';
import { getSettings, executeRawSql } from './database.js';

function mockLlmResponse(prompt) {
  // 1. Verificam daca este prompt-ul de traducere SQL
  if (prompt.includes('traducător de întrebări')) {
    const cleanQuery = prompt.toLowerCase();
    
    // Daca intrebarea este despre cautat produse, oportunitati, preturi mici, online, internet, produse noi sau recomandari:
    // Rulam INTOTDEAUNA un Live Online Sourcing pe o scala online mare!
    const isLocalStockQuery = cleanQuery.includes('reaprovizionez') || cleanQuery.includes('stocul meu') || cleanQuery.includes('portofoliul meu');
    
    if (!isLocalStockQuery && (
      cleanQuery.includes('caută') || cleanQuery.includes('cauta') ||
      cleanQuery.includes('găsește') || cleanQuery.includes('gaseste') ||
      cleanQuery.includes('sourcing') || cleanQuery.includes('online') ||
      cleanQuery.includes('internet') || cleanQuery.includes('produse') ||
      cleanQuery.includes('cumpara') || cleanQuery.includes('cumpăra') ||
      cleanQuery.includes('recomand') || cleanQuery.includes('oportunitat') ||
      cleanQuery.includes('scala') || cleanQuery.includes('lampa') ||
      cleanQuery.includes('casti') || cleanQuery.includes('auto') ||
      cleanQuery.includes('maxy') || cleanQuery.includes('verk') || cleanQuery.includes('eany')
    )) {
      let keyword = 'lampi led monitor';
      
      const match = cleanQuery.match(/(?:caută|cauta|găsește|gaseste|cerceteaza|arata|gaseste-mi|găsește-mi)\s+(?:live\s+)?(?:pe\s+internet\s+)?(?:pe\s+emag\s+)?([\s\S]+)/i);
      if (match && match[1]) {
        keyword = match[1].trim().replace(/^(pe\s+internet|pe\s+emag|produse|online)\s+/i, '');
      } else {
        const cleanText = cleanQuery.replace(/(cauta|cerceteaza|live|sourcing|produse|noi|online|internet|gaseste|găsește|arata|recomanda)/gi, '').trim();
        if (cleanText.length > 2) {
          keyword = cleanText;
        }
      }
      
      if (!keyword || keyword.length < 2) {
        keyword = 'organizatoare auto';
      }

      return JSON.stringify({
        action: "live_sourcing",
        query: keyword
      });
    }

    if (cleanQuery.includes('merită cumpărate') || cleanQuery.includes('recomandate') || cleanQuery.includes('verdict')) {
      return JSON.stringify({
        sql: "SELECT p.name, p.sku, r.opportunity_score, r.verdict FROM products p JOIN emag_research r ON p.id = r.product_id WHERE r.verdict IN ('CUMPĂRĂ', 'FOARTE BUN') ORDER BY r.opportunity_score DESC",
        explanation: "Selectăm produsele recomandate pentru achiziție cu verdict CUMPĂRĂ sau FOARTE BUN."
      });
    }

    if (cleanQuery.includes('auto sub 15') || cleanQuery.includes('auto')) {
      return JSON.stringify({
        sql: "SELECT p.name, p.sku, p.price_supplier FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE (p.category LIKE '%Auto%' OR p.name LIKE '%auto%') AND p.price_supplier < 7500",
        explanation: "Selectăm produsele din categoria Auto cu preț de achiziție sub 15 EUR (75.00 lei)."
      });
    }

    if (cleanQuery.includes('500 eur') || cleanQuery.includes('buget')) {
      return JSON.stringify({
        sql: "SELECT p.name, p.sku, p.price_supplier, r.opportunity_score FROM products p JOIN emag_research r ON p.id = r.product_id WHERE r.verdict IN ('CUMPĂRĂ', 'FOARTE BUN') ORDER BY r.opportunity_score DESC LIMIT 5",
        explanation: "Selectăm cele mai bune oportunități pentru a calcula o schemă de buget de 500 EUR."
      });
    }

    if (cleanQuery.includes('concurență') || cleanQuery.includes('competitie')) {
      return JSON.stringify({
        sql: "SELECT p.name, r.sellers_count, r.competition_level, r.competition_score FROM products p JOIN emag_research r ON p.id = r.product_id ORDER BY r.competition_score ASC LIMIT 5",
        explanation: "Afișăm produsele cu cea mai mică competiție înregistrată pe eMAG."
      });
    }

    if (cleanQuery.includes('profit peste 40') || cleanQuery.includes('40 lei')) {
      return JSON.stringify({
        sql: "SELECT p.name, p.sku, (COALESCE(r.price_med, CAST(p.price_supplier * 2.4 AS INT)) - p.price_supplier) as simple_diff FROM products p LEFT JOIN emag_research r ON p.id = r.product_id WHERE (COALESCE(r.price_med, CAST(p.price_supplier * 2.4 AS INT)) - p.price_supplier - 1650) > 4000",
        explanation: "Găsim produsele unde diferența dintre prețul eMAG și costul furnizorului depășește 40 RON, deducând estimativ costurile logistice."
      });
    }

    if (cleanQuery.includes('reaprovizionez') || cleanQuery.includes('stoc')) {
      return JSON.stringify({
        sql: "SELECT p.name, m.stock_qty, p.stock_supplier FROM my_portfolio m JOIN products p ON m.product_id = p.id WHERE m.stock_qty < 10",
        explanation: "Găsim produsele din portofoliul propriu cu stoc local sub limita de siguranță de 10 unități."
      });
    }

    return JSON.stringify({
      sql: "SELECT name, sku, price_supplier FROM products LIMIT 5",
      explanation: "Afișăm o listă de 5 produse generale din catalog ca fallback."
    });
  }

  // 2. Altfel, este prompt-ul de răspuns final
  if (prompt.includes('Rezultate SQL returnate')) {
    const resultsIdx = prompt.indexOf('Rezultate SQL returnate:');
    const resultsStr = prompt.substring(resultsIdx + 24, prompt.indexOf('Reguli:'));
    let results = [];
    try {
      results = JSON.parse(resultsStr.trim());
    } catch(e) {}

    if (prompt.includes('merită cumpărate')) {
      if (!results || results.length === 0) {
        return `Nu am găsit momentan produse în baza de date cu verdict CUMPĂRĂ sau FOARTE BUN. Poți folosi modulul **Product Hunter** pentru a găsi și importa noi oportunități en-gros!`;
      }
      return `Pe baza interogării în timp real a bazei de date SQLite, iată produsele recomandate:\n\n` +
             results.map((r, i) => `${i+1}. **${r.name}** (SKU: ${r.sku}) - Scor Oportunitate: **${r.opportunity_score}** | Verdict: \`${r.verdict}\``).join('\n') +
             `\n\nAceste produse au oportunități solide de marjă și competiție redusă în catalogul tău.`;
    }

    if (prompt.includes('auto sub 15')) {
      if (!results || results.length === 0) {
        return `Nu am găsit produse din categoria Auto cu preț de achiziție sub 15 EUR (75 lei) în baza locală.`;
      }
      return `Am găsit următoarele produse auto cu prețul de achiziție sub 15 EUR (75 lei):\n\n` +
             results.map(r => `* **${r.name}** (SKU: ${r.sku}) - Preț achiziție: **${(r.price_supplier/100).toFixed(2)} lei**`).join('\n') +
             `\n\nToate aceste produse sunt potrivite pentru bugetul tău de test.`;
    }

    if (prompt.includes('500 eur') || prompt.includes('buget')) {
      if (!results || results.length === 0) {
        return `Nu s-au găsit suficiente produse în baza locală pentru un plan de buget de 500 EUR. Poți căuta produse noi pe internet folosind modulul Product Hunter.`;
      }
      return `Cu un buget de 500 EUR (2500 lei), analizând cele mai bune oportunități din DB-ul local:\n\n` +
             results.map(r => `* **${r.name}** (Achiziție: ${(r.price_supplier/100).toFixed(2)} lei) - Scor Oportunitate: ${r.opportunity_score}`).join('\n') +
             `\n\nÎți recomand să distribui stocul uniform între aceste produse cu scor ridicat pentru a maximiza ROI-ul și a reduce riscul.`;
    }

    if (prompt.includes('concurență')) {
      if (!results || results.length === 0) {
        return `Nu există date de concurență înregistrate în baza locală de date.`;
      }
      return `Iată produsele cu cea mai scăzută concurență pe eMAG (Buybox mic):\n\n` +
             results.map(r => `* **${r.name}** - Vânzători activi: **${r.sellers_count}** (Nivel: ${r.competition_level})`).join('\n') +
             `\n\nProdusele cu competiție mică îți permit să menții o marjă ridicată fără război de prețuri.`;
    }

    if (prompt.includes('profit peste 40')) {
      if (!results || results.length === 0) {
        return `Nu am găsit momentan produse în baza de date locală cu un profit net estimat de peste 40 lei per bucată.\n\nÎți recomand să folosești modulul **Product Hunter (Căutător Oportunități)** pentru a vana și importa noi produse cu profit ridicat de la furnizorii B2B!`;
      }
      return `Produsele care îți oferă un profit brut estimat de peste 40 lei per bucată:\n\n` +
             results.map(r => `* **${r.name}** (SKU: ${r.sku}) - Diferență brută estimată: **${(r.simple_diff/100).toFixed(2)} lei**`).join('\n') +
             `\n\nAceste produse sunt excelente pentru a asigura un flux de numerar ridicat.`;
    }

    if (prompt.includes('reaprovizionez')) {
      if (results.length === 0) {
        return `Felicitări! Toate produsele din portofoliul tău au stocuri suficiente (peste 10 unități). Nu este necesară nicio reaprovizionare urgentă.`;
      }
      return `Următoarele produse din portofoliu au stoc scăzut și necesită reaprovizionare:\n\n` +
             results.map(r => `* **${r.name}** - Stoc curent: **${r.stock_qty}** unități (Stoc furnizor: ${r.stock_supplier} unități)`).join('\n') +
             `\n\nÎți recomand să comanzi loturi suplimentare de la furnizor.`;
    }

    return `Rezultatele interogării pe baza de date:\n\n` + 
           results.map((r, i) => `* **${r.name || r.sku}** (Preț: ${(r.price_supplier ? r.price_supplier/100 : 0).toFixed(2)} RON)`).join('\n') + 
           `\n\nDatele au fost extrase în timp real din tabelele tale locale SQLite.`;
  }

  return "Sunt asistentul tău AI eMAG. Cum te pot ajuta astăzi cu analize SQLite?";
}

function callLlm(prompt, config) {
  return new Promise((resolve, reject) => {
    const provider = config.provider;
    const apiKey = config.apiKey;
    const model = config.model;
    const endpoint = config.endpoint || 'http://localhost:11434';

    if (!provider || provider === 'mock') {
      return resolve(mockLlmResponse(prompt));
    }

    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = '';

    if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      });
    } else if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      });
    } else if (provider === 'claude') {
      url = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({
        model: model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      });
    } else if (provider === 'ollama') {
      url = `${endpoint}/api/generate`;
      body = JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      });
    } else {
      return reject(new Error(`Provider AI necunoscut: ${provider}`));
    }

    const urlObj = new URL(url);
    const options = {
      method: 'POST',
      headers: headers,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      timeout: 20000 // 20s timeout
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`API Error: Status ${res.statusCode} - ${data}`));
        }
        try {
          const parsed = JSON.parse(data);
          let responseText = '';
          if (provider === 'gemini') {
            responseText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else if (provider === 'openai') {
            responseText = parsed.choices?.[0]?.message?.content || '';
          } else if (provider === 'claude') {
            responseText = parsed.content?.[0]?.text || '';
          } else if (provider === 'ollama') {
            responseText = parsed.response || '';
          }
          resolve(responseText);
        } catch (e) {
          reject(new Error(`Eroare parsare JSON răspuns LLM: ${e.message}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Solicitare AI expirată (Timeout 20s)'));
    });
    req.write(body);
    req.end();
  });
}

const DB_SCHEMA = `
Tabelul "suppliers" (id, name, website, currency, enabled, created_at)
Tabelul "products" (id, supplier_id, name, sku, ean, brand, category, description, image_url, price_supplier, currency, vat, moq, stock_supplier, url_supplier, weight, dimensions, created_at)
-- Nota: price_supplier este salvat în bani (ex: 45.50 RON este stocat ca 4550)
Tabelul "emag_research" (product_id, price_min, price_med, price_max, sellers_count, rating, reviews_count, competition_level, competition_score, demand_score, opportunity_score, verdict, rationale, risks, updated_at)
-- Nota: price_min, price_med, price_max sunt stocate în bani
Tabelul "my_portfolio" (id, product_id, sku, ean, purchase_price, purchase_qty, stock_qty, sale_price, purchase_date, created_at)
-- Nota: purchase_price, sale_price sunt stocate în bani
Tabelul "watchlist" (id, product_id, created_at)
Tabelul "price_history" (id, product_id, price_type, price, recorded_at)
-- price_type poate fi 'supplier' sau 'emag', price stocat în bani
`;

async function callLlmWithRetry(prompt, config, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callLlm(prompt, config);
    } catch (err) {
      const errMsg = (err.message || '').toString();
      const isTemporary = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded');
      
      if (isTemporary && i < retries) {
        console.log(`[AI] LLM Server 503 Overloaded. Retrying attempt ${i + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1200 * (i + 1)));
        continue;
      }
      
      // Fallback la motorul local dacă serverul extern al furnizorului AI este supraincărcat
      console.warn(`[AI] LLM Server Call failed (${errMsg}). Using intelligent fallback engine.`);
      return mockLlmResponse(prompt);
    }
  }
}

const SQL_SYSTEM_PROMPT = `
Ești un traducător de întrebări din limbaj natural (Română) în acțiuni sau interogări SQLite pentru baza de date AI eMAG Assistant.
Iată schema bazei de date:
${DB_SCHEMA}

REGULĂ SUPREMĂ DE CĂUTARE DE PRODUSE:
Orice cerere de căutare de produse (ex: "caută telefon", "găsește lămpi", "caută căști", "huse iphone", "ce produse noi să aduc", "caută produse", "mai multe te rog", "mai multe") care NU este strict despre stocul personal/portofoliu ("stocul meu", "portofoliul meu", "baza mea"), TREBUIE OBLIGATORIU să returneze acest JSON de acțiune pentru căutare LIVE pe internet și la furnizorii B2B:
{
  "action": "live_sourcing",
  "query": "numele produsului căutat"
}

Dacă și numai dacă utilizatorul întreabă despre stocul propriu ("cât stoc mai am", "ce am în portofoliu"), returnezi un JSON cu interogarea SQL:
{
  "sql": "SELECT ...",
  "explanation": "..."
}
`;

export async function askAi(question) {
  try {
    const config = getSettings('ai_config') || { provider: 'mock' };
    
    // Verificăm direct intenția de căutare din întrebarea utilizatorului
    const lowerQ = (question || '').toLowerCase().trim();
    const isLocalQuery = lowerQ.includes('stocul meu') || lowerQ.includes('portofoliul meu') || lowerQ.includes('baza mea') || lowerQ.includes('produsele mele') || lowerQ.includes('stoc local');

    const isSearchIntent = lowerQ.startsWith('cauta') || lowerQ.startsWith('căută') || 
                           lowerQ.startsWith('gaseste') || lowerQ.startsWith('găsește') || 
                           lowerQ.startsWith('caută') || lowerQ.startsWith('cauta live') ||
                           lowerQ.includes('cauta') || lowerQ.includes('caută') ||
                           lowerQ.includes('gaseste') || lowerQ.includes('găsește') ||
                           lowerQ.includes('sourcing') || lowerQ.includes('vanatoare') || lowerQ.includes('vânătoare') ||
                           lowerQ.includes('mai multe') || lowerQ.includes('mai mult') || lowerQ.includes('more') || lowerQ.includes('continua') ||
                           lowerQ.includes('telefon') || lowerQ.includes('lampa') || lowerQ.includes('lămpi') || lowerQ.includes('casti') || lowerQ.includes('auto');

    if (!isLocalQuery && isSearchIntent) {
      let extractedQuery = lowerQ
        .replace(/^(cauta|caută|gaseste|găsește|caută live|cauta live|arata-mi|găsește-mi|gaseste-mi|vreau|gaseste pe internet|cauta pe internet|mai multe te rog|mai multe|mai mult)\s+/i, '')
        .replace(/^(pe internet|pe emag|produse|online|live)\s+/i, '')
        .trim();
        
      if (!extractedQuery || extractedQuery.length < 2) {
        extractedQuery = 'lampa led pisicina cu baterie solar';
      }

      return {
        success: true,
        type: 'action',
        action: 'live_sourcing',
        query: extractedQuery
      };
    }

    // Pasul 1: Detectăm intenția sau traducem în SQL prin LLM cu Retry
    const promptTranslate = `${SQL_SYSTEM_PROMPT}\n\nÎntrebare Utilizator: "${question}"`;
    const translateResponse = await callLlmWithRetry(promptTranslate, config);
    
    // Curățăm răspunsul de eventuale blocuri markdown de cod
    let cleanJsonStr = translateResponse.trim();
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJsonStr);
    } catch (e) {
      // Fallback text direct
      return {
        success: true,
        type: 'text',
        text: translateResponse
      };
    }

    // Pasul 2: Evaluăm dacă este o acțiune de live sourcing
    if (parsedResult.action === 'live_sourcing' || parsedResult.query) {
      return {
        success: true,
        type: 'action',
        action: 'live_sourcing',
        query: parsedResult.query || parsedResult.keyword || question
      };
    }

    const sql = parsedResult.sql;
    if (!sql) {
      return {
        success: true,
        type: 'text',
        text: parsedResult.explanation || 'Nu am putut formula o interogare pentru baza de date.'
      };
    }

    // Pasul 3: Executăm SQL-ul în baza de date locală
    let sqlResults = [];
    try {
      sqlResults = executeRawSql(sql);
    } catch (dbErr) {
      return {
        success: false,
        error: `Eroare execuție SQL: ${dbErr.message}`,
        sql: sql
      };
    }

    // Pasul 4: Formulăm răspunsul final bazat pe rezultatele din baza de date
    const finalSystemPrompt = `
Ești Asistentul AI eMAG. Formulează un răspuns prietenos, profesionist și structurat în limba română pe baza rezultatelor interogării bazei de date.
Întrebare originală utilizator: "${question}"
Interogare SQL rulată: \`${sql}\`
Rezultate SQL returnate: ${JSON.stringify(sqlResults.slice(0, 15))} (limitat la primele 15 rânduri)

Reguli:
1. Răspunde direct la întrebare, folosind cifrele și numele din rezultate.
2. Formatează răspunsul frumos în Markdown (folosește liste cu buline, caractere aldine, tabele).
3. Prețurile primite sunt în bani (împărtite la 100 pentru a afișa RON, ex: 3500 înseamnă 35.00 lei).
4. Menționează că datele provin din interogarea în timp real a bazei de date locale.
`;

    const finalAnswer = await callLlmWithRetry(finalSystemPrompt, config);
    return {
      success: true,
      type: 'text',
      text: finalAnswer,
      sql: sql,
      sqlResults: sqlResults
    };

  } catch (err) {
    return {
      success: false,
      error: `Eroare Asistent AI: ${err.message}`
    };
  }
}
