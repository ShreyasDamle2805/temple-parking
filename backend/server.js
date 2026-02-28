// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- DATABASE POOL --------------------
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sdml@096#',
  database: 'parkingsysdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// -------------------- UTIL FUNCTIONS --------------------
async function callAllocateSlot(vehicle_id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      CALL sp_allocate_slot(?, @out_record_id, @out_slot_id);
      SELECT @out_record_id AS record_id, @out_slot_id AS slot_id;
      `,
      [vehicle_id]
    );
    const out = rows[1][0];
    return { record_id: out.record_id, slot_id: out.slot_id };
  } finally {
    conn.release();
  }
}

async function callProcessExit(record_id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      CALL sp_process_exit(?, @out_amount);
      SELECT @out_amount AS amount;
      `,
      [record_id]
    );
    const out = rows[1][0];
    return { amount: out.amount };
  } finally {
    conn.release();
  }
}

// -------------------- API ENDPOINTS --------------------

// 1) Create User
app.post('/api/users', async (req, res) => {
  try {
    const { full_name, mobile, email } = req.body;
    const qr_code = 'USER:' + Date.now() + ':' + Math.random().toString(36).slice(2,8);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, mobile, email, qr_code) VALUES (?, ?, ?, ?)`,
      [full_name, mobile, email, qr_code]
    );
    res.json({ ok: true, user_id: result.insertId, qr_code });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 2) Create Vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    const { user_id, vehicle_number, vehicle_type } = req.body;
    const qr_code = 'VEH:' + Date.now() + ':' + Math.random().toString(36).slice(2,8);
    const [result] = await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_number, vehicle_type, qr_code) VALUES (?, ?, ?, ?)`,
      [user_id, vehicle_number, vehicle_type, qr_code]
    );
    res.json({ ok: true, vehicle_id: result.insertId, qr_code });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 3) Create Slot (add support for Three-Wheeler)
app.post('/api/slots', async (req, res) => {
  try {
    const { slot_number, slot_type } = req.body;
    const [result] = await pool.query(
      `INSERT INTO parking_slots (slot_number, slot_type, is_available) VALUES (?, ?, TRUE)`,
      [slot_number, slot_type]
    );
    res.json({ ok: true, slot_id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 4) Generate QR Image
app.get('/api/qrcode/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let qrRow;
    if (type === 'user') {
      const [r] = await pool.query('SELECT qr_code FROM users WHERE user_id=?', [id]);
      qrRow = r[0];
    } else {
      const [r] = await pool.query('SELECT qr_code FROM vehicles WHERE vehicle_id=?', [id]);
      qrRow = r[0];
    }
    if (!qrRow) return res.status(404).json({ ok: false, message: 'Not found' });
    const dataUrl = await QRCode.toDataURL(qrRow.qr_code);
    res.json({ ok: true, dataUrl, payload: qrRow.qr_code });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 5) Entry Scan
app.post('/api/scan/entry', async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ ok:false, message:'Payload required' });

    let vehicle_id;
    if (payload.startsWith('VEH:')) {
      const [vrows] = await pool.query('SELECT vehicle_id FROM vehicles WHERE qr_code=?', [payload]);
      if (!vrows.length) return res.status(404).json({ ok:false, message:'Vehicle not found' });
      vehicle_id = vrows[0].vehicle_id;
    } else if (payload.startsWith('USER:')) {
      const [u] = await pool.query('SELECT user_id FROM users WHERE qr_code=?', [payload]);
      if (!u.length) return res.status(404).json({ ok:false, message:'User not found' });
      const user_id = u[0].user_id;
      const [vrows] = await pool.query(`SELECT vehicle_id FROM vehicles WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, [user_id]);
      if (!vrows.length) return res.status(404).json({ ok:false, message:'User has no registered vehicles' });
      vehicle_id = vrows[0].vehicle_id;
    } else {
      return res.status(400).json({ ok:false, message:'Unknown QR payload' });
    }

    const alloc = await callAllocateSlot(vehicle_id);
    if (!alloc.record_id) return res.status(409).json({ ok:false, message:'No available slot' });

    const [srows] = await pool.query('SELECT slot_number FROM parking_slots WHERE slot_id=?', [alloc.slot_id]);
    res.json({ ok:true, record_id: alloc.record_id, slot_id: alloc.slot_id, slot_number: srows[0].slot_number });
  } catch(err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

// 6) Exit Scan
app.post('/api/scan/exit', async (req, res) => {
  try {
    const { payload, record_id } = req.body;
    let finalRecordId = record_id;

    if (!finalRecordId) {
      if (!payload) return res.status(400).json({ ok:false, message:'payload or record_id required' });
      const [vrows] = await pool.query('SELECT vehicle_id FROM vehicles WHERE qr_code=?', [payload]);
      if (!vrows.length) return res.status(404).json({ ok:false, message:'Vehicle not found' });

      const vehicle_id = vrows[0].vehicle_id;
      const [r] = await pool.query(`SELECT record_id FROM parking_records WHERE vehicle_id=? AND status='Parked' ORDER BY entry_time DESC LIMIT 1`, [vehicle_id]);
      if (!r.length) return res.status(404).json({ ok:false, message:'No active parking record' });
      finalRecordId = r[0].record_id;
    }

    const result = await callProcessExit(finalRecordId);
    res.json({ ok:true, record_id: finalRecordId, amount: result.amount });
  } catch(err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

// 7) Current Parked Vehicles
app.get('/api/parking/current', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pr.record_id, v.vehicle_number, ps.slot_number, pr.entry_time
      FROM parking_records pr
      JOIN vehicles v ON pr.vehicle_id = v.vehicle_id
      JOIN parking_slots ps ON pr.slot_id = ps.slot_id
      WHERE pr.status='Parked'
      ORDER BY pr.entry_time
    `);
    res.json({ ok:true, data: rows });
  } catch(err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

// -------------------- START SERVER --------------------
const PORT = 4000;

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Backend running at http://0.0.0.0:${PORT}`)
);

