// Renders the Microsoft Store (APPX/MSIX) tile assets into build/appx/.
// Run with: npm run store:assets
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const iconSvg = require('./icon-svg');

const outDir = path.join(__dirname, '..', 'build', 'appx');

// [asset name, width, height, icon size as a fraction of the shorter side]
const TILES = [
  ['StoreLogo', 50, 50, 1],
  ['Square44x44Logo', 44, 44, 1],
  ['SmallTile', 71, 71, 0.72],
  ['Square150x150Logo', 150, 150, 0.6],
  ['Wide310x150Logo', 310, 150, 0.6],
  ['LargeTile', 310, 310, 0.55],
];
const SCALES = [100, 125, 150, 200, 400];
// Taskbar / Start list icons drawn without the tile plate behind them.
const UNPLATED_SIZES = [16, 24, 32, 48, 256];

const jobs = [];
for (const [name, w, h, fraction] of TILES) {
  for (const scale of SCALES) {
    jobs.push({
      files: [`${name}.scale-${scale}.png`],
      w: Math.round((w * scale) / 100),
      h: Math.round((h * scale) / 100),
      fraction,
    });
  }
}
for (const size of UNPLATED_SIZES) {
  jobs.push({
    files: [
      `Square44x44Logo.targetsize-${size}.png`,
      `Square44x44Logo.targetsize-${size}_altform-unplated.png`,
    ],
    w: size,
    h: size,
    fraction: 1,
  });
}

// Runs inside the page: draws the SVG onto a canvas per job and returns PNG data URLs.
const renderInPage = `(async (svg, jobs) => {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  return jobs.map(({ w, h, fraction }) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    const size = Math.round(Math.min(w, h) * fraction);
    ctx.drawImage(img, Math.round((w - size) / 2), Math.round((h - size) / 2), size, size);
    return c.toDataURL('image/png');
  });
})`;

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html,<html><body></body></html>');
  // Large viewBox size so the SVG rasterises crisply at every target size.
  const svg = iconSvg.replace('<svg ', '<svg width="1024" height="1024" ');
  const urls = await win.webContents.executeJavaScript(
    `${renderInPage}(${JSON.stringify(svg)}, ${JSON.stringify(jobs)})`,
  );

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  let count = 0;
  urls.forEach((url, i) => {
    const png = Buffer.from(url.split(',')[1], 'base64');
    for (const file of jobs[i].files) {
      fs.writeFileSync(path.join(outDir, file), png);
      count++;
    }
  });
  console.log(`Wrote ${count} tile assets to build/appx/`);
  app.quit();
});
