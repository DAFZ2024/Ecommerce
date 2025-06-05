const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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


app.get('/api/productos/destacados', (req, res) => {
  const query = `
    SELECT 
  p.*, 
  c.nombre_categoria 
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
ORDER BY p.puntuacion DESC
LIMIT 4;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener productos destacados:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});


// Levantar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

