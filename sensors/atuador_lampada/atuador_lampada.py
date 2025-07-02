import paho.mqtt.client as mqtt
import random
import os

# --- Configurações MQTT ---
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
# Tópicos configurados por variáveis de ambiente
COMMAND_TOPIC = os.getenv('COMMAND_TOPIC', '/casa/cozinha/light/3/command') # Tópico padrão para comandos
STATUS_TOPIC = os.getenv('STATUS_TOPIC', '/casa/cozinha/light/3/status')   # Tópico padrão para status
CLIENT_ID = f"atuador_lampada_{random.randint(1000, 9999)}"

# --- Variável para guardar o estado atual da lâmpada ---
current_status = "OFF"

# --- Funções de Callback MQTT (paho-mqtt v2.0+) ---
def on_connect(client, userdata, flags, rc, properties=None):
    """Callback executado na conexão."""
    if rc == 0:
        print(f"[{client._client_id.decode()}] Conectado ao broker MQTT!")
        # Assina o tópico de comando assim que a conexão é estabelecida
        client.subscribe(COMMAND_TOPIC)
        print(f"[{client._client_id.decode()}] Assinado o tópico de comando: {COMMAND_TOPIC}")
        # Publica o estado inicial/atual no tópico de status
        client.publish(STATUS_TOPIC, current_status)
        print(f"[{client._client_id.decode()}] Publicado status inicial '{current_status}' em {STATUS_TOPIC}")
    else:
        print(f"[{client._client_id.decode()}] Falha na conexão, código: {rc}")

def on_disconnect(client, userdata, flags, rc, properties=None):
    """Callback executado na desconexão."""
    print(f"[{client._client_id.decode()}] Desconectado do broker com código: {rc}")

def on_message(client, userdata, msg):
    """Callback executado quando uma mensagem chega em um tópico assinado."""
    global current_status
    
    comando = msg.payload.decode()
    print(f"[{client._client_id.decode()}] Comando recebido em '{msg.topic}': {comando}")

    if comando == "ON" and current_status == "OFF":
        current_status = "ON"
        print(f"[{client._client_id.decode()}] Lâmpada LIGADA. Publicando status.")
        client.publish(STATUS_TOPIC, current_status, retain=True) # Publica e retém a mensagem
    elif comando == "OFF" and current_status == "ON":
        current_status = "OFF"
        print(f"[{client._client_id.decode()}] Lâmpada DESLIGADA. Publicando status.")
        client.publish(STATUS_TOPIC, current_status, retain=True) # Publica e retém a mensagem
    else:
        print(f"[{client._client_id.decode()}] Comando ignorado (estado já é '{current_status}').")


# --- Função Principal do Atuador ---
def run_actuator():
    """Inicializa o cliente MQTT e fica escutando por comandos."""
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, CLIENT_ID)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        # client.loop_forever() é um loop bloqueante que lida com a rede
        # e chama os callbacks. Perfeito para um atuador que só reage.
        client.loop_forever()

    except KeyboardInterrupt:
        print(f"\n[{CLIENT_ID}] Interrupção detectada. Desconectando...")
    except Exception as e:
        print(f"[{CLIENT_ID}] Ocorreu um erro: {e}")
    finally:
        client.disconnect()
        print(f"[{CLIENT_ID}] Atuador finalizado.")

if __name__ == "__main__":
    run_actuator()