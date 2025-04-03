const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Pieza = require("./models/Pieza");

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

      updateFields["cantidad.plegadora.cantidad"] =
        (pieza.cantidad?.plegadora?.cantidad || 0) + cantidadNumero;
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

      updateFields["cantidad.fresado.cantidad"] =
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
      bruto: ["Brazo 330", "Brazo 300", "Brazo 250", "Carcaza Afilador"],
      corte: ["Cuadrado Regulador"],
      torno: ["Carros", "Carros 250", "Movimiento", "Tornillo Teletubi Eco"],
      soldador: ["Caja Soldada Eco"],
      balancin: ["PortaEje"],
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
    } else if (categoria.soldador.includes(nombre)) {
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
        "Caja_300",
        "Caja_330",
        "Caja_250",
        "Cubrecuchilla 300",
        "Teletubi 300",
        "Tornillo Teletubi Eco",
        "Tapa Afilador Eco",
      ],
      corte: ["Buje Eje Eco"],
      torno: [
        "Caja 330 Armada",
        "Caja 300 Armada",
        "Caja 250 Armada",
        "Caja eco Armada",
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

app.put("/api/enviosSoldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

    const piezasBase = {
      baseInox330: [
        "ChapaBase 330Inox",
        "Lateral i330 contecla",
        "Lateral i330 sintecla",
        "Planchuela 330",
        "Varilla 330",
        "PortaEje",
      ],
      baseInox300: [
        "ChapaBase 300Inox",
        "Lateral i300 contecla",
        "Lateral i300 sintecla",
        "Planchuela 300",
        "Varilla 300",
        "PortaEje",
      ],
      baseInox250: [
        "ChapaBase 250Inox",
        "Lateral i250 contecla",
        "Lateral i250 sintecla",
        "Planchuela 250",
        "Varilla 250",
        "PortaEje",
      ],
      basePintada330: [
        "ChapaBase 330Pintada",
        "Lateral p330 contecla",
        "Lateral p330 sintecla",
        "Planchuela 330",
        "Varilla 330",
        "PortaEje",
      ],
      basePintada300: [
        "ChapaBase 300Pintada",
        "Lateral p300 contecla",
        "Lateral p300 sintecla",
        "Planchuela 300",
        "Varilla 300",
        "PortaEje",
      ],
      baseInoxECO: [
        "ChapaBase 330Inox",
        "Lateral i330 eco",
        "Lateral i330 sintecla",
        "Planchuela 330",
        "Varilla 330",
        "PortaEje",
      ],
      CajaSoldadaEco: [
        "Media Luna",
        "Pieza Caja Eco",
        "Planchuela Inferior",
        "Planchuela Interna",
      ],
    };

    switch (nombre) {
      case "CajaSoldadaEco":
        const CajaSoldadaEco = [
          "Media Luna",
          "Pieza Caja Eco",
          "Planchuela Inferior",
          "Planchuela Interna",
        ];

        const categoriaPieza = {
          "Media Luna": "plasma",
          "Pieza Caja Eco": "plasma",
          "Planchuela Inferior": "corte",
          "Planchuela Interna": "corte",
        };

        const piezasEnDB = await Pieza.find(
          { nombre: { $in: CajaSoldadaEco } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantes = [];
        let piezasActualizar = [];

        piezasEnDB.forEach((pieza) => {
          const categoria = categoriaPieza[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad || 0;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

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
          console.log(
            `No hay suficientes piezas para ensamblar la CajaSoldadaEco. Faltan: ${piezasFaltantes.join(
              ", "
            )}`
          );
        } else {
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

          const cajaSoldada = await Pieza.findOne({
            nombre: "Caja Soldada Eco",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'Caja Soldada Eco' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "Caja Soldada Eco" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "baseInox250":
        console.log(piezasBase[nombre], " inox");

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
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

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
