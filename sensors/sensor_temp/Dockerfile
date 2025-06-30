# Usa uma imagem base Python leve. A versão 3.9 é uma boa escolha.
FROM python:3.9-slim-buster

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo de dependências para o diretório de trabalho
COPY requirements.txt .

# Instala as dependências Python especificadas no requirements.txt
# --no-cache-dir evita que o pip salve arquivos de cache, reduzindo o tamanho da imagem
RUN pip install --no-cache-dir -r requirements.txt

# Copia o script do sensor para o diretório de trabalho
COPY sensor_temperatura.py .

# Define o comando que será executado quando o container iniciar.
# Ele roda o script Python do sensor.
CMD ["python", "sensor_temperatura.py"]
