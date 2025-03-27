const mongoose = require('mongoose');

const mecanizadoSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    cantidad: { type: Number, required: true, default: 0 },
    stock_deseado: { type: Number, required: true, default: 0 },
    detalles: { type: String, required: true }
}, { _id: false });

const cantidadSchema = new mongoose.Schema({
    bruto: {
        cantidad: { type: Number, required: true, default: 0 },
        stock_deseado: { type: Number, required: true, default: 0 },
        detalles: { type: String, required: true },
        img: { type: String, default: "" }
    },
    augeriado: {
        cantidad: { type: Number, required: true, default: 0 },
        stock_deseado: { type: Number, required: true, default: 0 }
    },
    terminado: {
        cantidad: { type: Number, required: true, default: 0 },
        stock_deseado: { type: Number, required: true, default: 0 },
        detalles: { type: String, required: true },
        img: { type: String, default: "" }
    }
}, { _id: false });

const piezaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo_material: { type: String, required: true },
    modelo: [{ type: String, required: true }],
    mecanizado: [mecanizadoSchema],
    cantidad: cantidadSchema,
    proveedores: {
        carmerlo: { type: Number, required: true, default: 0 },
        maxi: { type: Number, required: true, default: 0 }
    },
    origen: { type: String, required: true },
    detallesGeneral: {type: String, required: true},
    destino_final: [{ type: String, required: true }]
}, { timestamps: true });


const Pieza = mongoose.model('Pieza', piezaSchema, 'piezasFadeco');

module.exports = Pieza;
