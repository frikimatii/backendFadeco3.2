const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Pieza = require("./models/Pieza");
const MaquinasFinales = require("./models/MaquinaFinal");

const app = express();

MONGO_URI =
  "mongodb+srv://matibiencomodo:QAMHDwRFlYLWg4Dw@serverfadeco.comtp.mongodb.net/DBFadeco?retryWrites=true&w=majority&appName=serverFadeco";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("sections"));

// Conectar a MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Rutas
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const piezasRouter = require("./routes/piezas");
app.use("/api/piezas", piezasRouter);

const piezasAluminio = require("./routes/aluminio");
app.use("/api/aluminio", piezasAluminio);

const piezaChapa = require("./routes/chapa");
app.use("/api/chapa", piezaChapa);

const piezaShop = require("./routes/shop");
app.use("/api/shop", piezaShop);

const piezaPlastico = require("./routes/plastico");
app.use("/api/plastico", piezaPlastico);

const piezaHierro = require("./routes/hierro");
app.use("/api/hierro", piezaHierro);

const piezasaugeriado = require("./routes/mecanizado/augeriado");
app.use("/api/augeriado", piezasaugeriado); //

const piezasbalancin = require("./routes/mecanizado/balancin");
app.use("/api/balancin", piezasbalancin); //

const piezascorte = require("./routes/mecanizado/corte");
app.use("/api/corte", piezascorte); //

const piezasfresa = require("./routes/mecanizado/fresa");
app.use("/api/fresa", piezasfresa); //

const piezasPlasmas = require("./routes/mecanizado/plasma");
app.use("/api/plasma", piezasPlasmas); //

const piezasPlegadora = require("./routes/mecanizado/plegadora");
app.use("/api/plegadora", piezasPlegadora); //

const piezaspulido = require("./routes/mecanizado/pulido");
app.use("/api/pulido", piezaspulido); //

const piezassoldador = require("./routes/mecanizado/soldador");
app.use("/api/soldador", piezassoldador); //

const piezastorno = require("./routes/mecanizado/torno");
app.use("/api/torno", piezastorno); //

const Afiladore = require("./routes/provedores/afilador");
app.use("/api/afilador", Afiladore);

const PiezaMotores = require("./routes/armado/stockPieazaMotores");
app.use("/api/StockMotores", PiezaMotores);

const PiezaPreArmada = require("./routes/armado/stockPreArmado");
app.use("/api/StockPrearmado", PiezaPreArmada);

const BasePrearamada = require("./routes/armado/basePreArmado");
app.use("/api/Prearmado", BasePrearamada);

