// routes/payu.js
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// ✅ Middleware mejorado para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
      req.user = decoded;
      console.log('🔑 Token verificado para usuario:', decoded.userId || decoded.id);
    } catch (error) {
      console.warn('⚠️ Token inválido:', error.message);
      // No bloquear la request, solo advertir
    }
  }
  next();
};

router.post('/payment', verifyToken, async (req, res) => {
  console.log('📥 Iniciando proceso de pago...');
  console.log('📥 Headers:', req.headers);
  console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
  
  let connection;
  
  try {
    const ngrokUrl = process.env.NGROK_URL || ' https://5504-131-72-138-48.ngrok-free.app';

    const { cartItems, id_usuario, usuario_info } = req.body;

    // ✅ Validaciones mejoradas
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('❌ Carrito vacío o inválido');
      return res.status(400).json({ 
        error: "Carrito vacío",
        received: { cartItems, type: typeof cartItems }
      });
    }

    if (!id_usuario || isNaN(parseInt(id_usuario))) {
      console.error('❌ ID de usuario inválido:', id_usuario);
      return res.status(400).json({ 
        error: "ID de usuario inválido",
        received: id_usuario
      });
    }

    const userId = parseInt(id_usuario);

    // ✅ Verificar que el usuario del token coincida (si hay token)
    if (req.user && req.user.userId && req.user.userId !== userId) {
      console.error('❌ Usuario del token no coincide con el enviado');
      return res.status(403).json({ error: "Usuario no autorizado" });
    }

    // ✅ Validar estructura de cartItems
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.id_producto || !item.precio || !item.quantity || 
          isNaN(parseInt(item.id_producto)) || isNaN(parseFloat(item.precio)) || isNaN(parseInt(item.quantity))) {
        console.error('❌ Item del carrito inválido:', item);
        return res.status(400).json({ 
          error: `Item ${i + 1} del carrito es inválido`,
          details: `Faltan o son inválidos: id_producto, precio o quantity`,
          item: item
        });
      }
    }

    // ✅ Calcular totales de forma segura
    const subtotal = cartItems.reduce((sum, item) => {
      const precio = parseFloat(item.precio);
      const cantidad = parseInt(item.quantity);
      return sum + (precio * cantidad);
    }, 0);
    
    const shipping = 5.99;
    const total = parseFloat((subtotal + shipping).toFixed(2));

    console.log('💳 Procesando pago para usuario:', {
      id_usuario: userId,
      email: usuario_info?.email,
      nombre: usuario_info?.nombre,
      total: total,
      items: cartItems.length,
      subtotal: subtotal.toFixed(2),
      shipping: shipping
    });

    // ✅ Verificar credenciales de PayU ANTES de continuar
    const merchantId = process.env.PAYU_MERCHANT_ID;
    const accountId = process.env.PAYU_ACCOUNT_ID;
    const apiKey = process.env.PAYU_API_KEY;
    
    if (!merchantId || !accountId || !apiKey) {
      console.error('❌ Faltan credenciales de PayU:', {
        merchantId: !!merchantId,
        accountId: !!accountId,
        apiKey: !!apiKey
      });
      return res.status(500).json({ 
        error: "Configuración de PayU incompleta",
        details: process.env.NODE_ENV === 'development' ? 'Faltan variables de entorno PAYU_*' : undefined
      });
    }

    // ✅ Verificar conexión a base de datos
    try {
      connection = await db.getConnection();  // Así funciona con mysql2/promise
      console.log('✅ Conexión a BD establecida');
    } catch (dbConnectionError) {
      console.error('❌ Error conectando a BD:', dbConnectionError);
      return res.status(500).json({ 
        error: "Error de conexión a base de datos",
        details: process.env.NODE_ENV === 'development' ? dbConnectionError.message : undefined
      });
    }

    await connection.beginTransaction();
    console.log('🔄 Transacción iniciada');

    try {
      // ✅ Verificar que el usuario existe antes de continuar
      const [userCheck] = await connection.query(
        "SELECT id_usuario, correo, nombre_completo FROM usuarios WHERE id_usuario = ?", 
        [userId]
      );

      if (userCheck.length === 0) {
        console.error('❌ Usuario no encontrado en BD:', userId);
        await connection.rollback();
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const userData = userCheck[0];
      console.log('✅ Usuario verificado en BD:', {
        id: userData.id_usuario,
        email: userData.correo,
        nombre: userData.nombre_completo
      });

      // ✅ Verificar que todos los productos existen Y tienen suficiente stock
      const productIds = cartItems.map(item => parseInt(item.id_producto));
      const placeholders = cartItems.map(() => '?').join(',');
      const [productCheck] = await connection.query(
        `SELECT id_producto, stock FROM productos WHERE id_producto IN (${placeholders})`, 
        productIds
      );

      console.log('Productos buscados:', productIds);
      console.log('Productos encontrados:', productCheck.map(p => ({ id: p.id_producto, stock: p.stock })));

      if (productCheck.length !== cartItems.length) {
        const foundIds = productCheck.map(p => p.id_producto);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        
        console.error('❌ Productos no encontrados:', missingIds);
        await connection.rollback();
        return res.status(400).json({ 
          error: "Algunos productos no existen",
          missingProducts: missingIds,
          existingProducts: foundIds
        });
      }

      // ✅ Verificar stock suficiente para cada producto
      const stockInsuficiente = [];
      for (const item of cartItems) {
        const producto = productCheck.find(p => p.id_producto === parseInt(item.id_producto));
        if (producto && producto.stock < parseInt(item.quantity)) {
          stockInsuficiente.push({
            id_producto: item.id_producto,
            nombre: item.nombre,
            stockDisponible: producto.stock,
            cantidadSolicitada: parseInt(item.quantity)
          });
        }
      }

      if (stockInsuficiente.length > 0) {
        console.error('❌ Stock insuficiente:', stockInsuficiente);
        await connection.rollback();
        return res.status(400).json({ 
          error: "Stock insuficiente para algunos productos",
          productosConStockInsuficiente: stockInsuficiente
        });
      }

      // ✅ Insertar carrito con información adicional
      console.log('🛒 Insertando carrito...');
      const [carritoResult] = await connection.query(
        "INSERT INTO carrito (id_usuario, fecha_creacion) VALUES (?, NOW())", 
        [userId]
      );
      const id_carrito = carritoResult.insertId;
      console.log('✅ Carrito creado con ID:', id_carrito);

      // ✅ Insertar detalles del carrito Y descontar stock
      console.log('📦 Insertando detalles del carrito y descontando stock...');
      for (const item of cartItems) {
        const cantidad = parseInt(item.quantity);
        const idProducto = parseInt(item.id_producto);
        const precio = parseFloat(item.precio);

        // Insertar detalle del carrito
        await connection.query(
          "INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
          [id_carrito, idProducto, cantidad, precio]
        );

        // 🆕 DESCONTAR STOCK del producto
        const [updateResult] = await connection.query(
          "UPDATE productos SET stock = stock - ? WHERE id_producto = ?",
          [cantidad, idProducto]
        );

        if (updateResult.affectedRows === 0) {
          console.error('❌ No se pudo actualizar el stock del producto:', idProducto);
          await connection.rollback();
          return res.status(500).json({ 
            error: `Error al actualizar stock del producto ${idProducto}` 
          });
        }

        console.log(`✅ Stock descontado para producto ${idProducto}: -${cantidad} unidades`);
      }
      console.log('✅ Detalles del carrito insertados y stock actualizado');

      // ✅ Insertar orden con más información del usuario
      console.log('📋 Insertando orden...');
      const [ordenResult] = await connection.query(
        `INSERT INTO ordenes (id_usuario, total, estado, fecha_creacion, email_usuario, nombre_usuario) 
         VALUES (?, ?, 'pendiente', NOW(), ?, ?)`,
        [userId, total, userData.correo, userData.nombre_completo]
      );
      const id_orden = ordenResult.insertId;
      console.log('✅ Orden creada con ID:', id_orden);

      // ✅ Insertar detalles de la orden
      console.log('📦 Insertando detalles de la orden...');
      for (const item of cartItems) {
        await connection.query(
          "INSERT INTO orden_detalle (id_orden, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
          [id_orden, parseInt(item.id_producto), parseInt(item.quantity), parseFloat(item.precio)]
        );
      }
      console.log('✅ Detalles de la orden insertados');

      // ✅ Generar datos de PayU
      const referenceCode = `ORD-${id_orden}-${Date.now()}`;
      const currency = "COP";
      const signatureRaw = `${apiKey}~${merchantId}~${referenceCode}~${total}~${currency}`;
      const signature = crypto.createHash('md5').update(signatureRaw).digest("hex");

      console.log('✅ Datos PayU generados:', {
        merchantId,
        accountId,
        referenceCode,
        total,
        usuario: userData.correo,
        signature: signature.substring(0, 10) + '...'
      });

      // ✅ Confirmar transacción ANTES de generar el formulario
      await connection.commit();
      console.log('✅ Transacción de base de datos confirmada (stock descontado)');

      // ✅ Formulario PayU con datos del usuario real
      const formHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirigiendo a PayU...</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
              .spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .btn { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
            </style>
          </head>
          <body onload="document.forms[0].submit()">
            <div>
              <h2>🔄 Redirigiendo al portal de pagos...</h2>
              <p>Hola <strong>${userData.nombre_completo}</strong>, por favor espera mientras te redirigimos a PayU</p>
              <p>💰 Total a pagar: <strong>$${total} COP</strong></p>
              <p>📧 Email: ${userData.correo}</p>
              <p>🛒 Orden: ${referenceCode}</p>
              <div class="spinner"></div>
              <p><small>Si no eres redirigido automáticamente, haz clic en "Continuar"</small></p>
              <button type="submit" class="btn" onclick="document.forms[0].submit()">Continuar a PayU</button>
            </div>
            <form method="post" action="https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/">
              <input name="merchantId" type="hidden" value="${merchantId}" />
              <input name="accountId" type="hidden" value="${accountId}" />
              <input name="description" type="hidden" value="Compra en AutoPartesBogota - Usuario: ${userData.nombre_completo}" />
              <input name="referenceCode" type="hidden" value="${referenceCode}" />
              <input name="amount" type="hidden" value="${total}" />
              <input name="tax" type="hidden" value="0" />
              <input name="taxReturnBase" type="hidden" value="0" />
              <input name="currency" type="hidden" value="${currency}" />
              <input name="signature" type="hidden" value="${signature}" />
              <input name="test" type="hidden" value="1" />
              <input name="buyerEmail" type="hidden" value="${userData.correo}" />
              <input name="buyerFullName" type="hidden" value="${userData.nombre_completo}" />
              <input name="responseUrl" type="hidden" value="http://localhost:3001/api/payu/respuesta" />
              <input name="confirmationUrl" type="hidden" value="${ngrokUrl}/api/payu/confirmacion" />
              <input name="extra1" type="hidden" value="${userId}" />
              <input name="extra2" type="hidden" value="${id_orden}" />
            </form>
          </body>
        </html>
      `;

      console.log('✅ Formulario PayU generado exitosamente');
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(formHTML);

    } catch (dbError) {
      console.error("❌ Error en transacción de base de datos:", dbError);
      await connection.rollback();
      
      return res.status(500).json({ 
        error: "Error al procesar el pago en base de datos",
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      });
    }

  } catch (error) {
    console.error("❌ Error general en proceso de pago:", error);
    
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("❌ Error en rollback:", rollbackError);
      }
    }
    
    res.status(500).json({ 
      error: "Error interno del servidor",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      connection.release();
      console.log('🔄 Conexión a BD liberada');
    }
  }
});

// POST para confirmar pago desde PayU (webhook)
router.post('/confirmacion', express.urlencoded({ extended: false }), async (req, res) => {
    console.log("🔔 Webhook de confirmación recibido");
  
  // 1. Extraer parámetros
  const merchant_id = req.body.merchant_id;
  const reference_sale = req.body.reference_sale;
  const value = req.body.value; // Mantener como string
  const currency = req.body.currency;
  const sign = req.body.sign;
  const state_pol = req.body.state_pol;
  const transaction_id = req.body.transaction_id;
  const extra1 = req.body.extra1;
  const processing_date = req.body.processing_date; 
  const extra2 = req.body.extra2;

  console.log("🔔 ID Orden:", extra2);
  console.log("🔔 Estado:", state_pol);
  
  // 2. Generar firma CORRECTA (incluye state_pol)
  const signatureString = `${process.env.PAYU_API_KEY}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`;
  const expectedSignature = crypto.createHash('md5')
    .update(signatureString)
    .digest('hex');

  console.log(`🔐 Cadena: ${signatureString}`);
  console.log(`🔐 Firma esperada: ${expectedSignature}`);
  console.log(`🔐 Firma recibida: ${sign}`);
  
  // 3. Verificar firma
  if (expectedSignature !== sign) {
    console.error('❌ Firma no válida', {
      expected: expectedSignature,
      received: sign,
      signatureString: signatureString
    });
    return res.status(403).send('Firma no válida');
  }
  
  console.log(`🔍 Procesando orden: ${reference_sale}, Estado: ${state_pol}, ID Orden: ${extra2}`);

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 3. Mapear estados correctamente
    const estadoOrden = state_pol === '4' ? 'pagado' : 
                       (state_pol === '6' ? 'cancelado' : 
                       (state_pol === '104' ? 'error' : 'pendiente'));
    
    const estadoPago = state_pol === '4' ? 'completado' : 
                      (state_pol === '6' ? 'cancelado' : 
                      (state_pol === '104' ? 'fallido' : 'pendiente'));

    // 4. Actualizar orden
    await connection.query(
      "UPDATE ordenes SET estado = ?, fecha_actualizacion = NOW() WHERE id_orden = ?",
      [estadoOrden, extra2]
    );

    // 5. Insertar en PAGOS con TODOS los campos
    const insertQuery = `
      INSERT INTO pagos (
        id_orden, 
        id_usuario, 
        metodo_pago, 
        estado, 
        transaction_id, 
        monto,
        moneda,
        firma,
        numero_tarjeta,
        processing_date
      ) VALUES (?, ?, 'tarjeta', ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      extra2, 
      extra1, 
      estadoPago, 
      transaction_id, 
      value,
      currency,
      sign,
      '**** **** **** ' + (transaction_id ? transaction_id.slice(-4) : '0000'),
      processing_date ? new Date(processing_date) : null
    ];

    console.log("📝 Insertando en pagos:", insertQuery, insertParams);
    
    await connection.query(insertQuery, insertParams);

    await connection.commit();
    console.log(`✅ Confirmación procesada exitosamente para orden ${extra2}`);
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error en confirmación PayU:', error);
    if (connection) await connection.rollback();
    res.status(500).send('Error interno: ' + error.message);
  } finally {
    if (connection) connection.release();
  }
});

