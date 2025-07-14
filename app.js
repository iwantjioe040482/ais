const express = require('express');
const mysql = require('mysql2/promise'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const mysql = require('mysql');
const app = express();

app.use(express.json()); // <--- WAJIB

const port = process.env.PORT || 3000; // Use the port provided by the host or default to 3000

const SECRET_KEY = 'rahasia123'; // gunakan .env untuk keamanan

// Set up the MySQL connection
const dbConfig = {
    host: '172.17.12.127',
    port: '3306',
    user: 'dbuser',
    password: 'Welcome123',
    database: 'ais'
  };
//  const createConnection = () => mysql.createConnection(dbConfig);

const createConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // ambil setelah 'Bearer'

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await createConnection();
    // Ambil user dari database
    const [rows] = await connection.query('SELECT * FROM ais.mst_user WHERE uname = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    const user = rows[0];

    // Bandingkan password
    const validPassword = await bcrypt.compare(password, user.pwd);
    if (!validPassword) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Buat token JWT
    const token = jwt.sign({ userId: user.user_id, username: user.uname }, SECRET_KEY, {
      expiresIn: '1h'
    });

    const [rowsupdate] = await connection.query('update ais.mst_user set token=? WHERE user_id = ?',[token, user.user_id]);

    res.json({ message: 'Login berhasil', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

app.post('/logout', async (req, res) => {
  const { token } = req.body;
  try {
    const connection = await createConnection();
    
    // Ambil user dari database
    const [rows] = await connection.query('update ais.mst_user set token=null WHERE token = ?', [token]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'Logout berhasil', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});


app.post('/register', async (req, res) => {
  const { username, password,name  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const connection = await createConnection();
  await connection.query(
    'INSERT INTO ais.mst_user (uname, pwd,name) VALUES (?, ?,?)',
    [username, hashedPassword,name]
  );

  res.json({ message: 'User registered' });
});

// Route terproteksi (contoh)
app.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token tidak ditemukan' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Token valid', user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
});

 // Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// In-memory data store (replace with a database in production)
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

// Middleware to parse JSON requests
app.use(express.json());

app.get('/parthome', async (req, res) => {
  try {
    const connection = await createConnection();

    const [results] = await connection.query(
      'SELECT part_id AS id, part_name AS name, part_number AS sn FROM mst_vehicle_part WHERE type_id = "2"'
    );

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch part data' });
  }
});

app.post('/parthome', async (req, res) => {
  try {
    const connection = await createConnection();

    const part = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const sql = 'INSERT INTO mst_vehicle_part (part_name, part_number, type_id) VALUES (?, ?, "2")';
    const values = [part.name, part.sn];

    const [result] = await connection.query(sql, values);

    console.log(`Inserted Rows: ${result.affectedRows}`);

    await connection.end();

    res.status(201).json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to insert part' });
  }
});


app.get('/part', async (req, res) => {
  try {
    const connection = await createConnection();

    const [results] = await connection.query(
      'SELECT part_id AS id, part_name AS name, part_number AS sn FROM mst_vehicle_part WHERE type_id = "1"'
    );

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});


// Create (POST) a new item
app.post('/part', async (req, res) => {
  try {
    const connection = await createConnection();

    const part = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const sql = 'INSERT INTO mst_vehicle_part (part_name, part_number, type_id) VALUES (?, ?, "1")';
    const values = [part.name, part.sn];

    const [result] = await connection.query(sql, values);

    console.log(`Inserted Rows: ${result.affectedRows}`);

    await connection.end();

    res.status(201).json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to insert part' });
  }
});

app.get('/location', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = 'SELECT location_id AS id, location_name AS name FROM mst_location';
    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});
app.get('/sparepart', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = `
      SELECT 
        p.part_id AS id,
        p.part_name AS name,
        COALESCE(p.part_number, "") AS sn,
        t.qty,
        t.location_id,
        l.location_name,
        DATE_FORMAT(t.timestamp, "%Y-%m-%d %H:%i:%s") AS timestamp
      FROM ais.mst_vehicle_part p
      INNER JOIN ais.tr_part_history t ON t.part_id = p.part_id
      INNER JOIN mst_location l ON l.location_id = t.location_id
    `;

    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch spare parts' });
  }
});

app.post('/assets', async (req, res) => {
  
  const { token } = req.body;

  try {
    const connection = await createConnection();

    const sql = `
      SELECT 
        a.asset_id AS id,
        a.asset_name,
        t.type_asset,
        u.name,
        a.est_value,
        (
          SELECT DATE_FORMAT(tr.time_stamp, "%Y-%m-%d %H:%i:%s") 
          FROM tr_asset_history tr  
          WHERE tr.asset_id = a.asset_id 
          ORDER BY tr.time_stamp DESC 
          LIMIT 1
        ) AS last_update,
        (
          SELECT l.location_name 
          FROM tr_asset_history tr 
          INNER JOIN mst_location l ON l.location_id = tr.location_id 
          WHERE tr.asset_id = a.asset_id 
          ORDER BY tr.time_stamp DESC 
          LIMIT 1
        ) AS last_location,
        t.asset_icon 
      FROM ais.mst_asset a 
      INNER JOIN mst_user u ON u.user_id = a.user_id 
      INNER JOIN mst_type_asset t ON t.type_id = a.type_id  
      WHERE u.token = ?
      ORDER BY a.est_value DESC
    `;

    //const [results] = await connection.query(sql);
    const [results] = await connection.query(sql, [token]);
    
    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

async function recurringtransaction(ssparams) {
  let sql = '';

  switch (ssparams) {
    case "tax":
      sql = `
        SELECT r.recurring_id AS id, r.name,
          DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
          DATEDIFF(r.end_to, CURDATE()) AS remaining,
          DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
          u.name AS username
        FROM ais.recurring r
        INNER JOIN ais.mst_user u ON u.user_id = r.user_id
        WHERE r.type_id = "3"
        ORDER BY r.name
      `;
      break;
    case "insurance":
      sql = `
        SELECT r.recurring_id AS id, r.name,
          DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
          DATEDIFF(r.end_to, CURDATE()) AS remaining,
          DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
          u.name AS username
        FROM ais.recurring r
        INNER JOIN ais.mst_user u ON u.user_id = r.user_id
        WHERE r.type_id = "1"
        ORDER BY r.name
      `;
      break;
    case "creditcard":
      sql = `
        SELECT r.recurring_id AS id, r.name,
          DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
          DATEDIFF(r.end_to, CURDATE()) AS remaining,
          DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
          u.name AS username
        FROM ais.recurring r
        INNER JOIN ais.mst_user u ON u.user_id = r.user_id
        WHERE r.type_id = "2"
        ORDER BY r.name
      `;
      break;
    default:
      throw new Error("Invalid ssparams value");
  }

  try {
    const connection = await createConnection();
    const [results] = await connection.query(sql);
    await connection.end();
    return results; // Bisa langsung digunakan oleh pemanggil
  } catch (err) {
    console.error(err.message);
    return null;
  }
}

app.get('/tax', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = `
      SELECT 
        r.recurring_id AS id,
        r.name,
        DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
        DATEDIFF(r.end_to, CURDATE()) AS remaining,
        DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
        u.name AS username
      FROM ais.recurring r
      INNER JOIN ais.mst_user u ON u.user_id = r.user_id
      WHERE r.type_id = "3"
      ORDER BY r.name
    `;

    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve tax data' });
  }
});

app.get('/dailyexpense', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = 'SELECT * FROM vw_DailyExpenses1';

    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve expense data' });
  }
});


app.get('/expense', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = 'SELECT * FROM vw_DailyExpenses';

    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve expense data' });
  }
});

