// /home/mariamaidaunixa/sd_smarthome/smart-home-dashboard/hooks/use-smart-home-data.ts
"use client"

import { useState, useEffect, useCallback, useRef } from "react" // Importar useRef
import mqtt, { MqttClient } from "mqtt" // Importar MqttClient type

interface Sensor {
  id: string
  name: string
  type: "sensor" | "actuator"
  sensorType: "temperature" | "humidity" | "light" | "door"
  value: string
  unit?: string
  status?: "on" | "off" | "open" | "closed"
  location: string // Ex: "Sala de Estar"
  lastUpdate: Date
}

// Helper para converter localização em slug para tópicos MQTT
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres não-palavra
    .replace(/--+/g, '-') // Substitui múltiplos hífens por um único
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, ''); // Remove hífens do final
}

export function useSmartHomeData() {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: "1",
      name: "Temperatura da Sala",
      type: "sensor",
      sensorType: "temperature",
      value: "--", // Valor inicial vazio
      unit: "°C",
      location: "Sala de Estar",
      lastUpdate: new Date(),
    },
    {
      id: "2",
      name: "Umidade da Cozinha", // Ajustei o nome para corresponder a um sensor que teremos
      type: "sensor",
      sensorType: "humidity",
      value: "--", // Valor inicial vazio
      unit: "%",
      location: "Cozinha",
      lastUpdate: new Date(),
    },
    {
      id: "3", // Este será controlado pelo dashboard
      name: "Lâmpada da Cozinha",
      type: "actuator",
      sensorType: "light",
      value: "",
      status: "off", // Status inicial padrão
      location: "Cozinha",
      lastUpdate: new Date(),
    },
    {
      id: "5",
      name: "Temperatura do Quarto",
      type: "sensor",
      sensorType: "temperature",
      value: "--", // Valor inicial vazio
      unit: "°C",
      location: "Quarto Principal",
      lastUpdate: new Date(),
    },
    {
      id: "6",
      name: "Umidade do Quarto",
      type: "sensor",
      sensorType: "humidity",
      value: "--", // Valor inicial vazio
      unit: "%",
      location: "Quarto Principal",
      lastUpdate: new Date(),
    },
    {
      id: "7", // Este será controlado pelo dashboard
      name: "Lâmpada da Sala",
      type: "actuator",
      sensorType: "light",
      value: "",
      status: "off", // Status inicial padrão
      location: "Sala de Estar",
      lastUpdate: new Date(),
    }
  ])

  // Armazena a instância do cliente MQTT
  const mqttClientRef = useRef<MqttClient | null>(null)

  // Mapa para encontrar sensores por tópico ou ID eficientemente
  // Usaremos para mapear tópico -> ID do sensor e vice-versa, e para guardar referências
  const sensorTopicMap = useRef<Map<string, string>>(new Map()); // tópico -> sensorId
  const sensorIdMap = useRef<Map<string, Sensor>>(new Map()); // sensorId -> Sensor (para acesso rápido)

  // Inicializa os mapas uma vez
  useEffect(() => {
    sensors.forEach(s => {
      const locationSlug = slugify(s.location);
      if (s.type === "sensor") {
        const topic = `/casa/${locationSlug}/${s.sensorType}/${s.id}`;
        sensorTopicMap.current.set(topic, s.id);
      } else { // actuator
        const statusTopic = `/casa/${locationSlug}/${s.sensorType}/${s.id}/status`;
        const commandTopic = `/casa/${locationSlug}/${s.sensorType}/${s.id}/command`;
        sensorTopicMap.current.set(statusTopic, s.id);
        sensorTopicMap.current.set(commandTopic, s.id); // Guardamos também o command topic
      }
      sensorIdMap.current.set(s.id, s);
    });
  }, [sensors]); // Rodar apenas na primeira renderização, ou quando a lista de sensores mudar (se for dinâmica)


  // Efeito para conectar ao MQTT e assinar tópicos
  useEffect(() => {
    const MQTT_BROKER_HOST = 'localhost'; // Navegador acessa localhost
    const MQTT_BROKER_WS_PORT = 9001;     // Porta WebSockets do Mosquitto

    const client = mqtt.connect(`ws://${MQTT_BROKER_HOST}:${MQTT_BROKER_WS_PORT}`);
    mqttClientRef.current = client; // Armazena a instância do cliente

    client.on('connect', () => {
      console.log('Frontend MQTT Client: Conectado ao broker!');

      // Assinar todos os tópicos conhecidos
      sensorTopicMap.current.forEach((sensorId, topic) => {
        // Para tópicos de comando, o dashboard PUBLICARÁ, não ASSINARÁ.
        // Assinamos apenas os tópicos de status/leituras.
        if (!topic.endsWith('/command')) {
          client.subscribe(topic, (err) => {
            if (err) {
              console.error(`Frontend MQTT Client: Falha ao assinar ${topic}:`, err);
            } else {
              console.log(`Frontend MQTT Client: Assinado a ${topic}`);
            }
          });
        }
      });
    });

    client.on('message', (topic, message) => {
      const payload = message.toString();
      console.log(`Frontend MQTT Client: Mensagem recebida [${topic}]: ${payload}`);

      const sensorId = sensorTopicMap.current.get(topic);
      if (sensorId) {
        setSensors(prevSensors =>
          prevSensors.map(sensor => {
            if (sensor.id === sensorId) {
              const updatedSensor = { ...sensor, lastUpdate: new Date() };

              // Atualizar valor ou status baseado no tipo de sensor/atuador
              if (sensor.type === "sensor") {
                updatedSensor.value = payload;
                if (sensor.sensorType === "door") { // Para sensores de porta, o payload é o status
                  updatedSensor.status = payload === "open" ? "open" : "closed";
                }
              } else if (sensor.type === "actuator") { // Atuador está recebendo seu status
                updatedSensor.status = payload === "ON" ? "on" : "off";
              }
              return updatedSensor;
            }
            return sensor;
          })
        );
      } else {
        console.warn(`Frontend MQTT Client: Tópico "${topic}" não mapeado para um sensor conhecido.`);
      }
    });

    client.on('error', (err) => {
      console.error('Frontend MQTT Client: Erro:', err);
    });

    client.on('close', () => {
      console.log('Frontend MQTT Client: Conexão fechada.');
    });

    client.on('offline', () => {
      console.log('Frontend MQTT Client: Cliente offline. Tentando reconectar...');
    });

    // Função de limpeza ao desmontar o componente
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
        mqttClientRef.current = null;
        console.log('Frontend MQTT Client: Conexão MQTT encerrada.');
      }
    };
  }, []); // Rodar apenas na montagem e desmontagem do componente

  // Função para controlar atuadores (publica mensagem MQTT)
  const toggleDevice = useCallback((deviceId: string) => {
    const client = mqttClientRef.current;
    const sensorToToggle = sensorIdMap.current.get(deviceId);

    if (client && sensorToToggle && sensorToToggle.type === "actuator") {
      const newStatus = sensorToToggle.status === "on" ? "off" : "on";
      const locationSlug = slugify(sensorToToggle.location);
      const commandTopic = `/casa/${locationSlug}/${sensorToToggle.sensorType}/${sensorToToggle.id}/command`;
      const payload = newStatus.toUpperCase(); // Envia "ON" ou "OFF"

      console.log(`Frontend MQTT Client: Publicando ${payload} para ${commandTopic}`);
      client.publish(commandTopic, payload, { qos: 0, retain: false }, (err) => {
        if (err) {
          console.error(`Frontend MQTT Client: Falha ao publicar comando:`, err);
        } else {
          // O status no frontend será atualizado quando o simulador responder no tópico /status
          // Mas para feedback imediato, podemos atualizar o estado aqui temporariamente
          setSensors(prevSensors =>
            prevSensors.map(sensor =>
              sensor.id === deviceId
                ? { ...sensor, status: newStatus, lastUpdate: new Date() }
                : sensor
            )
          );
        }
      });
    } else {
      console.warn(`Frontend MQTT Client: Não foi possível alternar o dispositivo ${deviceId}. Cliente MQTT não conectado ou dispositivo não é atuador.`);
    }
  }, []);

  return {
    sensors,
    toggleDevice,
  }
}