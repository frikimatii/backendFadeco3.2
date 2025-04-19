const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rutas a los archivos
const jsonPath = path.join(__dirname, '../historial/stock.json');
const txtPath = path.join(__dirname, '../historial/stock_cargaIncial.txt');

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

// Crear el TXT si no existe
function inicializarTXT() {
  if (!fs.existsSync(txtPath)) {
    fs.writeFileSync(txtPath, 'Historial completo de cambios:\n\n', 'utf8');
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

// Añadir registro al TXT
function agregarAlTXT(mensaje) {
  inicializarTXT();
  const fecha = new Date().toISOString();
  const registro = `[${fecha}] ${mensaje}\n`;
  
  // Agregar al inicio del archivo (para que los más recientes aparezcan primero)
  const contenidoActual = fs.readFileSync(txtPath, 'utf8');
  fs.writeFileSync(txtPath, registro + contenidoActual, 'utf8');
}

// POST /api/historiales
router.post('/', (req, res) => {
  const { pieza, cantidad } = req.body;
  const mensaje = `${cantidad} ${pieza}.`;
  
  let stock = leerJSON();
  let material = stock.find(m => m.tipo.toLowerCase() === pieza.toLowerCase());

  if (!material) {
    return res.status(404).json({ success: false, message: 'Material no encontrado' });
  }

  // Agregamos el mensaje al historial JSON
  material.acciones.unshift(mensaje);
  
  // Guardamos en JSON
  guardarJSON(stock);
  
  // También guardamos en TXT
  agregarAlTXT(mensaje);
  
  res.json({ success: true, message: 'Historial actualizado', data: mensaje });
});


// GET /api/historiales/descargar/txt - Descarga el archivo TXT
router.get('/descargar/txt', (req, res) => {
  try {
    // Verifica si el archivo existe
    if (!fs.existsSync(txtPath)) {
      inicializarTXT(); // Crea el archivo si no existe
    }

    // Configura los headers para forzar la descarga
    res.setHeader('Content-disposition', 'attachment; filename=stock_cargaIncial.txt');
    res.setHeader('Content-type', 'text/plain');

    // Crea un stream de lectura y lo envía como respuesta
    const fileStream = fs.createReadStream(txtPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    res.status(500).json({ success: false, message: 'Error al descargar el archivo' });
  }
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