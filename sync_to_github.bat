@echo off
echo ========================================
echo    SINCRONIZACION A GITHUB
echo    Copiando archivos para repositorio
echo ========================================
echo.

REM Crear directorio Github si no existe
if not exist "Github" (
    echo Creando directorio Github...
    mkdir "Github"
)

REM Crear directorio Github si no existe
if not exist "Github" (
    echo Creando directorio Github...
    mkdir "Github"
)

echo.
echo Copiando archivos principales...

REM Copiar archivos principales (solo si han cambiado)
echo [INFO] Verificando archivos principales...
if exist "app.py" (
    copy "app.py" "Github\" /Y >nul
    echo [OK] app.py actualizado
)
if exist "requirements.txt" (
    copy "requirements.txt" "Github\" /Y >nul
    echo [OK] requirements.txt actualizado
)
if exist "config.json" (
    copy "config.json" "Github\" /Y >nul
    echo [OK] config.json actualizado
)
if exist "README.md" (
    copy "README.md" "Github\" /Y >nul
    echo [OK] README.md actualizado
)
if exist "env.example" (
    copy "env.example" "Github\" /Y >nul
    echo [OK] env.example actualizado
)

REM Copiar scripts de utilidad (solo si han cambiado)
echo [INFO] Verificando scripts de utilidad...
if exist "backup.bat" (
    copy "backup.bat" "Github\" /Y >nul
    echo [OK] backup.bat actualizado
)
if exist "restore.bat" (
    copy "restore.bat" "Github\" /Y >nul
    echo [OK] restore.bat actualizado
)
if exist "iniciar_app.bat" (
    copy "iniciar_app.bat" "Github\" /Y >nul
    echo [OK] iniciar_app.bat actualizado
)
if exist "instalar_tts.bat" (
    copy "instalar_tts.bat" "Github\" /Y >nul
    echo [OK] instalar_tts.bat actualizado
)
if exist "sync_to_github.bat" (
    copy "sync_to_github.bat" "Github\" /Y >nul
    echo [OK] sync_to_github.bat actualizado
)

REM Copiar directorio templates (actualización incremental)
echo [INFO] Actualizando templates...
if exist "templates" (
    xcopy "templates" "Github\templates\" /E /I /Y /Q >nul
    echo [OK] Templates actualizados
) else (
    echo [WARNING] Directorio templates no encontrado
)

REM Copiar directorio static (sin videos/audios generados)
echo [INFO] Actualizando archivos estáticos...
if exist "static\css" (
    xcopy "static\css" "Github\static\css\" /E /I /Y /Q >nul
    echo [OK] CSS actualizado
)
if exist "static\js" (
    xcopy "static\js" "Github\static\js\" /E /I /Y /Q >nul
    echo [OK] JavaScript actualizado
)
if exist "static\images" (
    xcopy "static\images" "Github\static\images\" /E /I /Y /Q >nul
    echo [OK] Imágenes actualizadas
)
if exist "static\fonts" (
    xcopy "static\fonts" "Github\static\fonts\" /E /I /Y /Q >nul
    echo [OK] Fuentes actualizadas
)

REM Crear directorios vacíos para videos y audio
echo Creando estructura de directorios...
mkdir "Github\static\videos\merged" 2>nul
mkdir "Github\static\videos\loops" 2>nul
mkdir "Github\static\audio\synthesized" 2>nul
echo [OK] Estructura de directorios creada