app.get('/priority', async (req, res) => {
  try {
    const connection = await createConnection();

    const sql = 'SELECT priority_id AS id, priority_name FROM mst_priority';

    const [results] = await connection.query(sql);

    console.log(JSON.stringify(results));

    await connection.end();

    res.json(results);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve priority data' });
  }
});


async function handleLedgerCall(req, res, procedureName, hasPriority) {
  try {
    const part = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const connection = await createConnection();

    const values = hasPriority
      ? [part.coa_id, part.description, part.total, part.priority_id]
      : [part.coa_id, part.description, part.total];

    const sql = `CALL ${procedureName} (${values.map(() => '?').join(', ')})`;

    const [results] = await connection.query(sql, values);

    console.log(`${procedureName} executed`, results);
    await connection.end();

    res.status(201).json(part);
  } catch (err) {
    console.error(`Error executing ${procedureName}:`, err.message);
    res.status(500).json({ error: `Failed to execute ${procedureName}` });
  }
}

app.post('/allobankincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeAlloBankLedger', false)
);

app.post('/allobankexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertAlloBankLedger', true)
);

app.post('/bcaincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeBcaLedger', false)
);

app.post('/bcaexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertBcaLedger', true)
);

app.post('/cashincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeCashLedger', false)
);

