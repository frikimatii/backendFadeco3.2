const express = require("express");
const router = express.Router();
const Pedido = require("../../models/Pedido");
const fs = require("fs"); // Módulo para manejar archivos
const path = require("path");

// Validación de datos (opcional)
const validatePedido = (data) => {
  const errors = [];
  if (!data.cliente || typeof data.cliente !== "string") {
    errors.push("El campo 'cliente' es obligatorio y debe ser un texto.");
  }
  if (!Array.isArray(data.productos) || data.productos.length === 0) {
    errors.push("El campo 'productos' debe ser un array no vacío.");
  }
  if (!data.fechaEntrega || isNaN(Date.parse(data.fechaEntrega))) {
    errors.push(
      "El campo 'fechaEntrega' es obligatorio y debe ser una fecha válida."
    );
  }
  return errors;
};

// Función para guardar el pedido en un archivo .txt (orden inverso)
const guardarPedidoEnArchivo = (pedido) => {
  const rutaArchivo = "./registros/pedidos.txt"; // Ruta del archivo
  const contenidoNuevoPedido = `
-------------------------
Nuevo Pedido Creado:
Cliente: ${pedido.cliente}
Fecha de Entrega: ${new Date(pedido.fechaEntrega).toLocaleDateString()}
Productos:
${pedido.productos
  .map((producto) => `- ${producto.nombre}: ${producto.cantidad}`)
  .join("\n")}
Fecha Creacion: ${new Date (pedido.createdAt).toLocaleDateString()}
-------------------------
`;

  // Asegúrate de que el directorio exista
  if (!fs.existsSync("./registros")) {
    fs.mkdirSync("./registros"); // Crear el directorio si no existe
  }

  // Leer el contenido actual del archivo (si existe)
  fs.readFile(rutaArchivo, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      // Si hay un error distinto a "archivo no encontrado"
      console.error("Error al leer el archivo:", err);
      return;
    }

    // Combinar el nuevo pedido con el contenido existente
    const contenidoActualizado = contenidoNuevoPedido + (data || "");

    // Escribir el contenido actualizado en el archivo
    fs.writeFile(rutaArchivo, contenidoActualizado, (writeErr) => {
      if (writeErr) {
        console.error("Error al escribir en el archivo:", writeErr);
      }
    });
  });
};

// Ruta para crear un nuevo pedido
router.post("/", async (req, res) => {
  try {
    const { cliente, productos, fechaEntrega } = req.body;

    // Validar los datos recibidos
    const validationErrors = validatePedido({
      cliente,
      productos,
      fechaEntrega,
    });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Errores de validación", errors: validationErrors });
    }

    // Crear un nuevo pedido
    const nuevoPedido = new Pedido({
      cliente,
      productos,
      fechaEntrega,
    });

    // Guardar en la base de datos
    await nuevoPedido.save();

    // Guardar el pedido en el archivo .txt
    guardarPedidoEnArchivo(nuevoPedido);

    res
      .status(201)
      .json({ message: "Pedido creado exitosamente", pedido: nuevoPedido });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear el pedido", error: error.message });
  }
});

router.get("/descargar/pedidos", (req, res) => {
  const rutaArchivo = path.join(__dirname, "../../registros/pedidos.txt"); // Ruta absoluta al archivo

  // Verificar si el archivo existe
  if (!fs.existsSync(rutaArchivo)) {
    return res
      .status(404)
      .json({ message: "El archivo de pedidos no existe." });
  }

  // Leer el archivo y enviarlo como respuesta
  res.download(rutaArchivo, "pedidos.txt", (err) => {
    if (err) {
      console.error("Error al descargar el archivo:", err);
      res.status(500).json({ message: "Error al descargar el archivo." });
    }
  });
});

module.exports = router;
