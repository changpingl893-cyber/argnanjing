// 素材压缩入库：sucai 三个目录 → assets/clues/（编号命名，输出映射表）
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = 'D:/DeepseekWorkSpace/argnanjing';
const OUT = path.join(ROOT, 'assets', 'clues');
fs.mkdirSync(OUT, { recursive: true });

const SOURCES = [
  { dir: path.join(ROOT, 'sucai', '网页素材'), cat: 'web', label: '网页设计' },
  { dir: path.join(ROOT, 'sucai', '古风素材'), cat: 'guofeng', label: '古风素材' },
  { dir: path.join(ROOT, 'sucai', '配色', '红蓝'), cat: 'color-redblue', label: '红蓝配色' },
  { dir: path.join(ROOT, 'sucai', '配色', '古风'), cat: 'color-guofeng', label: '国风配色' },
];

const map = [];
let n = 0;
for (const s of SOURCES) {
  if (!fs.existsSync(s.dir)) continue;
  const files = fs.readdirSync(s.dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  for (const f of files) {
    const src = path.join(s.dir, f);
    const st = fs.statSync(src);
    if (st.size < 5000) continue; // 跳过空文件
    n++;
    const id = String(n).padStart(2, '0');
    const outName = `clue-${id}.jpg`;
    const out = path.join(OUT, outName);
    // 用 PowerShell + System.Drawing 缩放压缩
    const ps = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${src.replace(/'/g, "''")}')
$maxW = 1400
$scale = [Math]::Min(1.0, $maxW / $img.Width)
$w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $w, $h)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$bmp.Save('${out.replace(/'/g, "''")}', $codec, $ep)
$bmp.Dispose(); $g.Dispose(); $img.Dispose()
Write-Output "$w x $h"
`;
    try {
      const dim = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).trim();
      map.push({ id, file: outName, name: f.replace(/_来自小红书网页版/, '').replace(/\.(jpg|jpeg|png)$/i, ''), cat: s.cat, catLabel: s.label, size: dim, kb: Math.round(fs.statSync(out).size / 1024) });
    } catch (e) {
      console.log('失败: ' + f + ' :: ' + e.message.slice(0, 80));
    }
  }
}
fs.writeFileSync(path.join(ROOT, '_clue-map.json'), JSON.stringify(map, null, 1), 'utf8');
console.log('共处理 ' + map.length + ' 张');
const total = map.reduce((a, b) => a + b.kb, 0);
console.log('总体积 ' + (total / 1024).toFixed(1) + ' MB');
map.slice(0, 6).forEach(m => console.log(` ${m.id} [${m.catLabel}] ${m.size} ${m.kb}KB  ${m.name.slice(0, 34)}`));
