const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "../../historial/historialProvedores.json");

function leerJSON() {
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, "[]", "utf8");
  }
  const data = fs.readFileSync(jsonPath, "utf8");
  return JSON.parse(data);
}

function guardarJSON(data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
}

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
  
    // 🕒 Generar la fecha y hora formateadas (hora local)
    const fecha = new Date();
    const fechaLocal = fecha.toLocaleDateString("es-AR"); // ej: 11/04/2025
    const horaLocal = fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }); // ej: 14:35
  
    // 📝 Crear el string con los datos
    const nuevoEnvio = `${fechaLocal} ${horaLocal} - Enviado ${cantidad} ${pieza}`;
  
    // 📥 Guardar al inicio del array
    proveedorData.pedidos.envios.unshift(nuevoEnvio);
  
    guardarJSON(historial);
  
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
  
    // 🕒 Formatear fecha y hora
    const fecha = new Date();
    const fechaLocal = fecha.toLocaleDateString("es-AR");
    const horaLocal = fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
    // 📝 Crear string de entrega
    const nuevaEntrega = `${fechaLocal} ${horaLocal} - Recibido ${cantidad} ${pieza}`;
  
    // 📥 Guardar al principio del array
    proveedorData.pedidos.entregas.unshift(nuevaEntrega);
  
    guardarJSON(historial);
  
    res.json({ success: true, mensaje: `Entrega registrada en ${provedor}`, entrega: nuevaEntrega });
  });
  

module.exports = router;