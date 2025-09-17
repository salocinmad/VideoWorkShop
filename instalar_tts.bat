@echo off
echo ========================================
echo        VIDEOWORKSHOP - INSTALACION
echo    Instalando Google Text-to-Speech
echo ========================================
echo.

echo Instalando Google Text-to-Speech...
call venv\Scripts\activate
pip install google-cloud-texttospeech==2.16.3

echo.
echo ========================================
echo    Instalacion completada!
echo    VideoWorkshop listo para usar
echo ========================================
pause

