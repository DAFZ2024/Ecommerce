const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); // Agregar esta línea
require('dotenv').config();

//payu
const payuRoutes = require('./routes/payu');
const app = express();

// apis routers
// Importar el router de uploads
const uploadsRouter = require("./routes/Uploads");

const contactosRoutes = require('./routes/contactos');
const carritosRoutes = require('./routes/carritos');
const ordenesRoutes = require('./routes/ordenes');
const pagosRoutes = require('./routes/pagos');



// subir imagenes usuarios 
// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});


// Middlewares (reorganizar para mejor orden)
app.use(cors({
  origin: 'http://localhost:5173', // o el dominio de tu frontend
  credentials: true
}));

app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para formularios

// Servir archivos estáticos (imágenes)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Permitir acceso a las imágenes
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Registrar todas las rutas
app.use('/api/contactos', contactosRoutes);
app.use('/api/carritos', carritosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/payu', payuRoutes);


// ¡ESTA ES LA LÍNEA QUE FALTABA!
app.use('/api', uploadsRouter);

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
    WHERE p.en_oferta = 1 AND p.stock > 0
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


// api mejor oferta
app.get('/api/productos/mejor-oferta', (req, res) => {
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
    ORDER BY p.descuento DESC
    LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener la mejor oferta:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    
    // DEBUG: Agrega un log para ver qué devuelve realmente
    console.log("Resultados de la mejor oferta:", results);
    
    // Devuelve el primer resultado o null
    res.json(results[0] || null);
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

// 🛡️ Middleware de autenticación JWT
const verificarToken = (req, res, next) => {
    // Obtener el token del header 'Authorization'
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: "Token no proporcionado" });
    }
    
    // Verificar formato "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(400).json({ error: "Formato de token inválido. Use: Bearer <token>" });
    }
    
    const token = tokenParts[1];
    
    try {
        // Verificar y decodificar el token usando tu JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Añadir los datos del usuario al request
        req.usuario = {
            id_usuario: decoded.id_usuario,
            correo: decoded.correo,
            rol: decoded.rol
        };
        
        next(); // Continuar al siguiente middleware/ruta
    } catch (error) {
        console.error("Error verificando token:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expirado" });
        }
        
        return res.status(401).json({ error: "Token inválido" });
    }
};

//actualizar usuarios


// 📌 ACTUALIZAR FOTO DE PERFIL (PUT)
app.put(
  "/api/usuarios/foto-perfil",
  verificarToken,
  upload.single('foto'),  // 'foto' debe ser el nombre del campo en el formulario
  async (req, res) => {
    const userId = req.usuario.id_usuario;
    
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó una imagen válida" });
    }

    const fotoPath = req.file.path; // Ruta relativa de la imagen

    try {
      // Actualizar base de datos
      await db.promise().query(
        "UPDATE usuarios SET foto_perfil = ? WHERE id_usuario = ?",
        [fotoPath, userId]
      );

      res.json({ 
        message: "Foto de perfil actualizada exitosamente",
        foto_perfil: fotoPath
      });

      // ✅ PASO 6: Devolver URL completa
    const fotoUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.filename)}`;
    
    res.json({ 
      message: "Foto actualizada",
      foto_url: fotoUrl
    });
      
    } catch (err) {
      console.error("Error al actualizar foto de perfil:", err);
      res.status(500).json({ error: "Error al actualizar foto" });
    }
  }
);






// 📌 ACTUALIZAR usuario (PUT)
app.put("/api/usuarios/:id", verificarToken, async (req, res) => {
  const userId = req.params.id;
  const { nombre_completo, direccion, telefono } = req.body;

  // Verificar permisos (usuario actual o admin)
  if (req.usuario.id_usuario != userId && req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: "No autorizado" });
  }

  if (!nombre_completo) {
    return res.status(400).json({ error: "El nombre completo es obligatorio" });
  }

  try {
    // 1. Obtener datos actuales primero
    const [currentUser] = await db.promise().query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [userId]
    );

    if (!currentUser.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Actualizar solo campos proporcionados
    const updateData = {
      nombre_completo: nombre_completo || currentUser[0].nombre_completo,
      direccion: direccion !== undefined ? direccion : currentUser[0].direccion,
      telefono: telefono !== undefined ? telefono : currentUser[0].telefono,
      foto_perfil: foto_perfil || currentUser[0].foto_perfil
    };

    // 3. Ejecutar actualización
    await db.promise().query(
      "UPDATE usuarios SET ? WHERE id_usuario = ?",
      [updateData, userId]
    );

    // 4. Devolver usuario actualizado
    const [updatedUser] = await db.promise().query(
      "SELECT id_usuario, nombre_completo, correo, direccion, telefono, foto_perfil FROM usuarios WHERE id_usuario = ?",
      [userId]
    );

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // ✅ PASO 6: Convertir ruta a URL accesible
    const userData = updatedUser[0];
    if (userData.foto_perfil) {
      userData.foto_url = `${req.protocol}://${req.get('host')}/uploads/${path.basename(userData.foto_perfil)}`;
    }

    res.json(userData);
    
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});




