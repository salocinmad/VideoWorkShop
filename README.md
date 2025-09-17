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
- **Múltiples voces disponibles** (Standard, Neural2, WaveNet)
- **Soporte para textos largos** sin límite de caracteres
- **Formatos de audio** MP3, WAV, FLAC
- **Control de velocidad, tono y volumen**

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

## 🚀 Instalación

### Requisitos Previos
- **Python 3.8+**
- **Google Cloud Platform** (cuenta activa)
- **Windows 10/11** (para scripts .bat)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/salocinmad/VideoWorkShop.git
cd VideoWorkShop
```

### 2. Crear Entorno Virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
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

## 🎯 Uso

### Iniciar la Aplicación
```bash
# Opción 1: Script automático (Windows)
iniciar_app.bat

# Opción 2: Comando directo
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
- **Español**: Femenina, Masculina (Standard, Neural2, WaveNet)
- **Inglés**: Varias voces con diferentes acentos
- **Francés, Alemán, Italiano, Portugués**: Voces nativas

## 🛠️ Scripts de Utilidad

### backup.bat
Crea un checkpoint completo de la aplicación:
```bash
backup.bat
# Ingresa nombre del checkpoint
# Se crea en carpeta Backups/
```

### restore.bat
Restaura un checkpoint anterior:
```bash
restore.bat
# Selecciona checkpoint de la lista
# Restaura archivos y configuración
```

### instalar_tts.bat
Instala dependencias de Text-to-Speech:
```bash
instalar_tts.bat
```

## 📁 Estructura del Proyecto

```
VideoWorkShop/
├── app.py                 # Aplicación principal Flask
├── config.json           # Configuración de la aplicación
├── requirements.txt      # Dependencias Python
├── .env                  # Variables de entorno
├── env.example          # Ejemplo de configuración
├── templates/           # Plantillas HTML
│   ├── base.html
│   ├── index.html
│   └── ...
├── static/              # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── ...
├── venv/                # Entorno virtual
├── Backups/             # Checkpoints de respaldo
├── backup.bat           # Script de backup
├── restore.bat          # Script de restauración
├── iniciar_app.bat      # Script de inicio
├── instalar_tts.bat     # Script de instalación TTS
└── README.md            # Documentación del proyecto
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

- **Sistema Operativo**: Windows 10/11, Linux, macOS
- **Python**: 3.8 o superior
- **Memoria RAM**: 4GB mínimo, 8GB recomendado
- **Espacio en disco**: 2GB para instalación
- **Conexión a Internet**: Requerida para APIs de Google Cloud

## 🚨 Solución de Problemas

### Error de Credenciales Google
```bash
# Verificar archivo de credenciales
echo $GOOGLE_APPLICATION_CREDENTIALS
# Debe apuntar al archivo JSON correcto
```

### Error de Dependencias
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error de Puerto en Uso
```bash
# Cambiar puerto en config.json
"port": 5051
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
- **Email**: soporte@videoworkshop.com
- **Documentación**: [Wiki del proyecto](https://github.com/salocinmad/VideoWorkShop/wiki)

## 🎉 Agradecimientos

- **Google Cloud Platform** por las APIs de IA
- **Flask** por el framework web
- **MoviePy** por el procesamiento de video
- **PyDub** por el procesamiento de audio
- **Comunidad open source** por las librerías utilizadas

---

**VideoWorkshop** - *Donde la creatividad se encuentra con la tecnología* 🎬✨
