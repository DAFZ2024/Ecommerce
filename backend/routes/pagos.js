const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todos los pagos con información de la orden
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_pago,
        p.id_orden,
        p.metodo_pago,
        p.numero_tarjeta,
        p.fecha_pago,
        p.estado,
        o.total as orden_total,
        u.nombre_completo as usuario_nombre
      FROM pagos p
      LEFT JOIN ordenes o ON p.id_orden = o.id_orden
      LEFT JOIN usuarios u ON o.id_usuario = u.id_usuario
      ORDER BY p.fecha_pago DESC
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un pago
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM pagos WHERE id_pago = ?';
    await db.execute(query, [id]);
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;