const piezaArmada = require("./routes/armado/piezaArmado");
app.use("/api/piezasArmado", piezaArmada);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// AGREGA pIEZAS A BRUTO
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

    res.json({
      mensaje: "Cantidad actualizada correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// AGREGA pIEZAS A MECANIZADO
app.put("/api/piezas/plegadora/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad no válida" });
    }
    const categorias = {
      bruto: [
        "ChapaBase 330Inox",
        "ChapaBase 300Inox",
        "ChapaBase 330Pintada",
        "ChapaBase 300Pintada",
        "ChapaBase 250Inox",
        "Bandeja Cabezal Inox 250",
        "Bandeja Cabezal Pintada",
        "Bandeja Cabezal Inox",
      ],
      plasma: [
        "Lateral i330 contecla",
        "Lateral i330 sintecla",
        "Lateral i300 contecla",
        "Lateral i300 sintecla",
        "Lateral i250 contecla",
        "Lateral i250 sintecla",
        "Lateral p330 contecla",
        "Lateral p330 sintecla",
        "Lateral p300 contecla",
        "Lateral p300 sintecla",
        "Lateral i330 eco",
      ],
      balancin: ["Chapa U Inox 250", "Chapa U Pintada", "Chapa U Inox"],
      fresa: ["Planchada 300", "Planchada 330", "Planchada 250"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    let updateFields = {};

    if (categorias.bruto.includes(nombre)) {
      // Verificar si hay stock suficiente antes de mecanizar
      if (
        !pieza.cantidad?.bruto?.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en stock ` });
      }
      // Restar piezas mecanizadas del stock bruto
      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      const piezasTerminadas = [
        "Bandeja Cabezal Inox 250",
        "Bandeja Cabezal Pintada",
        "Bandeja Cabezal Inox",
      ];

      if (piezasTerminadas.includes(nombre)) {
        updateFields["cantidad.terminado.cantidad"] =
          (pieza.cantidad?.terminado?.cantidad || 0) + cantidadNumero;
      } else {
        updateFields["cantidad.plegadora.cantidad"] =
          (pieza.cantidad?.plegadora?.cantidad || 0) + cantidadNumero;
      }
    } else if (categorias.plasma.includes(nombre)) {
      // Agregar directamente a la cantidad de la plegadora
      if (
        !pieza.cantidad?.plasma?.cantidad ||
        pieza.cantidad?.plasma.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insufiente de ${nombre} em el plasma` });
      }

      updateFields["cantidad.plasma.cantidad"] =
        pieza.cantidad.plasma.cantidad - cantidadNumero;

      updateFields["cantidad.plegadora.cantidad"] =
        (pieza.cantidad?.plegadora?.cantidad || 0) + cantidadNumero;
    } else if (categorias.fresa.includes(nombre)) {
      if (
        !pieza.cantidad?.fresa?.cantidad ||
        pieza.cantidad?.fresa.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `stock Insuficiente de ${nombre} en fresado` });
      }

      updateFields["cantidad.fresa.cantidad"] =
        pieza.cantidad.fresa.cantidad - cantidadNumero;

      updateFields["cantidad.plegadora.cantidad"] =
        (pieza.cantidad?.plegadora?.cantidad || 0) + cantidadNumero;
    } else if (categorias.balancin.includes(nombre)) {
      if (
        !pieza.cantidad?.balancin?.cantidad ||
        pieza.cantidad?.balancin.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `stock insuficinete de ${nombre} en balancin` });
      }

      updateFields["cantidad.balancin.cantidad"] =
        pieza.cantidad.balancin.cantidad - cantidadNumero;

      updateFields["cantidad.plegadora.cantidad"] =
        (pieza.cantidad?.plegadora?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad actualizada correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/plasma/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      plegadora: [
        "ChapaBase 330Inox",
        "ChapaBase 300Inox",
        "ChapaBase 330Pintada",
        "ChapaBase 300Pintada",
        "ChapaBase 250Inox",
        "Bandeja Cabezal Inox 250",
        "Bandeja Cabezal Pintada",
        "Bandeja Cabezal Inox",
      ],
      bruto: [
        "Planchada 330",
        "Planchada 300",
        "Planchada 250",
        "Vela 330",
        "Vela 300",
        "Vela 250",
        "Pieza Caja Eco",
        "Media Luna",
        "Lateral i330 contecla",
        "Lateral i330 sintecla",
        "Lateral i300 contecla",
        "Lateral i300 sintecla",
        "Lateral i250 contecla",
        "Lateral i250 sintecla",
        "Lateral p330 contecla",
        "Lateral p330 sintecla",
        "Lateral p300 contecla",
        "Lateral p300 sintecla",
        "Lateral i330 eco",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.plegadora.includes(nombre)) {
      if (
        !pieza.cantidad?.plegadora?.cantidad ||
        pieza.cantidad.plegadora.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en plegadora` });
      }

      updateFields["cantidad.plegadora.cantidad"] =
        pieza.cantidad.plegadora.cantidad - cantidadNumero;

      updateFields["cantidad.plasma.cantidad"] =
        (pieza.cantidad.plasma?.cantidad || 0) + cantidadNumero;
    } else if (categoria.bruto.includes(nombre)) {
      updateFields["cantidad.plasma.cantidad"] =
        (pieza.cantidad?.plasma?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/corte/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      bruto: [
        "Planchuela 250",
        "Planchuela 300",
        "Planchuela 330",
        "Varilla 300",
        "Varilla 330",
        "Varilla 250",
        "Eje Rectificado",
        "Varilla Brazo 330",
        "Varilla Brazo 300",
        "Varilla Brazo 250",
        "Tubo Manija",
        "Tubo Manija 250",
        "Cuadrado Regulador",
        "Palanca Afilador",
        "Eje Corto",
        "Eje Largo",
        "Buje Eje Eco",
        "Teletubi Eco",
        "Guia U",
        "Chapa CubreCabezal inox",
        "Chapa CubreCabezal pintada",
        "Chapa CubreCabezal inox 250",
        "Planchuela Inferior",
        "Planchuela Interna",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.bruto.includes(nombre)) {
      updateFields["cantidad.corte.cantidad"] =
        (pieza.cantidad?.corte?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/augeriado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      bruto: [
        "Brazo 330",
        "Brazo 300",
        "Brazo 250",
        "Carcaza Afilador",
        "Caja Soldada Eco",
      ],
      corte: ["Cuadrado Regulador"],
      torno: ["Carros", "Carros 250", "Movimiento", "Tornillo Teletubi Eco"],
      balancin: ["PortaEje"],
      fresa: [
        "CajaMotor_330",
        "CajaMotor_300",
        "CajaMotor_250",
        "CajaMotor_ECO",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.bruto.includes(nombre)) {
      if (
        !pieza.cantidad?.bruto?.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(404)
          .json({ mensaje: `Stock Insuficiente De ${nombre} en stock` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["cantidad.augeriado.cantidad"] =
        (pieza.cantidad?.augeriado?.cantidad || 0) + cantidadNumero;
    } else if (categoria.corte.includes(nombre)) {
      if (
        !pieza.cantidad.corte.cantidad ||
        pieza.cantidad.corte.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Corte` });
      }

      updateFields["cantidad.corte.cantidad"] =
        pieza.cantidad.corte.cantidad - cantidadNumero;

      updateFields["cantidad.augeriado.cantidad"] =
        (pieza.cantidad?.augeriado?.cantidad || 0) + cantidadNumero;
    } else if (categoria.torno.includes(nombre)) {
      if (
        !pieza.cantidad.torno.cantidad ||
        pieza.cantidad.torno.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.torno.cantidad"] =
        pieza.cantidad.torno.cantidad - cantidadNumero;

      updateFields["cantidad.augeriado.cantidad"] =
        (pieza.cantidad.augeriado.cantidad || 0) + cantidadNumero;
    } else if (categoria.balancin.includes(nombre)) {
      if (
        !pieza.cantidad.balancin.cantidad ||
        pieza.cantidad.balancin.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en el balancin` });
      }
      updateFields["cantidad.balancin.cantidad"] =
        pieza.cantidad.balancin.cantidad - cantidadNumero;

      updateFields["cantidad.augeriado.cantidad"] =
        (pieza.cantidad.augeriado.cantidad || 0) + cantidadNumero;
    } else if (categoria.fresa.includes(nombre)) {
      if (
        !pieza.cantidad.fresa.cantidad ||
        pieza.cantidad.fresa.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en el balancin` });
      }
      updateFields["cantidad.fresa.cantidad"] =
        pieza.cantidad.fresa.cantidad - cantidadNumero;

      updateFields["cantidad.terminado.cantidad"] =
        (pieza.cantidad.terminado.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );
    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/torno/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      bruto: [
        "Eje",
        "Eje 250",
        "Manchon",
        "Manchon 250",
        "Rueditas",
        "Tornillo guia",
        "Carros",
        "Carros 250",
        "Movimiento",
        "Caja 300",
        "Caja 330",
        "Caja 250",
        "Cubrecuchilla 300",
        "Teletubi 300",
        "Tornillo Teletubi Eco",
        "Tapa Afilador Eco",
      ],
      corte: ["Buje Eje Eco"],
      fresa: [
        "CajaMotor_330",
        "CajaMotor_300",
        "CajaMotor_250",
        "CajaMotor_ECO",
      ],
      soldador: [],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.bruto.includes(nombre)) {
      if (
        !pieza.cantidad?.bruto?.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(404)
          .json({ mensaje: `Stock Insuficiente De ${nombre} en stock` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["cantidad.torno.cantidad"] =
        (pieza.cantidad?.torno?.cantidad || 0) + cantidadNumero;
    } else if (categoria.corte.includes(nombre)) {
      if (
        !pieza.cantidad.corte.cantidad ||
        pieza.cantidad.corte.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Corte` });
      }

      updateFields["cantidad.corte.cantidad"] =
        pieza.cantidad.corte.cantidad - cantidadNumero;

      updateFields["cantidad.torno.cantidad"] =
        (pieza.cantidad?.torno?.cantidad || 0) + cantidadNumero;
    } else if (categoria.corte.includes(nombre)) {
      if (
        !pieza.cantidad.fresa.cantidad ||
        pieza.cantidad.fresa.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Corte` });
      }

      updateFields["cantidad.fresa.cantidad"] =
        pieza.cantidad.fresa.cantidad - cantidadNumero;

      updateFields["cantidad.terminado.cantidad"] =
        (pieza.cantidad?.terminado?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );
    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/fresa/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      plasma: [
        "Vela 250",
        "Vela 300",
        "Vela 330",
        "Planchada 330",
        "Planchada 300",
        "Planchada 250",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.plasma.includes(nombre)) {
      if (
        !pieza.cantidad?.plasma?.cantidad ||
        pieza.cantidad.plasma.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en plegadora` });
      }

      updateFields["cantidad.plasma.cantidad"] =
        pieza.cantidad.plasma.cantidad - cantidadNumero;

      updateFields["cantidad.fresa.cantidad"] =
        (pieza.cantidad.fresa?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/soldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      xxx: ["cabezal_inox", "cabezal_pintada", "cabezal_eco"],
      augeriado: ["Cuadrado Regulador"],
      plegadora: ["Planchada 330", "Planchada 300", "Planchada 250"],
      fresa: ["Vela 250", "Vela 300", "Vela 330"],
      corte: ["Varilla 330", "Varilla 300", "Varilla 250"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.augeriado.includes(nombre)) {
      if (
        !pieza.cantidad?.augeriado?.cantidad ||
        pieza.cantidad.augeriado.cantidad < cantidadNumero
      ) {
        return res
          .status(404)
          .json({ mensaje: `Stock Insuficiente De ${nombre} en stock` });
      }

      updateFields["cantidad.augeriado.cantidad"] =
        pieza.cantidad.augeriado.cantidad - cantidadNumero;

      updateFields["cantidad.soldador.cantidad"] =
        (pieza.cantidad?.soldador?.cantidad || 0) + cantidadNumero;
    } else if (categoria.plegadora.includes(nombre)) {
      if (
        !pieza.cantidad.plegadora.cantidad ||
        pieza.cantidad.plegadora.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Corte` });
      }

      updateFields["cantidad.plegadora.cantidad"] =
        pieza.cantidad.plegadora.cantidad - cantidadNumero;

      updateFields["cantidad.soldador.cantidad"] =
        (pieza.cantidad?.soldador?.cantidad || 0) + cantidadNumero;
    } else if (categoria.fresa.includes(nombre)) {
      if (
        !pieza.cantidad.fresa.cantidad ||
        pieza.cantidad.fresa.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.fresa.cantidad"] =
        pieza.cantidad.fresa.cantidad - cantidadNumero;

      updateFields["cantidad.soldador.cantidad"] =
        (pieza.cantidad.soldador.cantidad || 0) + cantidadNumero;
    } else if (categoria.corte.includes(nombre)) {
      if (
        !pieza.cantidad.corte.cantidad ||
        pieza.cantidad.corte.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.corte.cantidad"] =
        pieza.cantidad.corte.cantidad - cantidadNumero;

      updateFields["cantidad.soldador.cantidad"] =
        (pieza.cantidad.soldador.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );
    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/pulido/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      pulido: ["cabezal Inox", "cabezal 250"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.cabezales.includes(nombre)) {
      if (
        !pieza.cantidad?.cabezales?.cantidad ||
        pieza.cantidad.cabezales.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en plegadora` });
      }

      updateFields["cantidad.cabezales.cantidad"] =
        pieza.cantidad.cabezales.cantidad - cantidadNumero;

      updateFields["cantidad.pulido.cantidad"] =
        (pieza.cantidad.pulido?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

app.put("/api/piezas/balancin/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero)) {
      return res.status(400).json({ mensaje: "Cantidad No Válida" });
    }

    const categoria = {
      corte: [
        "Planchuela 250",
        "Planchuela 300",
        "Planchuela 330",
        "Guia U",
        "Teletubi Eco",
        "Eje Corto",
        "Eje Largo",
      ],
      bruto: ["Chapa U Inox", "Chapa U Pintada", "Chapa U Inox 250"],
      balancin: ["PortaEje"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};

    if (categoria.corte.includes(nombre)) {
      if (
        !pieza.cantidad?.corte?.cantidad ||
        pieza.cantidad.corte.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en plegadora` });
      }

      updateFields["cantidad.corte.cantidad"] =
        pieza.cantidad.corte.cantidad - cantidadNumero;

      updateFields["cantidad.balancin.cantidad"] =
        (pieza.cantidad.balancin?.cantidad || 0) + cantidadNumero;
    } else if (categoria.bruto.includes(nombre)) {
      if (
        !pieza.cantidad?.bruto?.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock insuficiente de ${nombre} en plegadora` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["cantidad.balancin.cantidad"] =
        (pieza.cantidad.balancin?.cantidad || 0) + cantidadNumero;
    } else if (categoria.balancin.includes(nombre)) {
      updateFields["cantidad.balancin.cantidad"] =
        (pieza.cantidad?.balancin?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    return res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

const guardarRuta = require("./routes/guardar");
app.use("/guardar", guardarRuta);

const historialRoutes = require("./routes/historial");
app.use("/api/historial", historialRoutes);

const historialRoute = require("./routes/historial-agregado");
app.use("/api/historiales", historialRoute);

const enviosYentregasRouter = require("./routes/provedores/historialprovedores");
app.use("/api", enviosYentregasRouter);

const mostrarDatosJsonProvedores = require("./routes/provedores/mostrarDatosjson");
app.use("/api/historialProvedores", mostrarDatosJsonProvedores);

//soldador
//actualizar piezas soldador
app.put("/api/enviosSoldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombreVisual = req.params.nombre;

    const nombreMapeo = {
      CajaSoldadaEco: "Caja Soldada Eco",
      baseInox250: "baseInox250",
      baseInox300: "baseInox300",
      baseInox330: "baseInox330",
      basePintada300: "basePintada300",
      basePintada330: "basePintada330",
      baseInoxECO: "baseInoxECO",
    };

    const nombreDB = nombreMapeo[nombreVisual];

    if (!nombreDB) {
      return res.status(400).json({ mensaje: "Producto no reconocido" });
    }

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad no es válida" });
    }

    const configuraciones = {
      CajaSoldadaEco: {
        piezas: [
          "Media Luna",
          "Pieza Caja Eco",
          "Planchuela Inferior",
          "Planchuela Interna",
        ],
        categoria: {
          "Media Luna": "plasma",
          "Pieza Caja Eco": "plasma",
          "Planchuela Inferior": "corte",
          "Planchuela Interna": "corte",
        },
      },
      baseInox250: {
        piezas: [
          "ChapaBase 250Inox",
          "Lateral i250 contecla",
          "Lateral i250 sintecla",
          "Planchuela 250",
          "Varilla 250",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 250Inox": "plasma",
          "Lateral i250 contecla": "plegadora",
          "Lateral i250 sintecla": "plegadora",
          "Planchuela 250": "balancin",
          "Varilla 250": "corte",
          PortaEje: "augeriado",
        },
      },
      baseInox300: {
        piezas: [
          "ChapaBase 300Inox",
          "Lateral i300 contecla",
          "Lateral i300 sintecla",
          "Planchuela 300",
          "Varilla 300",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 300Inox": "plasma",
          "Lateral i300 contecla": "plegadora",
          "Lateral i300 sintecla": "plegadora",
          "Planchuela 300": "balancin",
          "Varilla 300": "corte",
          PortaEje: "augeriado",
        },
      },
      baseInox330: {
        piezas: [
          "ChapaBase 330Inox",
          "Lateral i330 contecla",
          "Lateral i330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 330Inox": "plasma",
          "Lateral i330 contecla": "plegadora",
          "Lateral i330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        },
      },
      basePintada300: {
        piezas: [
          "ChapaBase 300Pintada",
          "Lateral p300 contecla",
          "Lateral p300 sintecla",
          "Planchuela 300",
          "Varilla 300",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 300Pintada": "plasma",
          "Lateral p300 contecla": "plegadora",
          "Lateral p300 sintecla": "plegadora",
          "Planchuela 300": "balancin",
          "Varilla 300": "corte",
          PortaEje: "augeriado",
        },
      },
      basePintada330: {
        piezas: [
          "ChapaBase 330Pintada",
          "Lateral p330 contecla",
          "Lateral p330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 330Pintada": "plasma",
          "Lateral p330 contecla": "plegadora",
          "Lateral p330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        },
      },
      baseInoxECO: {
        piezas: [
          "ChapaBase 330Inox",
          "Lateral i330 eco",
          "Lateral i330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ],
        categoria: {
          "ChapaBase 330Inox": "plasma",
          "Lateral i330 eco": "plegadora",
          "Lateral i330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        },
      },
    };

    const config = configuraciones[nombreVisual];
    if (!config) {
      return res.status(400).json({ mensaje: "Producto no reconocido" });
    }

    const piezasEnDB = await Pieza.find(
      { nombre: { $in: config.piezas } },
      { nombre: 1, cantidad: 1, _id: 0 }
    );

    let piezasFaltantes = [];
    let piezasActualizar = [];

    piezasEnDB.forEach((pieza) => {
      const categoria = config.categoria[pieza.nombre];
      const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;

      if (cantidadNumero > cantidadDisponible) {
        piezasFaltantes.push(pieza.nombre);
      } else {
        piezasActualizar.push({
          nombre: pieza.nombre,
          categoria,
          cantidadNueva: cantidadDisponible - cantidadNumero,
        });
      }
    });

    if (piezasFaltantes.length > 0) {
      return res.status(400).json({
        mensaje: `Faltan piezas para enviar al soldador ${nombreVisual}. Faltan: ${piezasFaltantes.join(
          ", "
        )}`,
        piezasFaltantes,
      });
    }

    for (const pieza of piezasActualizar) {
      await Pieza.updateOne(
        { nombre: pieza.nombre },
        {
          $set: {
            [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
          },
        }
      );
    }

    const resultadoProducto = await Pieza.updateOne(
      { nombre: nombreDB },
      { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
    );

    console.log(`✅ ${nombreVisual} ensamblado con éxito.`);
    console.log("🔄 Resultado de la actualización:", resultadoProducto);

    return res.json({
      mensaje: `${nombreVisual} ensamblado con éxito`,
      resultado: resultadoProducto,
    });
  } catch (error) {
    console.error("❌ Error en /api/enviosSoldador:", error);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error });
  }
});
app.put("/api/entregasSoldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    let nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad no es válida" });
    }

    // Mapeamos el nombre si viene mal escrito o sin espacios
    const nombreMapeado = {
      CajaSoldadaEco: "Caja Soldada Eco",
      // podés agregar más nombres aquí si lo necesitás
    };

    // Si viene un nombre sin espacio, lo corregimos
    if (nombreMapeado[nombre]) {
      nombre = nombreMapeado[nombre];
    }

    const pieza = await Pieza.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    const cantidadDisponible = pieza.proveedores?.soldador?.cantidad;

    if (cantidadDisponible < cantidadNumero) {
      return res.status(400).json({
        mensaje:
          "No hay suficientes piezas disponibles en proveedores.soldador",
      });
    }

    let campoDestino = "cantidad.bruto.cantidad";
    if (nombre === "Caja Soldada Eco") {
      campoDestino = "cantidad.bruto.cantidad";
    }

    const updateObj = {
      $inc: {
        [campoDestino]: cantidadNumero,
        "proveedores.soldador.cantidad": -cantidadNumero,
      },
    };

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      updateObj,
      { new: true }
    );

    res.json({
      mensaje: "Cantidad transferida correctamente del proveedor al destino",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

///carmelo
app.put("/api/enviosCarmelo/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezaenLugares = {
      torno: [
        "Caja 250",
        "Caja 300",
        "Caja 330",
        "Cubrecuchilla 300",
        "Teletubi 300",
        "Tapa Afilador Eco",
      ],
      bruto: [
        "Cubrecuchilla 250",
        "Velero",
        "Cubrecuchilla 330",
        "Aro Numerador",
        "Tapa Afilador",
        "Teletubi 330",
        "Tapa Afilador 250",
        "Teletubi 250",
        "baseInox330",
        "baseInox300",
        "baseInox250",
        "baseInoxECO",
      ],
      augeriado: ["Brazo 250", "Brazo 300", "Brazo 330"],
      soldador: [
        "Vela 330",
        "Vela 250",
        "Vela 300",
        "Planchada 330",
        "Planchada 300",
        "Planchada 250",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};
    if (piezaenLugares.torno.includes(nombre)) {
      if (
        !pieza.cantidad.torno.cantidad ||
        pieza.cantidad.torno.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Torno` });
      }

      updateFields["cantidad.torno.cantidad"] =
        pieza.cantidad.torno.cantidad - cantidadNumero;

      updateFields["proveedores.carmerlo.cantidad"] =
        (pieza.proveedores.carmerlo?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.bruto.includes(nombre)) {
      if (
        !pieza.cantidad.bruto.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["proveedores.carmerlo.cantidad"] =
        (pieza.proveedores.carmerlo?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.augeriado.includes(nombre)) {
      if (
        !pieza.cantidad.augeriado.cantidad ||
        pieza.cantidad.augeriado.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.augeriado.cantidad"] =
        pieza.cantidad.augeriado.cantidad - cantidadNumero;

      updateFields["proveedores.carmerlo.cantidad"] =
        (pieza.proveedores.carmerlo?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.soldador.includes(nombre)) {
      if (
        !pieza.cantidad.soldador.cantidad ||
        pieza.cantidad.soldador.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en Torno` });
      }

      updateFields["cantidad.soldador.cantidad"] =
        pieza.cantidad.soldador.cantidad - cantidadNumero;

      updateFields["proveedores.carmerlo.cantidad"] =
        (pieza.proveedores.carmerlo?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregasCarmelo/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad NO es valida" });
    }

    const pieza = await Pieza.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }
    const cantidadDispible = pieza.proveedores.carmerlo.cantidad;

    if (cantidadDispible < cantidadNumero) {
      return res
        .status(400)
        .json({ mensaje: "No hay suficientes Pieza diponible el Carmelo" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.terminado.cantidad": cantidadNumero,
          "proveedores.carmerlo.cantidad": -cantidadNumero,
        },
      },
      {
        new: true,
      }
    );

    res.json({
      mensaje: "Cantidad transferiada al terminado ",
      piezaActualizada,
    });
  } catch (error) {
    console.log(error);
  }
});

// Maxi

app.put("/api/enviosMaxi/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezaenLugares = {
      torno: [
        "Caja 250",
        "Caja 300",
        "Caja 330",
        "Cubrecuchilla 300",
        "Teletubi 300",
        "Tapa Afilador Eco",
      ],
      bruto: [
        "Cubrecuchilla 250",
        "Velero",
        "Cubrecuchilla 330",
        "Aro Numerador",
        "Tapa Afilador",
        "Teletubi 330",
        "Tapa Afilador 250",
        "Teletubi 250",
        "baseInox330",
        "baseInox300",
        "baseInox250",
        "baseInoxECO",
      ],
      augeriado: ["Brazo 250", "Brazo 300", "Brazo 330"],
      soldador: [
        "Vela 330",
        "Vela 250",
        "Vela 300",
        "Planchada 330",
        "Planchada 300",
        "Planchada 250",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};
    if (piezaenLugares.torno.includes(nombre)) {
      if (
        !pieza.cantidad.torno.cantidad ||
        pieza.cantidad.torno.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en Torno` });
      }

      updateFields["cantidad.torno.cantidad"] =
        pieza.cantidad.torno.cantidad - cantidadNumero;

      updateFields["proveedores.maxi.cantidad"] =
        (pieza.proveedores.maxi?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.bruto.includes(nombre)) {
      if (
        !pieza.cantidad.bruto.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en bruto` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["proveedores.maxi.cantidad"] =
        (pieza.proveedores.maxi?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.augeriado.includes(nombre)) {
      if (
        !pieza.cantidad.augeriado.cantidad ||
        pieza.cantidad.augeriado.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en augeriado` });
      }

      updateFields["cantidad.augeriado.cantidad"] =
        pieza.cantidad.augeriado.cantidad - cantidadNumero;

      updateFields["proveedores.maxi.cantidad"] =
        (pieza.proveedores.maxi?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.soldador.includes(nombre)) {
      if (
        !pieza.cantidad.soldador.cantidad ||
        pieza.cantidad.soldador.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en soldador` });
      }

      updateFields["cantidad.soldador.cantidad"] =
        pieza.cantidad.soldador.cantidad - cantidadNumero;

      updateFields["proveedores.maxi.cantidad"] =
        (pieza.proveedores.maxi?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregasMaxi/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad NO es valida" });
    }

    const pieza = await Pieza.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }
    const cantidadDispible = pieza.proveedores.maxi.cantidad;

    if (cantidadDispible < cantidadNumero) {
      return res
        .status(400)
        .json({ mensaje: "No hay suficientes Pieza diponible el Carmelo" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.terminado.cantidad": cantidadNumero,
          "proveedores.maxi.cantidad": -cantidadNumero,
        },
      },
      {
        new: true,
      }
    );

    res.json({
      mensaje: "Cantidad transferiada al terminado ",
      piezaActualizada,
    });
  } catch (error) {
    console.log(error);
  }
});

// Pintura

app.put("/api/enviosPintura/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezaenLugares = {
      balancin: ["Teletubi Eco"],
      bruto: ["basePintada330", "basePintada300", "Cabezal Pintura"],
      augeriado: ["Caja Soldada Eco"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};
    if (piezaenLugares.balancin.includes(nombre)) {
      if (
        !pieza.cantidad.balancin.cantidad ||
        pieza.cantidad.balancin.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en balancin` });
      }

      updateFields["cantidad.balancin.cantidad"] =
        pieza.cantidad.balancin.cantidad - cantidadNumero;

      updateFields["proveedores.pintura.cantidad"] =
        (pieza.proveedores.pintura?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.bruto.includes(nombre)) {
      if (
        !pieza.cantidad.bruto.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en bruto` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["proveedores.pintura.cantidad"] =
        (pieza.proveedores.pintura?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.augeriado.includes(nombre)) {
      if (
        !pieza.cantidad.augeriado.cantidad ||
        pieza.cantidad.augeriado.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en augeriado` });
      }

      updateFields["cantidad.augeriado.cantidad"] =
        pieza.cantidad.augeriado.cantidad - cantidadNumero;

      updateFields["proveedores.pintura.cantidad"] =
        (pieza.proveedores.pintura?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregasPintura/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad NO es valida" });
    }

    const pieza = await Pieza.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }
    const cantidadDispible = pieza.proveedores.pintura?.cantidad;

    if (cantidadDispible < cantidadNumero) {
      return res
        .status(400)
        .json({ mensaje: "No hay suficientes Pieza diponible el el Pintor" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.terminado.cantidad": cantidadNumero,
          "proveedores.pintura.cantidad": -cantidadNumero,
        },
      },
      {
        new: true,
      }
    );

    res.json({
      mensaje: "Cantidad transferiada al terminado ",
      piezaActualizada,
    });
  } catch (error) {
    console.log(error);
  }
});

