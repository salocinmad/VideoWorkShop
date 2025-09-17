@echo off
echo ========================================
echo           VIDEOWORKSHOP
echo    Taller de Video con Subtitulacion
echo ========================================
echo.

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo Iniciando VideoWorkshop...
python app.py

pause

