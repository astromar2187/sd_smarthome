# Usa uma imagem base Python leve
FROM python:3.9-slim-buster

WORKDIR /app

# Copia e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o script do sensor
COPY sensor_umidade.py .

# Comando para rodar o script
CMD ["python", "sensor_umidade.py"]