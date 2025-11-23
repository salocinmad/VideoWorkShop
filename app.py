#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import logging
import tempfile
import time
import subprocess
import re
from flask import Flask, request, jsonify, send_file, render_template
from google.cloud import speech
from google.cloud import translate_v2 as translate
from google.cloud import storage
from google.cloud import texttospeech
from google.cloud import texttospeech_v1beta1
import moviepy.editor as mp
from moviepy.config import change_settings
from pydub import AudioSegment

# Configurar logging primero
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configurar MoviePy para usar GPU (NVIDIA)
def setup_gpu_acceleration():
    """Configurar aceleración por GPU para procesamiento de video"""
    try:
        # Verificar si FFMPEG con soporte NVIDIA está disponible
        result = subprocess.run(['ffmpeg', '-encoders'], capture_output=True, text=True)
        if 'h264_nvenc' in result.stdout:
            # Configurar FFMPEG para usar GPU NVIDIA
            change_settings({"FFMPEG_BINARY": "ffmpeg"})
            
            # Detectar GPUs disponibles
            nvidia_result = subprocess.run(['nvidia-smi', '--query-gpu=index,name', '--format=csv,noheader,nounits'], 
                                         capture_output=True, text=True)
            if nvidia_result.returncode == 0:
                gpus = nvidia_result.stdout.strip().split('\n')
                logger.info(f"🎮 GPUs NVIDIA detectadas: {len(gpus)}")
                for gpu in gpus:
                    if gpu.strip():
                        logger.info(f"   - {gpu.strip()}")
                logger.info("🚀 Aceleración GPU habilitada - Selecciona GPU manualmente")
            else:
                logger.info("🎮 GPU NVIDIA detectada - Aceleración habilitada")
            
            return True
        else:
            logger.warning("⚠️ FFMPEG sin soporte NVIDIA - Usando CPU")
            return False
    except Exception as e:
        logger.warning(f"⚠️ No se pudo configurar GPU: {e}")
        return False

# Configurar GPU al iniciar
GPU_AVAILABLE = setup_gpu_acceleration()

# Configuración por defecto (solo para fallback si no existe config.json)
DEFAULT_CONFIG = {
    'host': '127.0.0.1',
    'port': 5050,
    'debug': True,
    'auto_reload': True,
    'default_source_lang': 'en-US',
    'default_target_lang': 'es',
    'default_model': 'latest_short',
    'default_voice_language': 'es-ES',
    'default_voice_name': 'es-ES-Standard-A',
    'default_audio_format': 'mp3',
    'default_speaking_rate': 1.0,
    'default_pitch': 0.0,
    'default_volume_gain_db': 0.0,
    'theme': 'auto',
    'audio_sample_rate': 16000,
    'audio_quality': 'optimized',
    'audio_channels': 'mono',
    'audio_optimization': 'dialogue'
}

