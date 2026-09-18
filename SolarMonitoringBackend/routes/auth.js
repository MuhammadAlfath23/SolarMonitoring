const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username: username }
    });

    if (!user || !user.is_active) {
      if (user) {
        await createLoginLog(user.id, req, false, 'User tidak aktif');
      }
      return res.status(401).json({ status: 'error', message: 'Kredensial tidak valid atau akun dinonaktifkan' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await createLoginLog(user.id, req, false, 'Password salah');
      return res.status(401).json({ status: 'error', message: 'Kredensial tidak valid' });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    await createLoginLog(user.id, req, true, null);

    const token = jwt.sign(
      { id: user.id.toString(), username: user.username }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );
    
    return res.json({
      status: 'success',
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
  }
});

async function createLoginLog(userId, req, success, failureReason) {
  try {
    await prisma.login_logs.create({
      data: {
        user_id: userId,
        action: 'login',
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        success: success,
        failure_reason: failureReason
      }
    });
  } catch (err) {
    console.error('Failed to write login log:', err);
  }
}

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
