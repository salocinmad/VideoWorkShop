@echo off
setlocal enabledelayedexpansion

echo ========================================
echo         SISTEMA DE RESTAURACIÓN
echo ========================================
echo.

REM Verificar que existe la carpeta Backups
if not exist "Backups" (
    echo [ERROR] No existe la carpeta 'Backups'
    echo [INFO] Ejecuta primero backup.bat para crear un checkpoint
    pause
    exit /b 1
)

REM Contar checkpoints disponibles
set checkpoint_count=0
for /d %%i in (Backups\*) do (
    set /a checkpoint_count+=1
)

if %checkpoint_count%==0 (
    echo [ERROR] No hay checkpoints disponibles en la carpeta Backups
    pause
    exit /b 1
)

echo [INFO] Checkpoints disponibles:
echo.

REM Mostrar lista de checkpoints numerados
set current_num=1
for /d %%i in (Backups\*) do (
    set checkpoint_name=%%~ni
    set display_name=!checkpoint_name!
    
    REM Leer nombre original si existe
    if exist "%%i\backup_info.txt" (
        for /f "tokens=2*" %%a in ('findstr "Nombre original:" "%%i\backup_info.txt"') do (
            set display_name=%%a %%b
        )
    )
    
    echo !current_num!. !display_name!
    
    REM Mostrar información del backup si existe
    if exist "%%i\backup_info.txt" (
        for /f "tokens=2*" %%a in ('findstr "Backup creado:" "%%i\backup_info.txt"') do (
            echo    Fecha: %%a %%b
        )
    )
    echo    Carpeta: %%i
    echo.
    set /a current_num+=1
)

echo.
set /p choice="Selecciona el número del checkpoint a restaurar (1-%checkpoint_count%): "

REM Validar entrada
if "%choice%"=="" (
    echo [ERROR] Debes seleccionar un número
    pause
    exit /b 1
)

REM Verificar que el número es válido
if %choice% LSS 1 (
    echo [ERROR] Número inválido
    pause
    exit /b 1
)

if %choice% GTR %checkpoint_count% (
    echo [ERROR] Número inválido
    pause
    exit /b 1
)

REM Encontrar el checkpoint seleccionado
set current_num=1
set selected_checkpoint=
for /d %%i in (Backups\*) do (
    if !current_num!==%choice% (
        set selected_checkpoint=%%i
        goto :found
    )
    set /a current_num+=1
)

:found
if "%selected_checkpoint%"=="" (
    echo [ERROR] No se pudo encontrar el checkpoint seleccionado
    pause
    exit /b 1
)

REM Obtener nombre original para mostrar
set display_name=%selected_checkpoint%
if exist "%selected_checkpoint%\backup_info.txt" (
    for /f "tokens=2*" %%a in ('findstr "Nombre original:" "%selected_checkpoint%\backup_info.txt"') do (
        set display_name=%%a %%b
    )
)

echo.
echo ========================================
echo        CONFIRMACIÓN DE RESTAURACIÓN
echo ========================================
echo [INFO] Checkpoint seleccionado: %display_name%
echo [INFO] Directorio: %selected_checkpoint%
echo.

REM Mostrar información del backup
if exist "%selected_checkpoint%\backup_info.txt" (
    echo [INFO] Información del backup:
    type "%selected_checkpoint%\backup_info.txt"
    echo.
)

echo [WARNING] Esta operación sobrescribirá los archivos actuales
echo [WARNING] Se creará un backup de seguridad del estado actual
echo.
echo ¿Deseas continuar? (S/N)
set /p confirm=
if /i not "%confirm%"=="S" (
    echo [INFO] Restauración cancelada
    pause
    exit /b 1
)

echo.
echo [INFO] Iniciando restauración...

REM Crear backup de seguridad del estado actual
echo [INFO] Creando backup de seguridad del estado actual...
set "current_timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "current_timestamp=%current_timestamp: =0%"
set current_backup=Backups\_current_backup_%current_timestamp%
mkdir "%current_backup%" 2>nul