# Cargar configuración desde archivo
def load_config():
    try:
        # Cargar configuración base
        if os.path.exists('config.json'):
            with open('config.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                logger.info("✅ Configuración cargada desde config.json")
        else:
            logger.info("📝 Creando configuración por defecto")
            config = DEFAULT_CONFIG.copy()
            save_config(config)
        
        # Asegurar que todas las claves de DEFAULT_CONFIG estén presentes
        for key, default_value in DEFAULT_CONFIG.items():
            if key not in config:
                config[key] = default_value
        
        # Sobrescribir con variables de entorno si existen
        config['host'] = os.getenv('HOST', config.get('host', '127.0.0.1'))
        config['port'] = int(os.getenv('PORT', config.get('port', 5050)))
        config['debug'] = os.getenv('DEBUG', str(config.get('debug', True))).lower() == 'true'
        config['auto_reload'] = os.getenv('AUTO_RELOAD', str(config.get('auto_reload', True))).lower() == 'true'
        
        # Configuración de idiomas
        config['default_source_lang'] = os.getenv('DEFAULT_SOURCE_LANG', config.get('default_source_lang', 'en-US'))
        config['default_target_lang'] = os.getenv('DEFAULT_TARGET_LANG', config.get('default_target_lang', 'es'))
        
        # Configuración de tema
        config['theme'] = os.getenv('THEME', config.get('theme', 'auto'))
        
        # Configuración de audio
        config['audio_sample_rate'] = int(os.getenv('AUDIO_SAMPLE_RATE', config.get('audio_sample_rate', 16000)))
        config['audio_quality'] = os.getenv('AUDIO_QUALITY', config.get('audio_quality', 'optimized'))
        config['audio_channels'] = os.getenv('AUDIO_CHANNELS', config.get('audio_channels', 'mono'))
        config['audio_optimization'] = os.getenv('AUDIO_OPTIMIZATION', config.get('audio_optimization', 'dialogue'))
        
        logger.info(f"🌐 Servidor configurado para: {config['host']}:{config['port']}")
        return config
        
    except Exception as e:
        logger.error(f"❌ Error cargando configuración: {e}")
        return DEFAULT_CONFIG

def save_config(config):
    try:
        with open('config.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        logger.info("💾 Configuración guardada en config.json")
    except Exception as e:
        logger.error(f"❌ Error guardando configuración: {e}")

# Cargar configuración
CONFIG = load_config()

# Configurar credenciales de Google Cloud
def setup_google_credentials():
    """Configurar credenciales de Google Cloud"""
    try:
        # Verificar si existe el archivo de credenciales
        creds_file = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if creds_file and os.path.exists(creds_file):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = creds_file
            logger.info(f"✅ Credenciales Google Cloud configuradas: {creds_file}")
            return True
        else:
            # Buscar archivo de credenciales en el directorio actual
            creds_files = [f for f in os.listdir('.') if f.endswith('.json') and 'eco-carver' in f]
            if creds_files:
                creds_file = creds_files[0]
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = creds_file
                logger.info(f"✅ Credenciales Google Cloud encontradas: {creds_file}")
                return True
            else:
                logger.error("❌ No se encontró archivo de credenciales de Google Cloud")
                return False
    except Exception as e:
        logger.error(f"❌ Error configurando credenciales: {e}")
        return False

# Cargar variables de entorno desde .env si existe
def load_env_file():
    """Cargar variables de entorno desde archivo .env"""
    try:
        if os.path.exists('.env'):
            with open('.env', 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
            logger.info("✅ Variables de entorno cargadas desde .env")
        else:
            # Intentar crear .env desde ejemplo o mínimo
            try:
                if os.path.exists('env.example'):
                    with open('env.example', 'r', encoding='utf-8') as src, open('.env', 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
                    logger.info("📝 .env creado desde env.example")
                else:
                    with open('.env', 'w', encoding='utf-8') as dst:
                        dst.write("HOST=0.0.0.0\nPORT=5050\nDEBUG=true\n")
                    logger.info("📝 .env básico creado (HOST/PORT/DEBUG)")
                # Cargar nuevamente
                with open('.env', 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            os.environ[key.strip()] = value.strip()
                logger.info("✅ Variables de entorno cargadas desde nuevo .env")
            except Exception as ce:
                logger.warning(f"⚠️ No se pudo crear .env: {ce}")
                logger.warning("⚠️ Usando variables de entorno del sistema")
    except Exception as e:
        logger.error(f"❌ Error cargando archivo .env: {e}")

# Cargar variables de entorno
load_env_file()

# Configurar credenciales
setup_google_credentials()

# Inicializar Flask
app = Flask(__name__)

# Inicializar clientes de Google Cloud
try:
    speech_client = speech.SpeechClient()
    translate_client = translate.Client()
    storage_client = storage.Client()
    tts_client = texttospeech.TextToSpeechClient()
    tts_long_client = texttospeech_v1beta1.TextToSpeechLongAudioSynthesizeClient()
    logger.info("✅ Clientes de Google Cloud inicializados correctamente")
except Exception as e:
    logger.error(f"❌ Error inicializando clientes de Google Cloud: {e}")
    speech_client = None
    translate_client = None
    storage_client = None
    tts_client = None
    tts_long_client = None

# Configuración de Google Cloud Storage
BUCKET_NAME = os.getenv('GOOGLE_STORAGE_BUCKET')
if not BUCKET_NAME:
    logger.warning("⚠️ GOOGLE_STORAGE_BUCKET no está configurado; se usará almacenamiento local hasta configurar .env")

def get_language_model(source_lang):
    """Determinar el modelo de idioma basado en el idioma de origen"""
    # Idiomas asiáticos que requieren latest_short
    asian_languages = ['ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'th-TH', 'vi-VN']
    
    if source_lang in asian_languages:
        model = 'latest_short'
        logger.info(f"🎯 Usando modelo: {model} para idioma: {source_lang}")
    else:
        model = 'latest_long'
        logger.info(f"🎯 Usando modelo: {model} para idioma: {source_lang}")
    
    return model

def upload_audio_to_gcs(audio_path, blob_name):
    """Subir archivo de audio a Google Cloud Storage y retornar URI de GCS"""
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        
        with open(audio_path, 'rb') as audio_file:
            blob.upload_from_file(audio_file, content_type='audio/wav')
        
        # Retornar URI de GCS para Speech-to-Text
        gcs_uri = f"gs://{BUCKET_NAME}/{blob_name}"
        logger.info(f"☁️ Audio subido a GCS: {gcs_uri}")
        return gcs_uri
        
    except Exception as e:
        logger.error(f"❌ Error subiendo audio a GCS: {e}")
        raise e

def upload_audio_to_gcs_public(audio_path, blob_name):
    """Subir archivo de audio a Google Cloud Storage y retornar URL firmada"""
    try:
        if storage_client and BUCKET_NAME:
            bucket = storage_client.bucket(BUCKET_NAME)
            blob = bucket.blob(blob_name)
        
        # Determinar content type basado en la extensión
        if blob_name.endswith('.mp3'):
            content_type = 'audio/mpeg'
        elif blob_name.endswith('.wav'):
            content_type = 'audio/wav'
        elif blob_name.endswith('.flac'):
            content_type = 'audio/flac'
        else:
            content_type = 'audio/mpeg'
        
        if storage_client and BUCKET_NAME:
            with open(audio_path, 'rb') as audio_file:
                blob.upload_from_file(audio_file, content_type=content_type)
            # Generar URL firmada válida por 1 hora
            from datetime import datetime, timedelta, timezone
            expiration = datetime.now(timezone.utc) + timedelta(hours=1)
            audio_url = blob.generate_signed_url(version="v4", expiration=expiration, method="GET")
            logger.info(f"☁️ Audio subido a GCS con URL firmada: {audio_url}")
            return audio_url
        else:
            # Fallback local
            import shutil
            base_dir = os.path.join(os.path.dirname(__file__), 'static', 'audio', 'synthesized')
            os.makedirs(base_dir, exist_ok=True)
            dest_name = os.path.basename(blob_name)
            dest_path = os.path.join(base_dir, dest_name)
            shutil.copyfile(audio_path, dest_path)
            local_url = f"/static/audio/synthesized/{dest_name}"
            logger.info(f"💾 Audio almacenado localmente: {local_url}")
            return local_url
        
    except Exception as e:
        logger.error(f"❌ Error subiendo audio a GCS: {e}")
        raise e

def upload_video_to_gcs(video_path, blob_name):
    """Subir archivo de video a Google Cloud Storage"""
    try:
        if storage_client and BUCKET_NAME:
            bucket = storage_client.bucket(BUCKET_NAME)
            blob = bucket.blob(blob_name)
            with open(video_path, 'rb') as video_file:
                blob.upload_from_file(video_file, content_type='video/mp4')
            video_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_name}"
            logger.info(f"☁️ Video subido a GCS: {video_url}")
            return video_url
        else:
            # Fallback local
            import shutil
            base_dir = os.path.join(os.path.dirname(__file__), 'static', 'videos', 'uploads')
            os.makedirs(base_dir, exist_ok=True)
            dest_name = os.path.basename(blob_name)
            dest_path = os.path.join(base_dir, dest_name)
            shutil.copyfile(video_path, dest_path)
            local_url = f"/static/videos/uploads/{dest_name}"
            logger.info(f"💾 Video almacenado localmente: {local_url}")
            return local_url
        
    except Exception as e:
        logger.error(f"❌ Error subiendo video a GCS: {e}")
        raise e

def format_file_size(size_bytes):
    """Formatear tamaño de archivo en formato legible"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

# Rutas de la aplicación
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(CONFIG)

@app.route('/api/config', methods=['POST'])
def update_config():
    global CONFIG
    try:
        new_config = request.get_json()
        CONFIG.update(new_config)
        save_config(CONFIG)
        logger.info("✅ Configuración actualizada")
        return jsonify({'success': True, 'config': CONFIG})
    except Exception as e:
        logger.error(f"❌ Error actualizando configuración: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/credentials', methods=['POST'])
def upload_credentials():
    try:
        if 'cred_file' not in request.files:
            return jsonify({'success': False, 'error': 'No file'}), 400
        f = request.files['cred_file']
        name = f.filename or 'service-account.json'
        base = os.path.basename(name)
        safe = ''.join(c for c in base if c.isalnum() or c in ('-', '_', '.',))
        if not safe.lower().endswith('.json'):
            return jsonify({'success': False, 'error': 'Invalid extension'}), 400
        creds_dir = os.path.join(os.path.dirname(__file__), 'creds')
        os.makedirs(creds_dir, exist_ok=True)
        dest = os.path.join(creds_dir, safe)
        f.save(dest)
        set_env_keys({'GOOGLE_APPLICATION_CREDENTIALS': dest})
        return jsonify({'success': True, 'credentials_path': dest})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/env', methods=['POST'])
def update_env():
    try:
        data = request.get_json(force=True)
        allowed = {}
        for k in ['GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_STORAGE_BUCKET', 'HOST', 'PORT', 'DEBUG']:
            if k in data:
                allowed[k] = str(data[k])
        set_env_keys(allowed)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def set_env_keys(kv):
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    current = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f.read().splitlines():
                if '=' in line and not line.strip().startswith('#'):
                    key, val = line.split('=', 1)
                    current[key.strip()] = val.strip()
    current.update(kv)
    lines = []
    for k, v in current.items():
        lines.append(f"{k}={v}")
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

@app.route('/api/process', methods=['POST'])
def process_video():
    """Procesar video y generar subtítulos"""
    try:
        logger.info('🎬 Iniciando procesamiento de video...')
        
        # Obtener archivo de video
        if 'video' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo de video'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Obtener parámetros
        source_lang = request.form.get('source_lang', CONFIG.get('default_source_lang', 'en-US'))
        target_lang = request.form.get('target_lang', CONFIG.get('default_target_lang', 'es'))
        subtitle_format = request.form.get('subtitle_format', 'srt')
        
        logger.info(f'📹 Video: {video_file.filename}')
        logger.info(f'🌍 Idioma origen: {source_lang}')
        logger.info(f'🌍 Idioma destino: {target_lang}')
        logger.info(f'📝 Formato: {subtitle_format}')
        
        # Crear archivo temporal para el video
        temp_fd, temp_video_path = tempfile.mkstemp(suffix='.mp4')
        os.close(temp_fd)
        
        try:
            # Guardar video
            video_file.save(temp_video_path)
            logger.info('📁 Video guardado temporalmente')
            
            # Extraer audio del video
            logger.info('🎵 Extrayendo audio del video...')
            video_clip = mp.VideoFileClip(temp_video_path)
            audio_clip = video_clip.audio
            
            # Crear archivo temporal para el audio
            temp_audio_fd, temp_audio_path = tempfile.mkstemp(suffix='.wav')
            os.close(temp_audio_fd)
            
            try:
                # Guardar audio
                audio_clip.write_audiofile(temp_audio_path, verbose=False, logger=None)
                logger.info('🎵 Audio extraído exitosamente')
                
                # Cerrar clips
                audio_clip.close()
                video_clip.close()
                
                # Subir audio a GCS
                timestamp = int(time.time())
                blob_name = f"audio/{timestamp}_{video_file.filename}.wav"
                gcs_uri = upload_audio_to_gcs(temp_audio_path, blob_name)
                
                # Procesar con Speech-to-Text
                logger.info('🎤 Procesando con Speech-to-Text...')
                model = get_language_model(source_lang)
                
                config = speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                    sample_rate_hertz=16000,
                    language_code=source_lang,
                    model=model,
                    enable_automatic_punctuation=True,
                    enable_word_time_offsets=True
                )
                
                audio = speech.RecognitionAudio(uri=gcs_uri)
                
                # Usar long_running_recognize para archivos largos
                operation = speech_client.long_running_recognize(config=config, audio=audio)
                
                # Polling manual para evitar timeouts
                logger.info('⏳ Esperando resultados de Speech-to-Text...')
                while not operation.done():
                    time.sleep(10)
                    logger.info('⏳ Procesando...')
                
                result = operation.result()
                
                if not result.results:
                    return jsonify({'error': 'No se detectó habla en el audio'}), 400
                
                # Procesar resultados
                full_text = ""
                words = []
                
                for result in result.results:
                    alternative = result.alternatives[0]
                    full_text += alternative.transcript + " "
                    
                    for word_info in alternative.words:
                        words.append({
                            'word': word_info.word,
                            'start_time': word_info.start_time.total_seconds(),
                            'end_time': word_info.end_time.total_seconds()
                        })
                
                logger.info(f'📝 Texto transcrito: {len(full_text)} caracteres')
                
                # Traducir texto
                logger.info('🌍 Traduciendo texto...')
                translate_source_lang = source_lang.split('-')[0] if '-' in source_lang else source_lang
                translation = translate_client.translate(
                    full_text,
                    source_language=translate_source_lang,
                    target_language=target_lang
                )
                
                translated_text = translation['translatedText']
                logger.info(f'🌍 Texto traducido: {len(translated_text)} caracteres')
                
                # Generar subtítulos
                logger.info('📝 Generando subtítulos...')
                if subtitle_format == 'srt':
                    subtitles = generate_srt_subtitles(words, translated_text)
                else:
                    subtitles = generate_vtt_subtitles(words, translated_text)
                
                # Limpiar archivos temporales
                os.unlink(temp_video_path)
                os.unlink(temp_audio_path)
                
                logger.info('✅ Procesamiento completado exitosamente')
                
                return jsonify({
                    'success': True,
                    'subtitles': subtitles,
                    'original_text': full_text.strip(),
                    'translated_text': translated_text,
                    'format': subtitle_format,
                    'source_lang': source_lang,
                    'target_lang': target_lang,
                    'model_used': model
                })
                
            finally:
                # Limpiar archivo de audio temporal
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
                    
        finally:
            # Limpiar archivo de video temporal
            try:
                os.unlink(temp_video_path)
            except:
                pass
                
    except Exception as e:
        logger.error(f"❌ Error procesando video: {e}")
        return jsonify({'error': str(e)}), 500

def generate_srt_subtitles(words, translated_text):
    """Generar subtítulos en formato SRT"""
    subtitles = []
    subtitle_index = 1
    words_per_subtitle = 8
    current_time = 0
    
    # Dividir texto traducido en palabras
    translated_words = translated_text.split()
    
    for i in range(0, len(translated_words), words_per_subtitle):
        # Obtener palabras para este subtítulo
        subtitle_words = translated_words[i:i + words_per_subtitle]
        subtitle_text = ' '.join(subtitle_words)
        
        # Calcular tiempos basados en las palabras originales
        start_word_index = i
        end_word_index = min(i + words_per_subtitle - 1, len(words) - 1)
        
        if start_word_index < len(words) and end_word_index < len(words):
            start_time = words[start_word_index]['start_time']
            end_time = words[end_word_index]['end_time']
            
            # Formatear tiempos
            start_srt = format_srt_time(start_time)
            end_srt = format_srt_time(end_time)
            
            # Crear subtítulo
            subtitle = f"{subtitle_index}\n{start_srt} --> {end_srt}\n{subtitle_text}\n"
            subtitles.append(subtitle)
            subtitle_index += 1
    
    return '\n'.join(subtitles)

def generate_vtt_subtitles(words, translated_text):
    """Generar subtítulos en formato VTT"""
    subtitles = ["WEBVTT\n"]
    words_per_subtitle = 8
    
    # Dividir texto traducido en palabras
    translated_words = translated_text.split()
    
    for i in range(0, len(translated_words), words_per_subtitle):
        # Obtener palabras para este subtítulo
        subtitle_words = translated_words[i:i + words_per_subtitle]
        subtitle_text = ' '.join(subtitle_words)
        
        # Calcular tiempos basados en las palabras originales
        start_word_index = i
        end_word_index = min(i + words_per_subtitle - 1, len(words) - 1)
        
        if start_word_index < len(words) and end_word_index < len(words):
            start_time = words[start_word_index]['start_time']
            end_time = words[end_word_index]['end_time']
            
            # Formatear tiempos
            start_vtt = format_vtt_time(start_time)
            end_vtt = format_vtt_time(end_time)
            
            # Crear subtítulo
            subtitle = f"{start_vtt} --> {end_vtt}\n{subtitle_text}\n"
            subtitles.append(subtitle)
    
    return '\n'.join(subtitles)

def format_srt_time(seconds):
    """Formatear tiempo para SRT"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

def format_vtt_time(seconds):
    """Formatear tiempo para VTT"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millisecs:03d}"

@app.route('/api/text-to-audio', methods=['POST'])
def text_to_audio():
    """Convertir texto a audio usando Google Text-to-Speech"""
    try:
        logger.info('🔊 Iniciando conversión de texto a audio...')
        
        # Obtener archivo de texto
        if 'text_file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo de texto'}), 400
        
        text_file = request.files['text_file']
        if text_file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        text_content = text_file.read().decode('utf-8')
        text_size = len(text_content.encode('utf-8'))
        text_length = len(text_content)
        
        logger.info(f'📄 Archivo: {text_file.filename} ({text_size} bytes)')
        
        # Obtener parámetros de voz
        voice_language = request.form.get('voice_language', CONFIG.get('default_voice_language', 'es-ES'))
        voice_name = request.form.get('voice_name', CONFIG.get('default_voice_name', 'es-ES-Standard-A'))
        # Normalizar y aplicar fallback si está vacío
        voice_name = (voice_name or '').strip()
        if not voice_name:
            voice_name = get_default_voice_name(voice_language)
        voice_style = request.form.get('voice_style', 'none')
        effects_profile_id = request.form.get('effects_profile_id', '')
        audio_format = request.form.get('audio_format', CONFIG.get('default_audio_format', 'mp3'))
        speaking_rate = float(request.form.get('speaking_rate', CONFIG.get('default_speaking_rate', 1.0)))
        pitch = float(request.form.get('pitch', CONFIG.get('default_pitch', 0.0)))
        volume_gain_db = float(request.form.get('volume_gain_db', CONFIG.get('default_volume_gain_db', 0.0)))
        
        logger.info(f'🎤 Voz: {voice_name} ({voice_language})')
        logger.info(f'⚙️ Configuración: {audio_format}, rate={speaking_rate}, pitch={pitch}')
        
        # Determinar método de procesamiento
        if text_size <= 5000:
            logger.info('📝 Usando API estándar (texto pequeño)')
            result = process_standard_audio(
                text_content, voice_language, voice_name, audio_format,
                speaking_rate, pitch, volume_gain_db, text_file.filename,
                voice_style, effects_profile_id, text_length
            )
        else:
            if (voice_style or '').lower() != 'none':
                logger.info('📝 Texto grande con estilo: usando procesamiento por chunks')
                result = process_chunked_audio(
                    text_content, voice_language, voice_name, audio_format,
                    speaking_rate, pitch, volume_gain_db, text_file.filename,
                    voice_style, effects_profile_id, text_length
                )
            else:
                logger.info('📝 Usando Long Audio API (texto grande)')
                result = process_long_audio(
                    text_content, voice_language, voice_name, audio_format,
                    speaking_rate, pitch, volume_gain_db, text_file.filename,
                    voice_style, effects_profile_id, text_length
                )
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error en conversión de texto a audio: {e}")
        return jsonify({'error': str(e)}), 500

def process_standard_audio(text_content, voice_language, voice_name, audio_format, 
                          speaking_rate, pitch, volume_gain_db, filename,
                          voice_style, effects_profile_id, total_length):
    """Procesar audio usando la API estándar de Text-to-Speech"""
    try:
        # Configurar síntesis
        ssml_text = apply_voice_style(text_content, voice_style, total_length)
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text) if ssml_text else texttospeech.SynthesisInput(text=text_content)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=voice_language,
            name=voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=get_audio_encoding(audio_format),
            speaking_rate=speaking_rate,
            pitch=pitch,
            volume_gain_db=volume_gain_db,
            effects_profile_id=[effects_profile_id] if effects_profile_id else None
        )
        
        try:
            response = tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
        except Exception as e:
            if 'does not exist' in str(e) or 'not found' in str(e):
                fallback_name = get_default_voice_name(voice_language)
                voice = texttospeech.VoiceSelectionParams(language_code=voice_language, name=fallback_name)
                response = tts_client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice,
                    audio_config=audio_config
                )
            else:
                raise
        
        # Guardar archivo temporal
        timestamp = int(time.time())
        temp_filename = f"audio_{timestamp}.{audio_format}"
        temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
        
        with open(temp_path, 'wb') as out:
            out.write(response.audio_content)
        
        # Subir a GCS
        blob_name = f"audio/synthesized/{timestamp}_{temp_filename}"
        audio_url = upload_audio_to_gcs_public(temp_path, blob_name)
        
        # Limpiar archivo temporal
        os.unlink(temp_path)
        
        logger.info(f'✅ Audio generado exitosamente: {audio_url}')
        
        return jsonify({
            'success': True,
            'audio_url': audio_url,
            'method': 'standard',
            'text_preview': text_content[:200] + '...' if len(text_content) > 200 else text_content,
            'filename': temp_filename
        })
        
    except Exception as e:
        logger.error(f"❌ Error en API estándar: {e}")
        # Fallback a procesamiento por chunks
        return process_chunked_audio(
            text_content, voice_language, voice_name, audio_format,
            speaking_rate, pitch, volume_gain_db, filename,
            voice_style, effects_profile_id, total_length
        )

def process_long_audio(text_content, voice_language, voice_name, audio_format,
                      speaking_rate, pitch, volume_gain_db, filename,
                      voice_style, effects_profile_id, total_length):
    """Procesar audio usando la Long Audio API de Text-to-Speech"""
    try:
        # Subir texto a GCS
        timestamp = int(time.time())
        text_blob_name = f"text/input/{timestamp}_text.txt"
        text_gcs_uri = upload_text_to_gcs(text_content, text_blob_name)
        
        # Configurar salida
        output_gcs_uri = f"gs://{BUCKET_NAME}/audio/synthesized/{timestamp}_long_audio.wav"
        
        # Configurar síntesis con el modelo más grande
        ssml_text = apply_voice_style(text_content, voice_style, total_length)
        synthesis_input = texttospeech_v1beta1.SynthesisInput(ssml=ssml_text) if ssml_text else texttospeech_v1beta1.SynthesisInput(text=text_content)
        
        voice = texttospeech_v1beta1.VoiceSelectionParams(
            language_code=voice_language,
            name=voice_name,
            ssml_gender=texttospeech_v1beta1.SsmlVoiceGender.NEUTRAL
        )
        
        audio_config = texttospeech_v1beta1.AudioConfig(
            audio_encoding=texttospeech_v1beta1.AudioEncoding.LINEAR16,
            speaking_rate=speaking_rate,
            pitch=pitch,
            volume_gain_db=volume_gain_db,
            effects_profile_id=[effects_profile_id] if effects_profile_id else ["telephony-class-application"]
        )
        
        # Crear request para Long Audio API
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
        if not project_id:
            logger.error("❌ GOOGLE_CLOUD_PROJECT_ID no está configurado en las variables de entorno")
            raise ValueError("GOOGLE_CLOUD_PROJECT_ID es requerido")
        
        request = texttospeech_v1beta1.SynthesizeLongAudioRequest(
            parent=f"projects/{project_id}/locations/global",
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
            output_gcs_uri=output_gcs_uri
        )
        
        # Iniciar síntesis
        logger.info('🎤 Iniciando síntesis con Long Audio API...')
        operation = tts_long_client.synthesize_long_audio(request=request)
        
        # Polling manual
        logger.info('⏳ Esperando síntesis...')
        while not operation.done():
            time.sleep(10)
            logger.info('⏳ Procesando síntesis...')
        
        result = operation.result()
        
        if result.error:
            logger.error(f"❌ Error en Long Audio API: {result.error}")
            # Fallback a procesamiento por chunks
            return process_chunked_audio(
                text_content, voice_language, voice_name, audio_format,
                speaking_rate, pitch, volume_gain_db, filename,
                voice_style, effects_profile_id, total_length
            )
        
        # Obtener URL del audio generado
        audio_url = f"https://storage.googleapis.com/{BUCKET_NAME}/audio/synthesized/{timestamp}_long_audio.wav"
        
        logger.info(f'✅ Audio generado con Long Audio API: {audio_url}')
        
        return jsonify({
            'success': True,
            'audio_url': audio_url,
            'method': 'long_audio',
            'text_preview': text_content[:200] + '...' if len(text_content) > 200 else text_content,
            'filename': f"long_audio_{timestamp}.wav"
        })
        
    except Exception as e:
        logger.error(f"❌ Error en Long Audio API: {e}")
        # Fallback a procesamiento por chunks
        return process_chunked_audio(
            text_content, voice_language, voice_name, audio_format,
            speaking_rate, pitch, volume_gain_db, filename,
            voice_style, effects_profile_id, total_length
        )

def process_chunked_audio(text_content, voice_language, voice_name, audio_format,
                         speaking_rate, pitch, volume_gain_db, filename,
                         voice_style, effects_profile_id, total_length):
    """Procesar audio dividiendo el texto en chunks"""
    try:
        logger.info('📝 Procesando texto por chunks...')
        
        # Dividir texto en chunks de máximo 4000 caracteres
        base_chunk = 4000
        if voice_style and voice_style.lower() != 'none':
            base_chunk = 3500
        if total_length >= 15000:
            base_chunk = 3200
        chunk_size = base_chunk
        chunks = [text_content[i:i+chunk_size] for i in range(0, len(text_content), chunk_size)]
        
        logger.info(f'📝 Texto dividido en {len(chunks)} chunks')
        
        audio_segments = []
        
        for i, chunk in enumerate(chunks):
            logger.info(f'🎤 Procesando chunk {i+1}/{len(chunks)}...')
            
            # Configurar síntesis para este chunk
            ssml_chunk = apply_voice_style(chunk, voice_style, total_length)
            # Asegurar límite de tamaño de request cuando se usa SSML
            if ssml_chunk and len(ssml_chunk) > 4500:
                max_len = len(chunk)
                while ssml_chunk and len(ssml_chunk) > 4500 and max_len > 500:
                    max_len = int(max_len * 0.9)
                    ssml_chunk = apply_voice_style(chunk[:max_len], voice_style, total_length)
                # Si aún excede, usar SSML mínimo para este fragmento
                if ssml_chunk and len(ssml_chunk) > 4500:
                    ssml_chunk = apply_minimal_voice_style(chunk[:max_len], voice_style, total_length)
            synthesis_input = texttospeech.SynthesisInput(ssml=ssml_chunk) if ssml_chunk else texttospeech.SynthesisInput(text=chunk)
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_language,
                name=voice_name
            )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=get_audio_encoding(audio_format),
                speaking_rate=speaking_rate,
                pitch=pitch,
                volume_gain_db=volume_gain_db,
                effects_profile_id=[effects_profile_id] if effects_profile_id else None
            )
            
            # Sintetizar chunk
            try:
                response = tts_client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice,
                    audio_config=audio_config
                )
            except Exception as e:
                if 'does not exist' in str(e) or 'not found' in str(e):
                    fallback_name = get_default_voice_name(voice_language)
                    voice = texttospeech.VoiceSelectionParams(language_code=voice_language, name=fallback_name)
                    response = tts_client.synthesize_speech(
                        input=synthesis_input,
                        voice=voice,
                        audio_config=audio_config
                    )
                elif ssml_chunk is not None and 'Invalid SSML' in str(e):
                    minimal_ssml = apply_minimal_voice_style(chunk, voice_style, total_length)
                    try:
                        synthesis_input = texttospeech.SynthesisInput(ssml=minimal_ssml) if minimal_ssml else texttospeech.SynthesisInput(text=chunk)
                        response = tts_client.synthesize_speech(
                            input=synthesis_input,
                            voice=voice,
                            audio_config=audio_config
                        )
                    except Exception:
                        synthesis_input = texttospeech.SynthesisInput(text=chunk)
                        response = tts_client.synthesize_speech(
                            input=synthesis_input,
                            voice=voice,
                            audio_config=audio_config
                        )
                else:
                    raise
            
            # Guardar chunk temporal
            chunk_filename = f"chunk_{i}_{int(time.time())}.{audio_format}"
            chunk_path = os.path.join(tempfile.gettempdir(), chunk_filename)
            
            with open(chunk_path, 'wb') as out:
                out.write(response.audio_content)
            
            audio_segments.append(chunk_path)
        
        # Combinar todos los chunks
        logger.info('🔗 Combinando chunks de audio...')
        combined_audio = AudioSegment.empty()
        
        for segment_path in audio_segments:
            try:
                segment = AudioSegment.from_file(segment_path, format=audio_format)
            except Exception:
                # Fallback básico
                if audio_format == 'mp3':
                    segment = AudioSegment.from_mp3(segment_path)
                else:
                    segment = AudioSegment.from_wav(segment_path)
            combined_audio += segment
        
        # Guardar audio combinado
        timestamp = int(time.time())
        final_filename = f"chunked_audio_{timestamp}.{audio_format}"
        final_path = os.path.join(tempfile.gettempdir(), final_filename)
        
        combined_audio.export(final_path, format=audio_format)
        
        # Subir a GCS
        blob_name = f"audio/synthesized/{timestamp}_{final_filename}"
        audio_url = upload_audio_to_gcs_public(final_path, blob_name)
        
        # Limpiar archivos temporales
        for segment_path in audio_segments:
            try:
                os.unlink(segment_path)
            except:
                pass
        try:
            os.unlink(final_path)
        except:
            pass
        
        logger.info(f'✅ Audio combinado generado: {audio_url}')
        
        return jsonify({
            'success': True,
            'audio_url': audio_url,
            'method': 'chunked',
            'text_preview': text_content[:200] + '...' if len(text_content) > 200 else text_content,
            'filename': final_filename,
            'chunks_processed': len(chunks)
        })
        
    except Exception as e:
        logger.error(f"❌ Error procesando chunks: {e}")
        return jsonify({'error': str(e)}), 500

def upload_text_to_gcs(text_content, blob_name):
    """Subir texto a Google Cloud Storage"""
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        
        blob.upload_from_string(text_content, content_type='text/plain')
        
        gcs_uri = f"gs://{BUCKET_NAME}/{blob_name}"
        logger.info(f"☁️ Texto subido a GCS: {gcs_uri}")
        return gcs_uri
        
    except Exception as e:
        logger.error(f"❌ Error subiendo texto a GCS: {e}")
        raise e

def get_audio_encoding(format_name):
    """Obtener encoding de audio basado en formato"""
    encodings = {
        'mp3': texttospeech.AudioEncoding.MP3,
        'wav': texttospeech.AudioEncoding.LINEAR16,
        'ogg': texttospeech.AudioEncoding.OGG_OPUS,
        'flac': texttospeech.AudioEncoding.LINEAR16  # FLAC no está disponible, usar LINEAR16
    }
    return encodings.get(format_name, texttospeech.AudioEncoding.MP3)

def apply_voice_style(text, style, total_length):
    s = (style or '').lower()
    if s in ('', 'none'):
        return None
    break_ms = 350
    if total_length and total_length >= 15000:
        if s in ('news', 'presenter'):
            break_ms = 250
        elif s in ('narrative', 'storytelling'):
            break_ms = 500
        else:
            break_ms = 350
    # Escapar caracteres especiales para SSML
    def esc(x):
        return x.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    safe = esc(text)
    # Insertar pausas en signos de puntuación
    t = re.sub(r"([\.\!\?])\s+", rf"\1 <break time=\"{break_ms}ms\"/> ", safe)
    if s == 'conversational':
        return f"<speak><prosody rate=\"medium\"><emphasis level=\"moderate\">{t}</emphasis></prosody></speak>"
    if s == 'narrative':
        return f"<speak><prosody rate=\"slow\"><emphasis level=\"moderate\">{t}</emphasis></prosody></speak>"
    if s == 'news':
        return f"<speak><prosody rate=\"fast\"><emphasis level=\"reduced\">{t}</emphasis></prosody></speak>"
    if s == 'presenter':
        return f"<speak><prosody rate=\"medium\"><emphasis level=\"strong\">{t}</emphasis></prosody></speak>"
    if s == 'storytelling':
        return f"<speak><prosody rate=\"slow\"><emphasis level=\"strong\">{t}</emphasis></prosody></speak>"
    if s == 'enthusiastic':
        return f"<speak><prosody rate=\"fast\"><emphasis level=\"strong\">{t}</emphasis></prosody></speak>"
    if s == 'calm':
        return f"<speak><prosody rate=\"medium\"><emphasis level=\"reduced\">{t}</emphasis></prosody></speak>"
    if s == 'advertising':
        return f"<speak><prosody rate=\"medium\"><emphasis level=\"strong\">{t}</emphasis></prosody></speak>"
    return None

def apply_minimal_voice_style(text, style, total_length):
    s = (style or '').lower()
    if s in ('', 'none'):
        return None
    break_ms = 350
    if total_length and total_length >= 15000:
        if s in ('news', 'presenter'):
            break_ms = 250
        elif s in ('narrative', 'storytelling'):
            break_ms = 500
        else:
            break_ms = 350
    def esc(x):
        return x.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    safe = esc(text)
    t = re.sub(r"([\.!\?])\s+", rf"\1 <break time=\"{break_ms}ms\"/> ", safe)
    rate = 'medium'
    if s in ('news', 'enthusiastic'):
        rate = 'fast'
    elif s in ('narrative', 'storytelling'):
        rate = 'slow'
    else:
        rate = 'medium'
    return f"<speak><prosody rate=\"{rate}\">{t}</prosody></speak>"

def get_default_voice_name(language_code):
    """Obtener una voz por defecto válida para el idioma indicado"""
    defaults = {
        'es-ES': 'es-ES-Standard-A',
        'es-MX': 'es-MX-Standard-A',
        'en-US': 'en-US-Standard-A',
        'en-GB': 'en-GB-Standard-A',
        'fr-FR': 'fr-FR-Standard-A',
        'de-DE': 'de-DE-Standard-A',
        'it-IT': 'it-IT-Standard-A',
        'pt-BR': 'pt-BR-Standard-A',
        'ja-JP': 'ja-JP-Standard-A',
        'ko-KR': 'ko-KR-Standard-A',
        'zh-CN': 'cmn-CN-Standard-A'
    }
    return defaults.get(language_code, CONFIG.get('default_voice_name', 'es-ES-Standard-A'))

@app.route('/api/voices', methods=['GET'])
def list_voices():
    try:
        language = request.args.get('language')
        if tts_client is None:
            raise RuntimeError('Cliente de Text-to-Speech no inicializado')
        result = tts_client.list_voices()
        voices = []
        for v in result.voices:
            item = {
                'name': getattr(v, 'name', None),
                'language_codes': list(getattr(v, 'language_codes', [])),
                'ssml_gender': str(getattr(v, 'ssml_gender', '')),
                'natural_sample_rate_hertz': int(getattr(v, 'natural_sample_rate_hertz', 0)) if getattr(v, 'natural_sample_rate_hertz', None) is not None else None
            }
            if not language or (language in item['language_codes']):
                voices.append(item)
        return jsonify({'success': True, 'voices': voices})
    except Exception as e:
        logger.error(f"❌ Error listando voces: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/clear-gcs', methods=['POST'])
def clear_gcs():
    try:
        if storage_client is None:
            raise RuntimeError('Cliente de Storage no inicializado')
        bucket = storage_client.bucket(BUCKET_NAME)
        total_deleted = 0
        total_size = 0
        batch = []
        for blob in bucket.list_blobs():
            try:
                total_size += getattr(blob, 'size', 0) or 0
            except Exception:
                pass
            batch.append(blob)
            if len(batch) >= 100:
                bucket.delete_blobs(batch)
                total_deleted += len(batch)
                batch = []
        if batch:
            bucket.delete_blobs(batch)
            total_deleted += len(batch)
        logger.info(f"🗑️ Bucket limpiado: {total_deleted} objetos eliminados")
        return jsonify({
            'success': True,
            'deleted': total_deleted,
            'freed_size': format_file_size(total_size)
        })
    except Exception as e:
        logger.error(f"❌ Error limpiando bucket: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/gcs-usage', methods=['GET'])
def gcs_usage():
    try:
        if storage_client is None:
            raise RuntimeError('Cliente de Storage no inicializado')
        bucket = storage_client.bucket(BUCKET_NAME)
        total_size = 0
        count = 0
        for blob in bucket.list_blobs():
            count += 1
            try:
                total_size += getattr(blob, 'size', 0) or 0
            except Exception:
                pass
        return jsonify({
            'success': True,
            'count': count,
            'total_size': total_size,
            'formatted_size': format_file_size(total_size)
        })
    except Exception as e:
        logger.error(f"❌ Error obteniendo uso del bucket: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/gcs-list', methods=['GET'])
def gcs_list():
    try:
        if storage_client is None:
            raise RuntimeError('Cliente de Storage no inicializado')
        bucket = storage_client.bucket(BUCKET_NAME)
        items = []
        for blob in bucket.list_blobs():
            item = {
                'name': blob.name,
                'size': (getattr(blob, 'size', 0) or 0),
                'content_type': getattr(blob, 'content_type', None)
            }
            try:
                item['updated'] = blob.updated.isoformat() if blob.updated else None
            except Exception:
                item['updated'] = None
            items.append(item)
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        logger.error(f"❌ Error listando contenido del bucket: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/merge-videos', methods=['POST'])
def merge_videos():
    """Unir múltiples videos MP4 en uno solo"""
    try:
        logger.info('🎬 Iniciando unión de videos...')
        
        # Obtener videos del formulario
        videos = []
        for i in range(1, 5):  # video1, video2, video3, video4
            video_key = f'video{i}'
            if video_key in request.files:
                video_file = request.files[video_key]
                if video_file.filename != '':
                    videos.append(video_file)
        
        if not videos:
            return jsonify({'error': 'No se proporcionaron videos para unir'}), 400
        
        if len(videos) > 4:
            return jsonify({'error': 'Máximo 4 videos permitidos'}), 400
        
        logger.info(f'📹 Videos a unir: {len(videos)}')
        
        # Obtener parámetros de configuración
        output_quality = request.form.get('output_quality', 'medium')
        output_format = request.form.get('output_format', 'mp4')
        transition_type = request.form.get('transition_type', 'none')
        processing_mode = request.form.get('processing_mode', 'auto')
        
        logger.info(f'⚙️ Configuración: {output_quality}, {output_format}, {transition_type}, {processing_mode}')
        
        # Procesar videos
        result = process_video_merge(videos, output_quality, output_format, transition_type, processing_mode)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error uniendo videos: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/loop-video', methods=['POST'])
def loop_video():
    """Crear loop de video hasta alcanzar duración deseada"""
    try:
        logger.info('🔄 Iniciando creación de loop de video...')
        
        # Obtener video del formulario
        if 'video' not in request.files:
            return jsonify({'error': 'No se proporcionó video'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No se seleccionó video'}), 400
        
        # Obtener parámetros de configuración
        target_minutes = int(request.form.get('target_minutes', 1))
        target_seconds = int(request.form.get('target_seconds', 0))
        loop_quality = request.form.get('loop_quality', 'medium')
        loop_transition = request.form.get('loop_transition', 'none')
        loop_format = request.form.get('loop_format', 'mp4')
        processing_mode = request.form.get('loop_processing_mode', 'auto')
        
        # Calcular duración objetivo en segundos
        target_duration = target_minutes * 60 + target_seconds
        
        logger.info(f'📹 Video: {video_file.filename}')
        logger.info(f'⏱️ Duración objetivo: {target_minutes}:{target_seconds:02d} ({target_duration}s)')
        logger.info(f'⚙️ Configuración: {loop_quality}, {loop_format}, {loop_transition}, {processing_mode}')
        
        # Procesar loop de video
        result = process_video_loop(video_file, target_duration, loop_quality, loop_format, loop_transition, processing_mode)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error creando loop de video: {e}")
        return jsonify({'error': str(e)}), 500

def process_video_merge(videos, output_quality, output_format, transition_type, processing_mode='auto'):
    """Procesar unión de videos usando moviepy"""
    try:
        from moviepy.editor import VideoFileClip, concatenate_videoclips
        import tempfile
        import os
        import time
        
        logger.info('🎬 Iniciando procesamiento de videos...')
        
        # Crear archivos temporales para los videos
        temp_video_paths = []
        
        try:
            # Guardar videos temporalmente
            for i, video_file in enumerate(videos):
                temp_fd, temp_video_path = tempfile.mkstemp(suffix='.mp4')
                os.close(temp_fd)
                video_file.save(temp_video_path)
                temp_video_paths.append(temp_video_path)
                logger.info(f'📁 Guardando video {i+1}: {video_file.filename}')
            
            # Cargar videos con moviepy
            video_clips = []
            for i, temp_path in enumerate(temp_video_paths):
                clip = VideoFileClip(temp_path)
                logger.info(f'✅ Video {i+1} cargado: {clip.duration:.2f}s, {clip.size}')
                video_clips.append(clip)
            
            # Configurar calidad de salida
            quality_settings = {
                '4k': {'height': 2160, 'bitrate': '15000k'},
                '1440p': {'height': 1440, 'bitrate': '8000k'},
                'high': {'height': 1080, 'bitrate': '5000k'},
                'medium': {'height': 720, 'bitrate': '2500k'},
                'low': {'height': 480, 'bitrate': '1000k'}
            }
            
            quality = quality_settings.get(output_quality, quality_settings['medium'])
            
            # Redimensionar videos
            logger.info(f'🔧 Ajustando resolución a {quality["height"]}p...')
            resized_clips = []
            for i, clip in enumerate(video_clips):
                resized_clip = clip.resize(height=quality['height'])
                logger.info(f'📐 Video {i+1} redimensionado: {resized_clip.size}')
                resized_clips.append(resized_clip)
            
            # Aplicar transiciones si es necesario
            if transition_type == 'fade':
                logger.info('🎭 Aplicando transiciones fade...')
                for i in range(1, len(resized_clips)):
                    resized_clips[i] = resized_clips[i].fadein(0.5)
            elif transition_type == 'crossfade':
                logger.info('🎭 Aplicando transiciones crossfade...')
                for i in range(len(resized_clips) - 1):
                    resized_clips[i] = resized_clips[i].fadeout(0.5)
                for i in range(1, len(resized_clips)):
                    resized_clips[i] = resized_clips[i].fadein(0.5)
            
            # Concatenar videos
            logger.info('🔗 Uniendo videos...')
            final_video = concatenate_videoclips(resized_clips)
            
            # Crear archivo de salida temporal
            timestamp = int(time.time())
            output_filename = f"video_unido_{timestamp}.{output_format}"
            temp_output_path = os.path.join(tempfile.gettempdir(), output_filename)
            
            # Configurar parámetros de escritura según modo de procesamiento
            use_gpu = False
            if processing_mode == 'gpu' and GPU_AVAILABLE:
                use_gpu = True
            elif processing_mode == 'cpu':
                use_gpu = False
            elif processing_mode == 'auto' and GPU_AVAILABLE:
                use_gpu = True
            
            if use_gpu:
                # Usar H.264 para mejor compatibilidad con navegadores
                codec = 'h264_nvenc'
                # Parámetros más conservadores para evitar errores de nivel
                write_params = {
                    'codec': codec,  # Usar encoder NVIDIA H.264
                    'audio_codec': 'aac',
                    'bitrate': quality['bitrate'],
                    'preset': 'fast'  # Preset rápido para GPU
                }
                logger.info(f"🚀 Usando GPU (RTX 3060/4070) con {codec.upper()}")
            else:
                write_params = {
                    'codec': 'libx264',
                    'audio_codec': 'aac',
                    'bitrate': quality['bitrate']
                }
                logger.info("💻 Usando CPU para procesar videos")
            
            logger.info(f'💾 Guardando video final: {output_filename}')
            try:
                final_video.write_videofile(
                    temp_output_path,
                    **write_params,
                    verbose=False,
                    logger=None
                )
            except Exception as gpu_error:
                if use_gpu:
                    logger.warning(f"⚠️ Error con GPU, cambiando a CPU: {gpu_error}")
                    # Fallback a CPU si GPU falla
                    write_params = {
                        'codec': 'libx264',
                        'audio_codec': 'aac',
                        'bitrate': quality['bitrate']
                    }
                    logger.info("💻 Usando CPU como fallback")
                    final_video.write_videofile(
                        temp_output_path,
                        **write_params,
                        verbose=False,
                        logger=None
                    )
                else:
                    raise gpu_error
            
            # Obtener información del video final
            final_duration = final_video.duration
            final_size = final_video.size
            file_size = os.path.getsize(temp_output_path)
            
            # Crear directorio de videos si no existe
            videos_dir = os.path.join('static', 'videos', 'merged')
            os.makedirs(videos_dir, exist_ok=True)
            
            # Mover video a directorio estático
            final_video_path = os.path.join(videos_dir, output_filename)
            import shutil
            shutil.move(temp_output_path, final_video_path)
            
            # Generar URL local
            video_url = f"/static/videos/merged/{output_filename}"
            logger.info(f'📁 Video guardado localmente: {video_url}')
            
            # Limpiar archivos temporales
            for temp_path in temp_video_paths:
                os.unlink(temp_path)
            
            # Cerrar clips para liberar memoria
            for clip in video_clips + resized_clips:
                clip.close()
            final_video.close()
            
            logger.info(f'✅ Video unido exitosamente: {video_url}')
            
            return jsonify({
                'success': True,
                'video_url': video_url,
                'video_details': {
                    'filename': output_filename,
                    'duration': f"{int(final_duration//60)}:{(int(final_duration%60)):02d}",
                    'size': format_file_size(file_size),
                    'resolution': f"{final_size[0]}x{final_size[1]}",
                    'format': output_format.upper(),
                    'quality': output_quality,
                    'transition': transition_type,
                    'videos_merged': len(videos)
                }
            })
            
        except Exception as e:
            # Limpiar archivos temporales en caso de error
            for temp_path in temp_video_paths:
                try:
                    os.unlink(temp_path)
                except:
                    pass
            raise e
            
    except Exception as e:
        logger.error(f"❌ Error procesando unión de videos: {e}")
        return jsonify({'error': str(e)}), 500

def process_video_loop(video_file, target_duration, loop_quality, loop_format, loop_transition, processing_mode='auto'):
    """Procesar loop de video usando moviepy"""
    try:
        from moviepy.editor import VideoFileClip, concatenate_videoclips
        import tempfile
        import os
        import time
        
        logger.info('🔄 Iniciando procesamiento de loop de video...')
        
        # Crear archivo temporal para el video
        temp_fd, temp_video_path = tempfile.mkstemp(suffix='.mp4')
        os.close(temp_fd)
        
        try:
            # Guardar video
            video_file.save(temp_video_path)
            logger.info(f'📁 Video guardado: {video_file.filename}')
            
            # Cargar video con moviepy
            original_clip = VideoFileClip(temp_video_path)
            original_duration = original_clip.duration
            
            logger.info(f'📹 Video original: {original_duration:.2f}s')
            logger.info(f'🎯 Duración objetivo: {target_duration}s')
            
            # Calcular cuántos loops necesitamos
            loops_needed = int(target_duration / original_duration) + 1
            logger.info(f'🔄 Loops necesarios: {loops_needed}')
            
            # Configurar calidad de salida
            quality_settings = {
                '4k': {'height': 2160, 'bitrate': '15000k'},
                '1440p': {'height': 1440, 'bitrate': '8000k'},
                'high': {'height': 1080, 'bitrate': '5000k'},
                'medium': {'height': 720, 'bitrate': '2500k'},
                'low': {'height': 480, 'bitrate': '1000k'}
            }
            
            quality = quality_settings.get(loop_quality, quality_settings['medium'])
            
            # Redimensionar video
            logger.info(f'🔧 Ajustando resolución a {quality["height"]}p...')
            resized_clip = original_clip.resize(height=quality['height'])
            
            # Crear lista de clips para el loop
            loop_clips = []
            
            for i in range(loops_needed):
                # Crear una copia del clip para cada loop
                loop_clip = resized_clip.copy()
                
                # Aplicar transiciones si es necesario
                if loop_transition == 'fade' and i > 0:
                    # Aplicar fade in al inicio (excepto el primer clip)
                    loop_clip = loop_clip.fadein(0.5)
                elif loop_transition == 'crossfade' and i > 0:
                    # Aplicar crossfade (más complejo)
                    loop_clip = loop_clip.fadein(0.3).fadeout(0.3)
                
                loop_clips.append(loop_clip)
                logger.info(f'🔄 Loop {i+1}/{loops_needed} preparado')
            
            # Concatenar todos los clips
            logger.info('🔗 Concatenando loops...')
            final_video = concatenate_videoclips(loop_clips)
            
            # Recortar a la duración exacta si es necesario
            if final_video.duration > target_duration:
                final_video = final_video.subclip(0, target_duration)
                logger.info(f'✂️ Video recortado a {target_duration}s')
            
            # Crear archivo de salida temporal
            timestamp = int(time.time())
            output_filename = f"video_loop_{timestamp}.{loop_format}"
            temp_output_path = os.path.join(tempfile.gettempdir(), output_filename)
            
            # Configurar parámetros de escritura según modo de procesamiento
            use_gpu = False
            if processing_mode == 'gpu' and GPU_AVAILABLE:
                use_gpu = True
            elif processing_mode == 'cpu':
                use_gpu = False
            elif processing_mode == 'auto' and GPU_AVAILABLE:
                use_gpu = True
            
            if use_gpu:
                # Usar H.264 para mejor compatibilidad con navegadores
                codec = 'h264_nvenc'
                # Parámetros más conservadores para evitar errores de nivel
                write_params = {
                    'codec': codec,  # Usar encoder NVIDIA H.264
                    'audio_codec': 'aac',
                    'bitrate': quality['bitrate'],
                    'preset': 'fast'  # Preset rápido para GPU
                }
                logger.info(f"🚀 Usando GPU (RTX 3060/4070) con {codec.upper()}")
            else:
                write_params = {
                    'codec': 'libx264',
                    'audio_codec': 'aac',
                    'bitrate': quality['bitrate']
                }
                logger.info("💻 Usando CPU para procesar videos")
            
            logger.info(f'💾 Guardando video con loop: {output_filename}')
            final_video.write_videofile(
                temp_output_path,
                **write_params,
                verbose=False,
                logger=None
            )
            
            # Obtener información del video final
            final_duration = final_video.duration
            final_size = final_video.size
            file_size = os.path.getsize(temp_output_path)
            
            # Crear directorio de videos si no existe
            videos_dir = os.path.join('static', 'videos', 'loops')
            os.makedirs(videos_dir, exist_ok=True)
            
            # Cerrar clips para liberar memoria ANTES de mover el archivo
            original_clip.close()
            resized_clip.close()
            final_video.close()
            for clip in loop_clips:
                clip.close()
            
            # Esperar un momento para que se libere el archivo
            import time
            time.sleep(1)
            
            # Mover video a directorio estático
            final_video_path = os.path.join(videos_dir, output_filename)
            import shutil
            
            # Intentar mover el archivo con reintentos
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    shutil.move(temp_output_path, final_video_path)
                    break
                except (OSError, PermissionError) as e:
                    if attempt < max_retries - 1:
                        logger.warning(f'⚠️ Intento {attempt + 1} fallido, reintentando en 2 segundos...')
                        time.sleep(2)
                    else:
                        # Como último recurso, copiar en lugar de mover
                        shutil.copy2(temp_output_path, final_video_path)
                        os.unlink(temp_output_path)
                        logger.info('📁 Archivo copiado en lugar de movido')
            
            # Generar URL local
            video_url = f"/static/videos/loops/{output_filename}"
            logger.info(f'📁 Video guardado localmente: {video_url}')
            
            # Limpiar archivos temporales
            os.unlink(temp_video_path)
            
            logger.info(f'✅ Loop de video creado exitosamente: {video_url}')
            
            return jsonify({
                'success': True,
                'video_url': video_url,
                'video_details': {
                    'filename': output_filename,
                    'original_duration': f"{int(original_duration//60)}:{(int(original_duration%60)):02d}",
                    'final_duration': f"{int(final_duration//60)}:{(int(final_duration%60)):02d}",
                    'target_duration': f"{int(target_duration//60)}:{(int(target_duration%60)):02d}",
                    'loops_created': loops_needed,
                    'size': format_file_size(file_size),
                    'resolution': f"{final_size[0]}x{final_size[1]}",
                    'format': loop_format.upper(),
                    'quality': loop_quality,
                    'transition': loop_transition
                }
            })
            
        except Exception as e:
            # Limpiar archivo temporal en caso de error
            try:
                os.unlink(temp_video_path)
            except:
                pass
            raise e
            
    except Exception as e:
        logger.error(f"❌ Error procesando loop de video: {e}")
        return jsonify({'error': str(e)}), 500

PRESETS_FILE = os.path.join(os.path.dirname(__file__), 'presets.json')

@app.route('/api/presets', methods=['GET'])
def api_get_presets():
    try:
        if not os.path.exists(PRESETS_FILE):
            presets = {
                "1": {
                    "name": "Masculino 1",
                    "voice_language": "es-ES",
                    "voice_gender": "male",
                    "voice_name": "es-ES-Wavenet-G",
                    "voice_style": "storytelling",
                    "effects_profile_id": "headphone-class-device",
                    "pitch": -0.5,
                    "speaking_rate": 1.0,
                    "volume_gain_db": 0.0,
                    "audio_format": "mp3"
                },
                "2": { "name": "Preajuste 2" },
                "3": { "name": "Preajuste 3" },
                "4": { "name": "Preajuste 4" }
            }
            with open(PRESETS_FILE, 'w', encoding='utf-8') as f:
                json.dump({"presets": presets}, f, ensure_ascii=False, indent=2)
        with open(PRESETS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify({"success": True, "presets": data.get("presets", {})})
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "presets": {}}), 500

@app.route('/api/presets/save', methods=['POST'])
def api_save_preset():
    try:
        payload = request.get_json(force=True)
        slot = str(payload.get('slot'))
        name = payload.get('name')
        data = payload.get('data') or {}
        if slot not in {'1','2','3','4'}:
            return jsonify({"success": False, "error": "slot inválido"}), 400
        if not name:
            return jsonify({"success": False, "error": "nombre requerido"}), 400
        if not os.path.exists(PRESETS_FILE):
            with open(PRESETS_FILE, 'w', encoding='utf-8') as f:
                json.dump({"presets": {}}, f)
        with open(PRESETS_FILE, 'r', encoding='utf-8') as f:
            content = json.load(f)
        presets = content.get('presets', {})
        presets[slot] = {"name": name, **data}
        with open(PRESETS_FILE, 'w', encoding='utf-8') as f:
            json.dump({"presets": presets}, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Usar configuración cargada desde config.json
    host = CONFIG.get('host', '127.0.0.1')
    port = CONFIG.get('port', 5050)
    debug = CONFIG.get('debug', True)
    
    print(f"🚀 Iniciando aplicación en http://{host}:{port}")
    print(f"🔧 Modo debug: {'Activado' if debug else 'Desactivado'}")
    print(f"🔄 Auto-reload: {'Activado' if CONFIG.get('auto_reload', True) else 'Desactivado'}")
    app.run(
        host=host,
        port=port,
        debug=debug
    )
