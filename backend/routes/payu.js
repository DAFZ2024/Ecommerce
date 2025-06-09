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

      // ✅ Verificar que todos los productos existen
      const productIds = cartItems.map(item => parseInt(item.id_producto));
const placeholders = cartItems.map(() => '?').join(',');
const [productCheck] = await connection.query(
  `SELECT id_producto FROM productos WHERE id_producto IN (${placeholders})`, 
  productIds
);

console.log('Productos buscados:', productIds);
console.log('Productos encontrados:', productCheck.map(p => p.id_producto));

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

      // ✅ Insertar carrito con información adicional
      console.log('🛒 Insertando carrito...');
      const [carritoResult] = await connection.query(
        "INSERT INTO carrito (id_usuario, fecha_creacion) VALUES (?, NOW())", 
        [userId]
      );
      const id_carrito = carritoResult.insertId;
      console.log('✅ Carrito creado con ID:', id_carrito);

      // ✅ Insertar detalles del carrito
      console.log('📦 Insertando detalles del carrito...');
      for (const item of cartItems) {
        await connection.query(
          "INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
          [id_carrito, parseInt(item.id_producto), parseInt(item.quantity), parseFloat(item.precio)]
        );
      }
      console.log('✅ Detalles del carrito insertados');

      // ✅ Insertar orden con más información del usuario
      console.log('📋 Insertando orden...');
      const [ordenResult] = await connection.query(
        `INSERT INTO ordenes (id_usuario, total, estado, fecha_creacion, email_usuario, nombre_usuario) 
         VALUES (?, ?, 'pendiente', NOW(), ?, ?)`,
        [userId, total, userData.email, userData.nombre]
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
        usuario: userData.email,
        signature: signature.substring(0, 10) + '...'
      });

      // ✅ Confirmar transacción ANTES de generar el formulario
      await connection.commit();
      console.log('✅ Transacción de base de datos confirmada');

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
              <p>Hola <strong>${userData.nombre}</strong>, por favor espera mientras te redirigimos a PayU</p>
              <p>💰 Total a pagar: <strong>$${total} COP</strong></p>
              <p>📧 Email: ${userData.email}</p>
              <p>🛒 Orden: ${referenceCode}</p>
              <div class="spinner"></div>
              <p><small>Si no eres redirigido automáticamente, haz clic en "Continuar"</small></p>
              <button type="submit" class="btn" onclick="document.forms[0].submit()">Continuar a PayU</button>
            </div>
            <form method="post" action="https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/">
              <input name="merchantId" type="hidden" value="${merchantId}" />
              <input name="accountId" type="hidden" value="${accountId}" />
              <input name="description" type="hidden" value="Compra en AutoPartesBogota - Usuario: ${userData.nombre}" />
              <input name="referenceCode" type="hidden" value="${referenceCode}" />
              <input name="amount" type="hidden" value="${total}" />
              <input name="tax" type="hidden" value="0" />
              <input name="taxReturnBase" type="hidden" value="0" />
              <input name="currency" type="hidden" value="${currency}" />
              <input name="signature" type="hidden" value="${signature}" />
              <input name="test" type="hidden" value="1" />
              <input name="buyerEmail" type="hidden" value="${userData.email}" />
              <input name="buyerFullName" type="hidden" value="${userData.nombre}" />
              <input name="responseUrl" type="hidden" value="http://localhost:5173/Gracias" />
              <input name="confirmationUrl" type="hidden" value="http://localhost:3001/api/payu/confirmacion" />
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
  console.log("📥 Confirmación PayU recibida");
  console.log("📥 Body completo:", req.body);
  
  // Verifica la firma de PayU para seguridad
  const expectedSignature = crypto.createHash('md5')
    .update(`${process.env.PAYU_API_KEY}~${req.body.merchant_id}~${req.body.reference_sale}~${req.body.value}~${req.body.currency}`)
    .digest('hex');

  console.log(`🔐 Firma esperada: ${expectedSignature}`);
  console.log(`🔐 Firma recibida: ${req.body.sign}`);
  
  if (expectedSignature !== req.body.sign) {
    console.error('❌ Firma no válida', {
      expected: expectedSignature,
      received: req.body.sign,
      components: {
        apiKey: process.env.PAYU_API_KEY ? 'present' : 'missing',
        merchantId: req.body.merchant_id,
        reference: req.body.reference_sale,
        value: req.body.value,
        currency: req.body.currency
      }
    });
    return res.status(403).send('Firma no válida');
  }
  
  const {
    reference_sale,
    state_pol,
    value,
    transaction_id,
    extra1, // id_usuario
    extra2  // id_orden
  } = req.body;

  console.log(`🔍 Procesando orden: ${reference_sale}, Estado: ${state_pol}, ID Orden: ${extra2}`);

  let connection;

  try {
    connection = await db.getConnection(); // Cambiado para ser consistente
    await connection.beginTransaction();

    // Primero actualizar la orden
    const estadoOrden = state_pol === '4' ? 'pagado' : 
                       (state_pol === '6' ? 'cancelado' : 
                       (state_pol === '104' ? 'error' : 'pendiente'));
    
    const estadoPago = state_pol === '4' ? 'completado' : 
                      (state_pol === '6' ? 'cancelado' : 
                      (state_pol === '104' ? 'fallido' : 'pendiente'));

    // Actualizar orden
    const [updateResult] = await connection.query(
      "UPDATE ordenes SET estado = ?, fecha_actualizacion = NOW() WHERE id_orden = ?",
      [estadoOrden, extra2]
    );

    console.log(`🔄 Orden ${extra2} actualizada:`, updateResult.affectedRows, 'filas afectadas');

    if (updateResult.affectedRows === 0) {
      throw new Error(`No se encontró la orden ${extra2} para actualizar`);
    }

    // Insertar o actualizar pago
    const [existingPayment] = await connection.query(
      "SELECT id_pago FROM pagos WHERE id_orden = ?",
      [extra2]
    );

    if (existingPayment.length > 0) {
      // Actualizar pago existente
      await connection.query(
        `UPDATE pagos SET 
          estado = ?, 
          transaction_id = ?, 
          monto = ?, 
          fecha_actualizacion = NOW() 
         WHERE id_orden = ?`,
        [estadoPago, transaction_id, value, extra2]
      );
      console.log(`💳 Pago actualizado para orden ${extra2}`);
    } else {
      // Insertar nuevo pago
      await connection.query(
  `INSERT INTO pagos (
    id_orden, 
    id_usuario, 
    metodo_pago, 
    estado, 
    transaction_id, 
    monto,
    numero_tarjeta,  // Añade este campo
    fecha_pago
  ) VALUES (?, ?, 'tarjeta', ?, ?, ?, ?, NOW())`,
  [extra2, extra1, estadoPago, transaction_id, value, '****'+transaction_id.slice(-4)] // Enmascarar número
);
      console.log(`💳 Nuevo pago registrado para orden ${extra2}`);
    }

    await connection.commit();
    console.log(`✅ Confirmación procesada exitosamente para orden ${extra2}`);
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error en confirmación PayU:', error);
    if (connection) await connection.rollback();
    res.status(500).send('Error interno');
  } finally {
    if (connection) connection.release();
  }
});

