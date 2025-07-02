import paho.mqtt.client as mqtt
import time
import random
import os

# --- Configurações MQTT ---
# O tópico é configurado via variável de ambiente para ser reutilizável
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
SENSOR_TOPIC = os.getenv('SENSOR_TOPIC', '/casa/cozinha/humidity/2') # Tópico padrão (Cozinha)
CLIENT_ID = f"sensor_umidade_{random.randint(1000, 9999)}"

# --- Configurações do Sensor ---
READ_INTERVAL = int(os.getenv('READ_INTERVAL', 7)) # Intervalo um pouco diferente para não publicar tudo junto
MIN_HUMIDITY = float(os.getenv('MIN_HUMIDITY', 30.0))
MAX_HUMIDITY = float(os.getenv('MAX_HUMIDITY', 90.0))

# --- Funções de Callback MQTT (paho-mqtt v2.0+) ---
def on_connect(client, userdata, flags, rc, properties=None):
    """Callback executado quando o cliente se conecta ao broker."""
    if rc == 0:
        print(f"[{client._client_id.decode()}] Conectado ao broker MQTT em {client._host}:{client._port}!")
    else:
        print(f"[{client._client_id.decode()}] Falha na conexão, código: {rc}")

def on_disconnect(client, userdata, flags, rc, properties=None):
    """Callback executado quando o cliente se desconecta."""
    print(f"[{client._client_id.decode()}] Desconectado do broker com código: {rc}")

def on_publish(client, userdata,flags, mid, properties=None):
    """Callback executado quando uma mensagem é publicada (opcional)."""
    pass

# --- Função Principal do Sensor ---
def run_sensor():
    """Inicializa o cliente MQTT e começa a publicar dados de umidade."""
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, CLIENT_ID)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish = on_publish

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start() # Inicia a thread de rede

        print(f"[{CLIENT_ID}] Iniciando publicação no tópico: {SENSOR_TOPIC}")

        while True:
            # Gera um valor de umidade aleatório
            umidade = round(random.uniform(MIN_HUMIDITY, MAX_HUMIDITY), 1)
            mensagem = f"{umidade}"

            # Publica a mensagem no tópico MQTT
            client.publish(SENSOR_TOPIC, mensagem)
            print(f"[{CLIENT_ID}] Publicado: '{mensagem}%' no tópico '{SENSOR_TOPIC}'")

            time.sleep(READ_INTERVAL)

    except KeyboardInterrupt:
        print(f"\n[{CLIENT_ID}] Interrupção detectada. Desconectando...")
    except Exception as e:
        print(f"[{CLIENT_ID}] Ocorreu um erro: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print(f"[{CLIENT_ID}] Sensor finalizado.")

if __name__ == "__main__":
    run_sensor()