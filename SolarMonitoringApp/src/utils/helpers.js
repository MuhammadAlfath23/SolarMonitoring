export const formatTime = () => {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};


export const formatDateTime = () => {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


export const calcPower = (voltage, current) => {
  return (parseFloat(voltage) * parseFloat(current)).toFixed(1);
};


export const getSystemStatus = (data) => {
  const voltage = parseFloat(data.voltage);
  if (voltage > 0 && voltage < 10) return 'danger';
  if (voltage >= 10 && voltage <= 12) return 'warning';
  if (parseFloat(data.power) === 0) return 'warning';
  if (data.battery < 30) return 'warning';
  return 'normal';
};