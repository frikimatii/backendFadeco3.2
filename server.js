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
        "Caja 300",
        "Caja 330",
        "Caja 250",
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

//soldador
//actualizar piezas soldador
app.put("/api/enviosSoldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre; // Corregido el error de escritura

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad No es Valida" });
    }

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
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

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
        const baseInox250 = [
          "ChapaBase 250Inox",
          "Lateral i250 contecla",
          "Lateral i250 sintecla",
          "Planchuela 250",
          "Varilla 250",
          "PortaEje",
        ];
        const categoriaPiezaInox250 = {
          "ChapaBase 250Inox": "plasma",
          "Lateral i250 contecla": "plegadora",
          "Lateral i250 sintecla": "plegadora",
          "Planchuela 250": "balancin",
          "Varilla 250": "corte",
          "PortaEje": "augeriado",
        };
        const piezasinox250 = await Pieza.find(
          { nombre: { $in: baseInox250 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesi250 = [];
        let piezasActualizari250 = [];

        piezasinox250.forEach((pieza) => {
          const categoria = categoriaPiezaInox250[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesi250.push(pieza.nombre);
          } else {
            piezasActualizari250.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesi250.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesi250.join(
              ", "
            )}`
          );
        } else {
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

          const cajaSoldada = await Pieza.findOne({
            nombre: "baseInox250",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'baseInox250' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "baseInox250" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "baseInox300":
        const baseInox300 = [
          "ChapaBase 300Inox",
          "Lateral i300 contecla",
          "Lateral i300 sintecla",
          "Planchuela 300",
          "Varilla 300",
          "PortaEje",
        ];
        const categoriaPiezaInox300 = {
          "ChapaBase 300Inox": "plasma",
          "Lateral i300 contecla": "plegadora",
          "Lateral i300 sintecla": "plegadora",
          "Planchuela 300": "balancin",
          "Varilla 300": "corte",
          PortaEje: "augeriado",
        };
        const piezasinox300 = await Pieza.find(
          { nombre: { $in: baseInox300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesi300 = [];
        let piezasActualizari300 = [];

        piezasinox300.forEach((pieza) => {
          const categoria = categoriaPiezaInox300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesi300.push(pieza.nombre);
          } else {
            piezasActualizari300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesi300.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesi300.join(
              ", "
            )}`
          );
        } else {
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

          const cajaSoldada = await Pieza.findOne({
            nombre: "baseInox300",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'baseInox300' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "baseInox300" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "baseInox330":
        const baseInox330 = [
          "ChapaBase 330Inox",
          "Lateral i330 contecla",
          "Lateral i330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ];
        const categoriaPiezaInox330 = {
          "ChapaBase 330Inox": "plasma",
          "Lateral i330 contecla": "plegadora",
          "Lateral i330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        };
        const piezasinox330 = await Pieza.find(
          { nombre: { $in: baseInox330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesi330 = [];
        let piezasActualizari330 = [];

        piezasinox330.forEach((pieza) => {
          const categoria = categoriaPiezaInox330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesi330.push(pieza.nombre);
          } else {
            piezasActualizari330.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesi330.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesi330.join(
              ", "
            )}`
          );
        } else {
          for (const pieza of piezasActualizari330) {
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
            nombre: "baseInox330",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'baseInox300' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "baseInox330" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "basePintada330":
        const basePintada330 = [
          "ChapaBase 330Pintada",
          "Lateral p330 contecla",
          "Lateral p330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ];
        const categoriaPiezaPintada330 = {
          "ChapaBase 330Pintada": "plasma",
          "Lateral p330 contecla": "plegadora",
          "Lateral p330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        };
        const piezasPintada330 = await Pieza.find(
          { nombre: { $in: basePintada330 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesp330 = [];
        let piezasActualizarp330 = [];

        piezasPintada330.forEach((pieza) => {
          const categoria = categoriaPiezaPintada330[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesp330.push(pieza.nombre);
          } else {
            piezasActualizarp330.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesp330.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesp330.join(
              ", "
            )}`
          );
        } else {
          for (const pieza of piezasActualizarp330) {
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
            nombre: "basePintada330",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'basePintada300' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "basePintada330" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "basePintada300":
        const basePintada300 = [
          "ChapaBase 300Pintada",
          "Lateral p300 contecla",
          "Lateral p300 sintecla",
          "Planchuela 300",
          "Varilla 300",
          "PortaEje",
        ];
        const categoriaPiezap300 = {
          "ChapaBase 300Inox": "plasma",
          "Lateral i300 contecla": "plegadora",
          "Lateral i300 sintecla": "plegadora",
          "Planchuela 300": "balancin",
          "Varilla 300": "corte",
          PortaEje: "augeriado",
        };
        const piezasPintada300 = await Pieza.find(
          { nombre: { $in: basePintada300 } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesp300 = [];
        let piezasActualizarp300 = [];

        piezasPintada300.forEach((pieza) => {
          const categoria = categoriaPiezap300[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesp300.push(pieza.nombre);
          } else {
            piezasActualizarp300.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesp300.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesp300.join(
              ", "
            )}`
          );
        } else {
          for (const pieza of piezasActualizarp300) {
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
            nombre: "basePintada300",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'basePintada00' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "basePintada300" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      case "baseInoxECO":
        const baseInoxECO = [
          "ChapaBase 330Inox",
          "Lateral p330 contecla",
          "Lateral p330 sintecla",
          "Planchuela 330",
          "Varilla 330",
          "PortaEje",
        ];
        const categoriaPiezaECO = {
          "ChapaBase 330Inox": "plasma",
          "Lateral i330 eco": "plegadora",
          "Lateral i330 sintecla": "plegadora",
          "Planchuela 330": "balancin",
          "Varilla 330": "corte",
          PortaEje: "augeriado",
        };
        const piezasECO = await Pieza.find(
          { nombre: { $in: baseInoxECO } },
          { nombre: 1, cantidad: 1, _id: 0 }
        );

        let piezasFaltantesECO = [];
        let piezasActualizarECO = [];

        piezasECO.forEach((pieza) => {
          const categoria = categoriaPiezaECO[pieza.nombre];
          const cantidadDisponible = pieza.cantidad?.[categoria]?.cantidad;

          console.log(
            `Nombre: ${pieza.nombre}, Cantidad disponible: ${cantidadDisponible}`
          );

          if (cantidadNumero > cantidadDisponible) {
            piezasFaltantesECO.push(pieza.nombre);
          } else {
            piezasActualizarECO.push({
              nombre: pieza.nombre,
              categoria,
              cantidadNueva: cantidadDisponible - cantidadNumero,
            });
          }
        });

        if (piezasFaltantesECO.length > 0) {
          console.log(
            `No hay suficientes piezas para ensamblar la baseinox250. Faltan: ${piezasFaltantesECO.join(
              ", "
            )}`
          );
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

          const cajaSoldada = await Pieza.findOne({
            nombre: "baseInoxECO",
          });

          if (!cajaSoldada) {
            console.log(
              "❌ No se encontró el documento 'baseInoxECO' en la base de datos."
            );
          } else {
            console.log("✅ Documento encontrado:", cajaSoldada);

            // Realizar la actualización
            const resultado = await Pieza.updateOne(
              { nombre: "baseInoxECO" },
              { $inc: { "proveedores.soldador.cantidad": cantidadNumero } }
            );

            console.log("🔄 Resultado de la actualización:", resultado);
          }

          console.log(
            `CajaSoldadaEco ensamblada con éxito. Se descontaron las piezas de la base de datos.`
          );
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put("/api/entregasSoldador/:nombre", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const nombre = req.params.nombre;

    const cantidadNumero = Number(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ mensaje: "Cantidad no es válida" });
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

    // Actualizamos ambas cantidades
    const piezaActualizada = await Pieza.findOneAndUpdate(
      { nombre },
      {
        $inc: {
          "cantidad.bruto.cantidad": cantidadNumero,
          "proveedores.soldador.cantidad": -cantidadNumero,
        },
      },
      { new: true }
    );

    res.json({
      mensaje: "Cantidad transferida correctamente del proveedor al bruto",
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
        "Tapa Afilador 250",
      ],
      bruto: [
        "Cubrecuchilla 250",
        "Velero",
        "Cubrecuchilla_330",
        "Aro Numerador",
        "Tapa Afilador",
        "Teletubi 330",
        "Tapa Afilador Eco",
        "Teletubi 250",
        "BaseInox_330",
        "BaseInox_300",
        "BaseInox_250",
        "BaseECO",
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
        "Tapa Afilador 250",
      ],
      bruto: [
        "Cubrecuchilla 250",
        "Velero",
        "Cubrecuchilla_330",
        "Aro Numerador",
        "Tapa Afilador",
        "Teletubi 330",
        "Tapa Afilador Eco",
        "Teletubi 250",
        "BaseInox_330",
        "BaseInox_300",
        "BaseInox_250",
        "BaseECO",
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
