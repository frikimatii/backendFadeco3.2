const mongoose = require("mongoose");

const piezaSchema = new mongoose.Schema({
    _id:{type: Number, required: true},
  nombre: { type: String, required: true },
  tipo_material: { type: String, required: true },
  modelo: [{ type: String }], 
  mecanizado: [{ type: String }],  
  cantidad: {
    bruto: {
      cantidad: { type: Number, required: true },
      stock_deseado: { type: Number, default: 0 },
      detalles: { type: String },
      img: { type: String }
    },
    plegadora: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    plasma: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    corte: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    augeriado: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    soldador: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    pulido: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    torno: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    fresa: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    balancin: { cantidad: { type: Number, default: 0 }, stock_deseado: { type: Number, default: 0 } },
    terminado: {
      cantidad: { type: Number, default: 0 },
      stock_deseado: { type: Number, default: 0 },
      detalles: { type: String },
      img: { type: String }
    }
  },
  proveedores: {
    carmerlo: { cantidad: { type: Number, default: 0 } },
    maxi: { cantidad: { type: Number, default: 0 } },
    soldador: { cantidad: { type: Number, default: 0 } },
    pintura: { cantidad: { type: Number, default: 0 } },
    niquelado: { cantidad: { type: Number, default: 0 } }
  },
  origen: [{ type: String }],
  detallesGeneral: { type: String },
  destino_final: [{ type: String }]
});


const Pieza = mongoose.model('Pieza', piezaSchema, 'piezasFadeco');

module.exports = Pieza;