// Niquelado

app.put("/api/enviosNiquelado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezaenLugares = {
      corte: [
        "Eje Rectificado",
        "Varilla Brazo 330",
        "Varilla Brazo 300",
        "Varilla Brazo 250",
        "Tubo Manija",
        "Tubo Manija 250",
        "Palanca Afilador",
      ],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};
    if (piezaenLugares.corte.includes(nombre)) {
      if (
        !pieza.cantidad.corte.cantidad ||
        pieza.cantidad.corte.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en corte` });
      }

      updateFields["cantidad.corte.cantidad"] =
        pieza.cantidad.corte.cantidad - cantidadNumero;

      updateFields["proveedores.niquelado.cantidad"] =
        (pieza.proveedores.niquelado?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregasNiquelado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad NO es valida" });
    }

    const pieza = await Pieza.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }
    const cantidadDispible = pieza.proveedores.niquelado.cantidad;

    if (cantidadDispible < cantidadNumero) {
      return res
        .status(400)
        .json({ mensaje: "No hay suficientes Pieza diponible el Niquelado" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.terminado.cantidad": cantidadNumero,
          "proveedores.niquelado.cantidad": -cantidadNumero,
        },
      },
      {
        new: true,
      }
    );

    res.json({
      mensaje: "Cantidad transferiada al terminado ",
      piezaActualizada,
    });
  } catch (error) {
    console.log(error);
  }
});

//  afiladores

app.put("/api/enviosAfiladores/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezaenLugares = {
      balancin: ["Eje Corto", "Eje Largo"],
      bruto: [
        "Ruleman608",
        "Capuchon Afilador",
        "Resorte Palanca",
        "Resorte Empuje",
      ],
      augeriado: ["Carcaza Afilador"],
      terminado: ["Palanca Afilador"],
    };

    const pieza = await Pieza.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza No Encontrada" });
    }

    let updateFields = {};
    if (piezaenLugares.balancin.includes(nombre)) {
      if (
        !pieza.cantidad.balancin.cantidad ||
        pieza.cantidad.balancin.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficiente de ${nombre} en balancin` });
      }

      updateFields["cantidad.balancin.cantidad"] =
        pieza.cantidad.balancin.cantidad - cantidadNumero;

      updateFields["proveedores.afiladores.cantidad"] =
        (pieza.proveedores.afiladores?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.bruto.includes(nombre)) {
      if (
        !pieza.cantidad.bruto.cantidad ||
        pieza.cantidad.bruto.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en bruto` });
      }

      updateFields["cantidad.bruto.cantidad"] =
        pieza.cantidad.bruto.cantidad - cantidadNumero;

      updateFields["proveedores.afiladores.cantidad"] =
        (pieza.proveedores.afiladores?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.augeriado.includes(nombre)) {
      if (
        !pieza.cantidad.augeriado.cantidad ||
        pieza.cantidad.augeriado.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en augeriado` });
      }

      updateFields["cantidad.augeriado.cantidad"] =
        pieza.cantidad.augeriado.cantidad - cantidadNumero;

      updateFields["proveedores.afiladores.cantidad"] =
        (pieza.proveedores.afiladores?.cantidad || 0) + cantidadNumero;
    } else if (piezaenLugares.terminado.includes(nombre)) {
      if (
        !pieza.cantidad.terminado.cantidad ||
        pieza.cantidad.terminado.cantidad < cantidadNumero
      ) {
        return res
          .status(400)
          .json({ mensaje: `Stock Insuficuente de ${nombre} en augeriado` });
      }

      updateFields["cantidad.terminado.cantidad"] =
        pieza.cantidad.terminado.cantidad - cantidadNumero;

      updateFields["proveedores.afiladores.cantidad"] =
        (pieza.proveedores.afiladores?.cantidad || 0) + cantidadNumero;
    } else {
      return res.status(400).json({ mensaje: "Categoría no válida" });
    }

    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad Actualizada Correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregaAfiladores/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad no es válida" });
    }

    if (nombre === "Afilador") {
      const piezasRequeridas = [
        { nombre: "Capuchon Afilador", cantidad: 2 },
        { nombre: "Eje Corto", cantidad: 1 },
        { nombre: "Eje Largo", cantidad: 1 },
        { nombre: "Ruleman608", cantidad: 2 },
        { nombre: "Palanca Afilador", cantidad: 1 },
        { nombre: "Resorte Palanca", cantidad: 1 },
        { nombre: "Resorte Empuje", cantidad: 2 },
        { nombre: "Carcaza Afilador", cantidad: 1}
      ];

      const nombresPiezas = piezasRequeridas.map((pieza) => pieza.nombre);

      const piezasEnDB = await Pieza.find({ nombre: { $in: nombresPiezas } });

      let piezasFaltantes = [];
      let piezasActualizar = [];

      for (const piezaRequerida of piezasRequeridas) {
        const piezaEnDB = piezasEnDB.find(
          (p) => p.nombre === piezaRequerida.nombre
        );

        if (!piezaEnDB) {
          piezasFaltantes.push(piezaRequerida.nombre);
          continue;
        }

        const disponible = piezaEnDB.proveedores?.afiladores?.cantidad;
        const totalNecesario = piezaRequerida.cantidad * cantidadNumero;

        if (disponible < totalNecesario) {
          piezasFaltantes.push(piezaRequerida.nombre);
        } else {
          piezasActualizar.push({
            nombre: piezaRequerida.nombre,
            cantidadNueva: disponible - totalNecesario,
          });
        }
      }

      if (piezasFaltantes.length > 0) {
        return res.status(400).json({
          mensaje: `Faltan piezas para ensamblar los afiladores: ${piezasFaltantes.join(
            ", "
          )}`,
        });
      }

      // Descontar las piezas
      for (const pieza of piezasActualizar) {
        await Pieza.updateOne(
          { nombre: pieza.nombre },
          { $set: { "proveedores.afiladores.cantidad": pieza.cantidadNueva } }
        );
      }

      // Sumar a afiladores terminados
      const afilador = await Pieza.findOne({ nombre: "Afilador" });

      if (!afilador) {
        return res
          .status(404)
          .json({ mensaje: "No se encontró el documento del Afilador." });
      }

      await Pieza.updateOne(
        { nombre: "Afilador" },
        { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
      );

      return res.status(200).json({
        mensaje: `✅ Se ensamblaron ${cantidadNumero} afiladores correctamente.`,
      });
    } else {
      return res
        .status(400)
        .json({ mensaje: "Nombre de pieza no reconocido." });
    }
  } catch (error) {
    console.error("Error en entrega de afiladores:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

const basesSoldador = require("./routes/provedores/soldador");
app.use("/api/baseSoldador", basesSoldador);

const piesasbrutas = require("./routes/provedores/stockfabrica");
app.use("/api/stockbruto", piesasbrutas);

const piezasBrutaFabricaStock = require("./routes/provedores/carmeloStockFabrica");
app.use("/api/carmelostockfabrica", piezasBrutaFabricaStock);

const piezaBrutoPintura = require("./routes/provedores/mostrarpintura");
app.use("/api/piezasbrutapintada", piezaBrutoPintura);

const piezaBrutoNiquelado = require("./routes/provedores/mostrarstockNiquelado");
app.use("/api/piezasbrutaniquelado", piezaBrutoNiquelado);

const piezaBrutoAfildor = require("./routes/provedores/MostrarBrutoAfilador");
app.use("/api/piezasbrutaAfilador", piezaBrutoAfildor);

const piezaSoldador = require("./routes/provedores/stockSoldador");
app.use("/api/stocksoldador", piezaSoldador);

const piezaPintura = require("./routes/provedores/piezaPintura");
app.use("/api/stockPintura", piezaPintura);

const motores = require("./routes/armado/motores");
app.use("/api/Motores", motores);

const MaquinaArmadas = require("./routes/armado/armadoFinal");
app.use("/api/maquinasTerminadas", MaquinaArmadas);
///Armado de Motores

app.put("/api/armadoDeMotores/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no es válida" });
    }

    switch (nombre) {
      case "CajaMotor_330":
        const Caja330 = [
          "Corona 330",
          "Seguer",
          "Sinfin",
          "Motor 220w",
          "Ruleman6005",
          "Ruleman6205",
          "Oring",
          "Ruleman6000",
          "Manchon",
          "Eje",
          "Caja 330",
        ];

        const categoriaMotor330 = {
          "Corona 330": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor 220w": "bruto",
          Ruleman6005: "bruto",
          Ruleman6205: "bruto",
          Oring: "bruto",
          Ruleman6000: "bruto",
          Manchon: "torno",
          Eje: "torno",
          "Caja 330": "terminado",
        };

        const cantidadesPorPieza = {
          "Corona 330": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor 220w": 1,
          Ruleman6005: 1,
          Ruleman6205: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          Ruleman6000: 1,
          Manchon: 1,
          Eje: 1,
          "Caja 330": 1,
        };

        const piezaEnDB = await Pieza.find(
          { nombre: { $in: Caja330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantes = [];
        let piezasActualizar = [];

        piezaEnDB.forEach((pieza) => {
          const categoria = categoriaMotor330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadesPorPieza[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantes.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizar.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantes.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Motor 330. Faltan: ${piezasFaltantes.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizar) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "CajaMotor_330" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Motor 330 ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }

      case "CajaMotor_300":
        const Caja300 = [
          "Corona 300",
          "Seguer",
          "Sinfin",
          "Motor 220w",
          "Ruleman6005",
          "Ruleman6205",
          "Oring",
          "Ruleman6000",
          "Manchon",
          "Eje",
          "Caja 300",
        ];

        const categoriaMotor300 = {
          "Corona 300": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor 220w": "bruto",
          Ruleman6005: "bruto",
          Ruleman6205: "bruto",
          Oring: "bruto",
          Ruleman6000: "bruto",
          Manchon: "torno",
          Eje: "torno",
          "Caja 300": "terminado",
        };

        const cantidadesPorPieza300 = {
          "Corona 300": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor 220w": 1,
          Ruleman6005: 1,
          Ruleman6205: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          Ruleman6000: 1,
          Manchon: 1,
          Eje: 1,
          "Caja 300": 1,
        };

        const piezaEnDB300 = await Pieza.find(
          { nombre: { $in: Caja300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesi300 = [];
        let piezasActualizari300 = [];

        piezaEnDB300.forEach((pieza) => {
          const categoria = categoriaMotor300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadesPorPieza300[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesi300.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizari300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesi300.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Motor 300. Faltan: ${piezasFaltantesi300.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizari300) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "CajaMotor_300" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Motor 300 ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }

      case "CajaMotor_250":
        const Caja250 = [
          "Corona 250",
          "Seguer",
          "Sinfin",
          "Motor250 220w",
          "Ruleman6004",
          "Ruleman6204",
          "Oring",
          "RulemanR6",
          "Manchon 250",
          "Eje 250",
          "Caja 250",
        ];

        const categoriaMotor250 = {
          "Corona 250": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor250 220w": "bruto",
          Ruleman6004: "bruto",
          Ruleman6204: "bruto",
          Oring: "bruto",
          RulemanR6: "bruto",
          "Manchon 250": "torno",
          "Eje 250": "torno",
          "Caja 250": "terminado",
        };

        const cantidadesPorPieza250 = {
          "Corona 250": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor250 220w": 1,
          Ruleman6004: 1,
          Ruleman6204: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          RulemanR6: 1,
          "Manchon 250": 1,
          "Eje 250": 1,
          "Caja 250": 1,
        };

        const piezaEnDB250 = await Pieza.find(
          { nombre: { $in: Caja250 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );
        let piezasFaltantesi250 = [];
        let piezasActualizari250 = [];

        piezaEnDB250.forEach((pieza) => {
          const categoria = categoriaMotor250[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadesPorPieza250[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesi250.push(
              `${pieza.nombre} (nesecita ${cantidadNecesaria} , hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizari250.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesi250.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Motor 250. Faltan: ${piezasFaltantesi250.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizari250) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }
          const resultado = await Pieza.updateOne(
            { nombre: "CajaMotor_250" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Motor 250 ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }

      case "CajaMotor_ECO":
        const CajaEco = [
          "Polea Grande",
          "Polea Chica",
          "Tecla",
          "Capacitores",
          "Conector Hembra",
          "Cable Corto Eco",
          "Motor ECO 220w",
          "Tapa Correa Eco",
          "Correa Eco",
          "Capuchon Motor Dodo",
          "Rectangulo Plastico Eco",
          "Ventilador Motor",
          "Buje Eje Eco",
          "Tornillo Teletubi Eco",
          "Caja Soldada Eco",
        ];
        const categoriaMotorECO = {
          "Polea Grande": "bruto",
          "Polea Chica": "bruto",
          Tecla: "bruto",
          Capacitores: "bruto",
          "Conector Hembra": "bruto",
          "Cable Corto Eco": "bruto",
          "Motor ECO 220w": "bruto",
          "Tapa Correa Eco": "bruto",
          "Correa Eco": "bruto",
          "Capuchon Motor Dodo": "bruto",
          "Rectangulo Plastico Eco": "bruto",
          "Ventilador Motor": "bruto",
          "Caja Soldada Eco": "terminado",
          "Tornillo Teletubi Eco": "augeriado",
          "Buje Eje Eco": "torno",
        };
        const cantidadesPorPiezaECO = {
          "Polea Grande": 1,
          "Polea Chica": 1,
          Tecla: 1,
          Capacitores: 1,
          "Conector Hembra": 1,
          "Cable Corto Eco": 1,
          "Motor ECO 220w": 1,
          "Tapa Correa Eco": 1,
          "Correa Eco": 1,
          "Capuchon Motor Dodo": 1,
          "Rectangulo Plastico Eco": 1,
          "Ventilador Motor": 1,
          "Buje Eje Eco": 1,
          "Tornillo Teletubi Eco": 2,
          "Caja Soldada Eco": 1,
        };

        const piezaEnDBECO = await Pieza.find(
          { nombre: { $in: CajaEco } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesECO = [];
        let piezasActualizarECO = [];

        piezaEnDBECO.forEach((pieza) => {
          const categoria = categoriaMotorECO[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadesPorPiezaECO[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesECO.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarECO.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesECO.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Motor 300. Faltan: ${piezasFaltantesECO.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarECO) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "CajaMotor_ECO" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Motor ECO ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }

      default:
        return res.status(400).json({ mensaje: "❌ Tipo de motor no válido." });
    }
  } catch (error) {
    console.error("🚨 Error en el armado de motores:", error);
    return res.status(500).json({ mensaje: "❌ Error interno del servidor." });
  }
});

app.put("/api/preArmado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no es válida" });
    }

    switch (nombre) {
      case "BasePreArmada_Inox330":
        const piezasPreInox330 = [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_330",
          "baseInox330",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 330",
        ];

        const categoriaPreInox330 = {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_330: "terminado",
          baseInox330: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 330": "soldador",
        };

        const cantidaPiezaPreinox330 = {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_330: 1,
          baseInox330: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 330": 1,
        };

        const BDPreArmadoi330 = await Pieza.find(
          { nombre: { $in: piezasPreInox330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei330 = [];
        let piezasActualizarPrei330 = [];

        BDPreArmadoi330.forEach((pieza) => {
          const categoria = categoriaPreInox330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidaPiezaPreinox330[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei330.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei330.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei330.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Inox 330. Faltan: ${piezasFaltantesPrei330.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei330) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_Inox330" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "BasePreArmada_Inox300":
        const piezasPreInox300 = [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_300",
          "baseInox300",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 300",
        ];

        const categoriaPreInox300 = {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_300: "terminado",
          baseInox300: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 300": "soldador",
        };

        const cantidaPiezaPreinox300 = {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_300: 1,
          baseInox300: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 300": 1,
        };

        const BDPreArmadoi300 = await Pieza.find(
          { nombre: { $in: piezasPreInox300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei300 = [];
        let piezasActualizarPrei300 = [];

        BDPreArmadoi300.forEach((pieza) => {
          const categoria = categoriaPreInox300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidaPiezaPreinox300[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei300.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei300.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armadado Inox 300. Faltan: ${piezasFaltantesPrei300.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei300) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_Inox300" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "BasePreArmada_Inox250":
        const piezasPreInox250 = [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Capacitores 250",
          "Movimiento",
          "Carros 250",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_250",
          "baseInox250",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 250",
        ];

        const categoriaPreInox250 = {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Capacitores 250": "bruto",
          Movimiento: "augeriado",
          "Carros 250": "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_250: "terminado",
          baseInox250: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 250": "soldador",
        };

        const cantidadPorPiezaInox250 = {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Capacitores 250": 1,
          Movimiento: 1,
          "Carros 250": 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_250: 1,
          baseInox250: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 250": 1,
        };

        const BDPreArmadoi250 = await Pieza.find(
          { nombre: { $in: piezasPreInox250 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei250 = [];
        let piezasActualizarPrei250 = [];

        BDPreArmadoi250.forEach((pieza) => {
          const categoria = categoriaPreInox250[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadPorPiezaInox250[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei250.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei250.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei250.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar elBase PreArmada 250. Faltan: ${piezasFaltantesPrei250.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei250) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_Inox250" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "BasePreArmada_InoxECO":
        const piezaPreArmadoECO = [
          "Espiral",
          "Tapita Perilla",
          "Cable Eco 220w",
          "Patas",
          "Perilla Numerador",
          "Resorte Carro",
          "Resorte Movimiento",
          "baseInoxECO",
          "Aro Numerador",
          "Eje Rectificado",
          "CajaMotor_ECO",
          "Rueditas",
          "Movimiento",
          "Carros",
          "Guia U",
          "Tornillo guia",
          "Varilla 330",
        ];

        const categoriaPreInoxECO = {
          Espiral: "bruto",
          "Tapita Perilla": "bruto",
          "Cable Eco 220w": "bruto",
          Patas: "bruto",
          "Perilla Numerador": "bruto",
          "Resorte Carro": "bruto",
          "Resorte Movimiento": "bruto",
          baseInoxECO: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          CajaMotor_ECO: "terminado",
          Rueditas: "torno",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Guia U": "balancin",
          "Tornillo guia": "torno",
          "Varilla 330": "soldador",
        };

        const cantidadPorPiezaInoxECO = {
          Espiral: 1,
          "Tapita Perilla": 1,
          "Cable Eco 220w": 1,
          Patas: 4,
          "Perilla Numerador": 1,
          "Resorte Carro": 2,
          "Resorte Movimiento": 1,
          baseInoxECO: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          CajaMotor_ECO: 1,
          Rueditas: 4,
          Movimiento: 1,
          Carros: 1,
          "Guia U": 1,
          "Tornillo guia": 1,
          "Varilla 330": 1,
        };

        const BDPreArmadoECO = await Pieza.find(
          { nombre: { $in: piezaPreArmadoECO } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPreECO = [];
        let piezasActualizarPreECO = [];

        BDPreArmadoECO.forEach((pieza) => {
          const categoria = categoriaPreInoxECO[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadPorPiezaInoxECO[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPreECO.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPreECO.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPreECO.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Motor InoxECO. Faltan: ${piezasFaltantesPreECO.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPreECO) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_InoxECO" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado InoxECO ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "BasePreArmada_Pintada330":
        const piezasPrePintada330 = [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_330",
          "basePintada330",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 330",
        ];

        const categoriaPrePintada330 = {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_330: "terminado",
          basePintada330: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 330": "soldador",
        };

        const cantidaPiezaPrePintada330 = {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_330: 1,
          basePintada330: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 330": 1,
        };

        const BDPreArmadoPintada = await Pieza.find(
          { nombre: { $in: piezasPrePintada330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrePintada = [];
        let piezasActualizarPrePintada = [];

        BDPreArmadoPintada.forEach((pieza) => {
          const categoria = categoriaPrePintada330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidaPiezaPrePintada330[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrePintada.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrePintada.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrePintada.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar la Base Pintada 330. Faltan: ${piezasFaltantesPrePintada.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrePintada) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar bases terminadas
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_Pintada330" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Base Pintada 330 ensamblada con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} unidades.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "BasePreArmada_Pintada300":
        const piezasPrePintada300 = [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_300",
          "basePintada300",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 300",
        ];

        const categoriaPrePintada300 = {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_300: "terminado",
          basePintada300: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 300": "soldador",
        };

        const cantidaPiezaPrePintada300 = {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_300: 1,
          basePintada300: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 300": 1,
        };

        const BDPreArmadoPintada300 = await Pieza.find(
          { nombre: { $in: piezasPrePintada300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrePintada300 = [];
        let piezasActualizarPrePintada300 = [];

        BDPreArmadoPintada300.forEach((pieza) => {
          const categoria = categoriaPrePintada300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidaPiezaPrePintada300[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrePintada300.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrePintada300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrePintada300.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar la Base Pintada 300. Faltan: ${piezasFaltantesPrePintada300.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrePintada300) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar bases terminadas
          const resultado = await Pieza.updateOne(
            { nombre: "BasePreArmada_Pintada300" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Base Pintada 300 ensamblada con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} unidades.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      default:
        return res
          .status(400)
          .json({ mensaje: "❌ Tipo de PreArmado no válido." });
    }
  } catch (error) {
    console.error("🚨 Error en el armado de motores:", error);
    return res.status(500).json({ mensaje: "❌ Error interno del servidor." });
  }
});

app.put("/api/ArmadoFinal/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no es válida" });
    }

    switch (nombre) {
      case "Inox_330":
        const piezaInox330 = [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Teletubi 330",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Inox330",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 330",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ];

        const categoriaInox330 = {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Teletubi 330": "terminado",
          "Cuchilla 330": "terminado",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox330: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 330": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        };

        const cantidadXpiezai330 = {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Teletubi 330": 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Inox330: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 330": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        };

        const BDPreArmadoi330 = await Pieza.find(
          { nombre: { $in: piezaInox330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei330 = [];
        let piezasActualizarPrei330 = [];

        BDPreArmadoi330.forEach((pieza) => {
          const categoria = categoriaInox330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpiezai330[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei330.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei330.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei330.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Inox 330. Faltan: ${piezasFaltantesPrei330.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei330) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          await MaquinasFinales.updateOne(
            { nombre: "Inox_330" },
            { $inc: { "cantidad.terminadas.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "Inox_300":
        const piezaInox300 = [
          "Brazo 300",
          "Cubrecuchilla 300",
          "Velero",
          "Teletubi 300",
          "Cuchilla 300",
          "Vela 300",
          "Planchada 300",
          "Varilla Brazo 300",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Inox300",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 300",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ];

        const categoriaInox300 = {
          "Brazo 300": "terminado",
          "Cubrecuchilla 300": "terminado",
          Velero: "terminado",
          "Teletubi 300": "terminado",
          "Cuchilla 300": "terminado",
          "Vela 300": "terminado",
          "Planchada 300": "terminado",
          "Varilla Brazo 300": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox300: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 300": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        };

        const cantidadXpiezai300 = {
          "Brazo 300": 1,
          "Cubrecuchilla 300": 1,
          Velero: 1,
          "Teletubi 300": 1,
          "Cuchilla 300": 1,
          "Vela 300": 1,
          "Planchada 300": 1,
          "Varilla Brazo 300": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Inox300: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 300": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        };

        const BDPreArmadoi300 = await Pieza.find(
          { nombre: { $in: piezaInox300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei300 = [];
        let piezasActualizarPrei300 = [];

        BDPreArmadoi300.forEach((pieza) => {
          const categoria = categoriaInox300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpiezai300[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei300.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei300.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Inox 300. Faltan: ${piezasFaltantesPrei300.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei300) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          await MaquinasFinales.updateOne(
            { nombre: "Inox_300" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "Pintada_330":
        const piezaPintada330 = [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Teletubi 330",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Pintada330",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 330",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_pintada",
        ];

        const categoriaPintura330 = {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Teletubi 330": "terminado",
          "Cuchilla 330": "terminado",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Pintada330: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 330": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_pintada: "soldador",
        };

        const cantidadXpiezap330 = {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Teletubi 330": 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Pintada330: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 330": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_pintada: 1,
        };

        const BDPreArmadoP330 = await Pieza.find(
          { nombre: { $in: piezaPintada330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPreP330 = [];
        let piezasActualizarPreP330 = [];

        BDPreArmadoP330.forEach((pieza) => {
          const categoria = categoriaPintura330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpiezap330[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPreP330.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPreP330.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPreP330.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Pintada 330. Faltan: ${piezasFaltantesPreP330.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPreP330) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          await MaquinasFinales.updateOne(
            { nombre: "Pintada_330" },
            { $inc: { "cantidad.terminadas.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado Pintada ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "Pintada_300":
        const piezaPintada300 = [
          "Brazo 300",
          "Cubrecuchilla 300",
          "Velero",
          "Teletubi 300",
          "Cuchilla 300",
          "Vela 300",
          "Planchada 300",
          "Varilla Brazo 300",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Pintada300",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 300",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ];

        const categoriaPintada300 = {
          "Brazo 300": "terminado",
          "Cubrecuchilla 300": "terminado",
          Velero: "terminado",
          "Teletubi 300": "terminado",
          "Cuchilla 300": "terminado",
          "Vela 300": "terminado",
          "Planchada 300": "terminado",
          "Varilla Brazo 300": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Pintada300: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 300": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        };

        const cantidadXpiezap300 = {
          "Brazo 300": 1,
          "Cubrecuchilla 300": 1,
          Velero: 1,
          "Teletubi 300": 1,
          "Cuchilla 300": 1,
          "Vela 300": 1,
          "Planchada 300": 1,
          "Varilla Brazo 300": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Pintada300: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 300": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        };

        const BDPreArmadoP300 = await Pieza.find(
          { nombre: { $in: piezaPintada300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPreP300 = [];
        let piezasActualizarPreP300 = [];

        BDPreArmadoP300.forEach((pieza) => {
          const categoria = categoriaPintada300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpiezap300[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPreP300.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPreP300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPreP300.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Pintado 300. Faltan: ${piezasFaltantesPreP300.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPreP300) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          await MaquinasFinales.updateOne(
            { nombre: "Pintada_300" },
            { $inc: { "cantidad.terminadas.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado Pintado 300 ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "Inox_250":
        const piezaInox250 = [
          "Brazo 250",
          "Cubrecuchilla 250",
          "Velero",
          "Teletubi 250",
          "Cuchilla 250",
          "Vela 250",
          "Planchada 250",
          "Varilla Brazo 250",
          "Tapa Afilador 250",
          "Tubo Manija 250",
          "Afilador",
          "BasePreArmada_Inox250",
          "Cubre Motor Rectangulo",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 250",
          "Piedra Afilador",
          "Pinche Frontal 250",
          "Pinche lateral 250",
          "Cuadrado Regulador",
          "cabezal i250",
        ];

        const piezaXcategoria250 = {
          "Brazo 250": "terminado",
          "Cubrecuchilla 250": "terminado",
          Velero: "terminado",
          "Teletubi 250": "terminado",
          "Cuchilla 250": "terminado",
          "Vela 250": "terminado",
          "Planchada 250": "terminado",
          "Varilla Brazo 250": "terminado",
          "Tapa Afilador 250": "terminado",
          "Tubo Manija 250": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox250: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 250": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal 250": "bruto",
          "Pinche lateral 250": "bruto",
          "Cuadrado Regulador": "soldador",
          "cabezal i250": "soldador",
        };

        const cantidadXpieza250 = {
          "Brazo 250": 1,
          "Cubrecuchilla 250": 1,
          Velero: 1,
          "Teletubi 250": 1,
          "Cuchilla 250": 1,
          "Vela 250": 1,
          "Planchada 250": 1,
          "Varilla Brazo 250": 1,
          "Tapa Afilador 250": 1,
          "Tubo Manija 250": 1,
          Afilador: 1,
          BasePreArmada_Inox250: 1,
          "Cubre Motor Rectangulo": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 250": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal 250": 1,
          "Pinche lateral 250": 1,
          "Cuadrado Regulador": 1,
          "cabezal i250": 1,
        };

        const BDPreArmadoi250 = await Pieza.find(
          { nombre: { $in: piezaInox250 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesPrei250 = [];
        let piezasActualizarPrei250 = [];

        BDPreArmadoi250.forEach((pieza) => {
          const categoria = piezaXcategoria250[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpieza250[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesPrei250.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarPrei250.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesPrei250.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Inox 250. Faltan: ${piezasFaltantesPrei250.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          // Descontar piezas usadas
          for (const pieza of piezasActualizarPrei250) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          // Sumar motores terminados
          await MaquinasFinales.updateOne(
            { nombre: "Inox_250" },
            { $inc: { "cantidad.terminadas.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }
      case "Inox_ECO":
        const piezaParaECO = [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_InoxECO",
          "Tapa Afilador Eco",
          "Teletubi Eco",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 250",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Pitito Teletubi Eco",
          "Cuadrado Regulador",
          "cabezal_inox",
        ];

        const piezaXcategoriaECO = {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Cuchilla 330": "terminado",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_InoxECO: "terminado",
          "Tapa Afilador Eco": "terminado",
          "Teletubi Eco": "terminado",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 250": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Pitito Teletubi Eco": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        };

        const cantidadXpiezasECO = {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_InoxECO: 1,
          "Tapa Afilador Eco": 1,
          "Teletubi Eco": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 250": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Pitito Teletubi Eco": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        };

        const BDPreArmadoECO = await Pieza.find(
          { nombre: { $in: piezaParaECO } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesECO = [];
        let piezasActualizarECO = [];

        BDPreArmadoECO.forEach((pieza) => {
          const categoria = piezaXcategoriaECO[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;
          const cantidadNecesaria =
            (cantidadXpiezasECO[pieza.nombre] || 1) * cantidadNumero;

          console.log(
            `🔍 ${pieza.nombre} - Disponible: ${cantidadDisponible}, Necesita: ${cantidadNecesaria}`
          );

          if (cantidadNecesaria > cantidadDisponible) {
            piezasFaltantesECO.push(
              `${pieza.nombre} (necesita ${cantidadNecesaria}, hay ${cantidadDisponible})`
            );
          } else {
            piezasActualizarECO.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNecesaria,
            });
          }
        });

        if (piezasFaltantesECO.length > 0) {
          const mensaje = `❌ No hay suficientes piezas para ensamblar el Pre armado Inox ECO. Faltan: ${piezasFaltantesECO.join(
            ", "
          )}`;
          console.log(mensaje);
          return res.status(400).json({ mensaje });
        } else {
          for (const pieza of piezasActualizarECO) {
            await Pieza.updateOne(
              { nombre: pieza.nombre },
              {
                $set: {
                  [`cantidad.${pieza.categoria}.cantidad`]: pieza.cantidadNueva,
                },
              }
            );
          }

          await MaquinasFinales.updateOne(
            { nombre: "Inox_ECO" },
            { $inc: { "cantidad.terminado.cantidad": cantidadNumero } }
          );

          const mensaje = `✅ Pre Armado ECO ensamblado con éxito. Se descontaron las piezas necesarias para ${cantidadNumero} motores.`;
          console.log(mensaje);
          return res.status(200).json({ mensaje });
        }

      default:
        return res
          .status(400)
          .json({ mensaje: "❌ Tipo de PreArmado no válido." });
    }
  } catch (error) {
    console.error("🚨 Error en el armado de motores:", error);
    return res.status(500).json({ mensaje: "❌ Error interno del servidor." });
  }
});

const datosparaGraficos = require("./routes/armado/datosGraficos");
app.use("/api/datosGraficos", datosparaGraficos);

const piezasEmbalar = require("./routes/control/btnEmbalar");
app.use("/api/datosEmbalar", piezasEmbalar);

const piezasLimpar = require("./routes/control/btnLimpiar");
app.use("/api/datosLimpios", piezasLimpar);

const piezasParaEmbalar = require("./routes/control/stockEmbalado");
app.use("/api/stockEmbalar", piezasParaEmbalar);

const piezasParaVentas = require("./routes/control/btnVentas");
app.use("/api/stockDeVentas", piezasParaVentas);

app.put("/api/Embalar/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad no es válida" });
    }

    const pieza = await MaquinasFinales.findOne({ nombre });
    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    const cantidadDisponible = pieza.cantidad.terminadas.cantidad;
    if (cantidadDisponible < cantidadNumero) {
      return res
        .status(400)
        .json({ mensaje: "No hay suficientes piezas disponibles" });
    }

    // Diccionario de calcomanías necesarias por tipo de máquina
    const piezasEmbalar = {
      Inox_250: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 250 2estrella", cantidad: 1 },
        { etiqueta: "Ventilador 250", cantidad: 1 },
      ],
      Inox_300: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 300 4estrella", cantidad: 1 },
        { etiqueta: "Ventilador Motor", cantidad: 1 },
      ],
      Inox_330: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 330 4estrella", cantidad: 1 },
        { etiqueta: "Ventilador Motor", cantidad: 1 },
      ],
      Inox_ECO: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 330 4estrella", cantidad: 1 },
      ],
      Pintada_330: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 330 3estrella", cantidad: 1 },
        { etiqueta: "Ventilador Motor", cantidad: 1 },
      ],
      Pintada_300: [
        { etiqueta: "Garantia", cantidad: 1 },
        { etiqueta: "Manual Instruciones", cantidad: 1 },
        { etiqueta: "Etiqueta Peligro", cantidad: 1 },
        { etiqueta: "F circulo", cantidad: 1 },
        { etiqueta: "F Cuadrado", cantidad: 1 },
        { etiqueta: "Circulo argentina", cantidad: 1 },
        { etiqueta: "Etiqueta Cable", cantidad: 1 },
        { etiqueta: "Fadeco 300 3estrella", cantidad: 1 },
        { etiqueta: "Ventilador Motor", cantidad: 1 },
      ],
    };

    const etiquetas = piezasEmbalar[nombre];
    if (!etiquetas) {
      return res
        .status(400)
        .json({ mensaje: "No se encuentran etiquetas para esta máquina" });
    }

    let errores = [];

    // Validar disponibilidad de calcomanías
    for (let etiqueta of etiquetas) {
      const calcomania = await Pieza.findOne({ nombre: etiqueta.etiqueta });

      if (!calcomania) {
        errores.push(
          `La calcomanía '${etiqueta.etiqueta}' no se encuentra en el inventario`
        );
        continue;
      }

      const disponible = calcomania.cantidad.bruto.cantidad;
      const necesaria = etiqueta.cantidad * cantidadNumero;

      if (disponible < necesaria) {
        errores.push(
          `Faltan calcomanías de '${etiqueta.etiqueta}': necesita ${necesaria}, disponibles ${disponible}`
        );
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        mensaje: "Faltan piezas para embalar",
        errores,
      });
    }

    // Descontar calcomanías del inventario
    for (let etiqueta of etiquetas) {
      const cantidadDescontar = etiqueta.cantidad * cantidadNumero;

      await Pieza.findOneAndUpdate(
        { nombre: etiqueta.etiqueta },
        { $inc: { "cantidad.bruto.cantidad": -cantidadDescontar } }
      );
    }

    // Actualizar cantidades de la máquina
    const piezaActualizada = await MaquinasFinales.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.limpias.cantidad": cantidadNumero,
          "cantidad.terminadas.cantidad": -cantidadNumero,
        },
      },
      { new: true }
    );

    res.json({
      mensaje: "Maquinas Lista para la venta.",
      piezaActualizada,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al procesar la solicitud" });
  }
});

app.put("/api/Ventas/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad NO es válida" });
    }

    const pieza = await MaquinasFinales.findOne({ nombre });

    if (!pieza) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    const cantidadDisponible = pieza?.cantidad?.limpias?.cantidad ?? 0;

    if (cantidadDisponible < cantidadNumero) {
      return res.status(400).json({
        mensaje: "No hay suficientes piezas disponibles en 'limpias'",
      });
    }

    const piezaActualizada = await MaquinasFinales.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.ventas.cantidad": cantidadNumero,
          "cantidad.limpias.cantidad": -cantidadNumero,
        },
      },
      { new: true }
    );

    // Obtener fecha y hora actual
    const ahora = new Date();
    const fechaHoraFormateada = ahora.toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    // Log con detalles de la venta
    console.log(
      `[VENTA REGISTRADA] - Máquina: ${nombre} | Cantidad: ${cantidadNumero} | Fecha y hora: ${fechaHoraFormateada}`
    );

    res.json({
      mensaje: "Cantidad transferida al estado 'ventas'",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error en /api/Ventas/:nombre", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});



app.post("/api/verificarArmadoMotores/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no válida" });
    }

    const configuraciones = {
      CajaMotor_330: {
        pieza: [
          "Corona 330",
          "Seguer",
          "Sinfin",
          "Motor 220w",
          "Ruleman6005",
          "Ruleman6205",
          "Oring",
          "Ruleman6000",
          "Manchon",
          "Eje",
          "Caja 330",
        ],
        categoriaPorPieza: {
          "Corona 330": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor 220w": "bruto",
          Ruleman6005: "bruto",
          Ruleman6205: "bruto",
          Oring: "bruto",
          Ruleman6000: "bruto",
          Manchon: "torno",
          Eje: "torno",
          "Caja 330": "terminado",
        },
        cantidadPorPieza: {
          "Corona 330": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor 220w": 1,
          Ruleman6005: 1,
          Ruleman6205: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          Ruleman6000: 1,
          Manchon: 1,
          Eje: 1,
          "Caja 330": 1,
        },
      },
      CajaMotor_300: {
        pieza: [
          "Corona 300",
          "Seguer",
          "Sinfin",
          "Motor 220w",
          "Ruleman6005",
          "Ruleman6205",
          "Oring",
          "Ruleman6000",
          "Manchon",
          "Eje",
          "Caja 300",
        ],
        categoriaPorPieza: {
          "Corona 300": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor 220w": "bruto",
          Ruleman6005: "bruto",
          Ruleman6205: "bruto",
          Oring: "bruto",
          Ruleman6000: "bruto",
          Manchon: "torno",
          Eje: "torno",
          "Caja 300": "terminado",
        },
        cantidadPorPieza: {
          "Corona 300": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor 220w": 1,
          Ruleman6005: 1,
          Ruleman6205: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          Ruleman6000: 1,
          Manchon: 1,
          Eje: 1,
          "Caja 300": 1,
        },
      },
      CajaMotor_250: {
        pieza: [
          "Corona 250",
          "Seguer",
          "Sinfin",
          "Motor250 220w",
          "Ruleman6004",
          "Ruleman6204",
          "Oring",
          "RulemanR6",
          "Manchon 250",
          "Eje 250",
          "Caja 250",
        ],
        categoriaPorPieza: {
          "Corona 250": "bruto",
          Seguer: "bruto",
          Sinfin: "bruto",
          "Motor250 220w": "bruto",
          Ruleman6004: "bruto",
          Ruleman6204: "bruto",
          Oring: "bruto",
          RulemanR6: "bruto",
          "Manchon 250": "torno",
          "Eje 250": "torno",
          "Caja 250": "terminado",
        },
        cantidadPorPieza: {
          "Corona 250": 1,
          Seguer: 1,
          Sinfin: 1,
          "Motor250 220w": 1,
          Ruleman6004: 1,
          Ruleman6204: 2, // 🔁 Esta se descuenta de a 2
          Oring: 1,
          RulemanR6: 1,
          "Manchon 250": 1,
          "Eje 250": 1,
          "Caja 250": 1,
        },
      },
      CajaMotor_ECO: {
        pieza: [
          "Polea Grande",
          "Polea Chica",
          "Tecla",
          "Capacitores",
          "Conector Hembra",
          "Cable Corto Eco",
          "Motor ECO 220w",
          "Tapa Correa Eco",
          "Correa Eco",
          "Capuchon Motor Dodo",
          "Rectangulo Plastico Eco",
          "Ventilador Motor",
          "Buje Eje Eco",
          "Tornillo Teletubi Eco",
          "Caja Soldada Eco",
        ],
        categoriaPorPieza: {
          "Polea Grande": "bruto",
          "Polea Chica": "bruto",
          Tecla: "bruto",
          Capacitores: "bruto",
          "Conector Hembra": "bruto",
          "Cable Corto Eco": "bruto",
          "Motor ECO 220w": "bruto",
          "Tapa Correa Eco": "bruto",
          "Correa Eco": "bruto",
          "Capuchon Motor Dodo": "bruto",
          "Rectangulo Plastico Eco": "bruto",
          "Ventilador Motor": "bruto",
          "Caja Soldada Eco": "terminado",
          "Tornillo Teletubi Eco": "augeriado",
          "Buje Eje Eco": "torno",
        },
        cantidadPorPieza: {
          "Polea Grande": 1,
          "Polea Chica": 1,
          Tecla: 1,
          Capacitores: 1,
          "Conector Hembra": 1,
          "Cable Corto Eco": 1,
          "Motor ECO 220w": 1,
          "Tapa Correa Eco": 1,
          "Correa Eco": 1,
          "Capuchon Motor Dodo": 1,
          "Rectangulo Plastico Eco": 1,
          "Ventilador Motor": 1,
          "Buje Eje Eco": 1,
          "Tornillo Teletubi Eco": 2,
          "Caja Soldada Eco": 1,
        },
      },
    };

    const config = configuraciones[nombre]
    if (!config){
      return res.status(400).json({ mensaje: `⚠️ Motor "${nombre}" no reconocido.` });
    }

    const piezasEnDB = await Pieza.find(
      {nombre: {$in: config.pieza } },
      {nombre: 1, cantidad: 1, _id: 0}
    )

    let piezasFaltantes = []

    piezasEnDB.forEach((pieza)=>{
      const categoria = config.categoriaPorPieza[pieza.nombre]
      const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0
      const cantidadNecesaria = (config.cantidadPorPieza[pieza.nombre] || 1 )* cantidadNumero

      if (cantidadNecesaria > cantidadDisponible){
        piezasFaltantes.push(`${pieza.nombre} (necesitas ${cantidadNecesaria}, hay ${cantidadDisponible})`)
      }
    })

    if (piezasFaltantes.length > 0) {
      const mensaje = `❌ No se puede armar ${cantidadNumero} ${nombre}. Faltan: ${piezasFaltantes.join(", ")} \n`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: false, piezasFaltantes });
    } else {
      const mensaje = `✅ Se puede armar ${cantidadNumero} ${nombre} sin problemas.`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: true });
    }
  } catch (error) {
    console.error("⚠️ Error en verificación de armado:", error);
    res.status(500).json({ mensaje: "❌ Error interno del servidor" });
  }
});




app.post("/api/verificarPreArmado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no válida" });
    }

    const configuraciones = {
      BasePreArmada_Inox330: {
        pieza: [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_330",
          "baseInox330",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 330",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_330: "terminado",
          baseInox330: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 330": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_330: 1,
          baseInox330: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 330": 1,
        },
      },
      BasePreArmada_Inox300: {
        pieza: [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_300",
          "baseInox300",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 300",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_300: "terminado",
          baseInox300: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 300": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_300: 1,
          baseInox300: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 300": 1,
        },
      },
      BasePreArmada_Inox250: {
        pieza: [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Capacitores 250",
          "Movimiento",
          "Carros 250",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_250",
          "baseInox250",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 250",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Capacitores 250": "bruto",
          Movimiento: "augeriado",
          "Carros 250": "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_250: "terminado",
          baseInox250: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 250": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Capacitores 250": 1,
          Movimiento: 1,
          "Carros 250": 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_250: 1,
          baseInox250: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 250": 1,
        },
      },
      BasePreArmada_InoxECO: {
        pieza: [
          "Espiral",
          "Tapita Perilla",
          "Cable Eco 220w",
          "Patas",
          "Perilla Numerador",
          "Resorte Carro",
          "Resorte Movimiento",
          "baseInoxECO",
          "Aro Numerador",
          "Eje Rectificado",
          "CajaMotor_ECO",
          "Rueditas",
          "Movimiento",
          "Carros",
          "Guia U",
          "Tornillo guia",
          "Varilla 330",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Tapita Perilla": "bruto",
          "Cable Eco 220w": "bruto",
          Patas: "bruto",
          "Perilla Numerador": "bruto",
          "Resorte Carro": "bruto",
          "Resorte Movimiento": "bruto",
          baseInoxECO: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          CajaMotor_ECO: "terminado",
          Rueditas: "torno",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Guia U": "balancin",
          "Tornillo guia": "torno",
          "Varilla 330": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Tapita Perilla": 1,
          "Cable Eco 220w": 1,
          Patas: 4,
          "Perilla Numerador": 1,
          "Resorte Carro": 2,
          "Resorte Movimiento": 1,
          baseInoxECO: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          CajaMotor_ECO: 1,
          Rueditas: 4,
          Movimiento: 1,
          Carros: 1,
          "Guia U": 1,
          "Tornillo guia": 1,
          "Varilla 330": 1,
        },
      },
      BasePreArmada_Pintada330: {
        pieza: [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_330",
          "basePintada330",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 330",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_330: "terminado",
          basePintada330: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 330": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_330: 1,
          basePintada330: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 330": 1,
        },
      },
      BasePreArmada_Pintada300: {
        pieza: [
          "Espiral",
          "Perilla Numerador",
          "Tapita Perilla",
          "Patas",
          "Resorte Movimiento",
          "Tecla",
          "Cable 220w",
          "Resorte Carro",
          "Capacitores",
          "Movimiento",
          "Carros",
          "Tornillo guia",
          "Rueditas",
          "CajaMotor_300",
          "basePintada300",
          "Aro Numerador",
          "Eje Rectificado",
          "Guia U",
          "Varilla 300",
        ],
        categoriaPorPieza: {
          Espiral: "bruto",
          "Perilla Numerador": "bruto",
          "Tapita Perilla": "bruto",
          Patas: "bruto",
          "Resorte Movimiento": "bruto",
          Tecla: "bruto",
          "Cable 220w": "bruto",
          "Resorte Carro": "bruto",
          Capacitores: "bruto",
          Movimiento: "augeriado",
          Carros: "augeriado",
          "Tornillo guia": "torno",
          Rueditas: "torno",
          CajaMotor_300: "terminado",
          basePintada300: "terminado",
          "Aro Numerador": "terminado",
          "Eje Rectificado": "terminado",
          "Guia U": "balancin",
          "Varilla 300": "soldador",
        },
        cantidadPorPieza: {
          Espiral: 1,
          "Perilla Numerador": 1,
          "Tapita Perilla": 1,
          Patas: 4,
          "Resorte Movimiento": 1,
          Tecla: 1,
          "Cable 220w": 1,
          "Resorte Carro": 2,
          Capacitores: 1,
          Movimiento: 1,
          Carros: 1,
          "Tornillo guia": 1,
          Rueditas: 4,
          CajaMotor_300: 1,
          basePintada300: 1,
          "Aro Numerador": 1,
          "Eje Rectificado": 1,
          "Guia U": 1,
          "Varilla 300": 1,
        },
      },
    };

    const config = configuraciones[nombre]
    if (!config){
      return res.status(400).json({ mensaje: `⚠️ Base PreArmada  "${nombre}" no reconocido.` });
    }

    const piezasEnDB = await Pieza.find(
      {nombre: {$in: config.pieza } },
      {nombre: 1, cantidad: 1, _id: 0}
    )

    let piezasFaltantes = []

    piezasEnDB.forEach((pieza)=>{
      const categoria = config.categoriaPorPieza[pieza.nombre]
      const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0
      const cantidadNecesaria = (config.cantidadPorPieza[pieza.nombre] || 1 )* cantidadNumero

      if (cantidadNecesaria > cantidadDisponible){
        piezasFaltantes.push(`${pieza.nombre} (necesitas ${cantidadNecesaria}, hay ${cantidadDisponible})`)
      }
    })

    if (piezasFaltantes.length > 0) {
      const mensaje = `❌ No se puede armar ${cantidadNumero} ${nombre}. Faltan: ${piezasFaltantes.join(", ")} \n`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: false, piezasFaltantes });
    } else {
      const mensaje = `✅ Se puede armar ${cantidadNumero} ${nombre} sin problemas.`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: true });
    }
  } catch (error) {
    console.error("⚠️ Error en verificación de armado:", error);
    res.status(500).json({ mensaje: "❌ Error interno del servidor" });
  }
});



app.post("/api/verificarArmado/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "❌ Cantidad no válida" });
    }

    const configuraciones = {
      Inox_330: {
        pieza: [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Teletubi 330",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Inox330",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 330",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ],
        categoriaPorPieza: {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Teletubi 330": "terminado",
          "Cuchilla 330": "bruto",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox330: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 330": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        },
        cantidadPorPieza: {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Teletubi 330": 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Inox330: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 330": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        },
      },
      Inox_300: {
        pieza: [
          "Brazo 300",
          "Cubrecuchilla 300",
          "Velero",
          "Teletubi 300",
          "Cuchilla 300",
          "Vela 300",
          "Planchada 300",
          "Varilla Brazo 300",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Inox300",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 300",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ],
        categoriaPorPieza: {
          "Brazo 300": "terminado",
          "Cubrecuchilla 300": "terminado",
          Velero: "terminado",
          "Teletubi 300": "terminado",
          "Cuchilla 300": "bruto",
          "Vela 300": "terminado",
          "Planchada 300": "terminado",
          "Varilla Brazo 300": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox300: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 300": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        },
        cantidadPorPieza: {
          "Brazo 300": 1,
          "Cubrecuchilla 300": 1,
          Velero: 1,
          "Teletubi 300": 1,
          "Cuchilla 300": 1,
          "Vela 300": 1,
          "Planchada 300": 1,
          "Varilla Brazo 300": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Inox300: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 300": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        },
      },
      Pintada_330: {
        pieza: [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Teletubi 330",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Pintada330",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 330",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_pintada",
        ],
        categoriaPorPieza: {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Teletubi 330": "terminado",
          "Cuchilla 330": "bruto",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Pintada330: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 330": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_pintada: "soldador",
        },
        cantidadPorPieza: {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Teletubi 330": 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Pintada330: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 330": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_pintada: 1,
        },
      },
      Pintada_300: {
        pieza: [
          "Brazo 300",
          "Cubrecuchilla 300",
          "Velero",
          "Teletubi 300",
          "Cuchilla 300",
          "Vela 300",
          "Planchada 300",
          "Varilla Brazo 300",
          "Tapa Afilador",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_Pintada300",
          "Cubre Motor Rectangulo",
          "Cubre Motor Cuadrado",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 300",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Cuadrado Regulador",
          "cabezal_inox",
        ],
        categoriaPorPieza: {
          "Brazo 300": "terminado",
          "Cubrecuchilla 300": "terminado",
          Velero: "terminado",
          "Teletubi 300": "terminado",
          "Cuchilla 300": "bruto",
          "Vela 300": "terminado",
          "Planchada 300": "terminado",
          "Varilla Brazo 300": "terminado",
          "Tapa Afilador": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_Pintada300: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Cubre Motor Cuadrado": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 300": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        },
        cantidadPorPieza: {
          "Brazo 300": 1,
          "Cubrecuchilla 300": 1,
          Velero: 1,
          "Teletubi 300": 1,
          "Cuchilla 300": 1,
          "Vela 300": 1,
          "Planchada 300": 1,
          "Varilla Brazo 300": 1,
          "Tapa Afilador": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_Pintada300: 1,
          "Cubre Motor Rectangulo": 1,
          "Cubre Motor Cuadrado": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 300": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        },
      },
      Inox_250: {
        pieza: [
          "Brazo 250",
          "Cubrecuchilla 250",
          "Velero",
          "Teletubi 250",
          "Cuchilla 250",
          "Vela 250",
          "Planchada 250",
          "Varilla Brazo 250",
          "Tapa Afilador 250",
          "Tubo Manija 250",
          "Afilador",
          "BasePreArmada_Inox250",
          "Cubre Motor Rectangulo",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 250",
          "Piedra Afilador",
          "Pinche Frontal 250",
          "Pinche lateral 250",
          "Cuadrado Regulador",
          "cabezal i250",
        ],
        categoriaPorPieza: {
          "Brazo 250": "terminado",
          "Cubrecuchilla 250": "terminado",
          Velero: "terminado",
          "Teletubi 250": "terminado",
          "Cuchilla 250": "bruto",
          "Vela 250": "terminado",
          "Planchada 250": "terminado",
          "Varilla Brazo 250": "terminado",
          "Tapa Afilador 250": "terminado",
          "Tubo Manija 250": "terminado",
          Afilador: "terminado",
          BasePreArmada_Inox250: "terminado",
          "Cubre Motor Rectangulo": "bruto",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 250": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal 250": "bruto",
          "Pinche lateral 250": "bruto",
          "Cuadrado Regulador": "soldador",
          "cabezal i250": "soldador",
        },
        cantidadPorPieza: {
          "Brazo 250": 1,
          "Cubrecuchilla 250": 1,
          Velero: 1,
          "Teletubi 250": 1,
          "Cuchilla 250": 1,
          "Vela 250": 1,
          "Planchada 250": 1,
          "Varilla Brazo 250": 1,
          "Tapa Afilador 250": 1,
          "Tubo Manija 250": 1,
          Afilador: 1,
          BasePreArmada_Inox250: 1,
          "Cubre Motor Rectangulo": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 250": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal 250": 1,
          "Pinche lateral 250": 1,
          "Cuadrado Regulador": 1,
          "cabezal i250": 1,
        },
      },
      Inox_ECO: {
        pieza: [
          "Brazo 330",
          "Cubrecuchilla 330",
          "Velero",
          "Cuchilla 330",
          "Vela 330",
          "Planchada 330",
          "Varilla Brazo 330",
          "Tubo Manija",
          "Afilador",
          "BasePreArmada_InoxECO",
          "Tapa Afilador Eco",
          "Teletubi Eco",
          "Perilla Brazo",
          "Resorte Brazo",
          "Pipas",
          "Perilla Cubrecuchilla",
          "Perilla Afilador",
          "Base Afilador 250",
          "Piedra Afilador",
          "Pinche Frontal",
          "Pinche lateral",
          "Pitito Teletubi Eco",
          "Cuadrado Regulador",
          "cabezal_inox",
        ],
        categoriaPorPieza: {
          "Brazo 330": "terminado",
          "Cubrecuchilla 330": "terminado",
          Velero: "terminado",
          "Cuchilla 330": "bruto",
          "Vela 330": "terminado",
          "Planchada 330": "terminado",
          "Varilla Brazo 330": "terminado",
          "Tubo Manija": "terminado",
          Afilador: "terminado",
          BasePreArmada_InoxECO: "terminado",
          "Tapa Afilador Eco": "terminado",
          "Teletubi Eco": "terminado",
          "Perilla Brazo": "bruto",
          "Resorte Brazo": "bruto",
          Pipas: "bruto",
          "Perilla Cubrecuchilla": "bruto",
          "Perilla Afilador": "bruto",
          "Base Afilador 250": "bruto",
          "Piedra Afilador": "bruto",
          "Pinche Frontal": "bruto",
          "Pinche lateral": "bruto",
          "Pitito Teletubi Eco": "bruto",
          "Cuadrado Regulador": "soldador",
          cabezal_inox: "soldador",
        },
        cantidadPorPieza: {
          "Brazo 330": 1,
          "Cubrecuchilla 330": 1,
          Velero: 1,
          "Cuchilla 330": 1,
          "Vela 330": 1,
          "Planchada 330": 1,
          "Varilla Brazo 330": 1,
          "Tubo Manija": 1,
          Afilador: 1,
          BasePreArmada_InoxECO: 1,
          "Tapa Afilador Eco": 1,
          "Teletubi Eco": 1,
          "Perilla Brazo": 1,
          "Resorte Brazo": 1,
          Pipas: 2,
          "Perilla Cubrecuchilla": 2,
          "Perilla Afilador": 1,
          "Base Afilador 250": 1,
          "Piedra Afilador": 1,
          "Pinche Frontal": 1,
          "Pinche lateral": 1,
          "Pitito Teletubi Eco": 1,
          "Cuadrado Regulador": 1,
          cabezal_inox: 1,
        },
      },
    };

    const config = configuraciones[nombre]
    if (!config){
      return res.status(400).json({ mensaje: `⚠️ Maquinas "${nombre}" no reconocido.` });
    }

    const piezasEnDB = await Pieza.find(
      {nombre: {$in: config.pieza } },
      {nombre: 1, cantidad: 1, _id: 0}
    )

    let piezasFaltantes = []

    piezasEnDB.forEach((pieza)=>{
      const categoria = config.categoriaPorPieza[pieza.nombre]
      const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0
      const cantidadNecesaria = (config.cantidadPorPieza[pieza.nombre] || 1 )* cantidadNumero

      if (cantidadNecesaria > cantidadDisponible){
        piezasFaltantes.push(`${pieza.nombre} (necesitas ${cantidadNecesaria}, hay ${cantidadDisponible})`)
      }
    })

    if (piezasFaltantes.length > 0) {
      const mensaje = `❌ No se puede armar ${cantidadNumero} ${nombre}. Faltan: ${piezasFaltantes.join(", ")} \n`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: false, piezasFaltantes });
    } else {
      const mensaje = `✅ Se puede armar ${cantidadNumero} ${nombre} sin problemas.`;
      console.log(mensaje);
      return res.status(200).json({ mensaje, puedeArmar: true });
    }
  } catch (error) {
    console.error("⚠️ Error en verificación de armado:", error);
    res.status(500).json({ mensaje: "❌ Error interno del servidor" });
  }
});





const piezaspanel = require("./routes/panel/piezasPanel")
app.use("/api/piezaPanel", piezaspanel)


/// actualiar PiezaBrutas 
app.put("/api/piezasBrutoActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.bruto.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.bruto.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Augeriado 
app.put("/api/piezasAugeriadoActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.augeriado.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.augeriado.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Plegadora
app.put("/api/piezasPlegadoraActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.plegadora.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.plegadora.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Plasma
app.put("/api/piezasPlasmaActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.plasma.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.plasma.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Corte
app.put("/api/piezasCorteActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.corte.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.corte.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Balancin
app.put("/api/piezasBalancinActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.balancin.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.balancin.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Torno
app.put("/api/piezasTornoActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.torno.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.torno.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Fresa
app.put("/api/piezasFresaActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.fresa.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.fresa.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/// Actulizar Soldar
app.put("/api/piezasSoldarActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.soldador.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.soldador.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


/// Actuliazar Piezas Terminadas 
app.put("/api/piezasTerminadoActualizar/nombre/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params; // Obtener el nombre desde la URL
    const { cantidadBruto, stockDeseadoBruto } = req.body; // Obtener los valores desde el body

    // Crear objeto con las actualizaciones, sólo si los valores no están vacíos
    const updates = {};

    if (cantidadBruto !== undefined) {
      updates["cantidad.terminado.cantidad"] = cantidadBruto;
    }

    if (stockDeseadoBruto !== undefined) {
      updates["cantidad.terminado.stock_deseado"] = stockDeseadoBruto;
    }

    // Verifica si la pieza existe y actualiza los valores
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre: nombre }, // Buscar por nombre
      { $set: updates }, // Actualizar lo que haya en el objeto `updates`
      { new: true } // Devolver la pieza actualizada
    );

    if (!piezaActualizada) {
      return res.status(404).json({ mensaje: "Pieza no encontrada" });
    }

    res.json({
      mensaje: "Cantidad y/o Stock deseado actualizado correctamente",
      piezaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la pieza:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});



// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

////   agregar provedodes a tolos las pieza ..
////sync function agregarAfiladores() {
//// try {
////   const resultado = await Pieza.updateMany(
////     { "proveedores.afiladores": { $exists: false } }, // solo a los que no lo tienen
////     { $set: { "proveedores.afiladores": { cantidad: 0 } } }
////   );
////
////   console.log(`Documentos actualizados: ${resultado.modifiedCount}`);
//// } catch (error) {
////   console.error("Error actualizando documentos:", error);
//// }
////
////
////gregarAfiladores()




