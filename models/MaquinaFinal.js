const mongoose = require('mongoose');

const MaquinasDB = new mongoose.Schema({
  _id: { type: String, required: true }, // "001"
  nombre: { type: String, required: true }, // "Inox_330"
  modelo: { type: String, required: true }, // "330"

  cantidad: {
    terminadas: {
      cantidad: { type: Number, default: 0 }
    },
    limpias: {
      cantidad: { type: Number, default: 0 }
    },
    ventas: {
      cantidad: { type: Number, default: 0 },
      fecha: { type: String, default: "" } // O puede ser Date si lo manejás como fecha
    }
  },

  mes: {
    enero: { cantidad: { type: Number, default: 0 } },
    febrero: { cantidad: { type: Number, default: 0 } },
    marzo: { cantidad: { type: Number, default: 0 } },
    abril: { cantidad: { type: Number, default: 0 } },
    mayo: { cantidad: { type: Number, default: 0 } },
    junio: { cantidad: { type: Number, default: 0 } },
    julio: { cantidad: { type: Number, default: 0 } },
    agosto: { cantidad: { type: Number, default: 0 } },
    septiembre: { cantidad: { type: Number, default: 0 } }, // corregido el typo "septiempre"
    octubre: { cantidad: { type: Number, default: 0 } },
    noviembre: { cantidad: { type: Number, default: 0 } },
    diciembre: { cantidad: { type: Number, default: 0 } }
  },

  year: {
    "2024": { cantidad: { type: Number, default: 0 } },
    "2025": { cantidad: { type: Number, default: 0 } },
    "2026": { cantidad: { type: Number, default: 0 } },
    "2027": { cantidad: { type: Number, default: 0 } },
    "2028": { cantidad: { type: Number, default: 0 } },
    "2029": { cantidad: { type: Number, default: 0 } },
    "2030": { cantidad: { type: Number, default: 0 } }
  },

  detalles: { type: String, default: "" }
});

const MaquinasFinales = mongoose.model('MaquinasFinales', MaquinasDB, 'BaseDatosMaquinas');

module.exports = MaquinasFinales;
