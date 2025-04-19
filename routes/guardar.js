const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const mecanizadosBase = [
    "plegadora", "plasma", "corte", "augeriado",
    "torno", "fresa", "soldador", "pulido", "balancin"
];

// Función para obtener rutas de archivos
function getFilePath() {
    const folder = path.join(__dirname, "..", "historial");
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    return path.join(folder, "historial.json");
}

// Función para obtener ruta del archivo TXT
function getTxtPath() {
    const folder = path.join(__dirname, "..", "historial");
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    return path.join(folder, "historial.txt");
}

// Guardar acción en historial (versión mejorada)
function guardarAccionEnHistorial(mecanizado, pieza, cantidad) {
    try {
        const filePath = getFilePath();
        const txtPath = getTxtPath();

        let historial = [];
        
        if (fs.existsSync(filePath)) {
            historial = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } else {
            historial = mecanizadosBase.map(nombre => ({
                nombre,
                acciones: []
            }));
        }

        const timestamp = new Date().toLocaleTimeString();
        const day = new Date().toLocaleDateString();
        const mensaje = `🕐${day} ${timestamp} - Mecanizado: ${mecanizado} | Pieza: ${pieza} | Cantidad: ${cantidad}`;

        const mecanizadoObj = historial.find(m => m.nombre === mecanizado);
        if (mecanizadoObj) {
            mecanizadoObj.acciones.push(mensaje);
        }

        // Guardar en JSON
        fs.writeFileSync(filePath, JSON.stringify(historial, null, 2), "utf8");
        
        // Guardar en TXT (modo append)
        fs.appendFileSync(txtPath, mensaje + "\n", "utf8");

    } catch (error) {
        console.error("Error al guardar historial:", error);
        throw error;
    }
}

// Ruta POST (mejorada con manejo de errores)
router.post("/", (req, res) => {
    try {
        const { mecanizado, pieza, cantidad } = req.body;

        if (!mecanizado || !pieza || !cantidad) {
            return res.status(400).json({ 
                error: "Faltan datos",
                detalles: {
                    mecanizado: mecanizado || "No proporcionado",
                    pieza: pieza || "No proporcionada",
                    cantidad: cantidad || "No proporcionada"
                }
            });
        }

        guardarAccionEnHistorial(mecanizado, pieza, cantidad);
        res.json({ 
            mensaje: "✅ Acción guardada correctamente.",
            datos: { mecanizado, pieza, cantidad }
        });

    } catch (error) {
        console.error("Error en POST /:", error);
        res.status(500).json({ 
            error: "Error interno al guardar los datos",
            detalles: error.message
        });
    }
});




router.get('/descargar/historial/mecanizado', (req, res) => {
    const txtPath = path.join(__dirname, "..", "historial", "historial.txt");
    
    try {
        // Verificar y crear archivo si no existe
        if (!fs.existsSync(txtPath)) {
            fs.writeFileSync(txtPath, "Historial de mecanizados:\n\n", "utf8");
        }

        // Configuración EXACTA para fetch
        const fileContent = fs.readFileSync(txtPath);
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="historial_mecanizados.txt"');
        res.setHeader('Content-Length', fileContent.length);
        
        // ENVIAR COMO BUFFER - CLAVE PARA QUE FUNCIONE CON FETCH
        res.send(fileContent);

    } catch (error) {
        console.error("Error en descarga:", error);
        res.status(500).send("Error al generar el archivo");
    }
});


module.exports = router;