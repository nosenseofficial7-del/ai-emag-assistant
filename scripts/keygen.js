import { generateKey } from '../electron/activation.js';

console.log('===================================================');
console.log('      AI eMAG Assistant - KEY GENERATOR');
console.log('      Developer: NoSense 2026');
console.log('===================================================');
console.log('');
console.log('Generăm 5 coduri de activare licență valide:');
console.log('');

for (let i = 1; i <= 5; i++) {
  const key = generateKey();
  console.log(`Cheia ${i}:  \x1b[32m${key}\x1b[0m`);
}

console.log('');
console.log('===================================================');
console.log('Păstrează aceste chei în siguranță pentru utilizatori.');
console.log('===================================================');