REM Hacer backup de archivos actuales
echo [INFO] Respaldando archivos actuales...
if exist "app.py" copy "app.py" "%current_backup%\" >nul
if exist "requirements.txt" copy "requirements.txt" "%current_backup%\" >nul
if exist "config.json" copy "config.json" "%current_backup%\" >nul
if exist ".env" copy ".env" "%current_backup%\" >nul
if exist "eco-carver-466600-u1-978cfde80c53.json" copy "eco-carver-466600-u1-978cfde80c53.json" "%current_backup%\" >nul

if exist "templates" xcopy "templates" "%current_backup%\templates\" /E /I /Q >nul
if exist "static" xcopy "static" "%current_backup%\static\" /E /I /Q >nul

echo [OK] Backup de seguridad creado en: %current_backup%

REM Restaurar archivos del checkpoint
echo [INFO] Restaurando archivos...

REM Restaurar archivos principales
if exist "%selected_checkpoint%\app.py" (
    copy "%selected_checkpoint%\app.py" "." >nul
    echo [OK] app.py restaurado
)
if exist "%selected_checkpoint%\requirements.txt" (
    copy "%selected_checkpoint%\requirements.txt" "." >nul
    echo [OK] requirements.txt restaurado
)
if exist "%selected_checkpoint%\config.json" (
    copy "%selected_checkpoint%\config.json" "." >nul
    echo [OK] config.json restaurado
)
if exist "%selected_checkpoint%\.env" (
    copy "%selected_checkpoint%\.env" "." >nul
    echo [OK] .env restaurado
)
if exist "%selected_checkpoint%\eco-carver-466600-u1-978cfde80c53.json" (
    copy "%selected_checkpoint%\eco-carver-466600-u1-978cfde80c53.json" "." >nul
    echo [OK] credenciales Google restauradas
)

REM Restaurar scripts de aplicacion
if exist "%selected_checkpoint%\iniciar_app.bat" (
    copy "%selected_checkpoint%\iniciar_app.bat" "." >nul
    echo [OK] iniciar_app.bat restaurado
)
if exist "%selected_checkpoint%\instalar_tts.bat" (
    copy "%selected_checkpoint%\instalar_tts.bat" "." >nul
    echo [OK] instalar_tts.bat restaurado
)
if exist "%selected_checkpoint%\sync_to_github.bat" (
    copy "%selected_checkpoint%\sync_to_github.bat" "." >nul
    echo [OK] sync_to_github.bat restaurado
)
if exist "%selected_checkpoint%\env.example" (
    copy "%selected_checkpoint%\env.example" "." >nul
    echo [OK] env.example restaurado
)

REM Restaurar directorios
if exist "%selected_checkpoint%\templates" (
    if exist "templates" rmdir /s /q "templates"
    xcopy "%selected_checkpoint%\templates" "templates\" /E /I /Q >nul
    echo [OK] templates/ restaurado
)

if exist "%selected_checkpoint%\static" (
    if exist "static" rmdir /s /q "static"
    xcopy "%selected_checkpoint%\static" "static\" /E /I /Q >nul
    echo [OK] static/ restaurado
)

REM Sincronizar con GitHub después de restaurar
echo [INFO] Sincronizando con carpeta Github...
if exist "sync_to_github.bat" (
    call "sync_to_github.bat"
    echo [OK] Sincronización con GitHub completada
) else (
    echo [WARNING] sync_to_github.bat no encontrado, saltando sincronización
)

echo.
echo ========================================
echo        RESTAURACIÓN COMPLETADA
echo ========================================
echo [OK] Checkpoint restaurado: %display_name%
echo [INFO] Directorio: %selected_checkpoint%
echo [INFO] Fecha: %date% %time%
echo.
echo [INFO] Archivos restaurados:
echo   - app.py (aplicacion principal)
echo   - requirements.txt (dependencias)
echo   - config.json (configuracion)
echo   - .env (variables de entorno)
echo   - eco-carver-466600-u1-978cfde80c53.json (credenciales Google)
echo   - iniciar_app.bat (script para iniciar aplicacion)
echo   - instalar_tts.bat (script para instalar TTS)
echo   - sync_to_github.bat (script para sincronizar con GitHub)
echo   - env.example (ejemplo de variables de entorno)
echo   - templates/ (directorio completo)
echo   - static/ (directorio completo)
echo.
echo [INFO] Backup de seguridad del estado anterior guardado en: %current_backup%
echo [INFO] Carpeta Github sincronizada y lista para subir
echo.
pause
