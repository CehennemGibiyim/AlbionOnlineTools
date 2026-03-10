#!/usr/bin/env node

/**
 * Build script for Electron application
 * Creates EXE installer for Windows
 */

const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

const Platform = builder.Platform;

// Ensure icon exists
const iconPath = path.join(__dirname, 'dist', 'assets', 'icon.png');
const iconDir = path.dirname(iconPath);

if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

// Create placeholder icon if not exists
if (!fs.existsSync(iconPath)) {
    console.log('⚠️  Icon not found. Creating placeholder...');
    // In real build, this would be replaced with actual icon
    fs.copyFileSync(
        path.join(__dirname, 'node_modules', 'electron-builder', 'templates', 'Elastic@2x.png'),
        iconPath
    ).catch(() => {
        console.log('Using default icon');
    });
}

const buildConfig = {
    appId: 'com.albion.tools',
    productName: 'Albion Online Tools',
    directories: {
        output: 'release',
        buildResources: 'dist/assets'
    },
    files: [
        {
            from: '.',
            to: '.',
            filter: ['!node_modules', '!release', '!.git', '!.DS_Store', '!*.md', '!*.log', '!.env']
        },
        'node_modules/**/*',
        'index.html',
        'main.js',
        'preload.js',
        'service-worker.js',
        'manifest.json',
        'css/**/*',
        'js/**/*',
        'data/**/*'
    ],
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64']
            },
            {
                target: 'portable',
                arch: ['x64']
            }
        ],
        icon: 'dist/assets/icon.png',
        certificateFile: undefined,
        certificatePassword: undefined,
        signingHashAlgorithms: ['sha256']
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'Albion Online Tools',
        installerIcon: 'dist/assets/icon.png',
        uninstallerIcon: 'dist/assets/icon.png',
        installerHeaderIcon: 'dist/assets/icon.png'
    },
    portable: {
        artifactName: '${productName}-${version}-portable.exe'
    }
};

async function build() {
    try {
        console.log('🔨 Building Electron application...');
        console.log('📦 Target: Windows x64');
        
        const result = await builder.build({
            targets: Platform.WINDOWS.createTarget(['nsis', 'portable']),
            config: buildConfig,
            publish: 'never'
        });

        console.log('✅ Build completed successfully!');
        console.log('📍 Output location: ./release');
        console.log('📦 Files:');
        result.forEach(file => {
            console.log(`   - ${file}`);
        });

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build
build();
