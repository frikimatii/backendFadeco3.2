const express = require("express");
const router = express.Router();
const DataModel = require("../../models/DatosMaquinas");

const maquinas = ["Inox_330", "Inox_300", "Inox_250", "Inox_ECO", "Pintada_330", "Pintada_300"];

const mesesDelAnio = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

router.post("/", async (req, res) => {
  try {
    const { anio } = req.body;

    if (!anio || typeof anio !== "string") {
      return res.status(400).json({ mensaje: "Debe enviar un año válido en el body. Ej: { anio: '2025' }" });
    }

    for (const id of maquinas) {
      const maquina = await DataModel.findOne({ id });

      if (!maquina || !maquina.terminadas || !maquina.terminadas.mes) {
        console.warn(`Estructura incompleta para: ${id}`);
        continue;
      }

      let suma = 0;
      const meses = maquina.terminadas.mes;

      // Sumar y reiniciar los meses
      for (const mes of mesesDelAnio) {
        const valor = typeof meses[mes] === "number" ? meses[mes] : 0;
        suma += valor;
        meses[mes] = 0;
      }

      // Crear el objeto "year" si no existe
      if (!maquina.terminadas.year) {
        maquina.terminadas.year = {};
      }

      // Guardar la suma en el año correspondiente
      maquina.terminadas.year[anio] = suma;

      await maquina.save();
    }

    res.status(200).json({
      mensaje: `Suma guardada y meses reiniciados correctamente para ${anio}.`,
    });
  } catch (error) {
    console.error("Error al cerrar el año:", error);
    res.status(500).json({ mensaje: "Error al cerrar el año." });
  }
});

module.exports = router;
