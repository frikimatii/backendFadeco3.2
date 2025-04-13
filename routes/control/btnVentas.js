const express = require("express");
const router = express.Router();
const MaquinasTotales = require("../../models/MaquinaFinal");

router.get("/", async (req, res) => {
  try {
    const piezas = await MaquinasTotales.find();
    res.status(200).json(piezas);
  } catch (error) {
    console.error("Error al obtener piezas de aluminio:", error);
    res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router;

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
      { etiqueta: "Ventilador 250", cantidad: 1 }
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
      { etiqueta: "Ventilador Motor", cantidad: 1 }
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
      { etiqueta: "Ventilador Motor", cantidad: 1 }
    ],
    Inox_ECO: [
      { etiqueta: "Garantia", cantidad: 1 },
      { etiqueta: "Manual Instruciones", cantidad: 1 },
      { etiqueta: "Etiqueta Peligro", cantidad: 1 },
      { etiqueta: "F circulo", cantidad: 1 },
      { etiqueta: "F Cuadrado", cantidad: 1 },
      { etiqueta: "Circulo argentina", cantidad: 1 },
      { etiqueta: "Etiqueta Cable", cantidad: 1 },
      { etiqueta: "Fadeco 330 4estrella", cantidad: 1 }
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
      { etiqueta: "Ventilador Motor", cantidad: 1 }
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
      { etiqueta: "Ventilador Motor", cantidad: 1 }
    ]
  };
  