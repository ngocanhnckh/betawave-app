// Script to generate app icons
// Run with: node assets/createIcons.js

const fs = require('fs');
const path = require('path');

// SVG for tray icon (22x22 template image)
const trayIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="9" fill="none" stroke="#000000" stroke-width="1.5"/>
  <path d="M5 11 Q8 7 11 11 Q14 15 17 11" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// SVG for app icon (larger, with colors)
const appIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c5cff"/>
      <stop offset="100%" style="stop-color:#5ce1e6"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e0e0ff"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="12"/>
  <circle cx="256" cy="256" r="140" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
  <path d="M100 256 Q178 180 256 256 Q334 332 412 256" fill="none" stroke="url(#waveGrad)" stroke-width="20" stroke-linecap="round"/>
</svg>`;

// Write SVG files
fs.writeFileSync(path.join(__dirname, 'trayIconTemplate.svg'), trayIconSVG);
fs.writeFileSync(path.join(__dirname, 'icon.svg'), appIconSVG);

console.log('SVG icons created. To convert to PNG/ICNS:');
console.log('1. Use an online converter or imagemagick');
console.log('2. For tray: convert to 22x22 PNG');
console.log('3. For app icon: convert to 512x512 PNG and icns');
