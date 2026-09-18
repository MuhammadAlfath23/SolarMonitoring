require('dotenv').config();
const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'solar/telemetry/test';

console.log(`[Test] Menyambungkan ke ${MQTT_BROKER}...`);

const options = {};
if (process.env.MQTT_USERNAME && process.env.MQTT_PASSWORD) {
  options.username = process.env.MQTT_USERNAME;
  options.password = process.env.MQTT_PASSWORD;
}

const client = mqtt.connect(MQTT_BROKER, options);

client.on('connect', () => {
  console.log('[Test] Berhasil tersambung ke HiveMQ!');
  
  // Membuat data dummy berbentuk JSON yang rapi
  const dummyData = {
    voltage: 13.5,
    current: 2.1,
    power: 28.35,
    battery: 95
  };

  const message = JSON.stringify(dummyData);
  
  console.log(`[Test] Mengirim data ke topik "${MQTT_TOPIC}":`);
  console.log(message);

  client.publish(MQTT_TOPIC, message, () => {
    console.log('[Test] Data sukses terkirim!');
    client.end(); // Tutup koneksi setelah mengirim
  });
});

client.on('error', (err) => {
  console.error('[Test] Gagal tersambung:', err);
  process.exit(1);
});
