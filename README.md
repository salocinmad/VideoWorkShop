# 🎬 VideoWorkshop

**Taller de video con subtitulación, audio y edición**

VideoWorkshop es una aplicación web completa que permite procesar videos de manera profesional, incluyendo subtitulación automática, conversión de texto a audio, unión de videos y creación de loops, todo integrado en una interfaz moderna y fácil de usar.

## ✨ Características Principales

### 🎥 Subtitulación de Videos
- **Reconocimiento automático de voz** usando Google Cloud Speech-to-Text
- **Traducción automática** a múltiples idiomas
- **Sincronización perfecta** de subtítulos con el audio
- **Exportación en formato SRT** estándar

### 🔊 Conversión de Texto a Audio
- **Síntesis de voz avanzada** con Google Text-to-Speech
- **Múltiples voces disponibles** (Standard, Neural2, WaveNet, Studio, Chirp3-HD)
- **Filtro por género** y selección por idioma con listas estáticas validadas
- **Estilos de voz SSML**: Conversacional, Narrativo, Noticias, Presentador, Storytelling, Entusiasta, Sereno, Publicitario
- **Perfiles de audio**: Auriculares, Bluetooth pequeño, Telefonía, Wearable, Hogar, Coche
- **Soporte para textos largos** con procesamiento por chunks y SSML consistente
- **Fallback inteligente**: Long Audio → chunks; voz inexistente → voz válida por defecto
- **Formatos de audio** MP3, WAV, OGG
- **Control fino** de velocidad, tono y volumen con paso 0.1

### 🎬 Edición de Videos
- **Unión de hasta 4 videos** con transiciones suaves
- **Creación de loops** para duración específica
- **Múltiples formatos de salida** (MP4, AVI, MOV)
- **Control de calidad** y compresión

### 🎨 Interfaz Moderna
- **Sistema de pestañas dinámicas** para organizar tareas
- **Temas claro y oscuro** con detección automática
- **Interfaz responsive** que se adapta a cualquier pantalla
- **Notificaciones en tiempo real** del progreso
- **Preajustes guardables** para aplicar configuraciones de voz/audio en un clic

## 🚀 Instalación

### Requisitos Previos
- **Python 3.8+**
- **Google Cloud Platform** (cuenta activa)
- **Sistema Operativo**: Windows 10/11, Linux, macOS

### 1. Clonar el Repositorio
```bash
git clone https://github.com/salocinmad/VideoWorkShop.git
cd VideoWorkShop
```

### 2. Crear Entorno Virtual
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```
#### Instalación automática (Windows)
```bat
instalar_app.bat
```

### 4. Configurar Google Cloud
1. **Crear proyecto** en [Google Cloud Console](https://console.cloud.google.com/)
2. **Habilitar APIs**:
   - Speech-to-Text API
   - Text-to-Speech API
   - Translate API
   - Cloud Storage API
3. **Crear cuenta de servicio** y descargar archivo JSON
4. **Configurar variables de entorno**:
   ```bash
   cp env.example .env
   # Editar .env con tus credenciales
   ```

### 5. Configurar Archivo .env
```env
# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=tu-archivo-credenciales.json
GOOGLE_STORAGE_BUCKET=tu-bucket-name

# Configuración del servidor
HOST=127.0.0.1
PORT=5050
DEBUG=true

# Clave secreta de Flask
SECRET_KEY=tu-clave-secreta-muy-segura
```

## 🌍 Compatibilidad Multiplataforma

VideoWorkshop está diseñado para funcionar en múltiples sistemas operativos:

### ✅ Sistemas Soportados
- **Windows 10/11**: Con scripts automáticos (.bat) para facilitar el uso
- **Linux**: Ubuntu 18.04+, Debian, CentOS, RHEL
- **macOS**: 10.14+ (Mojave o superior)

### 🔧 Diferencias por Plataforma
- **Windows**: Incluye scripts `.bat` para automatizar tareas comunes
- **Linux/macOS**: Uso directo de comandos Python estándar
- **Todas las plataformas**: Misma funcionalidad completa de la aplicación

## 🎯 Uso

### Iniciar la Aplicación

#### Windows (con scripts automáticos)
```bash
# Script automático que activa venv e inicia la app
iniciar_app.bat
```

#### Linux/macOS/Windows (comando directo)
```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate     # Windows

# Iniciar aplicación
python app.py
```

### Acceder a la Aplicación
Abre tu navegador y ve a: `http://127.0.0.1:5050`

## 📋 Funcionalidades Detalladas

### 🎥 Subtitular Video
1. **Sube un video** en cualquier formato común
2. **Selecciona idioma** de origen y destino
3. **Procesa automáticamente** con IA de Google
4. **Descarga subtítulos** en formato SRT

