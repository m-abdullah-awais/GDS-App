const fs = require('fs');
const path = require('path');

const assetsDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-navigation',
  'drawer',
  'lib',
  'module',
  'views',
  'assets'
);

const scales = ['2x', '3x', '4x'];

function copyIfMissing(scale) {
  const generic = path.join(assetsDir, `toggle-drawer-icon@${scale}.png`);
  const android = path.join(assetsDir, `toggle-drawer-icon@${scale}.android.png`);
  const ios = path.join(assetsDir, `toggle-drawer-icon@${scale}.ios.png`);

  if (fs.existsSync(generic)) {
    return;
  }

  const source = fs.existsSync(android) ? android : fs.existsSync(ios) ? ios : null;

  if (source) {
    fs.copyFileSync(source, generic);
    console.log(`Created ${path.basename(generic)} from ${path.basename(source)}`);
  }
}

if (fs.existsSync(assetsDir)) {
  scales.forEach(copyIfMissing);
}
