@echo off
echo ========================================
echo           SISTEMA DE BACKUP
echo ========================================
echo.

REM Solicitar nombre personalizado para el checkpoint
echo [INFO] Ingresa un nombre descriptivo para este checkpoint
echo [INFO] Ejemplos: "funcionando_text_audio", "version_estable", "antes_cambios", etc.
echo.
set /p "checkpoint_name=Nombre del checkpoint: "

REM Validar que se ingresó un nombre
if "%checkpoint_name%"=="" (
    echo [ERROR] Debes ingresar un nombre para el checkpoint
    pause
    exit /b 1
)

REM Limpiar el nombre del checkpoint (remover caracteres especiales)
set "checkpoint_name=%checkpoint_name: =_%"
set "checkpoint_name=%checkpoint_name:/=_%"
set "checkpoint_name=%checkpoint_name:\=_%"
set "checkpoint_name=%checkpoint_name::=_%"
set "checkpoint_name=%checkpoint_name:?=_%"
set "checkpoint_name=%checkpoint_name:<=_%"
set "checkpoint_name=%checkpoint_name:>=_%"
set "checkpoint_name=%checkpoint_name:|=_%"

REM Crear directorio de respaldo con nombre personalizado y timestamp
set "timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "timestamp=%timestamp: =0%"
set "backup_dir=Backups\%checkpoint_name%_%timestamp%"
mkdir "%backup_dir%"

echo [INFO] Creando respaldo en: %backup_dir%
echo [INFO] Nombre del checkpoint: %checkpoint_name%
echo [INFO] Fecha y hora: %timestamp%
echo.

REM Copiar archivos principales
echo [INFO] Respaldando archivos principales...
if exist "app.py" (
    copy "app.py" "%backup_dir%\app.py"
    echo [OK] app.py copiado
) else (
    echo [WARNING] app.py no encontrado
)

if exist "requirements.txt" (
    copy "requirements.txt" "%backup_dir%\requirements.txt"
    echo [OK] requirements.txt copiado
) else (
    echo [WARNING] requirements.txt no encontrado
)

if exist "config.json" (
    copy "config.json" "%backup_dir%\config.json"
    echo [OK] config.json copiado
) else (
    echo [WARNING] config.json no encontrado
)

if exist ".env" (
    copy ".env" "%backup_dir%\.env"
    echo [OK] .env copiado
) else (
    echo [WARNING] .env no encontrado
)

if exist "eco-carver-466600-u1-978cfde80c53.json" (
    copy "eco-carver-466600-u1-978cfde80c53.json" "%backup_dir%\eco-carver-466600-u1-978cfde80c53.json"
    echo [OK] credenciales Google copiadas
) else (
    echo [WARNING] credenciales Google no encontradas
)

REM Copiar scripts de backup y restauracion
echo [INFO] Respaldando scripts de backup...
if exist "backup.bat" (
    copy "backup.bat" "%backup_dir%\backup.bat"
    echo [OK] backup.bat copiado
)
if exist "restore.bat" (
    copy "restore.bat" "%backup_dir%\restore.bat"
    echo [OK] restore.bat copiado
)

REM Copiar scripts de aplicacion
echo [INFO] Respaldando scripts de aplicacion...
if exist "iniciar_app.bat" (
    copy "iniciar_app.bat" "%backup_dir%\iniciar_app.bat"
    echo [OK] iniciar_app.bat copiado
) else (
    echo [WARNING] iniciar_app.bat no encontrado
)

if exist "instalar_tts.bat" (
    copy "instalar_tts.bat" "%backup_dir%\instalar_tts.bat"
    echo [OK] instalar_tts.bat copiado
) else (
    echo [WARNING] instalar_tts.bat no encontrado
)

REM Copiar archivo de ejemplo de variables de entorno
if exist "env.example" (
    copy "env.example" "%backup_dir%\env.example"
    echo [OK] env.example copiado
) else (
    echo [WARNING] env.example no encontrado
)

REM Copiar directorio templates completo
echo [INFO] Respaldando directorio templates...
if exist "templates" (
    xcopy "templates" "%backup_dir%\templates\" /E /I /Y
    echo [OK] templates/ copiado
) else (
    echo [WARNING] directorio templates no encontrado
)

REM Copiar directorio static si existe
echo [INFO] Respaldando directorio static...
if exist "static" (
    xcopy "static" "%backup_dir%\static\" /E /I /Y
    echo [OK] static/ copiado
) else (
    echo [WARNING] directorio static no encontrado
)

REM Crear directorios de videos y audio vacíos (sin contenido)
echo [INFO] Creando estructura de directorios...
mkdir "%backup_dir%\static\videos\merged" 2>nul
mkdir "%backup_dir%\static\videos\loops" 2>nul
mkdir "%backup_dir%\static\audio\synthesized" 2>nul
echo [OK] Estructura de directorios creada

REM Crear archivo de información del backup
echo [INFO] Creando información del backup...
echo Backup creado: %date% %time% > "%backup_dir%\backup_info.txt"
echo Checkpoint: %checkpoint_name% >> "%backup_dir%\backup_info.txt"
echo Directorio: %backup_dir% >> "%backup_dir%\backup_info.txt"
echo Nombre original: %checkpoint_name% >> "%backup_dir%\backup_info.txt"
echo [OK] Información del backup creada

echo.
echo [OK] Respaldo completado exitosamente
echo [INFO] Checkpoint: %checkpoint_name%
echo [INFO] Ubicacion: %backup_dir%
echo [INFO] Fecha y hora: %timestamp%
echo.
echo [INFO] Archivos respaldados:
echo   - app.py (aplicacion principal)
echo   - requirements.txt (dependencias)
echo   - config.json (configuracion)
echo   - .env (variables de entorno)
echo   - eco-carver-466600-u1-978cfde80c53.json (credenciales Google)
echo   - templates/ (directorio completo)
echo   - static/ (directorio completo, sin videos/audios)
echo   - backup.bat, restore.bat (scripts de backup)
echo   - iniciar_app.bat (script para iniciar aplicacion)
echo   - instalar_tts.bat (script para instalar TTS)
echo   - env.example (ejemplo de variables de entorno)
echo.
echo [INFO] Para restaurar: usar restore.bat
echo.
pause