const mqtt = require('mqtt');
const prisma = require('../config/prisma');

const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'solar/telemetry/#';

function initMQTT() {
  console.log(`[MQTT] Connecting to ${MQTT_BROKER}...`);
  
  const options = {};
  if (process.env.MQTT_USERNAME && process.env.MQTT_PASSWORD) {
    options.username = process.env.MQTT_USERNAME;
    options.password = process.env.MQTT_PASSWORD;
    // HiveMQ Cloud biasanya menggunakan port 8883 (MQTTS/TLS)
  }

  const client = mqtt.connect(MQTT_BROKER, options);

  client.on('connect', () => {
    console.log(`[MQTT] Connected to broker.`);
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error(`[MQTT] Subscription error:`, err);
      } else {
        console.log(`[MQTT] Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });

  client.on('message', async (topic, message) => {
    let payload = {};
    const msgStr = message.toString();

    try {
      payload = JSON.parse(msgStr);
    } catch (parseError) {
      const parts = msgStr.split(',');
      if (parts.length >= 5) {
        payload = {
          voltage: parseFloat(parts[2]),
          current: parseFloat(parts[3]),
          power: parseFloat(parts[4]),
          battery: parts[5] === 'CHARGING' ? 100 : 50, // Estimasi kasar
          source: 'ESP32 (CSV)'
        };
      } else {
        console.warn(`[MQTT] Mengabaikan pesan (Format tidak dikenali):`, msgStr);
        return;
      }
    }

    try {
      console.log(`[MQTT] Received on ${topic}:`, payload);

      const voltage = Math.abs(payload.voltage || 0);
      const current = Math.abs(payload.current || 0);
      const power = Math.abs(payload.power || (voltage * current));
      const battery = Math.max(0, Math.min(100, payload.battery || 0));

      const isNormal = voltage > 12;

      await prisma.plts_history.create({
        data: {
          voltage,
          current,
          power,
          battery,
          is_normal: isNormal,
          source: 'Panel Surya'
        }
      });

      await prisma.plts_current.upsert({
        where: { id: 1 },
        update: {
          voltage,
          current,
          power,
          battery,
          is_normal: isNormal,
          updated_at: new Date(),
          timestamp: new Date()
        },
        create: {
          id: 1,
          voltage,
          current,
          power,
          battery,
          is_normal: isNormal
        }
      });

      console.log(`[MQTT] Data saved to database.`);
    } catch (error) {
      console.error(`[MQTT] Error processing payload:`, error.message);
    }
  });

  client.on('error', (err) => {
    console.error(`[MQTT] Error:`, err);
  });
}

module.exports = {
  initMQTT
};
