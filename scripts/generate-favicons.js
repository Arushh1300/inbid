const fs = require('fs');
const path = require('path');

const width = 32;
const height = 32;
const pixels = new Uint8Array(width * height * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

// Background: rounded dark slate #0F172A
const r = 6;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let isCorner = false;
    if (x < r && y < r) {
      if ((x - r) * (x - r) + (y - r) * (y - r) > r * r) isCorner = true;
    } else if (x >= width - r && y < r) {
      if ((x - (width - 1 - r)) * (x - (width - 1 - r)) + (y - r) * (y - r) > r * r) isCorner = true;
    } else if (x < r && y >= height - r) {
      if ((x - r) * (x - r) + (y - (height - 1 - r)) * (y - (height - 1 - r)) > r * r) isCorner = true;
    } else if (x >= width - r && y >= height - r) {
      if ((x - (width - 1 - r)) * (x - (width - 1 - r)) + (y - (height - 1 - r)) * (y - (height - 1 - r)) > r * r) isCorner = true;
    }

    if (isCorner) {
      setPixel(x, y, 0, 0, 0, 0);
    } else {
      setPixel(x, y, 15, 23, 42, 255);
    }
  }
}

// Top bar: short, orange #F97316 (y: 8..10, x: 6..13)
for (let y = 8; y <= 10; y++) {
  for (let x = 6; x <= 13; x++) {
    setPixel(x, y, 249, 115, 22);
  }
}

// Middle bar: medium, white #FFFFFF (y: 14..16, x: 6..19)
for (let y = 14; y <= 16; y++) {
  for (let x = 6; x <= 19; x++) {
    setPixel(x, y, 255, 255, 255);
  }
}

// Bottom bar: long, white #FFFFFF (y: 20..22, x: 6..25)
for (let y = 20; y <= 22; y++) {
  for (let x = 6; x <= 25; x++) {
    setPixel(x, y, 255, 255, 255);
  }
}

// Build ICO Buffer
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(32, 0);
dirEntry.writeUInt8(32, 1);
dirEntry.writeUInt8(0, 2);
dirEntry.writeUInt8(0, 3);
dirEntry.writeUInt16LE(1, 4);
dirEntry.writeUInt16LE(32, 6);
const imageSize = 40 + 4096 + 128;
dirEntry.writeUInt32LE(imageSize, 8);
dirEntry.writeUInt32LE(22, 12);

const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);
bmpHeader.writeInt32LE(32, 4);
bmpHeader.writeInt32LE(64, 8);
bmpHeader.writeUInt16LE(1, 12);
bmpHeader.writeUInt16LE(32, 14);
bmpHeader.writeUInt32LE(0, 16);
bmpHeader.writeUInt32LE(4096, 20);

const pixelBuffer = Buffer.alloc(4096);
for (let y = 0; y < 32; y++) {
  const srcY = 31 - y;
  for (let x = 0; x < 32; x++) {
    const srcIdx = (srcY * 32 + x) * 4;
    const destIdx = (y * 32 + x) * 4;
    pixelBuffer[destIdx] = pixels[srcIdx + 2];     // B
    pixelBuffer[destIdx + 1] = pixels[srcIdx + 1]; // G
    pixelBuffer[destIdx + 2] = pixels[srcIdx];     // R
    pixelBuffer[destIdx + 3] = pixels[srcIdx + 3]; // A
  }
}

const maskBuffer = Buffer.alloc(128, 0);
const icoBuffer = Buffer.concat([icoHeader, dirEntry, bmpHeader, pixelBuffer, maskBuffer]);

// Write ICO to src/app/favicon.ico and public/favicon.ico
fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
console.log('Successfully generated favicon.ico in src/app and public');
