const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'arturo1234',
  database: 'droppingwater'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Definición de las entidades y los endpoints CRUD
const entities = {
  cliente: ['Nombre', 'Zona', 'Direccion', 'Celular', 'Correo', 'Contraseña', 'Estado'],
  empleado: ['Nombre', 'CURP', 'RFC', 'Direccion', 'Fecha_nac', 'Contraseña', 'Estado', 'Telefono'],
  administrativo: ['id', 'Nombre', 'ClaveUnica', 'Contraseña', 'Fecha_nac', 'RFC', 'CURP', 'Direccion', 'Comentarios', 'Estado'],
  tinaco: ['id_cliente', 'Litros', 'Nivel'],
  mantenimientos: ['id_Tinaco', 'Comentarios', 'Realizado', 'Fecha', 'Hora'],
  mensajes: ['id_cliente', 'id_administrativo', 'Mensaje', 'Fecha', 'Hora']
};

Object.keys(entities).forEach(entity => {
  // Create
  app.post(`/api/${entity}`, (req, res) => {
    const data = req.body;
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');
    const sql = `INSERT INTO ${entity} (${columns}) VALUES (${placeholders})`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(`Error inserting into ${entity}:`, err);
        return res.status(500).send(err);
      }
      res.status(201).send(result);
    });
  });

  // Read all
  app.get(`/api/${entity}`, (req, res) => {
    const sql = `SELECT * FROM ${entity}`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error(`Error reading from ${entity}:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(results);
    });
  });

  // Read by id
  app.get(`/api/${entity}/id/:id`, (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM ${entity} WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(`Error reading from ${entity} by id:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(results);
    });
  });

  // Read by nombre
  app.get(`/api/${entity}/nombre/:nombre`, (req, res) => {
    const { nombre } = req.params;
    const sql = `SELECT * FROM ${entity} WHERE Nombre = ?`;
    db.query(sql, [nombre], (err, results) => {
      if (err) {
        console.error(`Error reading from ${entity} by nombre:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(results);
    });
  });

  // Update by id
  app.put(`/api/${entity}/id/:id`, (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const columns = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const sql = `UPDATE ${entity} SET ${columns} WHERE id = ?`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(`Error updating ${entity} by id:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(result);
    });
  });

  // Update by nombre
  app.put(`/api/${entity}/nombre/:nombre`, (req, res) => {
    const { nombre } = req.params;
    const data = req.body;
    const columns = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(nombre);
    const sql = `UPDATE ${entity} SET ${columns} WHERE Nombre = ?`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(`Error updating ${entity} by nombre:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(result);
    });
  });

  // Delete by id
  app.delete(`/api/${entity}/id/:id`, (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM ${entity} WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(`Error deleting from ${entity} by id:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(result);
    });
  });

  // Delete by nombre
  app.delete(`/api/${entity}/nombre/:nombre`, (req, res) => {
    const { nombre } = req.params;
    const sql = `DELETE FROM ${entity} WHERE Nombre = ?`;
    db.query(sql, [nombre], (err, result) => {
      if (err) {
        console.error(`Error deleting from ${entity} by nombre:`, err);
        return res.status(500).send(err);
      }
      res.status(200).send(result);
    });
  });
});

// Endpoint para manejar la solicitud de llenado
app.post('/api/mensajes', (req, res) => {
  const { id_cliente, id_administrativo, Mensaje, Fecha, Hora } = req.body;
  const sql = 'INSERT INTO mensajes (id_cliente, id_administrativo, Mensaje, Fecha, Hora) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id_cliente, id_administrativo, Mensaje, Fecha, Hora], (err, result) => {
    if (err) {
      console.error('Error inserting into mensajes:', err);
      return res.status(500).send(err);
    }
    res.status(201).json({ message: 'Solicitud de llenado recibida correctamente' });
  });
});

// Endpoint para obtener datos del tinaco por id_cliente
app.get('/api/tinaco', (req, res) => {
  const { id_cliente } = req.query;
  if (!id_cliente) {
    return res.status(400).send('id_cliente is required');
  }

  const sql = 'SELECT * FROM tinaco WHERE id_cliente = ?';
  db.query(sql, [id_cliente], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send(err);
    }
    res.status(200).send(results[0]);
  });
});

// Endpoint para el login del cliente
app.post('/api/cliente/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).send('Correo y contraseña son requeridos');
  }

  const sql = 'SELECT * FROM cliente WHERE Correo = ? AND Contraseña = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send(err);
    }

    if (results.length === 0) {
      return res.status(401).send('Credenciales inválidas');
    }

    const user = results[0];

    // Remove the password before sending the response
    delete user.Contraseña;

    res.status(200).send(user);
  });
});

app.post('/api/trabajador/login', (req, res) => {
  const { rfc, contraseña } = req.body;

  if (!rfc || !contraseña) {
    return res.status(400).send('RFC y contraseña son requeridos');
  }

  const sql = 'SELECT * FROM empleado WHERE RFC = ? AND Contraseña = ?';
  db.query(sql, [rfc, contraseña], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send(err);
    }

    if (results.length === 0) {
      return res.status(401).send('Credenciales inválidas');
    }

    const user = results[0];

    // Remove the password before sending the response
    delete user.Contraseña;

    res.status(200).send(user);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://10.0.2.2:${port}`);
});