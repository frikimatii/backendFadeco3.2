const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  id: { type: String, required: true },
  modelo: { type: String, required: true },
  terminadas: {
    mes: {
      enero: { type: Number, default: 0 },
      febrero: { type: Number, default: 0 },
      marzo: { type: Number, default: 0 },
      abril: { type: Number, default: 0 },
      mayo: { type: Number, default: 0 },
      junio: { type: Number, default: 0 },
      julio: { type: Number, default: 0 },
      agosto: { type: Number, default: 0 },
      septiembre: { type: Number, default: 0 },
      octubre: { type: Number, default: 0 },
      noviembre: { type: Number, default: 0 },
      diciembre: { type: Number, default: 0 }
    },
    year: {
      '2024': { type: Number, default: 0 },
      '2025': { type: Number, default: 0 },
      '2026': { type: Number, default: 0 },
      '2027': { type: Number, default: 0 },
      '2028': { type: Number, default: 0 },
      '2029': { type: Number, default: 0 },
      '2030': { type: Number, default: 0 }
    }
  },
  limpiar: {
    mes: {
      enero: { type: Number, default: 0 },
      febrero: { type: Number, default: 0 },
      marzo: { type: Number, default: 0 },
      abril: { type: Number, default: 0 },
      mayo: { type: Number, default: 0 },
      junio: { type: Number, default: 0 },
      julio: { type: Number, default: 0 },
      agosto: { type: Number, default: 0 },
      septiembre: { type: Number, default: 0 },
      octubre: { type: Number, default: 0 },
      noviembre: { type: Number, default: 0 },
      diciembre: { type: Number, default: 0 }
    },
    year: {
      '2024': { type: Number, default: 0 },
      '2025': { type: Number, default: 0 },
      '2026': { type: Number, default: 0 },
      '2027': { type: Number, default: 0 },
      '2028': { type: Number, default: 0 },
      '2029': { type: Number, default: 0 },
      '2030': { type: Number, default: 0 }
    }
  },
  ventas: {
    mes: {
      enero: { type: Number, default: 0 },
      febrero: { type: Number, default: 0 },
      marzo: { type: Number, default: 0 },
      abril: { type: Number, default: 0 },
      mayo: { type: Number, default: 0 },
      junio: { type: Number, default: 0 },
      julio: { type: Number, default: 0 },
      agosto: { type: Number, default: 0 },
      septiembre: { type: Number, default: 0 },
      octubre: { type: Number, default: 0 },
      noviembre: { type: Number, default: 0 },
      diciembre: { type: Number, default: 0 }
    },
    year: {
      '2024': { type: Number, default: 0 },
      '2025': { type: Number, default: 0 },
      '2026': { type: Number, default: 0 },
      '2027': { type: Number, default: 0 },
      '2028': { type: Number, default: 0 },
      '2029': { type: Number, default: 0 },
      '2030': { type: Number, default: 0 }
    }
  }
});

const DataModel = mongoose.model('Data', dataSchema, "Machine");

module.exports = DataModel;
