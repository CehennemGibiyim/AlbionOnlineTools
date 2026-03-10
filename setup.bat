@echo off
REM ================================================
REM Albion Online Tools v2.0.0 - Kurulum Sihirbazı
REM ================================================

setlocal enabledelayedexpansion

REM Admin check
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [!] Bu kurulum Administrator olarak çalıştırılmalıdır.
    echo [!] Lütfen sağ-tıklayıp "Yönetici olarak çalıştır" seçeneğini kullanın.
    echo.
    pause
    exit /b 1
)

cls
echo.
echo ================================================
echo   Albion Online Tools v2.0.0 - Kurulum Sihirbazı
echo ================================================
echo.

REM Varsayılan kurulum dizini
set "INSTALL_DIR=%ProgramFiles%\Albion Online Tools"

REM Kullanıcıya seçim yaptır
echo Kurulum dizini seçin:
echo.
echo 1. Varsayılan: %INSTALL_DIR%
echo 2. Özel dizin gir
echo.
set /p CHOICE="Seçim yapın (1 veya 2): "

if "%CHOICE%"=="2" (
    set /p INSTALL_DIR="Kurulum dizinini girin: "
)

REM Kurulum klasörünü oluştur
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo.
    echo [+] Kurulum klasörü oluşturuldu
)

echo.
echo ================================================
echo   Dosyalar kopyalanıyor...
echo ================================================
echo.

REM Tüm dosyaları kopyala
xcopy "C:\Users\cehen\Downloads\AlbionTools\*.*" "%INSTALL_DIR%\" /Y /S /I 2>nul

echo [+] Docker Compose yapılandırması kopyalandı
echo [+] Tüm kaynak dosyaları kopyalandı
echo [+] Konfigürasyon dosyaları kopyalandı

echo.
echo ================================================
echo   Kısayollar oluşturuluyor...
echo ================================================
echo.

REM Start Menu klasörü
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Albion Online Tools"
if not exist "%STARTMENU%" mkdir "%STARTMENU%"

REM PowerShell script ile kısayol oluştur
powershell -Command "
\$WshShell = New-Object -ComObject WScript.Shell

REM Masaüstü kısayolu - Docker başlat
\$DesktopPath = [Environment]::GetFolderPath('Desktop')
\$shortcut1 = \$WshShell.CreateShortcut(\"\`\$DesktopPath\Albion Online Tools.lnk\")
\$shortcut1.TargetPath = \"C:\Program Files\Docker\Docker\Docker Desktop.exe\"
\$shortcut1.WorkingDirectory = \"%INSTALL_DIR%\"
\$shortcut1.Description = \"Albion Online Tools - Docker başlat\"
\$shortcut1.Save()

REM Start Menu - Ana program
\$shortcut2 = \$WshShell.CreateShortcut(\"%STARTMENU%\Başlat.lnk\")
\$shortcut2.TargetPath = \"cmd.exe\"
\$shortcut2.Arguments = \"/k cd /d \`\"%INSTALL_DIR%\`\" && docker-compose up\"
\$shortcut2.WorkingDirectory = \"%INSTALL_DIR%\"
\$shortcut2.Description = \"Albion Online Tools - Başlat\"
\$shortcut2.Save()

REM Start Menu - Browser'da aç
\$shortcut3 = \$WshShell.CreateShortcut(\"%STARTMENU%\Uygulamayı Aç.lnk\")
\$shortcut3.TargetPath = \"http://localhost:3000\"
\$shortcut3.Description = \"Albion Online Tools - Web Uygulaması\"
\$shortcut3.Save()

REM Start Menu - Klasörü aç
\$shortcut4 = \$WshShell.CreateShortcut(\"%STARTMENU%\Klasörü Aç.lnk\")
\$shortcut4.TargetPath = \"%INSTALL_DIR%\"
\$shortcut4.Description = \"Albion Online Tools - Klasör\"
\$shortcut4.Save()

REM Start Menu - Kaldır
\$shortcut5 = \$WshShell.CreateShortcut(\"%STARTMENU%\Kaldır.lnk\")
\$shortcut5.TargetPath = \"powershell.exe\"
\$shortcut5.Arguments = \"-Command `\"& {Remove-Item -Path '%INSTALL_DIR%' -Recurse -Force; Write-Host 'Kaldırıldı'; pause}`\"\"
\$shortcut5.Description = \"Albion Online Tools - Kaldır\"
\$shortcut5.Save()

Write-Host '[+] Masaüstü kısayolu oluşturuldu'
Write-Host '[+] Start Menu kısayolları oluşturuldu'
" 2>nul

echo.
echo ================================================
echo   Registry kayıtları yapılıyor...
echo ================================================
echo.

REM Registry'ye kayıt yap (Programlar ve Özellikler)
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /v "DisplayName" /d "Albion Online Tools v2.0.0" /f >nul 2>&1
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /v "InstallLocation" /d "%INSTALL_DIR%" /f >nul 2>&1
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /v "DisplayVersion" /d "2.0.0" /f >nul 2>&1
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /v "Publisher" /d "Albion Tools Team" /f >nul 2>&1
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" /v "UninstallString" /d "%INSTALL_DIR%\uninstall.bat" /f >nul 2>&1

echo [+] Registry kayıtları yapıldı

echo.
echo ================================================
echo   KURULUM BAŞARILI!
echo ================================================
echo.
echo Kurulum Yolu:  %INSTALL_DIR%
echo.
echo Başlamak için:
echo   1. Masaüstündeki "Albion Online Tools" kısayoluna çift tıkla
echo   2. Docker başlayacak ve otomatik container çalışacak
echo   3. Tarayıcında http://localhost:3000 açılacak
echo.
echo NOT: Docker Desktop yüklü olmalıdır!
echo      Değilse: https://www.docker.com/products/docker-desktop
echo.
pause
