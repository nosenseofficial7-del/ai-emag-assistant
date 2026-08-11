import { Sparkles, ShieldCheck } from 'lucide-react';

interface ChangelogPageProps {
  t: any;
  lang?: string;
}

export default function ChangelogPage({ t, lang = 'ro' }: ChangelogPageProps) {
  if (t) {}
  const isRo = lang === 'ro';

  const releases = [
    {
      version: 'v1.7.4',
      date: '11 August 2026',
      tag: isRo ? 'LANSAT ACUM • ENTERPRISE' : 'CURRENT RELEASE • ENTERPRISE',
      color: '#10b981',
      title: isRo 
        ? 'Suport Bilingv Complet (RO/EN) & Minor Bug-Fixes' 
        : 'Full Bilingual Support (RO/EN) & Minor Bug-Fixes',
      changes: isRo ? [
        'Suport Bilingv Complet (Română / Engleză): Toate paginile, taburile, formularele, tabelele și panourile de analiză sunt traduse 100% în ambele limbi.',
        'Corecție Verificare Logică Limbă Activă (isRo): Remedierea bug-ului unde verificarea limbii forța limba română în loc de engleză când comutatorul era pe EN.',
        'Minor Bug-Fixes & Optimizări UI: Corecții vizuale la selecția opțiunilor în meniurile derulante și ajustări de interfață.',
        'Sincronizare Dinamică GitHub fără Cache: Ocolirea automată a memoriei cache a serverelor CDN pentru actualizări instantanee.'
      ] : [
        'Full Bilingual Support (Romanian / English): 100% full translation across all pages, tabs, forms, tables, and analysis sidebars.',
        'Language Logic Check Bug-Fix (isRo): Fixed root-cause issue where language detection defaulted to Romanian even when EN was active.',
        'Minor Bug-Fixes & UI Optimizations: Improved dark mode contrast on native select option elements and enhanced responsive controls.',
        'Real-Time Cacheless GitHub Sync: Automatic cache-busting timestamp parameters for instant version checks.'
      ]
    },
    {
      version: 'v1.7.3',
      date: '10 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#3b82f6',
      title: isRo 
        ? 'Remediere Contrast Dark Mode & Sincronizare Dinamică GitHub fără Cache' 
        : 'Dark Mode Select Contrast Fix & Real-Time Cacheless GitHub Sync',
      changes: isRo ? [
        'Remediere Contrast Meniuri Derulante (Select Options): S-a forțat stilul color-scheme: dark și background-color pe opțiunile meniurilor derulante, eliminând complet textul alb pe fundal alb pe Windows.',
        'Sincronizare Dinamică în Timp Real fără Cache: Adăugat filtru automat Cache-Buster (?t=timestamp) pe versiunea de GitHub pentru citirea instantanee a modificărilor.',
        'Sistem de Actualizare Automată (Check for Updates): Posibilitatea de a verifica și instala actualizările aplicației direct dintr-un singur click, fără re-descărcări manuale.',
        'Protecție Automată Eroare 503 AI: Sistem inteligent cu reîncercări automate (Exponential Backoff) la erori de server Google Gemini, prevenind întreruperea conversației.',
        'Comparare Directă 🟢 Furnizor & 🔴 eMAG: Butoane alăturate pe fiecare card de produs cu link-uri de căutare garantate pe eMAG Marketplace FĂRĂ erori 404.'
      ] : [
        'Select Option Contrast Fix: Forced color-scheme: dark and custom background styles on select option dropdown items, eliminating white-on-white text issues on Windows.',
        'Real-Time Cacheless GitHub Sync: Added automatic cache-buster timestamp query parameters to GitHub manifest checks for instant updates.',
        '1-Click Auto-Update System: Easily check and install application updates directly with a single click.',
        'Automatic AI 503 Error Retry: Integrated exponential backoff retries for Google Gemini server overloads to prevent chat interruptions.',
        'Direct Side-by-Side Links: Color-coded 🟢 Supplier and 🔴 eMAG Marketplace search buttons guaranteed 0% 404 errors.'
      ]
    },
    {
      version: 'v1.7.0',
      date: '10 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#3b82f6',
      title: isRo 
        ? 'Sistem Auto-Update într-un Click & Protecție Eroare 503 AI' 
        : '1-Click Auto-Update System & AI 503 Protection',
      changes: isRo ? [
        'Sistem de Actualizare Automată (Check for Updates): Posibilitatea de a verifica și instala actualizările aplicației direct dintr-un singur click.',
        'Protecție Automată Eroare 503 AI: Sistem inteligent cu reîncercări automate (Exponential Backoff) la erori de server Google Gemini.',
        'Filtru de Relevanță Contextuală Strictă: Eliminarea automată a produselor irelevante de casă la căutările din categoria Auto.',
        'Comparare Directă 🟢 Furnizor & 🔴 eMAG: Butoane alăturate pe fiecare card de produs cu link-uri de căutare garantate pe eMAG.'
      ] : [
        '1-Click Auto-Update System: Easily check and install application updates directly with a single click.',
        'Automatic AI 503 Error Retry: Integrated exponential backoff retries for Google Gemini server overloads.',
        'Strict Context Relevance Filter: Filters out non-car home products when searching for auto accessories.',
        'Direct Side-by-Side Links: Color-coded 🟢 Supplier and 🔴 eMAG Marketplace search buttons.'
      ]
    },
    {
      version: 'v1.6.0',
      date: '10 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#3b82f6',
      title: isRo 
        ? 'Selector Versiuni Gemini & Persistență Dublă Setări' 
        : 'Gemini Version Selector & Dual Persistence Settings',
      changes: isRo ? [
        'Selector Versiuni AI Google Gemini: Selector drop-down pentru modelele gemini-2.5-flash (Recomandat Ultra-Rapid), gemini-1.5-flash și gemini-1.5-pro în Setări.',
        'Persistență Dublă Setări (SQLite + LocalStorage): Salvarea sincronizată a cheilor API și configurărilor AI pentru a garanta că opțiunile alese nu se resetează pe Demo.',
        'Comanda "Mai Multe Te Rog": Asistentul AI recunoaște comanda conversatională de aducere suplimentară de produse B2B din chat.'
      ] : [
        'Google Gemini Version Selector: Added dropdown selector for gemini-2.5-flash (Recommended Ultra Fast), gemini-1.5-flash, and gemini-1.5-pro.',
        'Dual Persistence System: Sychronized API keys and AI settings across SQLite and LocalStorage to prevent settings resets.',
        'Interactive "More Products" Command: AI Assistant recognizes commands to fetch additional B2B sourcing batches.'
      ]
    },
    {
      version: 'v1.5.0',
      date: '09 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#8b5cf6',
      title: isRo 
        ? 'Vânătoare Live Online B2B pe Scală Mare & Ordonare Ieftin Primul' 
        : 'Large Scale Live B2B Online Search & Cheapest First Sorting',
      changes: isRo ? [
        'Vânătoare Live Online B2B: Scanare în timp real pe site-urile furnizorilor en-gros (Maxy B2B, VERK Wholesale, EANY Dropship) și comparare instantanee cu ofertele de pe eMAG Marketplace.',
        'Ordonare Cheapest First: Afișarea automată a produselor B2B ordonate crescător după prețul de achiziție, cu opțiunea de import cu 1-click în catalogul personal.',
        'Filtrare după Buget & Marjă: Filtrare rapidă pe Buget Maxim Achiziție (RON/EUR), Preț Maxim Unitat, Categorie și Scor de Oportunitate.'
      ] : [
        'Large Scale Live B2B Online Search: Real-time parsing across wholesale B2B suppliers (Maxy, Verk, Eany) with instant eMAG price comparisons.',
        'Cheapest First Auto-Sorting: Automatically ranks live sourcing results starting from the lowest supplier price with 1-click import to local catalog.',
        'Budget & Margin Filtering: Filter products by Maximum Total Budget, Maximum Unit Cost, Category, and Opportunity Score.'
      ]
    },
    {
      version: 'v1.4.0',
      date: '09 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#f59e0b',
      title: isRo 
        ? 'Manual Oficial de Utilizare PDF (10 Capitole Complexe)' 
        : 'Official PDF User Manual (10 Detailed Chapters)',
      changes: isRo ? [
        'Manual Oficial de Utilizare PDF: Ghid tehnic complet pe 10 capitole în format PDF A4 descarcabil direct din aplicație.',
        'Ghid Pas cu Pas API AI: Instrucțiuni ilustrate pentru obținerea cheii API gratuite Google Gemini 2.5 Flash de pe aistudio.google.com.',
        'Explicarea Fiecărui Buton & Formulă: Ghid exhaustiv pentru fiecare modul, comision eMAG pe categorie și calcul ROI.'
      ] : [
        'Official PDF User Manual: Comprehensive 10-chapter printable A4 technical guide downloadable directly within the app.',
        'Step-by-Step API Key Setup: Illustrated instructions for obtaining free Google Gemini 2.5 Flash API keys.',
        'Button & Formula Reference: Complete guide for every module, eMAG category commission rate, and ROI calculation formula.'
      ]
    },
    {
      version: 'v1.3.0',
      date: '09 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#06b6d4',
      title: isRo 
        ? 'Interfață Bilingvă RO/EN & Personalizare Culori UI' 
        : 'Bilingual RO/EN Interface & UI Theme Personalization',
      changes: isRo ? [
        'Interfață Bilingvă (Română / Engleză): Comutare instantanee a limbii din header și panoul de activare a licenței.',
        'Engine de Personalizare Culori: 5 teme de culori de accent UI (Smarald, Cian, Violet, Chihlimbar, Albastru Cyber) și moduri de densitate ecran.'
      ] : [
        'Bilingual Interface (Romanian / English): Instant language switching via header and activation panel.',
        'Theme Personalization Engine: 5 UI accent color themes (Emerald, Cyber, Purple, Amber, Crimson) and screen density modes.'
      ]
    },
    {
      version: 'v1.2.0',
      date: '09 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#ec4899',
      title: isRo 
        ? 'Asistent AI Chat RAG & Inspectare Cod SQL' 
        : 'AI RAG Chat Assistant & SQL Query Inspection',
      changes: isRo ? [
        'Asistent AI Chat RAG: Chat inteligent în limba română ce traduce întrebările despre stocuri în interogări SQL rulate live pe baza de date locală SQLite.',
        'Consolă de Transparență SQL: Buton dedicat ">_ Vezi interogare SQLite rulată" sub răspunsurile AI-ului pentru verificarea calculelor.',
        'Sourcing Agent Automat: AI-ul lansează căutări paralele de produse pe internet când adresezi întrebări comerciale.'
      ] : [
        'AI RAG Chat Assistant: Natural language Romanian chat translating stock queries into live SQLite SQL queries.',
        'SQL Transparency Console: Collapsible ">_ View SQLite query run" button under AI responses for auditability.',
        'Automated Sourcing Agent: AI triggers parallel live product sourcing on the web when asked commercial queries.'
      ]
    },
    {
      version: 'v1.1.0',
      date: '09 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#64748b',
      title: isRo 
        ? 'Scor de Oportunitate AI (0-100) & Analiză Concurență' 
        : 'AI Opportunity Score (0-100) & Competition Analysis',
      changes: isRo ? [
        'Scor de Oportunitate (0 - 100): Calcularea automată a potențialului de profit și atribuirea verdictelor clare (CUMPĂRĂ, FOARTE BUN, RISC MEDIU, NU MERITĂ).',
        'Analiză Buybox eMAG: Monitorizarea numărului de vânzători concurenți activi și evaluarea nivelului de competiție pe categorie.'
      ] : [
        'Opportunity Score (0 - 100): Automated profit potential calculation assigning clear verdicts (BUY, VERY GOOD, MEDIUM RISK, NOT WORTH IT).',
        'eMAG Buybox Analysis: Tracks active competing sellers and evaluates marketplace competition levels per category.'
      ]
    },
    {
      version: 'v1.0.0',
      date: '08 August 2026',
      tag: isRo ? 'STABIL' : 'STABLE',
      color: '#475569',
      title: isRo ? 'Versiunea de Bază (Enterprise MVP)' : 'Base Enterprise MVP Release',
      changes: isRo ? [
        'Bază de Date SQLite Locala Privată: Stocarea 100% securizată a catalogului de produse și a portofoliului pe hard disk-ul propriu.',
        'Calculator Financiar eMAG: Calculul exact al marjei nete, comisionului pe categorie (Auto 16%, IT 14%, Home 18%), TVA 19% și costurilor logistice.',
        'Import Universal Excel / CSV / XML: Maparea dinamică a coloanelor pentru încărcarea cataloagelor mari de la furnizori.'
      ] : [
        'Private Native SQLite Database: 100% secure local storage for product catalog and inventory on your own hard drive.',
        'eMAG Financial Calculator: Precise net margin calculation accounting for category commissions, VAT, and shipping logistics.',
        'Universal Excel / CSV / XML Import: Dynamic column mapping wizard for bulk importing wholesale supplier catalogs.'
      ]
    }
  ];

  return (
    <div className="page-changelog fade-in-page" style={{ paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} className="text-emerald animate-pulse" />
            {isRo ? 'Jurnal Schimbări (Changelog)' : 'Version Changelog'}
          </h2>
          <p className="page-subtitle">
            {isRo 
              ? 'Istoricul versiunilor și funcționalităților lansate pentru eficientizarea vânzărilor pe eMAG Marketplace.' 
              : 'Complete version history and features launched to maximize your eMAG Marketplace arbitrage sales.'}
          </p>
        </div>
      </div>

      {/* Release Timeline */}
      <div className="changelog-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {releases.map((rel) => (
          <div 
            key={rel.version} 
            className="changelog-card"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Accent Stripe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: rel.color
            }} />

            {/* Version Meta Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '800', 
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace' 
                }}>
                  {rel.version}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  color: rel.color, 
                  background: `${rel.color}15`, 
                  border: `1px solid ${rel.color}40`,
                  padding: '3px 10px', 
                  borderRadius: '12px',
                  letterSpacing: '0.5px'
                }}>
                  {rel.tag}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                📅 {rel.date}
              </span>
            </div>

            {/* Title */}
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {rel.title}
            </h3>

            {/* User-focused Changes List */}
            <ul style={{ 
              margin: 0, 
              paddingLeft: '20px', 
              fontSize: '13.5px', 
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {rel.changes.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{ 
        marginTop: '30px', 
        paddingTop: '20px', 
        borderTop: '1px solid var(--border-color)', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: 'var(--text-secondary)' 
      }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={16} className="text-emerald" />
          AI eMAG Assistant v1.7.0 • Enterprise Edition • Copyright © NoSense 2026.
        </p>
      </div>
    </div>
  );
}
