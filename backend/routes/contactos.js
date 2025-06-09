const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Ajusta la ruta según tu estructura

// GET - Obtener todos los contactos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id_contacto, nombre, correo, mensaje, fecha 
      FROM contactos 
      ORDER BY fecha DESC
    `;
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar un contacto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM contactos WHERE id_contacto = ?';
    await db.execute(query, [id]);
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;