### 🔊 Texto a Audio
1. **Escribe o sube texto** (sin límite de caracteres)
2. **Selecciona voz** y configuración de audio
3. **Genera audio** con síntesis de voz avanzada
4. **Reproduce y descarga** el resultado

#### Preajustes
- Botones de preajustes visibles sobre Idioma/Género/Voz.
- “Guardar Preajuste” abre panel para elegir slot 1–4 y editar nombre; guarda en `presets.json`.
- Al iniciar, se aplica automáticamente el Preajuste 1 por defecto.
- Los preajustes contienen: `voice_language`, `voice_gender`, `voice_name`, `voice_style`, `effects_profile_id`, `pitch`, `speaking_rate`, `volume_gain_db`, `audio_format`.

### 🎬 Unir Videos
1. **Selecciona hasta 4 videos** MP4
2. **Elige transición** (fade, crossfade, sin transición)
3. **Configura calidad** y formato de salida
4. **Procesa y descarga** el video unido

### 🔄 Loop de Video
1. **Sube un video** de cualquier duración
2. **Especifica duración objetivo** (minutos y segundos)
3. **Configura calidad** y transiciones
4. **Genera loop** automáticamente

## ⚙️ Configuración Avanzada

### Archivo config.json
```json
{
  "app_name": "VideoWorkshop",
  "port": 5050,
  "default_source_lang": "en-US",
  "default_target_lang": "es",
  "theme": "auto",
  "audio_sample_rate": 16000,
  "audio_quality": "optimized"
}
```

### Personalización de Voces
El sistema incluye voces en múltiples idiomas:
- **Español**: Femenina, Masculina (Standard, Neural2, WaveNet, Studio, Chirp3-HD)
- **Inglés**: Varias voces con diferentes acentos (incluye News, Studio y Chirp3-HD)
- **Francés, Alemán, Italiano, Portugués, Japonés, Coreano**: Voces nativas
### Estilos de Voz (SSML)
- Conversacional, Narrativo, Noticias, Presentador, Storytelling, Entusiasta, Sereno, Publicitario
### Perfiles de Audio
- Auriculares, Altavoz pequeño Bluetooth, Telefonía, Wearable, Hogar, Coche

## 🛠️ Scripts de Utilidad

### Scripts de Windows (.bat)
Estos scripts facilitan el uso en Windows:

#### iniciar_app.bat
Inicia la aplicación con el entorno virtual activado:
```bash
iniciar_app.bat
```

#### backup.bat
Crea un checkpoint completo de la aplicación:
```bash
backup.bat
# Ingresa nombre del checkpoint
# Se crea en carpeta Backups/
```

#### restore.bat
Restaura un checkpoint anterior:
```bash
restore.bat
# Selecciona checkpoint de la lista
# Restaura archivos y configuración
```

#### instalar_tts.bat
Instala dependencias de Text-to-Speech:
```bash
instalar_tts.bat
```

#### instalar_app.bat
Crea el entorno `venv`, instala dependencias y ejecuta la instalación de TTS:
```bash
instalar_app.bat
```

### Uso en Linux/macOS
En sistemas Unix, puedes usar los comandos equivalentes:
```bash
# Crear backup manual
cp -r . Backups/manual_backup_$(date +%Y%m%d_%H%M%S)

# Instalar dependencias
pip install -r requirements.txt

# Iniciar aplicación
python app.py
```

## 📁 Estructura del Proyecto

```
VideoWorkShop/
├── app.py                      # Backend Flask y endpoints
├── config.json                 # Configuración del servidor
├── presets.json                # Preajustes guardados (slots 1–4)
├── requirements.txt            # Dependencias
├── templates/
│   ├── base.html               # Layout y barra de pestañas
│   └── index.html              # Contenido de todas las pestañas
├── static/
│   ├── css/
│   │   └── style.css           # Estilos, filas en línea, centrado y modal de preajustes
│   ├── js/
│   │   └── app.js              # Lógica UI, TTS, presets, filtros de voces
│   └── videos/                 # Salidas locales (loops/merge)
├── tests/
│   ├── long_text.txt           # Texto de prueba largo
│   └── long_text_big.txt       # Texto de prueba muy largo
├── .env                        # Variables de entorno (no subir)
├── LICENSE
└── README.md
```

## 🔌 Endpoints REST

- `GET /api/presets` devuelve preajustes guardados `{ presets: {1..4} }`.
- `POST /api/presets/save` guarda un preajuste en `presets.json`.
  - Body JSON: `{ slot, name, data }`
