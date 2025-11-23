@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "PY=python"
%PY% --version >nul 2>&1 || set "PY=py -3"

echo ========================================
echo    Instalando VideoWorkshop
echo ========================================

echo Creando entorno virtual...
%PY% -m venv venv || (
  echo Error creando entorno virtual
  exit /b 1
)

echo Activando entorno virtual...
call "%~dp0venv\Scripts\activate.bat" || (
  echo Error activando el entorno virtual
  exit /b 1
)

echo Actualizando pip...
python -m pip install --upgrade pip

echo Instalando dependencias...
pip install -r requirements.txt || (
  echo Error instalando dependencias
  exit /b 1
)

echo Ejecutando instalacion de TTS...
call instalar_tts.bat || (
  echo Error en instalar_tts.bat
  exit /b 1
)

echo Instalacion completada.
endlocal
