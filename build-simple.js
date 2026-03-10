const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Basit Exe Builder başlatılıyor...');

// Build directory
const buildDir = path.join(__dirname, 'dist-simple');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Copy essential files only
const essentialFiles = [
    'index.html',
    'main.js',
    'css',
    'js',
    'data'
];

essentialFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(buildDir, file);
    
    if (fs.existsSync(src)) {
        console.log(`📁 Kopyalanıyor: ${file}`);
        copyRecursive(src, dest);
        console.log(`✅ Kopyalandı: ${file}`);
    }
});

// Copy function
function copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(child => {
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Create simple package.json for dist
const distPackageJson = {
    name: "albion-tools",
    version: "1.0.0",
    main: "main.js",
    description: "Albion Online Tools — Craft, Market, KillBoard, Avalon Maps",
    author: "Albion Tools Team",
    license: "MIT"
};

fs.writeFileSync(
    path.join(buildDir, 'package.json'),
    JSON.stringify(distPackageJson, null, 2)
);

// Create simple bat file to run with electron
const batContent = `@echo off
echo Albion Online Tools başlatılıyor...
echo.
node_modules\\.bin\\electron . main.js
pause
`;

fs.writeFileSync(path.join(buildDir, 'AlbionTools.bat'), batContent);

console.log('✅ Basit build tamamlandı!');
console.log('📁 Dist klasörü:', buildDir);
console.log('🚀 Çalıştırmak için:');
console.log('   cd ' + buildDir);
console.log('   AlbionTools.bat');
