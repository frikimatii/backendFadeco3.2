const express = require("express");
const router = express.Router();
const Pieza = require("../../models/Pieza");
const DatosMaquimas = require("../../models/DatosMaquinas");

const maquinas = ["Inox_330", "Inox_300", "Inox_250", "Inox_ECO", "Pintada_330", "Pintada_300"]; // Las máquinas que querés resetear

router.post("/", async (req, res) => {
  try {
    const { cantidad, mesSeleccionado } = req.body;

    // Validamos que llegue la cantidad (por seguridad)
    if (typeof cantidad !== 'number') {
      return res.status(400).json({ mensaje: "Cantidad inválida." });
    }

    // Mostrar el mes seleccionado en consola
    console.log("Mes seleccionado desde el frontend:", mesSeleccionado);

    // Mostrar las máquinas que se están procesando
    console.log("Máquinas que se están procesando:", maquinas);

    let totalCantidad = 0; // Inicializamos la variable para la suma total

    // Primero, obtener las cantidades actuales de cada máquina
    for (const nombre of maquinas) {
      const result = await Pieza.findOne({ nombre });

      if (!result) {
        console.error(`No se encontró la pieza con nombre: ${nombre}`);
      } else {
        // Guardar la cantidad de cada máquina en el mes seleccionado
        const cantidadMaquina = result.cantidad.terminado.cantidad || 0;

        // Acumular la cantidad total
        totalCantidad += cantidadMaquina;

        // Actualizar la base de datos con la cantidad de cada máquina en el mes seleccionado
        await DatosMaquimas.findOneAndUpdate(
          { id: nombre }, // Aquí utilizas 'nombre' como identificador
          {
            $set: {
              [`terminadas.mes.${mesSeleccionado}`]: cantidadMaquina
            }
          },
          { new: true }
        );

        console.log(`Cantidad de ${nombre} en el mes ${mesSeleccionado}: ${cantidadMaquina}`);
      }
    }

    // Ahora, actualizamos las cantidades de las máquinas para ponerlas en cero
    for (const nombre of maquinas) {
      const result = await Pieza.findOneAndUpdate(
        { nombre },
        { $set: { "cantidad.terminado.cantidad": cantidad } },
        { new: true }
      );

      if (!result) {
        console.error(`No se encontró la pieza con nombre: ${nombre}`);
      }
    }

    // Enviar el total de las cantidades de todas las máquinas al frontend
    res.status(200).json({
      mensaje: `Cantidad puesta en cero correctamente.`,
      totalMaquinas: totalCantidad, // El total de todas las máquinas
    });

  } catch (error) {
    console.error("Error en el servidor al actualizar:", error);
    res.status(500).json({ mensaje: "Error al actualizar la base de datos." });
  }
});

module.exports = router;