// 📌 CAMBIAR CONTRASEÑA (PUT)
app.put("/api/usuarios/cambiar-password", verificarToken, async (req, res) => {
  const userId = req.usuario.id_usuario;
  const { contrasena_actual, nueva_contrasena } = req.body;

  // Validación mejorada
  if (!contrasena_actual || !nueva_contrasena) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // 1. Obtener usuario
    const [user] = await db.promise().query(
      "SELECT contrasena FROM usuarios WHERE id_usuario = ?",
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Verificar contraseña actual (usa await para versión asíncrona)
    const contrasenaValida = await bcrypt.compare(
      contrasena_actual,
      user[0].contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    // 3. Hashear nueva contraseña
    const saltRounds = 10;
    const nuevaContrasenaHash = await bcrypt.hash(nueva_contrasena, saltRounds);

    // 4. Actualizar en BD
    await db.promise().query(
      "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
      [nuevaContrasenaHash, userId]
    );

    res.json({ message: "Contraseña actualizada exitosamente" });
    
  } catch (err) {
    console.error("Error en cambiar-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});




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

// apis crud



// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT id_usuario, nombre_completo, correo, rol, direccion, telefono FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre_completo, correo, contrasena, rol = 'cliente', direccion, telefono } = req.body;

  if (!nombre_completo || !correo || !contrasena) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const hashedPassword = await bcrypt.hash(contrasena, 10);

  const sql = `INSERT INTO usuarios (nombre_completo, correo, contrasena, rol, direccion, telefono)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [nombre_completo, correo, hashedPassword, rol, direccion, telefono], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear usuario' });
    res.status(201).json({ message: 'Usuario creado', id_usuario: result.insertId });
  });
});

// Actualizar usuario
app.put('/api/usuarios/:id', (req, res) => {
  const { nombre_completo, correo, rol, direccion, telefono } = req.body;
  const id = req.params.id;

  const sql = `UPDATE usuarios SET nombre_completo = ?, correo = ?, rol = ?, direccion = ?, telefono = ? WHERE id_usuario = ?`;
  db.query(sql, [nombre_completo, correo, rol, direccion, telefono, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
    res.json({ message: 'Usuario actualizado' });
  });
});

// Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
  db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
    res.json({ message: 'Usuario eliminado' });
  });
});


// Crear categoría
app.post('/api/categorias', (req, res) => {
  const { nombre_categoria } = req.body;

  if (!nombre_categoria) return res.status(400).json({ error: 'Nombre requerido' });

  db.query('INSERT INTO categorias (nombre_categoria) VALUES (?)', [nombre_categoria], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear categoría' });
    res.status(201).json({ message: 'Categoría creada', id_categoria: result.insertId });
  });
});

// Actualizar categoría
app.put('/api/categorias/:id', (req, res) => {
  const { nombre_categoria } = req.body;

  db.query('UPDATE categorias SET nombre_categoria = ? WHERE id_categoria = ?', [nombre_categoria, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar categoría' });
    res.json({ message: 'Categoría actualizada' });
  });
});

// Eliminar categoría
app.delete('/api/categorias/:id', (req, res) => {
  db.query('DELETE FROM categorias WHERE id_categoria = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar categoría' });
    res.json({ message: 'Categoría eliminada' });
  });
});


// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre_categoria 
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY p.id_producto DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(results);
  });
});

// Crear nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, puntuacion = 0.0, imagen_url, id_categoria, en_oferta = false, descuento = 0.0 } = req.body;

  const sql = `
    INSERT INTO productos 
    (nombre, descripcion, precio, stock, puntuacion, imagen_url, id_categoria, en_oferta, descuento)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombre, descripcion, precio, stock, puntuacion, imagen_url, id_categoria, en_oferta, descuento], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear producto' });
    res.status(201).json({ message: 'Producto creado', id_producto: result.insertId });
  });
});

