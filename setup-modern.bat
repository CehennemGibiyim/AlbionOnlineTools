@echo off
setlocal enabledelayedexpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Administrator olarak calistir!
    pause
    exit /b 1
)

cls
echo.
echo ================================================
echo   Albion Online Tools v2.0.0 - Kurulum
echo ================================================
echo.

set "INSTALL_DIR=%ProgramFiles%\Albion Online Tools"

echo Kurulum dizini: %INSTALL_DIR%
echo.

if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
)

echo Dosyalar kopyalaniyor...
xcopy "C:\Users\cehen\Downloads\AlbionTools\*.*" "%INSTALL_DIR%\" /Y /S /I 2>nul

echo.
echo ================================================
echo   Kurulum Tamamlandi!
echo ================================================
echo.

REM Docker Desktop'ı başlat
echo Docker baslatiliyor...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

timeout /t 5

REM Container'ı başlat
cd /d "%INSTALL_DIR%"
docker-compose up -d

timeout /t 10

REM Ngrok ile public URL oluştur
echo.
echo Web uygulamasi yayinlanyor...
echo.

REM Ngrok config oluştur ve başlat
if exist ngrok.exe (
    start "" ngrok.exe http 3000
    timeout /t 3
    
    REM Ngrok status URL'sinden public URL'yi al
    powershell -Command "
    try {
        \$response = Invoke-WebRequest -Uri 'http://localhost:4040/api/tunnels' -UseBasicParsing
        \$json = ConvertFrom-Json \$response.Content
        \$publicUrl = \$json.tunnels[0].public_url
        Write-Host \"\"
        Write-Host \"========================================\"
        Write-Host \"   ALBION ONLINE TOOLS HAZIR!\"
        Write-Host \"========================================\"
        Write-Host \"\"
        Write-Host \"Web Adresi: \$publicUrl\"
        Write-Host \"\"
        Write-Host \"Tarayicida bu adresi ac.\"
        Write-Host \"\"
        Write-Host \"========================================\"
        Write-Host \"\"
        Start-Process \$publicUrl
    } catch {
        Write-Host \"Ngrok calismadi. Localhost kullaniyor...\"
        Start-Process 'http://localhost:3000'
    }
    "
) else (
    echo Tarayici aciliyor...
    start "" "http://localhost:3000"
)

pause
