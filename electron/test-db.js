import { app } from 'electron';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

app.whenReady().then(() => {
  console.log('Electron is ready.');
  
  // Determină folderul de date
  const userDataPath = app.getPath('userData');
  console.log('User Data Path:', userDataPath);
  
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  const dbPath = path.join(userDataPath, 'test-database.db');
  console.log('Database Path:', dbPath);
  
  // Șterge baza de date anterioară dacă există, pentru a începe curat
  if (fs.existsSync(dbPath)) {
    console.log('Removing existing test database to perform clean test...');
    fs.unlinkSync(dbPath);
  }
  
  // Pasul 1: Creare bază de date și tabel
  console.log('--- PASUL 1: Creare database.db & Tabel ---');
  let db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      val INTEGER NOT NULL
    );
  `);
  console.log('Tabel test_table creat cu succes.');
  
  // Pasul 2: INSERT
  console.log('--- PASUL 2: INSERT ---');
  const insertStmt = db.prepare('INSERT INTO test_table (name, val) VALUES (?, ?)');
  insertStmt.run('Aspirator Auto', 10999); // 109.99 lei stocați în bani (10999 bani)
  console.log('Inregistrare inserata.');
  
  // Pasul 3: SELECT
  console.log('--- PASUL 3: SELECT ---');
  const selectStmt = db.prepare('SELECT * FROM test_table');
  let rows = selectStmt.all();
  console.log('Date selectate:', rows);
  
  if (rows.length !== 1 || rows[0].name !== 'Aspirator Auto' || rows[0].val !== 10999) {
    console.error('Eroare: Inserarea sau selectarea a eșuat.');
    app.exit(1);
    return;
  }
  
  // Pasul 4: UPDATE
  console.log('--- PASUL 4: UPDATE ---');
  const updateStmt = db.prepare('UPDATE test_table SET val = ? WHERE id = ?');
  updateStmt.run(11999, rows[0].id);
  console.log('Inregistrare actualizata la 119.99 lei (11999 bani).');
  
  rows = selectStmt.all();
  console.log('Date dupa UPDATE:', rows);
  if (rows[0].val !== 11999) {
    console.error('Eroare: Actualizarea a eșuat.');
    app.exit(1);
    return;
  }
  
  // Pasul 5: Inchidere database
  console.log('--- PASUL 5: Inchidere database ---');
  db.close();
  console.log('Baza de date inchisa.');
  
  // Pasul 6: Redeschidere si verificare persistenta
  console.log('--- PASUL 6: Redeschidere si verificare persistenta ---');
  db = new DatabaseSync(dbPath);
  const selectStmt2 = db.prepare('SELECT * FROM test_table');
  const rowsAfterReopen = selectStmt2.all();
  console.log('Date dupa redeschidere:', rowsAfterReopen);
  db.close();
  
  if (rowsAfterReopen.length === 1 && rowsAfterReopen[0].val === 11999) {
    console.log('>>> TEST SUCCES: Datele sunt persistente! <<<');
    app.exit(0);
  } else {
    console.error('Eroare: Datele nu s-au regăsit corect după redeschidere.');
    app.exit(1);
  }
}).catch(err => {
  console.error('Eroare la pornire:', err);
  app.exit(1);
});
