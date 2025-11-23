## Objetivo
Dockerizar la aplicación para desarrollo y producción, manteniendo configuración editable fuera de la imagen (config.json, presets.json, .env) y cargando credenciales de Google de forma segura (archivo JSON montado como volumen).

## Contenidos a crear
1. Dockerfile (imagen Linux basada en Python; instala ffmpeg y dependencias; expone 5050).
2. docker-compose.yml (mapea puertos, volúmenes para config/presets/credenciales y salida de videos; define variables de entorno).
3. .dockerignore (excluye venv, Backups, archivos temporales, credenciales locales no deseadas dentro de la imagen).

## Detalles técnicos
- Base: `python:3.12-slim`.
- Paquetes sistema: `ffmpeg`, `curl`, `build-essential` (según necesidad), `libsndfile1` si fuese requerido por librerías de audio.
- Instalar `pip` requirements dentro de la imagen.
- Entrypoint/CMD:
  - Dev: `python app.py`.
  - Prod (opcional): `gunicorn -w 2 -b 0.0.0.0:5050 app:app` (si añadimos gunicorn al `requirements.txt`).
- Variables de entorno en contenedor:
  - `HOST=0.0.0.0`, `PORT=5050`, `DEBUG=false`.
  - `GOOGLE_APPLICATION_CREDENTIALS=/app/creds/service-account.json` (ruta al archivo montado).
- Volúmenes mapeados:
  - `./config.json:/app/config.json:ro` (solo lectura).
  - `./presets.json:/app/presets.json` (lectura/escritura para guardar preajustes).
  - `./creds:/app/creds:ro` (carpeta con JSON de cuenta de servicio).
  - `./static/videos:/app/static/videos` (persistencia de salidas locales).
  - (Opcional) `./Backups:/app/Backups`.
- Seguridad: no copiar `.env` ni credenciales dentro de la imagen; usar `env_file` y volúmenes.

## Compatibilidad GPU (opcional)
- Si necesitas NVENC dentro del contenedor: instalar `nvidia-container-toolkit`, usar `runtime: nvidia` en Compose y una imagen con `ffmpeg` compilado con NVENC. Si no, el contenedor funciona con CPU y la app detecta y usa CPU automáticamente.

## Archivos propuestos
### Dockerfile
- FROM `python:3.12-slim`.
- RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*.
- WORKDIR `/app`.
- COPY `requirements.txt` y `README.md`.
- RUN `pip install --no-cache-dir -r requirements.txt`.
- COPY `app.py` `templates/` `static/`.
- EXPOSE 5050.
- ENV `HOST=0.0.0.0` `PORT=5050` `DEBUG=false`.
- CMD `python app.py` (o Gunicorn en producción).

### docker-compose.yml
- Servicio `videoworkshop`:
  - build: `.`
  - ports: `5050:5050`
  - env_file: `.env` (opcional; o declarar variables inline).
  - environment: `GOOGLE_APPLICATION_CREDENTIALS=/app/creds/service-account.json`
  - volumes:
    - `./config.json:/app/config.json:ro`
    - `./presets.json:/app/presets.json`
    - `./creds:/app/creds:ro`
    - `./static/videos:/app/static/videos`
  - (Opcional) restart: unless-stopped; healthcheck `curl -f http://localhost:5050/`.
- Perfil GPU (opcional): `deploy` con `resources`, `device_ids` y `runtime: nvidia` si usas Swarm/K8s.

### .dockerignore
- `venv/`
- `Backups/`
- `*.pyc`
- `__pycache__/`
- `.git/`
- `.DS_Store`
- `*.env`
- `creds/*` (se montan por volumen, no se copian)

## Pasos de uso
1. Coloca tu JSON de credenciales en `./creds/service-account.json` y revisa `config.json`, `presets.json` y `.env`.
2. Construye la imagen: `docker compose build`.
3. Arranca: `docker compose up -d`.
4. Accede: `http://localhost:5050`.
5. Logs: `docker compose logs -f videoworkshop`.

## Verificación
- Probar: subir TXT en “Texto a Audio”, generar audio; guardar un preajuste; verificar que `presets.json` en host se actualiza.
- Probar unión y loop de video; revisar que `static/videos` en host contiene los archivos.

## Opciones futuras
- Añadir Gunicorn a `requirements.txt` y usarlo como CMD en el Dockerfile para producción.
- Añadir `HEALTHCHECK` y `LABELS` con metadatos.
- Separar dev/prod mediante `docker-compose.override.yml` (dev) y `docker-compose.prod.yml` (prod).

¿Apruebas este plan? Si sí, generamos `Dockerfile`, `docker-compose.yml` y `.dockerignore` y lo dejamos listo para `docker compose up`. 