// Actualizar producto
app.put('/api/productos/:id', (req, res) => {
  const { nombre, descripcion, precio, stock, puntuacion, imagen_url, id_categoria, en_oferta, descuento } = req.body;

  const sql = `
    UPDATE productos 
    SET nombre = ?, descripcion = ?, precio = ?, stock = ?, puntuacion = ?, imagen_url = ?, id_categoria = ?, en_oferta = ?, descuento = ?
    WHERE id_producto = ?
  `;

  db.query(sql, [nombre, descripcion, precio, stock, puntuacion, imagen_url, id_categoria, en_oferta, descuento, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar producto' });
    res.json({ message: 'Producto actualizado' });
  });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
  db.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar producto' });
    res.json({ message: 'Producto eliminado' });
  });
});

app.get('/api/usuarios-rol/:rol', (req, res) => {
  const rol = req.params.rol;
  db.query('SELECT id_usuario, nombre_completo, correo, rol, direccion, telefono FROM usuarios WHERE rol = ?', [rol], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(results);
  });
});


// APIs para dashboard clientes - VERSIÓN CORREGIDA
// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// 📦 RUTAS PARA ÓRDENES DEL USUARIO

// Obtener todas las órdenes de un usuario específico con datos completos
app.get('/api/ordenes/usuario/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;
  
  // Verificar que el usuario solo pueda ver sus propias órdenes (o que sea admin)
  if (req.user.id_usuario != userId && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para ver estas órdenes' });
  }

  const sql = `
    SELECT 
      o.*,
      u.direccion as direccion_usuario,
      u.telefono as telefono_usuario,
      DATE_FORMAT(o.fecha_creacion, '%Y-%m-%d %H:%i:%s') as fecha_creacion,
      DATE_FORMAT(o.fecha_creacion, '%Y-%m-%d %H:%i:%s') as fecha_cracion,
      -- Calcular el total real de la orden basado en los detalles
      COALESCE(orden_total.total_calculado, o.total, 0) as total_real
    FROM ordenes o
    JOIN usuarios u ON o.id_usuario = u.id_usuario
    LEFT JOIN (
      SELECT 
        od.id_orden,
        SUM(od.cantidad * od.precio_unitario) as total_calculado
      FROM orden_detalle od
      GROUP BY od.id_orden
    ) orden_total ON o.id_orden = orden_total.id_orden
    WHERE o.id_usuario = ?
    ORDER BY o.fecha_creacion DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener órdenes del usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Procesar los resultados para usar la dirección correcta
    const processedResults = results.map(order => ({
      ...order,
      // Usar dirección de envío si existe, sino usar la del usuario
      direccion_envio: order.direccion_envio || order.direccion_usuario || 'No especificada',
      // Usar teléfono de contacto si existe, sino usar el del usuario
      telefono_contacto: order.telefono_contacto || order.telefono_usuario || 'No especificado',
      // Usar el total calculado
      total: order.total_real
    }));
    
    res.json(processedResults);
  });
});

// Obtener detalles de una orden específica con información completa
app.get('/api/ordenes/:orderId/detalles', verifyToken, (req, res) => {
  const orderId = req.params.orderId;

  // Primero verificar que la orden pertenezca al usuario (o que sea admin)
  const checkOwnershipSql = `
    SELECT id_usuario FROM ordenes WHERE id_orden = ?
  `;

  db.query(checkOwnershipSql, [orderId], (err, ownerResults) => {
    if (err) {
      console.error('Error verificando propiedad de orden:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (ownerResults.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (ownerResults[0].id_usuario != req.user.id_usuario && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para ver esta orden' });
    }

    // Obtener los detalles de la orden con información completa del producto
    const sql = `
      SELECT 
        od.*,
        p.nombre as nombre_producto,
        p.descripcion as descripcion_producto,
        p.precio as precio_producto_actual,
        -- Calcular subtotal basado en cantidad y precio unitario del detalle
        (od.cantidad * od.precio_unitario) as subtotal_calculado
      FROM orden_detalle od
      JOIN productos p ON od.id_producto = p.id_producto
      WHERE od.id_orden = ?
      ORDER BY od.id_detalle
    `;

    db.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error('Error al obtener detalles de orden:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      // Procesar los resultados para asegurar valores correctos
      const processedResults = results.map(detail => ({
        ...detail,
        subtotal: detail.subtotal_calculado || detail.subtotal || (detail.cantidad * detail.precio_unitario)
      }));
      
      res.json(processedResults);
    });
  });
});

// 💳 RUTAS PARA PAGOS DEL USUARIO

// Obtener todos los pagos de un usuario específico
app.get('/api/pagos/usuario/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;
  
  // Verificar que el usuario solo pueda ver sus propios pagos (o que sea admin)
  if (req.user.id_usuario != userId && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para ver estos pagos' });
  }

  const sql = `
    SELECT 
      p.*,
      o.id_usuario,
      o.total as total_orden,
      DATE_FORMAT(p.fecha_pago, '%Y-%m-%d %H:%i:%s') as fecha_pago
    FROM pagos p
    JOIN ordenes o ON p.id_orden = o.id_orden
    WHERE o.id_usuario = ?
    ORDER BY p.fecha_pago DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener pagos del usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// Obtener un pago específico
app.get('/api/pagos/:pagoId', verifyToken, (req, res) => {
  const pagoId = req.params.pagoId;

  const sql = `
    SELECT 
      p.*,
      o.id_usuario,
      o.total as total_orden,
      DATE_FORMAT(p.fecha_pago, '%Y-%m-%d %H:%i:%s') as fecha_pago
    FROM pagos p
    JOIN ordenes o ON p.id_orden = o.id_orden
    WHERE p.id_pago = ?
  `;

  db.query(sql, [pagoId], (err, results) => {
    if (err) {
      console.error('Error al obtener pago:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el pago pertenezca al usuario (o que sea admin)
    if (results[0].id_usuario != req.user.id_usuario && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para ver este pago' });
    }

    res.json(results[0]);
  });
});

// 📊 RUTA PARA ESTADÍSTICAS DEL USUARIO MEJORADA
app.get('/api/usuarios/:userId/estadisticas', verifyToken, (req, res) => {
  const userId = req.params.userId;
  
  // Verificar que el usuario solo pueda ver sus propias estadísticas (o que sea admin)
  if (req.user.id_usuario != userId && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado para ver estas estadísticas' });
  }

  const sql = `
    SELECT 
      COUNT(DISTINCT o.id_orden) as total_ordenes,
      COUNT(DISTINCT p.id_pago) as total_pagos,
      -- Calcular total gastado basado en los detalles de las órdenes
      COALESCE(SUM(DISTINCT orden_totales.total_real), 0) as total_gastado,
      COUNT(DISTINCT CASE WHEN o.estado = 'completado' THEN o.id_orden END) as ordenes_completadas,
      COUNT(DISTINCT CASE WHEN p.estado_pago = 'completado' THEN p.id_pago END) as pagos_completados,
      -- Estadísticas adicionales
      AVG(CASE WHEN orden_totales.total_real > 0 THEN orden_totales.total_real END) as promedio_por_orden,
      COUNT(DISTINCT CASE WHEN o.estado = 'pendiente' THEN o.id_orden END) as ordenes_pendientes
    FROM ordenes o
    LEFT JOIN pagos p ON o.id_orden = p.id_orden
    LEFT JOIN (
      SELECT 
        od.id_orden,
        SUM(od.cantidad * od.precio_unitario) as total_real
      FROM orden_detalle od
      GROUP BY od.id_orden
    ) orden_totales ON o.id_orden = orden_totales.id_orden
    WHERE o.id_usuario = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener estadísticas del usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Procesar el resultado para asegurar tipos correctos
    const stats = results[0];
    const processedStats = {
      ...stats,
      total_gastado: parseFloat(stats.total_gastado) || 0,
      promedio_por_orden: parseFloat(stats.promedio_por_orden) || 0,
      total_ordenes: parseInt(stats.total_ordenes) || 0,
      total_pagos: parseInt(stats.total_pagos) || 0,
      ordenes_completadas: parseInt(stats.ordenes_completadas) || 0,
      pagos_completados: parseInt(stats.pagos_completados) || 0,
      ordenes_pendientes: parseInt(stats.ordenes_pendientes) || 0
    };
    
    res.json(processedStats);
  });
});

// 🛍️ ENDPOINT ADICIONAL: Obtener resumen de productos más comprados por el usuario
app.get('/api/usuarios/:userId/productos-favoritos', verifyToken, (req, res) => {
  const userId = req.params.userId;
  
  // Verificar autorización
  if (req.user.id_usuario != userId && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT 
      p.id_producto,
      p.nombre,
      p.precio,
      SUM(od.cantidad) as total_comprado,
      COUNT(DISTINCT o.id_orden) as veces_comprado,
      SUM(od.cantidad * od.precio_unitario) as total_gastado_producto
    FROM orden_detalle od
    JOIN ordenes o ON od.id_orden = o.id_orden
    JOIN productos p ON od.id_producto = p.id_producto
    WHERE o.id_usuario = ?
    GROUP BY p.id_producto, p.nombre, p.precio
    ORDER BY total_comprado DESC, total_gastado_producto DESC
    LIMIT 10
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener productos favoritos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});






// Levantar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

