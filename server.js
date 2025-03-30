const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Pieza = require('./models/Pieza')


const app = express();

MONGO_URI = "mongodb+srv://matibiencomodo:QAMHDwRFlYLWg4Dw@serverfadeco.comtp.mongodb.net/DBFadeco?retryWrites=true&w=majority&appName=serverFadeco"



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('sections'))

// Conectar a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));


// Rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const piezasRouter = require('./routes/piezas')
app.use('/api/piezas', piezasRouter)

const piezasAluminio = require('./routes/aluminio')
app.use('/api/aluminio', piezasAluminio)

const piezaChapa = require("./routes/chapa")
app.use('/api/chapa', piezaChapa)

const piezaShop = require('./routes/shop')
app.use('/api/shop', piezaShop)

const piezaPlastico = require('./routes/plastico')
app.use('/api/plastico', piezaPlastico)

const piezaHierro = require('./routes/hierro')
app.use('/api/hierro', piezaHierro)


const piezasaugeriado = require('./routes/mecanizado/augeriado')
app.use('/api/augeriado', piezasaugeriado)//

const piezasbalancin = require('./routes/mecanizado/balancin')
app.use('/api/balancin', piezasbalancin)//

const piezascorte = require('./routes/mecanizado/corte')
app.use('/api/corte', piezascorte)//

const piezasfresa = require('./routes/mecanizado/fresa')
app.use('/api/fresa', piezasfresa)//

const piezasPlasmas = require('./routes/mecanizado/plasma')
app.use('/api/plasma', piezasPlasmas)//

const piezasPlegadora = require('./routes/mecanizado/plegadora')
app.use('/api/plegadora', piezasPlegadora)//

const piezaspulido = require('./routes/mecanizado/pulido')
app.use('/api/pulido', piezaspulido)//

const piezassoldador = require('./routes/mecanizado/soldador')
app.use('/api/soldador', piezassoldador)//

const piezastorno = require('./routes/mecanizado/torno')
app.use('/api/torno', piezastorno)//

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});



//actuializar 

app.put("/api/piezas/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidad } = req.body; // Obtener la cantidad desde el body

    // Verifica si la pieza existe y actualiza la cantidad
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: { "cantidad.bruto.cantidad": cantidad } }, // Actualizar la cantidad
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({ mensaje: "Cantidad actualizada correctamente", piezaActualizada });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


app.put('/api/piezas/mecanizado/:nombre', async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidaNumero = Number(cantidad);
    if (isNaN(cantidaNumero)) {
      return res.status(400).json({ mensaje: "Cantidad no válida" });
    }

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    const cantidadBruta = pieza.cantidad.bruto.cantidad;
    const cantidadMecanizado = pieza.cantidad.plegadora.cantidad;

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $set: {
          "cantidad.bruto.cantidad": cantidadBruta - cantidad,
          "cantidad.plegadora.cantidad": cantidadMecanizado + cantidad,
        },
      },
      { new: true }
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }
    res.json({
      mensaje: "Cantidad actualizada correctamente",
      piezaActualizada,
    });

  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
});


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});