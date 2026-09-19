// Renders the app icon to every place it's used (installer, window, in-app logo).
// Run with: npm run icon
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PNG_TARGETS = ['build/icon.png', 'resources/icon.png', 'src/renderer/src/assets/icon.png'];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/><stop offset=".45" stop-color="#6366f1"/><stop offset="1" stop-color="#0891b2"/>
    </linearGradient>
    <radialGradient id="shine" cx=".25" cy=".15" r=".9">
      <stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="url(#bg)"/>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="url(#shine)"/>
  <path d="M52 176 C80 176 84 138 110 140 C136 142 140 158 162 132 C180 110 186 92 204 80 L204 204 L52 204 Z" fill="url(#area)"/>
  <path d="M52 176 C80 176 84 138 110 140 C136 142 140 158 162 132 C180 110 186 92 204 80" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
  <circle cx="204" cy="80" r="16" fill="#fff"/>
  <circle cx="204" cy="80" r="7" fill="#22d3ee"/>
  <rect x="10" y="10" width="236" height="236" rx="60" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
</svg>`;

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 256,
    height: 256,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    useContentSize: true,
    webPreferences: { offscreen: true },
  });
  win.webContents.setZoomFactor(1);
  await win.loadURL(
    'data:text/html;charset=utf-8,' +
      encodeURIComponent(
        `<html><body style="margin:0;background:transparent;overflow:hidden">${svg}</body></html>`,
      ),
  );
  await new Promise((r) => setTimeout(r, 500));
  const img = await win.webContents.capturePage({ x: 0, y: 0, width: 256, height: 256 });

  const sizes = [256, 128, 64, 48, 32, 24, 16];
  const pngs = sizes.map((s) => img.resize({ width: s, height: s, quality: 'best' }).toPNG());
  for (const target of PNG_TARGETS) fs.writeFileSync(path.join(root, target), pngs[0]);

  // ICO container with embedded PNGs
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const dir = sizes.map((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s >= 256 ? 0 : s, 0);
    e.writeUInt8(s >= 256 ? 0 : s, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
  });
  fs.writeFileSync(path.join(root, 'build/icon.ico'), Buffer.concat([header, ...dir, ...pngs]));
  console.log(`Wrote build/icon.ico and ${PNG_TARGETS.join(', ')}`);
  app.quit();
});
