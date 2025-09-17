@echo off
echo Instalando Google Text-to-Speech...
call venv\Scripts\activate
pip install google-cloud-texttospeech==2.16.3
echo Instalacion completada!
pause

