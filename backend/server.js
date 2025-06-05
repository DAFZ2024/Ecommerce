const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(__dirname + '/public/images'));



// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('❌ Error de conexión:', err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

// Apis de desarrollo

// api para destacados
app.get('/api/productos/destacados', (req, res) => {
  const query = `
    SELECT 
  p.*, 
  c.nombre_categoria 
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
ORDER BY p.puntuacion DESC
LIMIT 12;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener productos destacados:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// api para productos en oferta
app.get('/api/productos/ofertas', (req, res) => {
  const query = `
    SELECT 
      p.id_producto,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.puntuacion,
      p.imagen_url,
      p.id_categoria,
      c.nombre_categoria,
      p.en_oferta,
      p.descuento
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.en_oferta = 1
    ORDER BY p.puntuacion DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener productos en oferta:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const query = 'SELECT id_categoria, nombre_categoria FROM categorias';
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener categorías:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Obtener productos por categoría
app.get('/api/productos/categoria/:id', (req, res) => {
  const id_categoria = req.params.id;
  const query = `
    SELECT 
      p.*, 
      c.nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_categoria = ?
    ORDER BY p.puntuacion DESC
  `;
  db.query(query, [id_categoria], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener productos por categoría:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

app.post('/api/contactos', (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const query = `INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)`;

  db.query(query, [nombre, correo, mensaje], (err, result) => {
    if (err) {
      console.error("Error al guardar contacto:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json({ message: "Mensaje enviado correctamente", id_contacto: result.insertId });
  });
});

// Supongamos que tienes una conexión a la base de datos llamada `connection`
app.get("/api/productos/buscar", (req, res) => {
  const query = req.query.query?.toLowerCase() || ""; // Obtiene el texto de búsqueda de la URL
  const likeQuery = `%${query}%`;

  // Consulta SQL para buscar productos por nombre o descripción que contengan el texto
  const sql = `SELECT * FROM productos WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ?`;

  connection.query(sql, [likeQuery, likeQuery], (error, results) => {
    if (error) return res.status(500).json({ error: "Error en la base de datos" });
    res.json(results); // Devuelve los productos encontrados
  });
});


// Levantar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

