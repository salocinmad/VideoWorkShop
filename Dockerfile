FROM python:3.12-slim
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt README.md ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py templates static ./
ENV HOST=0.0.0.0 PORT=5050 DEBUG=false
EXPOSE 5050
CMD ["python","app.py"]
