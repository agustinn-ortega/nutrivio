const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// 1. Fix script tag: defer -> type="module"
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
html = html.replace(' defer></script>', ' type="module"></script>');

// 2. Find all font files and inject @font-face CSS
const fontsDir = path.join(distDir, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
let fontFaces = '';

if (fs.existsSync(fontsDir)) {
  const fontFiles = fs.readdirSync(fontsDir).filter(f => f.endsWith('.ttf'));
  for (const file of fontFiles) {
    // Extract font family name (e.g., "Ionicons" from "Ionicons.xxxxx.ttf")
    const family = file.split('.')[0];
    const relativePath = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/' + file;
    fontFaces += `
      @font-face {
        font-family: '${family}';
        src: url('${relativePath}') format('truetype');
        font-display: block;
      }`;
  }
}

if (fontFaces) {
  html = html.replace('</style>', fontFaces + '\n    </style>');
}

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// 3. Write vercel.json for SPA routing
fs.writeFileSync(
  path.join(distDir, 'vercel.json'),
  JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] })
);

console.log('✓ Fixed index.html (type=module, @font-face)');
console.log('✓ Created vercel.json (SPA rewrites)');
