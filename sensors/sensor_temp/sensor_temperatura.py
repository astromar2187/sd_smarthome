import paho.mqtt.client as mqtt
import time
import random
import os

# --- Configurações MQTT ---
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
SENSOR_TOPIC = os.getenv('SENSOR_TOPIC', '/casa/exemplo/temperatura')
CLIENT_ID = f"sensor_temperatura_{random.randint(1000, 9999)}"

# --- Configurações do Sensor ---
READ_INTERVAL = int(os.getenv('READ_INTERVAL', 5))
MIN_TEMP = float(os.getenv('MIN_TEMP', 20.0))
MAX_TEMP = float(os.getenv('MAX_TEMP', 30.0))

# --- Funções de Callback MQTT ---
def on_connect(client, userdata, flags, rc, properties=None): 
    """
    Callback executado quando o cliente se conecta ao broker MQTT.
    'properties' foi adicionado na API v2.0
    """
    if rc == 0:
        print(f"[{client._client_id.decode()}] Conectado ao broker MQTT em {client._host}:{client._port}!") # Ajustado para mostrar o ID do cliente e host/port
    else:
        print(f"[{client._client_id.decode()}] Falha na conexão ao broker, código: {rc}")

def on_disconnect(client, userdata, flags, rc, properties=None): 
    """
    Callback executado quando o cliente se desconecta do broker MQTT.
    """
    print(f"[{client._client_id.decode()}] Desconectado do broker MQTT com código: {rc}")

def on_publish(client, userdata,flags, mid, properties=None): 
    """
    Callback executado quando uma mensagem é publicada.
    """
    #depuração
    pass

# --- Função Principal do Sensor ---
def run_sensor():
    """
    Inicializa o cliente MQTT e começa a publicar dados de temperatura.
    """
    # *** ALTERAÇÃO CRÍTICA AQUI: Especifica a versão da API de callback ***
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, CLIENT_ID)

    # Atribui as funções de callback
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish = on_publish

    try:
        # Conecta ao broker MQTT
        client.connect(MQTT_BROKER, MQTT_PORT, 60)

        # Inicia um loop de thread em segundo plano para lidar com a rede MQTT
        client.loop_start()

        print(f"[{CLIENT_ID}] Iniciando publicação no tópico: {SENSOR_TOPIC}")

        while True:
            # Gera um valor de temperatura aleatório
            temperatura = round(random.uniform(MIN_TEMP, MAX_TEMP), 2)
            mensagem = f"{temperatura}"

            # Publica a mensagem no tópico MQTT
            client.publish(SENSOR_TOPIC, mensagem)
            print(f"[{CLIENT_ID}] Publicado: '{mensagem}°C' no tópico '{SENSOR_TOPIC}'")

            # Aguarda o próximo intervalo de leitura
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