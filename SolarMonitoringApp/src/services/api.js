import Config from '../constants/Config';

export const loginUser = async (username, password) => {
  try {
    console.log("API URL:", Config.API_URL);
    console.log("LOGIN HIT:", username, password);

    const res = await fetch(`http://103.87.67.112:5000/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    return data;
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    throw new Error(err.message || 'Network request failed');
  }
};


export const registerUser = async (username, email, password, fullName) => {
  try {
    console.log("REGISTER HIT:", username, email);

    const res = await fetch(`${Config.API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        email, 
        password, 
        full_name: fullName 
      })
    });

    console.log("REGISTER STATUS:", res.status);

    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);

    return data;
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    throw new Error(err.message || 'Network request failed');
  }
};


export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${Config.API_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.warn('[API] getUserProfile error:', error.message);
    return null;
  }
};


export const getPLTSData = async (token) => {
  try {
    const response = await fetch(`${Config.API_URL}/api/dashboard`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const resJson = await response.json();
    const data = resJson.data || resJson;

    return {
      voltage: parseFloat(data.voltage ?? data.tegangan ?? 0).toFixed(1),
      current: parseFloat(data.current ?? data.arus ?? 0).toFixed(2),
      power: parseFloat(data.power ?? data.daya ?? (data.voltage * data.current) ?? 0).toFixed(1),
      isNormal: data.isNormal ?? true,
      lastUpdated: data.lastUpdated ?? null,
    };
  } catch (error) {
    console.warn('[API] getPLTSData error:', error.message);
    return {
      voltage: '0.0',
      current: '0.00',
      power: '0.0',
      isNormal: true,
      lastUpdated: null,
    };
  }
};

/**
 * Ambil riwayat data dari server
 * @param {string} range - 'today' | '7days' | '30days'
 */
export const getHistoryData = async (range = 'today', token) => {
  try {
    let period = 'daily';
    if (range === '7days') period = 'weekly';
    if (range === '30days') period = 'monthly';

    const response = await fetch(`${Config.API_URL}/api/history?period=${period}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const resJson = await response.json();
    const data = resJson.data || resJson;

    return (Array.isArray(data) ? data : data.history || []).map((item) => ({
      timestamp: item.timestamp ?? item.waktu ?? new Date().toISOString(),
      voltage: parseFloat(item.voltage ?? item.tegangan ?? 0).toFixed(1),
      current: parseFloat(item.current ?? item.arus ?? 0).toFixed(2),
      power: parseFloat(item.power ?? item.daya ?? 0).toFixed(1),
    }));
  } catch (error) {
    console.warn('[API] getHistoryData error:', error.message);
    return [];
  }
};


export const generateNotifications = (data) => {
  const notifications = [];
  const now = new Date().toLocaleString('id-ID');
  const voltage = parseFloat(data.voltage);

  
  if (voltage > 0 && voltage < Config.CRITICAL_VOLTAGE_THRESHOLD) {
    notifications.push({
      id: 'critical-voltage',
      title: '⚠️ Tegangan Bahaya',
      message: `Tegangan < ${Config.CRITICAL_VOLTAGE_THRESHOLD}V (saat ini: ${data.voltage}V) - Sistem dalam kondisi darurat!`,
      type: 'danger',
      timestamp: now,
    });
  } else if (voltage >= Config.CRITICAL_VOLTAGE_THRESHOLD && voltage <= Config.WARNING_VOLTAGE_THRESHOLD) {
    notifications.push({
      id: 'warning-voltage',
      title: '⚠️ Tegangan Peringatan',
      message: `Tegangan ${Config.CRITICAL_VOLTAGE_THRESHOLD}-${Config.WARNING_VOLTAGE_THRESHOLD}V (saat ini: ${data.voltage}V) - Butuh perhatian!`,
      type: 'warning',
      timestamp: now,
    });
  } else if (voltage > Config.WARNING_VOLTAGE_THRESHOLD) {
    notifications.push({
      id: 'voltage-safe',
      title: '✓ Tegangan Aman',
      message: `Tegangan di atas ${Config.WARNING_VOLTAGE_THRESHOLD}V (${data.voltage}V) - Sistem normal`,
      type: 'normal',
      timestamp: now,
    });
  }

  
  if (parseFloat(data.power) === 0) {
    notifications.push({
      id: 'no-power',
      title: '⚠️ Daya Tidak Terdeteksi',
      message: 'Tidak ada daya masuk dari panel surya',
      type: 'warning',
      timestamp: now,
    });
  }

  
  const hasWarning = notifications.some(n => ['danger', 'warning'].includes(n.type));
  if (!hasWarning) {
    notifications.push({
      id: 'normal',
      title: '✓ Sistem Normal',
      message: 'Semua parameter dalam kondisi baik',
      type: 'normal',
      timestamp: now,
    });
  }

  return notifications;
};