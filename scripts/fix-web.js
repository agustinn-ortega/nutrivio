const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// 1. Fix script tag: defer -> type="module"
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
html = html.replace(' defer></script>', ' type="module"></script>');

// 2. Read the actual font-family names from the icon set source files
// @expo/vector-icons uses lowercase names in createIconSet calls
const iconSetsDir = path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build');
const fontFamilyMap = {};

if (fs.existsSync(iconSetsDir)) {
  const jsFiles = fs.readdirSync(iconSetsDir).filter(f => f.endsWith('.js') && !f.startsWith('create'));
  for (const jsFile of jsFiles) {
    try {
      const content = fs.readFileSync(path.join(iconSetsDir, jsFile), 'utf8');
      // Match: createIconSet(glyphMap, 'fontfamilyname', font)
      const match = content.match(/createIconSet\(\w+,\s*['"]([^'"]+)['"]/);
      if (match) {
        const baseName = jsFile.replace('.js', '');
        fontFamilyMap[baseName] = match[1];
      }
    } catch {}
  }
}

// 3. Inject @font-face for all font files with BOTH original and lowercase names
const fontsDir = path.join(distDir, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
let fontFaces = '';

if (fs.existsSync(fontsDir)) {
  const fontFiles = fs.readdirSync(fontsDir).filter(f => f.endsWith('.ttf'));
  for (const file of fontFiles) {
    const baseName = file.split('.')[0];
    const relativePath = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/' + file;

    // Get the actual family name used by the icon component
    const actualFamily = fontFamilyMap[baseName];
    const families = new Set([baseName]);
    if (actualFamily) families.add(actualFamily);
    // Also add lowercase version just in case
    families.add(baseName.toLowerCase());

    for (const family of families) {
      fontFaces += `
      @font-face {
        font-family: '${family}';
        src: url('${relativePath}') format('truetype');
        font-display: block;
      }`;
    }
  }
}

if (fontFaces) {
  html = html.replace('</style>', fontFaces + '\n    </style>');
}

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// 4. Write vercel.json for SPA routing
fs.writeFileSync(
  path.join(distDir, 'vercel.json'),
  JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] })
);

const fontCount = Object.keys(fontFamilyMap).length;
console.log(`✓ Fixed index.html (type=module, ${fontCount} icon fonts with @font-face)`);
console.log('✓ Created vercel.json (SPA rewrites)');
