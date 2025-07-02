# Projeto: Casa Inteligente com arquitetura distribuída usando Docker e MQTT

Este projeto implementa uma simulação de casa inteligente, onde diversos dispositivos IoT (Internet das Coisas) coletam e publicam dados em tempo real para um broker MQTT. Um dashboard web intuitivo, desenvolvido com Next.js (React), se conecta a este broker para monitorar e exibir todas as leituras de forma visual. Toda a infraestrutura é conteinerizada usando Docker Compose, garantindo portabilidade e facilidade de implantação.

## 🚀 Visão Geral da Arquitetura

A solução é composta pelos seguintes serviços conteinerizados:

* **MQTT Broker (Mosquitto):** Atua como o ponto central de comunicação. Ele recebe mensagens dos sensores e as distribui para o dashboard web via WebSockets.
* **Sensores IoT Simulados (Python):** Múltiplos contêineres Python que simulam o comportamento de sensores (temperatura, umidade) e atuadores (status de lâmpada). Eles publicam dados periodicamente em tópicos MQTT específicos.
* **Dashboard Web (Next.js/React + Node.js):** Um contêiner que executa uma aplicação Next.js. O frontend em React se conecta diretamente ao broker MQTT (via WebSockets) e atualiza a interface com os dados dos sensores em tempo real.

## Pré-requisitos

Para rodar este projeto, você precisará ter as seguintes ferramentas instaladas em sua máquina:

* **[Docker Desktop](https://www.docker.com/products/docker-desktop/):** (Recomendado para Windows/macOS) Inclui o Docker Engine e o Docker Compose.
* **[Docker Engine & Docker Compose](https://docs.docker.com/engine/install/)**: (Para Linux) Instale o Docker Engine e o Docker Compose separadamente.

Você pode verificar suas instalações com:

```bash
docker --version
docker compose version # ou 'docker-compose --version' em versões mais antigas
```

## ⚙️ Como Rodar o Projeto

Siga estes passos para colocar sua Casa Inteligente em funcionamento:

### 1. Clonar o Repositório

Abra seu terminal e clone este repositório para sua máquina local. 

```bash
git clone https://github.com/astromar2187/sd_smarthome.git
cd sd_smarthome # Navegue até a pasta raiz do projeto
```

### 2. Construir e Iniciar os Contêineres

Com o repositório clonado e você dentro da pasta raiz do projeto (sd_smarthome/), use o Docker Compose para construir as imagens e iniciar todos os serviços:

```bash
docker compose up -d --build
```

* O comando docker compose up lerá o docker-compose.yml e criará/iniciará todos os serviços definidos.
* O flag -d (detached mode) fará com que os contêineres rodem em segundo plano, liberando seu terminal.
* O flag --build garantirá que todas as imagens Docker necessárias (Next.js, sensores Python) sejam construídas a partir dos seus Dockerfiles.

### 3. Verificar o Status dos Contêineres

Para confirmar que todos os serviços foram iniciados corretamente:

```bash
docker ps
```

Você deverá ver todos os contêineres listados (iot_broker, sensor_temperatura_sala, frontend, etc.) com o status Up.

### 4. Abrir o Dashboard

Acesse [http://localhost:3000/](http://localhost:3000/).

### 5. Monitorar os Logs dos Sensores

Para ver a saída dos seus sensores Python em tempo real você pode usar o comando:

```bash
docker logs sensor_sala_temp -f
```

Em outro terminal, verifique a atuação dos atuadores de lâmpada:
```bash
docker logs -f atuador_lampada_cozinha
```

Pressione Ctrl+C para sair do monitoramento de logs a qualquer momento.

Para desligar todos os containers:
```bash
docker compose down
```
