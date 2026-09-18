cat > ~/SolarMonitoringBackend/routes/history.js << 'EOF'
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyToken } = require('./auth');


router.get('/', verifyToken, async (req, res) => {
  try {
    const periode = req.query.period || 'daily';
    
    const sekarang = new Date();
    let tanggalAwal;
    
    if (periode === 'daily' || periode === 'today') {
      tanggalAwal = new Date(sekarang);
      tanggalAwal.setHours(0, 0, 0, 0);
    } else if (periode === 'weekly' || periode === '7d') {
      tanggalAwal = new Date(sekarang.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periode === 'monthly' || periode === '30d') {
      tanggalAwal = new Date(sekarang.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      tanggalAwal = new Date(sekarang);
      tanggalAwal.setHours(0, 0, 0, 0);
    }

    const dataRiwayat = await prisma.plts_history.findMany({
      where: {
        timestamp: {
          gte: tanggalAwal
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    const dataTerurut = dataRiwayat.map(item => ({
      time: item.timestamp.toISOString(),
      voltage: parseFloat(item.voltage.toString()),
      current: parseFloat(item.current.toString()),
      power: parseFloat(item.power.toString()),
      battery: item.battery,
      isNormal: item.is_normal
    }));

    return res.json({
      status: 'success',
      data: dataTerurut,
      count: dataTerurut.length,
      period: periode,
      startDate: tanggalAwal.toISOString()
    });
  } catch (error) {
    console.error('[Riwayat] Terjadi kesalahan:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data riwayat'
    });
  }
});

module.exports = router;
EOF