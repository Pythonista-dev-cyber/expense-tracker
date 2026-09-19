// Builds the Microsoft Store package (.appx) into release/<version>/.
// Run with: npm run dist:store
//
// Why this wrapper: electron-builder caches the Windows Kits in a folder named "win-codesign@1.1.0",
// and makeappx.exe can't load its side-by-side manifests from a path containing "@"
// ("side-by-side configuration is incorrect"). We copy the kit to a plain path and point
// electron-builder at it with ELECTRON_BUILDER_WINDOWS_KITS_PATH.
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Arch } = require('builder-util');
const { getWindowsKitsBundle } = require('app-builder-lib/out/toolsets/windows');

(async () => {
  const bundle = await getWindowsKitsBundle({ winCodeSign: '1.1.0', arch: Arch.x64 });
  const safeKit = path.join(os.tmpdir(), 'expense-tracker-windows-kits-10.0.26100-x64');
  if (!fs.existsSync(path.join(safeKit, 'makeappx.exe'))) {
    fs.cpSync(bundle.kit, safeKit, { recursive: true });
    fs.cpSync(path.join(bundle.appxAssets, 'appxAssets'), path.join(safeKit, 'appxAssets'), {
      recursive: true,
    });
  }

  execSync('npx electron-builder --win appx', {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_BUILDER_WINDOWS_KITS_PATH: safeKit },
  });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
