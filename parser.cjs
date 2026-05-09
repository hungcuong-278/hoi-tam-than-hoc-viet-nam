const fs = require('fs');
const cheerio = require('cheerio');
const md = fs.readFileSync('c:\\Users\\PC\\Downloads\\_MConverter.eu_Agenda HNTTHTQ 2026 - final.md', 'utf8');
const $ = cheerio.load(md);
const structuredData = [];

// Map table index to venue (daySection)
const daySectionMap = {
  0:  "Tổng quan",
  1:  "Ngày 29-30/5/2026",
  2:  "Hội trường Hồng Quảng (31/5)",
  3:  "Hội trường Hồng Quảng (31/5)",
  4:  "Hội trường Yên Trung (31/5)",
  5:  "Hội trường Yên Trung (31/5)",
  6:  "Hội trường Đồng Sơn (31/5)",
  7:  "Hội trường Đồng Sơn (31/5)",
  8:  "Hội trường Yên Đức 1 (31/5)",
  9:  "Hội trường Yên Đức 1 (31/5)",
  10: "Hội trường Yên Đức 2 (31/5)",
  11: "Hội trường Yên Đức 2 (31/5)",
  12: "Hội trường Yên Đức 3 (31/5)",
  13: "Hội trường Yên Đức 3 (31/5)",
  14: "Hội trường Thanh Lân 1 (31/5)",
  15: "Hội trường Thanh Lân 1 (31/5)",
  16: "Hội trường Thanh Lân 2 (31/5)",
  17: "Hội trường Thanh Lân 2 (31/5)",
  18: "Hội trường Kim Quy (31/5)",
  19: "Hội trường Kim Quy (31/5)",
};

$('table').each((i, el) => {
  const tableHtml = $.html(el);
  const firstRow = $(el).find('tr').first().text().replace(/\s+/g, ' ').trim();
  const daySection = daySectionMap[i] || "Ngày 31/5/2026";
  let title = firstRow;

  // For id=1 (pre-conference), remove May 31 rows from the HTML
  let html = tableHtml;
  if (i === 1) {
    const may31Marker = '<p><strong>Ngày 31/5/2026</strong>';
    const may31Idx = html.indexOf(may31Marker);
    if (may31Idx !== -1) {
      const trStart = html.lastIndexOf('\n<tr', may31Idx);
      const tableEnd = '\n</tbody>\n</table>';
      const tableEndIdx = html.indexOf(tableEnd, may31Idx);
      if (trStart !== -1 && tableEndIdx !== -1) {
        html = html.substring(0, trStart) + tableEnd + html.substring(tableEndIdx + tableEnd.length);
      }
    }
  }

  structuredData.push({ id: i, daySection, title, html });
});

fs.writeFileSync(
  './src/data/timelineStructured.js',
  'export const structuredTimeline = ' + JSON.stringify(structuredData, null, 2),
  'utf8'
);
console.log('Done! Generated timelineStructured.js with', structuredData.length, 'sessions.');
