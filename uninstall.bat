@echo off
REM Albion Online Tools - Kaldırma Scripti

setlocal enabledelayedexpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Administrator olarak çalıştırılmalıdır!
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Albion Online Tools - Kaldırılıyor...
echo ================================================
echo.

set "INSTALL_DIR=%ProgramFiles%\Albion Online Tools"

REM Docker container'ı durdur
echo [*] Docker container durduruluyor...
cd /d "%INSTALL_DIR%"
docker-compose down 2>nul

REM Klasörü sil
echo [*] Dosyalar siliniyor...
rmdir /s /q "%INSTALL_DIR%" 2>nul

REM Start Menu sil
rmdir /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Albion Online Tools" 2>nul

REM Masaüstü kısayolunu sil
del "%USERPROFILE%\Desktop\Albion Online Tools.lnk" 2>nul

REM Registry sil
reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /f 2>nul

echo.
echo ================================================
echo   KALDIRMA TAMAMLANDI!
echo ================================================
echo.
pause
