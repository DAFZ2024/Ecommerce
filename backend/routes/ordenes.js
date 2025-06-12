const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todas las órdenes con información del usuario
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id_orden,
        o.id_usuario,
        o.fecha,
        o.total,
        o.estado,
        u.nombre_completo as usuario_nombre
      FROM ordenes o
      LEFT JOIN usuarios u ON o.id_usuario = u.id_usuario
      ORDER BY o.fecha DESC
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener todos los detalles de órdenes
router.get('/detalles', async (req, res) => {
  try {
    const query = `
      SELECT 
        od.id_detalle,
        od.id_orden,
        od.id_producto,
        od.cantidad,
        od.precio_unitario,
        p.nombre as producto_nombre
      FROM orden_detalle od
      LEFT JOIN productos p ON od.id_producto = p.id_producto
      ORDER BY od.id_orden, od.id_detalle
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener detalles de órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Cambiar estado de una orden
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    // Validar estado
    const estadosValidos = ['pendiente', 'pagado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const query = 'UPDATE ordenes SET estado = ? WHERE id_orden = ?';
    await db.execute(query, [estado, id]);
    
    res.json({ message: 'Estado de orden actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar una orden y sus detalles
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero eliminar los detalles de la orden
    await db.execute('DELETE FROM orden_detalle WHERE id_orden = ?', [id]);
    
    // Eliminar pagos asociados
    await db.execute('DELETE FROM pagos WHERE id_orden = ?', [id]);
    
    // Luego eliminar la orden
    await db.execute('DELETE FROM ordenes WHERE id_orden = ?', [id]);
    
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
//Obtener pago por ID de orden
router.get('/:id/pago', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Ejemplo con MySQL
    const [results] = await db.query(
      'SELECT * FROM pagos WHERE id_orden = ?', 
      [orderId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});



// Obtener historial de pedidos
router.get('/historial', async (req, res) => {
  try {
    // Obtener ID de usuario (debes implementar autenticación)
    const userId = 1; // Temporal, cambiar por usuario real

    const [orders] = await db.query(
      `SELECT 
        id_orden, 
        estado, 
        fecha_creacion, 
        total,
        COALESCE(moneda, 'COP') AS moneda
      FROM ordenes 
      WHERE id_usuario = ? 
      ORDER BY fecha_creacion DESC`,
      [userId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Error en /historial', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// Agregar este endpoint
router.get('/:id', async (req, res) => {
   try {
    const orderId = req.params.id;
    console.log(`Solicitando orden ID: ${orderId}`);

    // 1. Obtener información básica de la orden
    const [order] = await db.query(
      'SELECT * FROM ordenes WHERE id_orden = ?', 
      [orderId]
    );
    
    console.log(`Resultado orden:`, order);

    if (!order || order.length === 0) {
      console.log(`Orden ${orderId} no encontrada`);
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // 2. Obtener productos de la orden
    const [products] = await db.query(
      `SELECT p.nombre, do.cantidad, do.precio_unitario 
  FROM detalle_orden do
  JOIN productos p ON do.id_producto = p.id_producto
  WHERE do.id_orden = ?`,
      [orderId]
    );
    
    // 3. Obtener información del usuario
    const [user] = await db.query(
      'SELECT nombre, email FROM usuarios WHERE id_usuario = ?',
      [order[0].id_usuario]
    );
    
    // Construir respuesta
    const response = {
      id_orden: order[0].id_orden,
      total: order[0].total,
      fecha_creacion: order[0].fecha_creacion,
      nombre_usuario: user[0]?.nombre || '',
      email_usuario: user[0]?.email || '',
      productos: products
    };
    
    res.json(response);
 } catch (error) {
    console.error('Error en GET /:id', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});




module.exports = router;
