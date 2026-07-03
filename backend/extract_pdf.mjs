import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import { readFileSync } from 'fs';

const buf = readFileSync('d:/rent flatmate/rent_flatmate_project.pdf');
const data = await pdfParse(buf);
const text = data.text;

// Find all phase sections
const lines = text.split('\n');
let capture = false;
let currentPhase = 0;
const output = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const phaseMatch = line.match(/Phase\s+(\d+)/i);
  if (phaseMatch) {
    const n = parseInt(phaseMatch[1]);
    if (n >= 11 && n <= 15) {
      capture = true;
      currentPhase = n;
    } else if (n > 15 && capture) {
      break;
    } else {
      capture = false;
    }
  }
  if (capture) output.push(line);
}

console.log(output.join('\n'));
