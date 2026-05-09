const fs = require('fs');
const cheerio = require('cheerio');

const md = fs.readFileSync('c:\\Users\\PC\\Downloads\\_MConverter.eu_Agenda HNTTHTQ 2026 - final.md', 'utf8');
const $ = cheerio.load(md);

const structuredData = [];

$('table').each((i, el) => {
  const tableHtml = $.html(el);
  const firstRow = $(el).find('tr').first().text().replace(/\n/g, ' ').trim();
  
  let daySection = "Ngày 31/5/2026"; // default
  let title = firstRow;

  if (i === 0) {
    title = "Tổng Quan Lịch Trình (31/5/2026)";
    daySection = "Tổng quan";
  } else if (i === 1) {
    title = "Phiên Đào Tạo Tiền Hội Nghị (29-30-31/5/2026)";
    daySection = "Ngày 29-30/5/2026";
  } else {
    // The rest are strictly Day 31 sessions
    daySection = "Ngày 31/5/2026";
  }

  structuredData.push({
    id: i,
    daySection,
    title,
    html: tableHtml
  });
});

const output = `export const structuredTimeline = ${JSON.stringify(structuredData, null, 2)};\n`;
fs.writeFileSync('./src/data/timelineStructured.js', output);
console.log("Written structured data");