app.post('/cashexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertCashLedger', true)
);

app.post('/cimbincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeCimbLedger', false)
);

app.post('/cimbexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertCimbLedger', true)
);

app.post('/danaincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeDanaLedger', false)
);

app.post('/danaexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertDanaLedger', true)
);

app.post('/flazzexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertFlazzLedger', true)
);

app.post('/gopayincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeGoPayLedger', false)
);

app.post('/gopayexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertGopayLedger', true)
);


app.post('/hanaincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeHanaLedger', false)
);

app.post('/hanaexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertHanaLedger', true)
);


app.post('/octoincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeOctoLedger', false)
);

app.post('/octoexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertOctoLedger', true)
);

app.post('/mandiriincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeMandiriLedger', true)
);

app.post('/mandiriexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertMandiriLedger', true)
);

app.post('/ovoincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomeOvoLedger', false)
);

app.post('/ovoexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertOvoLedger', true)
);

app.post('/permataincome', (req, res) =>
  handleLedgerCall(req, res, 'IncomePermataLedger', false)
);

app.post('/permataexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertPermataLedger', true)
);

app.post('/shopeepayexpense', (req, res) =>
  handleLedgerCall(req, res, 'InsertShopeePayLedger', true)
);

// Endpoint POST untuk menerima transaksi (versi async)
app.post('/transfer', async (req, res) => {
    try {
    const { from, to,  amount } = req.body;

    if (!from || !to || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

        // Tentukan prosedur berdasarkan kombinasi from-to
    let procedureName = null;

    if (from === 'BCA' && to === 'Cash') {
      procedureName = 'IsiCashFromBCALedger';
    } else if (from === 'CIMB' && to === 'BCA') {
      procedureName = 'IsiBCAFromCIMBLedger';
    } else if (from === 'CIMB' && to === 'Cash') {
      procedureName = 'IsiCashFromCIMBLedger';
    } else if (from === 'BCA' && to === 'Flazz') {
      procedureName = 'IsiFlazzFromBCALedger';
    } else if (from === 'CIMB' && to === 'GoPay') {
      procedureName = 'IsiGopayFromCIMBLedger';
    } else if (from === 'CIMB' && to === 'Hana') {
      procedureName = 'IsiHanaFromCIMBLedger';
    } else if (from === 'CIMB' && to === 'Octo') {
      procedureName = 'IsiOctoFromCIMBLedger';
    } else if (from === 'CIMB' && to === 'Ovo') {
      procedureName = 'IsiOctoFromCIMBLedger';
    } else if (from === 'Mandiri' && to === 'BCA') {
      procedureName = 'IsiBCAFromMandiriLedger';
    } else {
      return res.status(400).json({ error: 'Unsupported from-to combination' });
    }

    const description = `Transfer from ${from} to ${to}`;
    const values = [description, amount];
    const sql = `CALL ${procedureName}(?, ?)`;

    const connection = await createConnection();
    
    const [results] = await connection.query(sql, values);

    console.log(`${procedureName} executed`, results);
    await connection.end();

    res.status(200).json({
      message: 'Transfer recorded',
      data: { from, to, amount }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function transformToPivot(rows) {
  const pivotMap = {};
  const monthMap = {
    '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr',
    '05': 'may', '06': 'jun', '07': 'jul', '08': 'aug',
    '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec',
  };

  rows.forEach(row => {
    const coa = row.coa_name;
    const total = row.total;
    const monthKey = monthMap[row.gl_month.split('-')[1]]; // '2025-04' → 'apr'

    if (!pivotMap[coa]) {
      pivotMap[coa] = { coa_name: coa };
    }

    // Inisialisasi bulan jika belum ada
    if (!pivotMap[coa][monthKey]) {
      pivotMap[coa][monthKey] = 0;
    }

    pivotMap[coa][monthKey] += total; // pakai += untuk akumulasi
  });

  // Optional: sort coa_name
  return Object.values(pivotMap).sort((a, b) =>
    a.coa_name.localeCompare(b.coa_name, 'id', { sensitivity: 'base' })
  );
};


app.get('/monthlyexpense', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM vw_MonthlyExpenses
    `);

    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error('Error in /pivot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/pivot', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM vw_MonthlyExpenses
    `);

    await connection.end();

    const pivot = transformToPivot(rows);
    res.json(pivot);
  } catch (error) {
    console.error('Error in /pivot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/coaincome', async (req, res) => {
  let connection;
  try {
    connection = await createConnection();

    const [results] = await connection.query('SELECT * FROM vw_CoaIncomes');

    console.log('vw_CoaIncomes results:', results);

    res.json(results);
  } catch (err) {
    console.error('Error fetching vw_CoaIncomes:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from vw_CoaIncomes' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/coaexpense', async (req, res) => {
  let connection;
  try {
    connection = await createConnection();

    const [results] = await connection.query('SELECT * FROM vw_CoaExpenses');

    console.log('vw_CoaExpenses results:', results);

    res.json(results);
  } catch (err) {
    console.error('Error fetching vw_CoaExpenses:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from vw_CoaExpenses' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/creditcard', async (req, res) => {
  let connection;

  try {
    connection = await createConnection();

    const sql = `
      SELECT 
        r.recurring_id AS id,
        r.name,
        DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
        DATEDIFF(r.end_to, CURDATE()) AS remaining,
        DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
        u.name AS username
      FROM ais.recurring r
      INNER JOIN ais.mst_user u ON u.user_id = r.user_id
      WHERE r.type_id = "2"
      ORDER BY r.name
    `;

    const [results] = await connection.query(sql);

    console.log('Credit card recurring results:', results);

    res.json(results);
  } catch (err) {
    console.error('Error executing /creditcard:', err.message);
    res.status(500).json({ error: 'Failed to fetch credit card recurring data' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/insurance', async (req, res) => {
  let connection;

  try {
    connection = await createConnection();

    const sql = `
      SELECT 
        r.recurring_id AS id,
        r.name,
        DATE_FORMAT(r.end_to, "%Y-%m-%d") AS end_to,
        DATEDIFF(r.end_to, CURDATE()) AS remaining,
        DATEDIFF(r.end_to, r.start_from) - 1 AS timeline,
        u.name AS username
      FROM ais.recurring r
      INNER JOIN ais.mst_user u ON u.user_id = r.user_id
      WHERE r.type_id = "1"
    `;

    const [results] = await connection.query(sql);

    console.log('Insurance recurring results:', results);

    res.json(results);
  } catch (err) {
    console.error('Error executing /insurance:', err.message);
    res.status(500).json({ error: 'Failed to fetch insurance recurring data' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/water',auth, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    const newWater = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    connection = await createConnection();

    // const sql = 'INSERT INTO ais.water (date, water_value) VALUES (?, ?)';
    // const values = [newWater.date, newWater.water_value];

    const sql = 'CALL sp_insertwater(?,?,?)';
    const values = [token,newWater.date, newWater.water_value];


    const [results] = await connection.query(sql, values);

    console.log(`Inserted Rows: ${results.affectedRows}`);
    res.status(201).json(newWater);
  } catch (err) {
    console.error('Error executing /water:', err.message);
    res.status(500).json({ error: 'Failed to insert water data' });
  } finally {
    if (connection) await connection.end();
  }
});


app.get('/water',auth, async (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    connection = await createConnection();

    const [results] = await connection.query('CALL sp_water(?)',[token]);

    console.log(JSON.stringify(results));

    res.json(results[0]);
  } catch (err) {
    console.error('Error executing /water:', err.message);
    res.status(500).json({ error: 'Failed to fetch water data' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/electricity',auth, async (req, res) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    const electricity = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    connection = await createConnection();

    //const sql = 'INSERT INTO ais.electricity (date, electricity_value) VALUES (?, ?)';
    const sql = 'CALL sp_insertelectricity(?,?,?)';
    const values = [token,electricity.date, electricity.electricity_value];

    const [results] = await connection.query(sql, values);

    console.log(`Inserted Rows: ${results.affectedRows}`);
    res.status(201).json(electricity);
  } catch (err) {
    console.error('Error inserting electricity data:', err.message);
    res.status(500).json({ error: 'Failed to insert electricity data' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/electricity', auth, async (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    connection = await createConnection();

    const [results] = await connection.query('CALL sp_electricity(?)',[token]);

    console.log(JSON.stringify(results));
    res.json(results[0]);
  } catch (err) {
    console.error('Failed to fetch electricity data:', err.message);
    res.status(500).json({ error: 'Failed to fetch electricity data' });
  } finally {
    if (connection) await connection.end();
  }
});
app.post('/items', async (req, res) => {
  let connection;
  let item;

  try {
    connection = await createConnection();

    const newItem = req.body;

    // Cek dan parse jika perlu
    item = (typeof newItem === 'string') ? JSON.parse(newItem) : newItem;

    const sql = 'INSERT INTO items (name) VALUES (?)';
    const values = [item.name];

    const [results] = await connection.query(sql, values);

    console.log(`Inserted Rows: ${results.affectedRows}`);
    res.status(201).json(item);
  } catch (err) {
    console.error('Failed to insert item:', err.message);
    res.status(500).json({ error: 'Failed to insert item' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/items', async (req, res) => {
  let connection;

  try {
    connection = await createConnection();

    const [results] = await connection.query('SELECT * FROM items');

    console.log(JSON.stringify(results));
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch items:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/estelectricbill',auth, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    connection = await createConnection();

    // const [results] = await connection.query('SELECT electricbillest FROM vw_estelectricbill');
    const [results] = await connection.query('CALL sp_estelectricbill(?)',[token]);
    

    if (results.length === 0) {
      return res.status(404).json({ error: 'electricbillest not found' });
    }

    console.log(JSON.stringify(results));
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching electricbillest:', err.message);
    res.status(500).json({ error: 'Failed to fetch electricbillest' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/estwaterbill', auth, async (req, res) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  let connection;

  try {
    connection = await createConnection();

    //const [results] = await connection.query('SELECT waterbillest FROM vw_estwaterbill');
    const [results] = await connection.query('CALL sp_estwaterbill (?)',[token]);
    

    if (results.length === 0) {
      return res.status(404).json({ error: 'waterbillest not found' });
    }

    console.log(JSON.stringify(results));
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching waterbillest:', err.message);
    res.status(500).json({ error: 'Failed to fetch waterbillest' });
  } finally {
    if (connection) await connection.end();
  }
});
app.get('/balance/:id',auth, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil token dari header

  const connection = await createConnection(dbConfig);
  const id = req.params.id;

  // Peta nama ke coa_id
  const coaMap = {
    "Allo Bank": 32,
    "BCA": 2,
    "Cash": 1,
    "CIMB": 3,
    "Dana": 25,
    "Flazz": 10,
    "GoPay": 5,
    "Hana": 57,
    "Mandiri":61,
    "Octo": 24,
    "Ovo": 38,
    "Permata": 48,
    "ShopeePay": 7,
    "Blue":62
  };

  const coaId = coaMap[id];

  if (!coaId) {
    await connection.end();
    return res.status(400).json({ error: `Invalid COA name: ${id}` });
  }

  try {
    const [results] = await connection.query(
      'SELECT m.Balance FROM mst_coa m INNER JOIN coa_user c ON c.id_coa=m.coa_id INNER JOIN mst_user u ON u.user_id=c.id_user WHERE u.token=? and  m.coa_id = ?',
      [token,coaId]
    );

    console.log({ id, coaId, results });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Balance not found' });
    }

    res.json(results);
  } catch (err) {
    console.error('Query error:', err.message);
    res.status(500).json({ error: 'Failed to fetch balance' });
  } finally {
    await connection.end();
  }
});
app.get('/items/:id', async (req, res) => {
  let connection;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    connection = await createConnection();
    const [results] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log(JSON.stringify(results));
    res.json(results[0]); // return single item
  } catch (err) {
    console.error('Error fetching item:', err.message);
    res.status(500).json({ error: 'Failed to fetch item' });
  } finally {
    if (connection) await connection.end();
  }
});
app.put('/items/:id', async (req, res) => {
  let connection;

  try {
    const id = parseInt(req.params.id);
    const updatedItem = req.body;

    if (isNaN(id) || !updatedItem.name) {
      return res.status(400).json({ error: 'Invalid ID or missing name' });
    }

    connection = await createConnection();

    // Check if the item exists
    const [existing] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update the item
    await connection.query('UPDATE items SET name = ? WHERE id = ?', [updatedItem.name, id]);

    console.log(`Updated item ID ${id} with name = ${updatedItem.name}`);
    res.json({ id, name: updatedItem.name });

  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: 'Failed to update item' });
  } finally {
    if (connection) await connection.end();
  }
});
app.delete('/items/:id', async (req, res) => {
  let connection;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    connection = await createConnection();

    // Cek apakah item ada
    const [existing] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Lakukan penghapusan
    await connection.query('DELETE FROM items WHERE id = ?', [id]);

    console.log(`Deleted item ID ${id}`);
    res.json({ message: 'Item deleted successfully', deletedItem: existing[0] });

  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete item' });
  } finally {
    if (connection) await connection.end();
  }
});
