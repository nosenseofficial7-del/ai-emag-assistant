import fs from 'fs';
import XLSX from 'xlsx';

/**
 * Exports products to an Excel spreadsheet.
 * @param {Array} products List of products to export
 * @param {string} filePath Path to write the .xlsx file
 * @returns {object} Export status
 */
export function exportToExcel(products, filePath) {
  try {
    const data = products.map(p => ({
      'SKU Furnizor': p.sku,
      'Cod EAN': p.ean || '',
      'Nume Produs': p.name,
      'Brand': p.brand || 'Nespecificat',
      'Categorie': p.category || 'Nespecificata',
      'Pret Achizitie (RON)': (p.price_supplier / 100).toFixed(2),
      'Pret Vanzare eMAG (RON)': p.price_med ? (p.price_med / 100).toFixed(2) : 'N/A',
      'Stoc Furnizor': p.stock_supplier || 0,
      'Greutate (kg)': p.weight || '0.5',
      'Scor Oportunitate': p.opportunity_score || '0',
      'Verdict': p.verdict || 'FARA ANALIZA'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog eMAG');
    
    XLSX.writeFile(workbook, filePath);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Exports products to an eMAG XML product feed.
 * @param {Array} products List of products to export
 * @param {string} filePath Path to write the .xml file
 * @returns {object} Export status
 */
export function exportToXml(products, filePath) {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<products>\n';
    
    for (const p of products) {
      xml += '  <product>\n';
      xml += `    <sku><![CDATA[${p.sku}]]></sku>\n`;
      xml += `    <ean>${p.ean || ''}</ean>\n`;
      xml += `    <name><![CDATA[${p.name}]]></name>\n`;
      xml += `    <brand><![CDATA[${p.brand || 'Nespecificat'}]]></brand>\n`;
      xml += `    <category><![CDATA[${p.category || 'Nespecificata'}]]></category>\n`;
      xml += `    <price_supplier>${(p.price_supplier / 100).toFixed(2)}</price_supplier>\n`;
      xml += `    <price_emag_recommended>${p.price_med ? (p.price_med / 100).toFixed(2) : '0.00'}</price_emag_recommended>\n`;
      xml += `    <stock>${p.stock_supplier || 0}</stock>\n`;
      xml += `    <weight>${p.weight || '0.5'}</weight>\n`;
      xml += `    <verdict>${p.verdict || 'FARA ANALIZA'}</verdict>\n`;
      xml += `    <opportunity_score>${p.opportunity_score || '0'}</opportunity_score>\n`;
      xml += '  </product>\n';
    }
    
    xml += '</products>\n';
    
    fs.writeFileSync(filePath, xml, 'utf8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
