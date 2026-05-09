const fs = require('fs');
const md = fs.readFileSync('c:\\Users\\PC\\Downloads\\_MConverter.eu_Agenda HNTTHTQ 2026 - final.md', 'utf8');
const out = 'const fullTimeline = `' + md.replace(/`/g, '\\`') + '`;\n\nexport default fullTimeline;';
fs.writeFileSync('./src/data/fullTimeline.js', out);
