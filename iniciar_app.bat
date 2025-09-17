@echo off
echo ========================================
echo    SISTEMA DE SUBTITULACION DE VIDEOS
echo ========================================
echo.

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo Iniciando aplicacion...
python app.py

pause

