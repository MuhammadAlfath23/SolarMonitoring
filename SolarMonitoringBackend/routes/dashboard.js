const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken } = require('./auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const latestData = await prisma.plts_current.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    if (latestData) {
      return res.json({
        status: 'success',
        data: {
          voltage: latestData.voltage.toString(),
          current: latestData.current.toString(),
          power: latestData.power.toString(),
          battery: latestData.battery,
          energy: '0', 
          source: latestData.source,
          isNormal: latestData.is_normal,
          lastUpdated: latestData.timestamp.toISOString()
        }
      });
    } else {
      // Seeder disabled: return 0/empty data
      return res.json({
        status: 'success',
        data: {
          voltage: '0',
          current: '0',
          power: '0',
          battery: 0,
          energy: '0',
          source: 'Database Kosong',
          isNormal: true,
          lastUpdated: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.warn('[Dashboard] Menggunakan Seeder/Dummy Data karena:', error.message);
    
    // --- START SEEDER / DUMMY DATA (FALLBACK) ---
    const voltage = 12.0;
    const current = 1.3;
    const power = voltage * current; // 15.6 W
    const efficiency = 85; 

    return res.json({
      status: 'success',
      data: {
        voltage: voltage.toString(),
        current: current.toString(),
        power: power.toString(),
        battery: efficiency,
        energy: '100',
        source: 'Test Data (Seeder)',
        isNormal: true,
        lastUpdated: new Date().toISOString()
      }
    });
    // --- END SEEDER DATA ---
  }
});

module.exports = router;
