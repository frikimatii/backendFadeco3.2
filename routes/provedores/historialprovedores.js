const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Rutas a los archivos
const jsonPath = path.join(__dirname, "../../historial/historialProvedores.json");
const txtPath = path.join(__dirname, "../../historial/historialProvedores.txt");

// Inicializar archivo TXT
function inicializarTXT() {
  if (!fs.existsSync(txtPath)) {
    fs.writeFileSync(txtPath, "Historial completo de proveedores:\n\n", "utf8");
  }
}

// Función para agregar registro al TXT
function agregarAlTXT(registro) {
  inicializarTXT();
  const fechaCompleta = new Date().toLocaleString("es-AR");
  const linea = `[${fechaCompleta}] ${registro}\n`;
  
  // Agregar al inicio del archivo
  const contenidoActual = fs.readFileSync(txtPath, "utf8");
  fs.writeFileSync(txtPath, linea + contenidoActual, "utf8");
}

// Leer JSON (igual que antes)
function leerJSON() {
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, "[]", "utf8");
  }
  const data = fs.readFileSync(jsonPath, "utf8");
  return JSON.parse(data);
}

// Guardar JSON (igual que antes)
function guardarJSON(data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
}



// Ruta para descargar el archivo TXT
router.get('/descargar/historial/provedores', (req, res) => {
  try {
    // Verifica si el archivo existe
    if (!fs.existsSync(txtPath)) {
      inicializarTXT(); // Crea el archivo si no existe
    }

    // Configura los headers para forzar la descarga
    res.setHeader('Content-Disposition', 'attachment; filename=historialProvedores.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Crea un stream de lectura y lo envía como respuesta
    const fileStream = fs.createReadStream(txtPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al descargar el historial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al descargar el archivo de historial' 
    });
  }
});

// Ruta para guardar ENVIOS
router.put("/envios/:provedor", (req, res) => {
  const { provedor } = req.params;
  const { cantidad, pieza } = req.body;

  if (!cantidad || !pieza) {
    return res.status(400).json({ success: false, message: "Datos incompletos" });
  }

  let historial = leerJSON();
  let proveedorData = historial.find(p => p.provedor.toLowerCase() === provedor.toLowerCase());

  if (!proveedorData) {
    return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
  }

  const fecha = new Date();
  const fechaLocal = fecha.toLocaleDateString("es-AR");
  const horaLocal = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const nuevoEnvio = `${fechaLocal} ${horaLocal} - Enviado ${cantidad} ${pieza}`;

  proveedorData.pedidos.envios.unshift(nuevoEnvio);
  guardarJSON(historial);
  
  // Registrar en TXT
  agregarAlTXT(`Proveedor: ${provedor} - ${nuevoEnvio}`);

  res.json({ success: true, mensaje: `Envío registrado en ${provedor}`, envio: nuevoEnvio });
});

// Ruta para guardar ENTREGAS
router.put("/entregas/:provedor", (req, res) => {
  const { provedor } = req.params;
  const { cantidad, pieza } = req.body;

  if (!cantidad || !pieza) {
    return res.status(400).json({ success: false, message: "Datos incompletos" });
  }

  let historial = leerJSON();
  let proveedorData = historial.find(p => p.provedor.toLowerCase() === provedor.toLowerCase());

  if (!proveedorData) {
    return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
  }

  const fecha = new Date();
  const fechaLocal = fecha.toLocaleDateString("es-AR");
  const horaLocal = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const nuevaEntrega = `${fechaLocal} ${horaLocal} - Recibido ${cantidad} ${pieza}`;

  proveedorData.pedidos.entregas.unshift(nuevaEntrega);
  guardarJSON(historial);
  
  // Registrar en TXT
  agregarAlTXT(`Proveedor: ${provedor} - ${nuevaEntrega}`);

  res.json({ success: true, mensaje: `Entrega registrada en ${provedor}`, entrega: nuevaEntrega });
});

module.exports = router;