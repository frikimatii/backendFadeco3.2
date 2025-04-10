const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const jsonPath = path.join(__dirname, '../historial/stock.json');

// Crear el JSON si no existe
function inicializarJSON() {
  if (!fs.existsSync(jsonPath)) {
    const estructuraInicial = [
      {
        tipo: "aluminio",
        acciones: []
      },
      {
        tipo: "Chapa",
        acciones: []
      }
    ];
    fs.writeFileSync(jsonPath, JSON.stringify(estructuraInicial, null, 2), 'utf8');
  }
}

// Leer el JSON
function leerJSON() {
  inicializarJSON();
  const data = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(data);
}

// Guardar el JSON
function guardarJSON(data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
}

// POST /api/historiales
router.post('/', (req, res) => {
    const { pieza, cantidad } = req.body;
    const mensaje = `${cantidad}  ${pieza} .`;
  
    let stock = leerJSON();
  
    let material = stock.find(m => m.tipo.toLowerCase() === pieza.toLowerCase());
  
  
    // Agregamos el mensaje al historial
    material.acciones.unshift(mensaje);
  
    // 🔴 Ya no hay límite de 10
    guardarJSON(stock);
    res.json({ success: true, message: 'Historial actualizado', data: mensaje });
  });
  
// GET /api/historiales/:tipo
router.get('/:tipo', (req, res) => {
    const tipo = req.params.tipo.toLowerCase();
    const stock = leerJSON();
    const material = stock.find(m => m.tipo.toLowerCase() === tipo);
  
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material no encontrado' });
    }
  
    const ultimosCambios = material.acciones.slice(0, 7);
    res.json({ success: true, cambios: ultimosCambios });
  });
  

module.exports = router;
