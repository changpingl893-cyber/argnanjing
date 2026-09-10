// 字体子集化：抽取页面实际用到的字符 → pyftsubset 生成 woff2（手机友好）
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = 'D:/DeepseekWorkSpace/argnanjing';
const FONTS = path.join(ROOT, 'assets', 'fonts');

// 1. 收集字符：所有页面与数据文件
const FILES = ['index.html', 'gallery.html', '404.html', 'js/clues-data.js', 'js/opening.js', 'js/gallery.js'];
let text = '';
for (const f of FILES) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) text += fs.readFileSync(p, 'utf8');
}
// 加上常用标点与数字字母，保证扩展文案不缺字
text += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
text += '，。、；：？！“”‘’（）《》〈〉【】…—·～￥·％＋－＝／＼｜＃＆＊＠　';
const chars = Array.from(new Set(text.split(''))).filter(c => c.trim().length > 0 || c === ' ');
const charFile = path.join(ROOT, '_font-chars.txt');
fs.writeFileSync(charFile, chars.join(''), 'utf8');
console.log('收集到 ' + chars.length + ' 个不同字符');

// 2. 子集化
const jobs = [
  { src: 'MaShanZheng-Regular.ttf', out: 'ShouXie' },   // 马善政毛笔楷书（手写感）
  { src: 'ZhiMangXing-Regular.ttf', out: 'XingShu' },   // 志莽行书
];
for (const j of jobs) {
  const src = path.join(FONTS, j.src);
  if (!fs.existsSync(src)) { console.log('缺字体: ' + j.src); continue; }
  const outWoff2 = path.join(FONTS, j.out + '.woff2');
  try {
    execFileSync('python', ['-m', 'fontTools.subset', src,
      '--text-file=' + charFile,
      '--output-file=' + outWoff2,
      '--flavor=woff2',
      '--layout-features=*',
      '--no-hinting',
      '--desubroutinize'
    ], { stdio: 'pipe' });
    console.log(`${j.src} → ${j.out}.woff2  ${(fs.statSync(outWoff2).size / 1024).toFixed(0)}KB`);
  } catch (e) {
    console.log('子集化失败 ' + j.src + ': ' + (e.stderr ? e.stderr.toString().slice(0, 200) : e.message));
  }
}