router.get('/respuesta', async (req, res) => {
  console.log("📄 Respuesta PayU (GET):", req.query);
  
  const { transactionState, referenceCode, TX_VALUE, transactionId, processingDate } = req.query;
  
  // Validar parámetros esenciales
  if (!referenceCode) {
    console.error('❌ Falta referenceCode en la respuesta');
    return res.redirect(`http://localhost:5173/Gracias?estado=error&mensaje=Falta información de la transacción`);
  }

  // Determinar estado y mensaje
  let estado, mensaje;
  
  switch(transactionState) {
    case '4':
      estado = 'success';
      mensaje = '¡Pago exitoso! Gracias por tu compra.';
      break;
    case '6':
      estado = 'cancelled';
      mensaje = 'El pago fue cancelado.';
      break;
    case '7':
      estado = 'pending';
      mensaje = 'El pago está pendiente de aprobación.';
      break;
    case '104':
      estado = 'error';
      mensaje = 'Ocurrió un error al procesar el pago.';
      break;
    default:
      estado = 'unknown';
      mensaje = 'Estado de transacción desconocido.';
  }

  // Construir URL de redirección con todos los datos relevantes
  const params = new URLSearchParams();
  params.append('estado', estado);
  params.append('mensaje', mensaje);
  params.append('orden', referenceCode);
  params.append('monto', TX_VALUE || '0');
  params.append('fecha', processingDate || new Date().toISOString());
  if (transactionId) params.append('transaccion', transactionId);
  
  const redirectUrl = `http://localhost:5173/Gracias?${params.toString()}`;
  console.log(`🔄 Redirigiendo a: ${redirectUrl}`);
  
  res.redirect(redirectUrl);
});

module.exports = router;