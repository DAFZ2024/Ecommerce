const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todos los carritos con información del usuario
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id_carrito, 
        c.id_usuario, 
        c.fecha_creado,
        u.nombre_completo as usuario_nombre
      FROM carrito c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.fecha_creado DESC
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener carritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener todos los detalles de carritos
router.get('/detalles', async (req, res) => {
  try {
    const query = `
      SELECT 
        cd.id_detalle,
        cd.id_carrito,
        cd.id_producto,
        cd.cantidad,
        cd.precio_unitario,
        p.nombre as producto_nombre
      FROM carrito_detalle cd
      LEFT JOIN productos p ON cd.id_producto = p.id_producto
      ORDER BY cd.id_carrito, cd.id_detalle
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener detalles de carritos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un carrito y sus detalles
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero eliminar los detalles del carrito
    await db.execute('DELETE FROM carrito_detalle WHERE id_carrito = ?', [id]);
    
    // Luego eliminar el carrito
    await db.execute('DELETE FROM carrito WHERE id_carrito = ?', [id]);
    
    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;