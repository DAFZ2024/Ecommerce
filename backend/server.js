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

app.get("/api/productos/buscar", (req, res) => {
  const query = req.query.query?.toLowerCase() || "";
  const likeQuery = `%${query}%`;

  const sql = `
    SELECT 
      p.*, 
      c.nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE LOWER(p.nombre) LIKE ? OR LOWER(p.descripcion) LIKE ?
  `;

  db.query(sql, [likeQuery, likeQuery], (error, results) => {
    if (error) {
      console.error("❌ Error al buscar productos:", error);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json(results);
  });
});

// Obtener detalle de un producto por ID
app.get("/api/productos/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.*, 
      c.nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_producto = ?
    LIMIT 1
  `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error("❌ Error al obtener el producto:", error);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(results[0]);
  });
});



const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "secreto123"; // Guarda esto en tu .env en producción

// 📌 REGISTRO de usuario
app.post("/api/auth/register", async (req, res) => {
  const { nombre_completo, correo, contrasena, direccion, telefono } = req.body;

  if (!nombre_completo || !correo || !contrasena) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const checkSql = `SELECT id_usuario FROM usuarios WHERE correo = ?`;
    db.query(checkSql, [correo], async (err, results) => {
      if (err) {
        console.error("❌ Error al verificar usuario:", err);
        return res.status(500).json({ error: "Error interno" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      const insertSql = `
        INSERT INTO usuarios (nombre_completo, correo, contrasena, direccion, telefono, rol)
        VALUES (?, ?, ?, ?, ?, 'cliente')
      `;

      db.query(insertSql, [nombre_completo, correo, hashedPassword, direccion, telefono], (err, result) => {
        if (err) {
          console.error("❌ Error al registrar usuario:", err);
          return res.status(500).json({ error: "Error al crear usuario" });
        }

        res.status(201).json({ message: "Usuario registrado exitosamente", id_usuario: result.insertId });
      });
    });
  } catch (err) {
    console.error("❌ Error en el registro:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔐 LOGIN de usuario
app.post("/api/auth/login", (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  const sql = `SELECT * FROM usuarios WHERE correo = ?`;

  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json({ error: "Error interno" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];
    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo: user.correo,
        rol: user.rol,
        nombre_completo: user.nombre_completo,
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        rol: user.rol,
      }
    });
  });
});


app.get("/api/auth/perfil", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ usuario: decoded });
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
});




// Levantar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

