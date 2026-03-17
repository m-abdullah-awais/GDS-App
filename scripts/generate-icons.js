const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '..', 'assets', 'images', 'GDS.jpg');
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Adaptive icon foreground: 108dp per density
// Logo occupies inner ~66dp (safe zone), so we resize logo to ~61% of total and pad the rest
const densities = [
  { name: 'mdpi',    total: 108 },
  { name: 'hdpi',    total: 162 },
  { name: 'xhdpi',   total: 216 },
  { name: 'xxhdpi',  total: 324 },
  { name: 'xxxhdpi', total: 432 },
];

// Legacy icons for pre-API 26
const legacySizes = [
  { name: 'mdpi',    size: 48 },
  { name: 'hdpi',    size: 72 },
  { name: 'xhdpi',   size: 96 },
  { name: 'xxhdpi',  size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

async function generate() {
  for (const { name, total } of densities) {
    const logoSize = Math.round(total * 0.65);
    const padding = Math.round((total - logoSize) / 2);

    await sharp(input)
      .resize(logoSize, logoSize, { fit: 'contain', background: '#000000' })
      .extend({
        top: padding,
        bottom: total - logoSize - padding,
        left: padding,
        right: total - logoSize - padding,
        background: '#000000',
      })
      .png()
      .toFile(path.join(resDir, `drawable-${name}`, 'ic_launcher_foreground.png'));

    console.log(`Generated drawable-${name}/ic_launcher_foreground.png (${total}x${total})`);
  }

  // Legacy icons
  for (const { name, size } of legacySizes) {
    await sharp(input)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(resDir, `mipmap-${name}`, 'ic_launcher.png'));

    await sharp(input)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(resDir, `mipmap-${name}`, 'ic_launcher_round.png'));

    console.log(`Generated mipmap-${name}/ic_launcher.png & ic_launcher_round.png (${size}x${size})`);
  }
}

generate().then(() => console.log('Done!')).catch(console.error);
