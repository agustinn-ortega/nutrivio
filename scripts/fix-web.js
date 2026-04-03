const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// 1. Fix script tag: defer -> type="module"
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
html = html.replace(' defer></script>', ' type="module"></script>');

// 2. Inject @font-face with BASE64-embedded fonts (avoids MIME type issues on Vercel)
const srcFontsDir = path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const iconSetsDir = path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build');

let fontFaces = '';

// Only embed Ionicons (the one we use) to keep bundle size reasonable
const fontsToEmbed = ['Ionicons'];

if (fs.existsSync(srcFontsDir) && fs.existsSync(iconSetsDir)) {
  for (const fontName of fontsToEmbed) {
    const ttfFile = fs.readdirSync(srcFontsDir).find(f => f.startsWith(fontName) && f.endsWith('.ttf'));
    if (!ttfFile) continue;

    const ttfPath = path.join(srcFontsDir, ttfFile);
    const base64 = fs.readFileSync(ttfPath).toString('base64');

    // Read the actual font-family name from the JS source
    const jsFile = path.join(iconSetsDir, fontName + '.js');
    const families = new Set();

    if (fs.existsSync(jsFile)) {
      const content = fs.readFileSync(jsFile, 'utf8');
      const match = content.match(/createIconSet\(\w+,\s*['"]([^'"]+)['"]/);
      if (match) families.add(match[1]);
    }
    families.add(fontName);
    families.add(fontName.toLowerCase());

    for (const family of families) {
      fontFaces += `
      @font-face {
        font-family: '${family}';
        src: url(data:font/ttf;base64,${base64}) format('truetype');
        font-display: block;
      }`;
    }

    console.log(`  Embedded ${fontName} font (${(base64.length / 1024).toFixed(0)}KB base64)`);
  }
}

if (fontFaces) {
  html = html.replace('</style>', fontFaces + '\n    </style>');
}

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// 3. Write vercel.json - SPA rewrites, correct MIME types for fonts
fs.writeFileSync(
  path.join(distDir, 'vercel.json'),
  JSON.stringify({
    headers: [
      {
        source: "/assets/(.*).ttf",
        headers: [{ key: "Content-Type", value: "font/ttf" }]
      }
    ],
    rewrites: [
      { source: "/((?!_expo|assets).*)", destination: "/index.html" }
    ]
  })
);

console.log('✓ Fixed index.html (type=module, @font-face injected)');
console.log('✓ Created vercel.json (SPA rewrites, assets excluded)');
