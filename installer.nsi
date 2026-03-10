; Albion Online Tools v2.0.0 - Kurulum Sihirbazı
; NSIS Installer Script

!include "MUI2.nsh"
!include "WinMessages.nsh"
!include "x64.nsh"

; ========================================
; KURULUM AYARLARI
; ========================================

Name "Albion Online Tools v2.0.0"
OutFile "D:\Finish\Albion-Online-Tools-Setup-v2.0.0.exe"
InstallDir "$PROGRAMFILES64\Albion Online Tools"
InstallDirRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "InstallLocation"

RequestExecutionLevel admin

; ========================================
; ARAYÜZ AYARLARI (Modern UI)
; ========================================

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Turkish"

; ========================================
; KURULUM BÖLÜMÜ
; ========================================

Section "Albion Online Tools"
  SetOutPath "$INSTDIR"
  
  ; Docker Compose dosyasını kopyala
  File "C:\Users\cehen\Downloads\AlbionTools\docker-compose.yml"
  File "C:\Users\cehen\Downloads\AlbionTools\Dockerfile"
  File "C:\Users\cehen\Downloads\AlbionTools\.dockerignore"
  File "C:\Users\cehen\Downloads\AlbionTools\package.json"
  File "C:\Users\cehen\Downloads\AlbionTools\package-lock.json"
  File "C:\Users\cehen\Downloads\AlbionTools\README.md"
  
  ; Tüm kaynak dosyaları kopyala
  SetOutPath "$INSTDIR\src"
  File /r "C:\Users\cehen\Downloads\AlbionTools\*.js"
  
  SetOutPath "$INSTDIR\css"
  File /r "C:\Users\cehen\Downloads\AlbionTools\css\*.*"
  
  SetOutPath "$INSTDIR\js"
  File /r "C:\Users\cehen\Downloads\AlbionTools\js\*.*"
  
  SetOutPath "$INSTDIR\data"
  File /r "C:\Users\cehen\Downloads\AlbionTools\data\*.*"
  
  ; HTML dosyaları
  SetOutPath "$INSTDIR"
  File "C:\Users\cehen\Downloads\AlbionTools\index.html"
  File "C:\Users\cehen\Downloads\AlbionTools\manifest.json"
  
  ; Başlangıç ve hızlı başlama scriptleri oluştur
  SetOutPath "$INSTDIR"
  
  ; Docker'ı başlat scripti
  FileOpen $0 "$INSTDIR\docker-start.bat" w
  FileWrite $0 "@echo off$\r$\n"
  FileWrite $0 "title Albion Online Tools - Docker Container$\r$\n"
  FileWrite $0 "cd /d `"%~dp0`"$\r$\n"
  FileWrite $0 "docker-compose up$\r$\n"
  FileClose $0
  
  ; Browser'ı aç scripti
  FileOpen $0 "$INSTDIR\launch-browser.bat" w
  FileWrite $0 "@echo off$\r$\n"
  FileWrite $0 "timeout /t 5$\r$\n"
  FileWrite $0 "start http://localhost:3000$\r$\n"
  FileClose $0
  
  ; Kısayollar oluştur
  SetOutPath "$SMPROGRAMS\Albion Online Tools"
  CreateDirectory "$SMPROGRAMS\Albion Online Tools"
  
  ; Ana programı başlat kısayolu
  CreateShortcut "$SMPROGRAMS\Albion Online Tools\Albion Online Tools.lnk" "$INSTDIR\docker-start.bat" "" "$INSTDIR\docker-start.bat" 0
  
  ; Browser'ı aç kısayolu
  CreateShortcut "$SMPROGRAMS\Albion Online Tools\Uygulamayı Aç.lnk" "$INSTDIR\launch-browser.bat" "" "$INSTDIR\launch-browser.bat" 0
  
  ; Klasörü aç kısayolu
  CreateShortcut "$SMPROGRAMS\Albion Online Tools\Klasörü Aç.lnk" "$INSTDIR" "" "$INSTDIR" 0
  
  ; Kaldır kısayolu
  CreateShortcut "$SMPROGRAMS\Albion Online Tools\Kaldır.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  
  ; Masaüstü kısayolu
  CreateDirectory "$DESKTOP"
  CreateShortcut "$DESKTOP\Albion Online Tools.lnk" "$INSTDIR\docker-start.bat" "" "$INSTDIR\docker-start.bat" 0
  
  ; Çıkartıcı oluştur
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Registry'ye kaydet (Programlar ve Özellikler'de görünmesi için)
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "DisplayName" "Albion Online Tools v2.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "DisplayVersion" "2.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools" "Publisher" "Albion Tools Team"
  
  ; İlk çalıştırmayı başlat
  Exec "$INSTDIR\docker-start.bat"
  
SectionEnd

; ========================================
; KALDIRMA BÖLÜMÜ
; ========================================

Section "Uninstall"
  
  ; Docker container'ı durdur
  ExecWait "docker-compose -f $INSTDIR\docker-compose.yml down"
  
  ; Klasörü ve dosyaları sil
  RMDir /r "$INSTDIR"
  
  ; Start Menu klasörünü sil
  RMDir /r "$SMPROGRAMS\Albion Online Tools"
  
  ; Masaüstü kısayolunu sil
  Delete "$DESKTOP\Albion Online Tools.lnk"
  
  ; Registry'den kaldır
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlbionTools"
  
SectionEnd

; ========================================
; DESCRIPTION MESSAGES
; ========================================

LangString DESC_Section1 ${LANG_TURKISH} "Albion Online Tools - Kapsamlı Albion Online araç takımı"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${Section1} $(DESC_Section1)
!insertmacro MUI_FUNCTION_DESCRIPTION_END