REM Crear archivo .gitignore
echo Creando .gitignore...
echo # Entorno virtual > "Github\.gitignore"
echo venv/ >> "Github\.gitignore"
echo __pycache__/ >> "Github\.gitignore"
echo *.pyc >> "Github\.gitignore"
echo *.pyo >> "Github\.gitignore"
echo *.pyd >> "Github\.gitignore"
echo .Python >> "Github\.gitignore"
echo build/ >> "Github\.gitignore"
echo develop-eggs/ >> "Github\.gitignore"
echo dist/ >> "Github\.gitignore"
echo downloads/ >> "Github\.gitignore"
echo eggs/ >> "Github\.gitignore"
echo .eggs/ >> "Github\.gitignore"
echo lib/ >> "Github\.gitignore"
echo lib64/ >> "Github\.gitignore"
echo parts/ >> "Github\.gitignore"
echo sdist/ >> "Github\.gitignore"
echo var/ >> "Github\.gitignore"
echo wheels/ >> "Github\.gitignore"
echo *.egg-info/ >> "Github\.gitignore"
echo .installed.cfg >> "Github\.gitignore"
echo *.egg >> "Github\.gitignore"
echo. >> "Github\.gitignore"
echo # Archivos de configuración local >> "Github\.gitignore"
echo .env >> "Github\.gitignore"
echo eco-carver-466600-u1-978cfde80c53.json >> "Github\.gitignore"
echo. >> "Github\.gitignore"
echo # Archivos de desarrollo y pruebas >> "Github\.gitignore"
echo test_*.py >> "Github\.gitignore"
echo test_*.html >> "Github\.gitignore"
echo diagnose_*.py >> "Github\.gitignore"
echo find_*.py >> "Github\.gitignore"
echo debug_*.py >> "Github\.gitignore"
echo monitor_*.py >> "Github\.gitignore"
echo verify_*.py >> "Github\.gitignore"
echo ejemplo_*.srt >> "Github\.gitignore"
echo sample_*.wav >> "Github\.gitignore"
echo *.mp4 >> "Github\.gitignore"
echo *.avi >> "Github\.gitignore"
echo *.mov >> "Github\.gitignore"
echo *.wav >> "Github\.gitignore"
echo *.mp3 >> "Github\.gitignore"
echo. >> "Github\.gitignore"
echo # Directorios de respaldo >> "Github\.gitignore"
echo Backups/ >> "Github\.gitignore"
echo. >> "Github\.gitignore"
echo # Archivos del sistema >> "Github\.gitignore"
echo .DS_Store >> "Github\.gitignore"
echo Thumbs.db >> "Github\.gitignore"
echo desktop.ini >> "Github\.gitignore"
echo [OK] .gitignore creado

REM Crear archivo LICENSE
echo Creando LICENSE...
echo MIT License > "Github\LICENSE"
echo. >> "Github\LICENSE"
echo Copyright ^(c^) 2025 VideoWorkshop >> "Github\LICENSE"
echo. >> "Github\LICENSE"
echo Permission is hereby granted, free of charge, to any person obtaining a copy >> "Github\LICENSE"
echo of this software and associated documentation files ^(the "Software"^), to deal >> "Github\LICENSE"
echo in the Software without restriction, including without limitation the rights >> "Github\LICENSE"
echo to use, copy, modify, merge, publish, distribute, sublicense, and/or sell >> "Github\LICENSE"
echo copies of the Software, and to permit persons to whom the Software is >> "Github\LICENSE"
echo furnished to do so, subject to the following conditions: >> "Github\LICENSE"
echo. >> "Github\LICENSE"
echo The above copyright notice and this permission notice shall be included in all >> "Github\LICENSE"
echo copies or substantial portions of the Software. >> "Github\LICENSE"
echo. >> "Github\LICENSE"
echo THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR >> "Github\LICENSE"
echo IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, >> "Github\LICENSE"
echo FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE >> "Github\LICENSE"
echo AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER >> "Github\LICENSE"
echo LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, >> "Github\LICENSE"
echo OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE >> "Github\LICENSE"
echo SOFTWARE. >> "Github\LICENSE"
echo [OK] LICENSE creado

echo.
echo ========================================
echo    SINCRONIZACION INCREMENTAL COMPLETADA
echo ========================================
echo.
echo Archivos actualizados en: Github/
echo.
echo Archivos sincronizados:
echo   - app.py (aplicacion principal)
echo   - requirements.txt (dependencias)
echo   - config.json (configuracion)
echo   - README.md (documentacion)
echo   - env.example (ejemplo de variables)
echo   - templates/ (plantillas HTML)
echo   - static/ (CSS, JS, sin videos/audios)
echo   - Scripts .bat (utilidades)
echo   - .gitignore (archivos ignorados)
echo   - LICENSE (licencia MIT)
echo.
echo Archivos EXCLUIDOS:
echo   - .env (configuracion local)
echo   - eco-carver-466600-u1-978cfde80c53.json (credenciales)
echo   - test_*.py (archivos de prueba)
echo   - *.mp4, *.wav, *.mp3 (archivos multimedia)
echo   - Backups/ (respaldos locales)
echo   - venv/ (entorno virtual)
echo.
echo Listo para subir a GitHub!
echo.
pause