- `POST /api/text-to-audio` convierte texto a audio; soporta SSML, estilos y perfiles.
  - Form-data: `text_file`, `voice_language`, `voice_gender`, `voice_name`, `voice_style`, `effects_profile_id`, `speaking_rate`, `pitch`, `volume_gain_db`, `audio_format`
- `GET /api/voices?language=<code>` lista voces disponibles del proyecto por idioma (opcional; UI usa listas estáticas validadas).
### Ejemplos
Guardar preajuste (PowerShell):
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5050/api/presets/save -ContentType 'application/json' -Body (@{
  slot='2'; name='Femenino 1'; data=@{
    voice_language='es-ES'; voice_gender='female'; voice_name='es-ES-Chirp-HD-F';
    voice_style='storytelling'; effects_profile_id='headphone-class-device';
    pitch=-0.5; speaking_rate=1.2; volume_gain_db=0.0; audio_format='mp3'
  }
} | ConvertTo-Json)
```
Texto a audio (curl):
```bash
curl -s -S -F "text_file=@tests/long_text.txt" \
     -F "voice_language=es-ES" -F "voice_gender=female" -F "voice_name=es-ES-Chirp-HD-F" \
     -F "voice_style=storytelling" -F "effects_profile_id=headphone-class-device" \
     -F "speaking_rate=1.2" -F "pitch=-0.5" -F "volume_gain_db=0.0" -F "audio_format=mp3" \
     http://127.0.0.1:5050/api/text-to-audio
```

## 🔧 Tecnologías Utilizadas

- **Backend**: Python 3.8+, Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **IA/ML**: Google Cloud Speech-to-Text, Text-to-Speech, Translate
- **Procesamiento de Video**: MoviePy, FFmpeg
- **Procesamiento de Audio**: PyDub, AudioSegment
- **Almacenamiento**: Google Cloud Storage
- **Interfaz**: Sistema de pestañas dinámicas, temas adaptativos

## 📝 Requisitos del Sistema

- **Sistema Operativo**: Windows 10/11, Linux (Ubuntu 18.04+), macOS 10.14+
- **Python**: 3.8 o superior
- **Memoria RAM**: 4GB mínimo, 8GB recomendado
- **Espacio en disco**: 2GB para instalación
- **Conexión a Internet**: Requerida para APIs de Google Cloud
- **FFmpeg**: Requerido para procesamiento de video (se instala automáticamente con MoviePy)

## 🚨 Solución de Problemas

### Error de Credenciales Google
```bash
# Windows
echo %GOOGLE_APPLICATION_CREDENTIALS%

# Linux/macOS
echo $GOOGLE_APPLICATION_CREDENTIALS

# Debe apuntar al archivo JSON correcto
```

### Error de Dependencias
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall

# Si hay problemas con MoviePy en Linux
pip install imageio-ffmpeg
```

### Error de Puerto en Uso
```bash
# Cambiar puerto en config.json
"port": 5051
```

### Error de FFmpeg (Linux/macOS)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# macOS con Homebrew
brew install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- **Issues**: [GitHub Issues](https://github.com/salocinmad/VideoWorkShop/issues)

## 🎉 Agradecimientos

- **Google Cloud Platform** por las APIs de IA
- **Flask** por el framework web
- **MoviePy** por el procesamiento de video
- **PyDub** por el procesamiento de audio
- **Comunidad open source** por las librerías utilizadas

---

**VideoWorkshop** - *Donde la creatividad se encuentra con la tecnología* 🎬✨
### 400 Invalid SSML (Neural2)
- Asegura comillas dobles en atributos SSML.
- Evita etiquetas no soportadas o demasiado largas por chunk.
- La app recorta SSML o usa SSML mínimo en fallback por chunk.

### Voz no existe / “does not exist”
- Algunas voces (p. ej., ciertas `Wavenet-*`) pueden no estar habilitadas en tu proyecto.
- La app reintenta con una voz válida por defecto del mismo idioma.
- Revisa el selector y usa voces de la lista estática por idioma y género.

### Deprecations
- `datetime.utcnow()` → `datetime.now(timezone.utc)` para URLs firmadas.
- `pkg_resources` (Translate v2) puede mostrar aviso deprecado; no bloquea.
### 404 en `/api/presets/save`
- Asegúrate de tener las rutas definidas antes de `app.run(...)` y reinicia la app.
## 📘 FAQ
- ¿Por qué mis voces suenan iguales?
  - Si `voice_name` está vacío, se usa la voz por defecto. La UI autoselecciona voz y el backend aplica fallback seguro.
- ¿Puedo usar voces Neural2 para textos largos?
  - Sí, usando chunks con SSML seguro. Long Audio puede diferir; en muy largos, la app fuerza chunks.
- ¿Cómo cambio el orden de pestañas?
  - En `templates/base.html`; “Texto a Audio” es la pestaña principal.
