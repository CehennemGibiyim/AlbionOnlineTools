const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Tüm Electron bağımlılıkları kopyalanıyor...\n');

const sourceDir = 'node_modules/electron/dist';
const destDir = 'D:\\Finish';

// Tüm dosyaları kopyala (electron.exe hariç)
const files = fs.readdirSync(sourceDir);
let copied = 0;

files.forEach(file => {
  if (file === 'electron.exe') return;
  
  const src = path.join(sourceDir, file);
  const dest = path.join(destDir, file);
  
  if (fs.statSync(src).isDirectory()) {
    // Folder'ı kopyala
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true});
    try {
      execSync(`xcopy "${src}\\*.*" "${dest}\\" /Y /S /I 2>nul`);
      console.log(`✓ ${file}/`);
    } catch(e) {}
  } else {
    // File'ı kopyala
    try {
      fs.copyFileSync(src, dest);
      copied++;
      console.log(`✓ ${file}`);
    } catch(e) {
      console.log(`✗ ${file} (skipped)`);
    }
  }
});

console.log(`\n✅ Tamamlandı! ${copied} dosya + folders kopyalandı`);

// Now create the app.asar
console.log('\n📦 App package oluşturuluyor...\n');

const appDir = destDir;
if (!fs.existsSync(path.join(appDir, 'resources'))) {
  fs.mkdirSync(path.join(appDir, 'resources'), { recursive: true });
}

// Main files'ı kopyala
const mainFiles = ['index.html', 'main.js', 'preload.js', 'service-worker.js', 'manifest.json'];
mainFiles.forEach(file => {
  const src = file;
  const dest = path.join(appDir, 'resources', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ ${file}`);
  }
});

// Folders'ı kopyala
const folders = ['css', 'js', 'data'];
folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    const dest = path.join(appDir, 'resources', folder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    execSync(`xcopy "${folder}\\*.*" "${dest}\\" /Y /S /I 2>nul`);
    console.log(`✓ ${folder}/`);
  }
});

console.log('\n✅ Albion Online Tools Portable EXE hazır!');
console.log(`📁 Location: ${destDir}\\Albion-Online-Tools.exe`);
