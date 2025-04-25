const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true
    },
    productos:[
        {
            nombre:{
                type: String,
                required: true
            },
            cantidad:{
                type: Number,
                required: true
            },
        },
    ],
    fechaEntrega:{
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ["activo", "completado", "eliminado"],
        default: "activo"
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("pedido", pedidoSchema, "pedidosMarcelo")