import fs from 'fs';
const txt = fs.readFileSync('./src/data/fullTimeline.js', 'utf8');

// Regex logic to parse tables
console.log("Analyzing...");