router.get('/ordenes/:ordenId/pago', async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM pagos WHERE id_orden = ?", 
      [req.params.ordenId]
    );
    res.json(results[0] || { error: "Pago no encontrado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/respuesta', async (req, res) => {
  console.log("📄 Respuesta PayU (GET):", req.query);
  
  const { transactionState, referenceCode, TX_VALUE, transactionId, processingDate } = req.query;
  
  // Validar parámetros esenciales
  if (!referenceCode) {
    return res.redirect(`http://localhost:5173/Gracias?estado=error`);
  }

  // Extraer ID de orden de la referencia (ORD-32-1749573168736)
  const ordenId = referenceCode.split('-')[1];
  
  // Redirigir con parámetros necesarios
  res.redirect(`http://localhost:5173/Gracias?estado=${transactionState}&orden=${ordenId}`);
});

// Obtener información de pago por ID de orden
router.get('/api/ordenes/:ordenId/pago', async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM pagos WHERE id_orden = ?", 
      [req.params.ordenId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener detalles de una orden con productos
router.get('/api/ordenes/:ordenId', async (req, res) => {
  try {
    const ordenId = req.params.ordenId;
    
    // Obtener información básica de la orden
    const [orden] = await db.query(
      "SELECT * FROM ordenes WHERE id_orden = ?", 
      [ordenId]
    );
    
    if (orden.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    
    // Obtener detalles de productos de la orden
    const [detalles] = await db.query(
      `SELECT 
        p.id_producto,
        p.nombre,
        p.imagen_url,
        od.cantidad,
        od.precio_unitario,
        p.moneda
      FROM orden_detalle od
      JOIN productos p ON od.id_producto = p.id_producto
      WHERE od.id_orden = ?`,
      [ordenId]
    );
    
    res.json({
      ...orden[0],
      productos: detalles
    });
    
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de pedidos
router.get('/api/ordenes/historial', async (req, res) => {
  try {
    // Esto es un ejemplo, ajusta según tu estructura de DB
    const [results] = await db.query(`
      SELECT 
        id_orden, 
        total, 
        estado, 
        fecha_creacion,
        moneda
      FROM ordenes
      ORDER BY fecha_creacion DESC
      LIMIT 10
    `);
    
    res.json(results);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;