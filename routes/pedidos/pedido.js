const express = require("express");
const router = express.Router();
const Pieza = require("../../models/Pieza"); // tu modelo Mongoose

const maquinas = {
    Inox_330: {
      ArmadoCantidadCategoria: [
        { pieza: "Brazo 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Cubrecuchilla 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Velero", cantidad: 1, categoria: "terminado" },
        { pieza: "Teletubi 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Cuchilla 330", cantidad: 1, categoria: "bruto" },
        { pieza: "Vela 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Planchada 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Varilla Brazo 330", cantidad: 1, categoria: "terminado" },
        { pieza: "Tapa Afilador", cantidad: 1, categoria: "terminado" },
        { pieza: "Tubo Manija", cantidad: 1, categoria: "terminado" },
        { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
        { pieza: "Cubre Motor Rectangulo", cantidad: 1, categoria: "bruto" },
        { pieza: "Cubre Motor Cuadrado", cantidad: 1, categoria: "bruto" },
        { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
        { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
        { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
        { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
        { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
        { pieza: "Base Afilador 330", cantidad: 1, categoria: "bruto" },
        { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
        { pieza: "Pinche Frontal", cantidad: 1, categoria: "bruto" },
        { pieza: "Pinche lateral", cantidad: 1, categoria: "bruto" },
        { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
        { pieza: "CabezalInox", cantidad: 1, categoria: "pulido" },
        { pieza: "BasePreArmada_Inox330", cantidad: 1, categoria: "terminado" },
      ],
      PreArmadoCantidadCategoria: [
        { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
        { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
        { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
        { pieza: "Patas", cantidad: 4, categoria: "bruto" },
        { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
        { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
        { pieza: "Cable 220w", cantidad: 1, categoria: "bruto" },
        { pieza: "Resorte Carro", cantidad: 2, categoria: "bruto" },
        { pieza: "Capacitores", cantidad: 1, categoria: "bruto" },
        { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
        { pieza: "Carros", cantidad: 1, categoria: "augeriado" },
        { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
        { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
        { pieza: "CajaMotor_330", cantidad: 1, categoria: "terminado" },
        { pieza: "baseInox330", cantidad: 1, categoria: "terminado" },
        { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
        { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
        { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
        { pieza: "Varilla 330", cantidad: 1, categoria: "soldador" },
      ],
      MotorCantidadCategoria: [
        { pieza: "Corona 330", cantidad: 1, categoria: "bruto" },
        { pieza: "Seguer", cantidad: 1, categoria: "bruto" },
        { pieza: "Sinfin", cantidad: 1, categoria: "bruto" },
        { pieza: "Motor 220w", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6005", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6205", cantidad: 2, categoria: "bruto" },
        { pieza: "Oring", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6000", cantidad: 1, categoria: "bruto" },
        { pieza: "Manchon", cantidad: 1, categoria: "torno" },
        { pieza: "Eje", cantidad: 1, categoria: "torno" },
        { pieza: "Caja 330", cantidad: 1, categoria: "terminado" },
      ],
    },
    Inox_300: {
      ArmadoCantidadCategoria: [
        { pieza: "Brazo 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Cubrecuchilla 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Velero", cantidad: 1, categoria: "terminado" },
        { pieza: "Teletubi 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Cuchilla 300", cantidad: 1, categoria: "bruto" },
        { pieza: "Vela 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Planchada 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Varilla Brazo 300", cantidad: 1, categoria: "terminado" },
        { pieza: "Tapa Afilador", cantidad: 1, categoria: "terminado" },
        { pieza: "Tubo Manija", cantidad: 1, categoria: "terminado" },
        { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
        { pieza: "BasePreArmada_Inox300", cantidad: 1, categoria: "terminado" },
        { pieza: "Cubre Motor Rectangulo", cantidad: 1, categoria: "bruto" },
        { pieza: "Cubre Motor Cuadrado", cantidad: 1, categoria: "bruto" },
        { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
        { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
        { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
        { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
        { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
        { pieza: "Base Afilador 300", cantidad: 1, categoria: "bruto" },
        { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
        { pieza: "Pinche Frontal", cantidad: 1, categoria: "bruto" },
        { pieza: "Pinche lateral", cantidad: 1, categoria: "bruto" },
        { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
        { pieza: "CabezalInox", cantidad: 1, categoria: "pulido" },
      ],
      PreArmadoCantidadCategoria: [
        { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
        { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
        { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
        { pieza: "Patas", cantidad: 4, categoria: "bruto" },
        { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
        { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
        { pieza: "Cable 220w", cantidad: 1, categoria: "bruto" },
        { pieza: "Resorte Carro", cantidad: 2, categoria: "bruto" },
        { pieza: "Capacitores", cantidad: 1, categoria: "bruto" },
        { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
        { pieza: "Carros", cantidad: 1, categoria: "augeriado" },
        { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
        { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
        { pieza: "CajaMotor_300", cantidad: 1, categoria: "terminado" },
        { pieza: "baseInox300", cantidad: 1, categoria: "terminado" },
        { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
        { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
        { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
        { pieza: "Varilla 300", cantidad: 1, categoria: "soldador" },
      ],
      MotorCantidadCategoria: [
        { pieza: "Corona 300", cantidad: 1, categoria: "bruto" },
        { pieza: "Seguer", cantidad: 1, categoria: "bruto" },
        { pieza: "Sinfin", cantidad: 1, categoria: "bruto" },
        { pieza: "Motor 220w", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6005", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6205", cantidad: 2, categoria: "bruto" }, // 🔁 Se descuenta de a 2
        { pieza: "Oring", cantidad: 1, categoria: "bruto" },
        { pieza: "Ruleman6000", cantidad: 1, categoria: "bruto" },
        { pieza: "Manchon", cantidad: 1, categoria: "torno" },
        { pieza: "Eje", cantidad: 1, categoria: "torno" },
        { pieza: "Caja 300", cantidad: 1, categoria: "terminado" },
      ],
    },
    Inox_250: {
        ArmadoCantidadCategoria: [
          { pieza: "Brazo 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Cubrecuchilla 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Velero", cantidad: 1, categoria: "terminado" },
          { pieza: "Teletubi 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Cuchilla 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Vela 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Planchada 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Varilla Brazo 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Tapa Afilador 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Tubo Manija 250", cantidad: 1, categoria: "terminado" },
          { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "BasePreArmada_Inox250", cantidad: 1, categoria: "terminado" },
          { pieza: "Cubre Motor Rectangulo", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Base Afilador 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche Frontal 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche lateral 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
          { pieza: "Cabezal250", cantidad: 1, categoria: "pulido" },
        ],
        PreArmadoCantidadCategoria: [
          { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
          { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
          { pieza: "Patas", cantidad: 4, categoria: "bruto" },
          { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
          { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
          { pieza: "Cable 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Capacitores 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
          { pieza: "Carros 250", cantidad: 1, categoria: "augeriado" },
          { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
          { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
          { pieza: "CajaMotor_250", cantidad: 1, categoria: "terminado" },
          { pieza: "baseInox250", cantidad: 1, categoria: "terminado" },
          { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
          { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
          { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
          { pieza: "Varilla 250", cantidad: 1, categoria: "soldador" },
        ],
        MotorCantidadCategoria: [
          { pieza: "Corona 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Seguer", cantidad: 1, categoria: "bruto" },
          { pieza: "Sinfin", cantidad: 1, categoria: "bruto" },
          { pieza: "Motor250 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6004", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6204", cantidad: 2, categoria: "bruto" },
          { pieza: "Oring", cantidad: 1, categoria: "bruto" },
          { pieza: "RulemanR6", cantidad: 1, categoria: "bruto" },
          { pieza: "Manchon 250", cantidad: 1, categoria: "torno" },
          { pieza: "Eje 250", cantidad: 1, categoria: "torno" },
          { pieza: "Caja 250", cantidad: 1, categoria: "terminado" },
        ],
    },
    Pintada_330: {
        ArmadoCantidadCategoria: [
          { pieza: "Brazo 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Cubrecuchilla 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Velero", cantidad: 1, categoria: "terminado" },
          { pieza: "Teletubi 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Cuchilla 330", cantidad: 1, categoria: "bruto" },
          { pieza: "Vela 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Planchada 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Varilla Brazo 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Tapa Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "Tubo Manija", cantidad: 1, categoria: "terminado" },
          { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "BasePreArmada_Pintada330",cantidad: 1,categoria: "terminado",},
          { pieza: "Cubre Motor Rectangulo", cantidad: 1, categoria: "bruto" },
          { pieza: "Cubre Motor Cuadrado", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Base Afilador 330", cantidad: 1, categoria: "bruto" },
          { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche Frontal", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche lateral", cantidad: 1, categoria: "bruto" },
          { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
          { pieza: "CabezalPintada", cantidad: 1, categoria: "terminado" },
        ],
        PreArmadoCantidadCategoria: [
          { pieza: "Bandeja 330", cantidad: 1, categoria: "bruto" },
          { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
          { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
          { pieza: "Patas", cantidad: 4, categoria: "bruto" },
          { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
          { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
          { pieza: "Cable 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Carro", cantidad: 2, categoria: "bruto" },
          { pieza: "Capacitores", cantidad: 1, categoria: "bruto" },
          { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
          { pieza: "Carros", cantidad: 1, categoria: "augeriado" },
          { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
          { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
          { pieza: "CajaMotor_330", cantidad: 1, categoria: "terminado" },
          { pieza: "basePintada330", cantidad: 1, categoria: "terminado" },
          { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
          { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
          { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
          { pieza: "Varilla 330", cantidad: 1, categoria: "soldador" },
        ],
        MotorCantidadCategoria: [
          { pieza: "Corona 330", cantidad: 1, categoria: "bruto" },
          { pieza: "Seguer", cantidad: 1, categoria: "bruto" },
          { pieza: "Sinfin", cantidad: 1, categoria: "bruto" },
          { pieza: "Motor 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6005", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6205", cantidad: 2, categoria: "bruto" },
          { pieza: "Oring", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6000", cantidad: 1, categoria: "bruto" },
          { pieza: "Manchon", cantidad: 1, categoria: "torno" },
          { pieza: "Eje", cantidad: 1, categoria: "torno" },
          { pieza: "Caja 330", cantidad: 1, categoria: "terminado" },
        ],
    },
    Pintada_300: {
        ArmadoCantidadCategoria: [
          { pieza: "Brazo 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Cubrecuchilla 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Velero", cantidad: 1, categoria: "terminado" },
          { pieza: "Teletubi 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Cuchilla 300", cantidad: 1, categoria: "bruto" },
          { pieza: "Vela 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Planchada 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Varilla Brazo 300", cantidad: 1, categoria: "terminado" },
          { pieza: "Tapa Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "Tubo Manija", cantidad: 1, categoria: "terminado" },
          { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "BasePreArmada_Pintada300",cantidad: 1,categoria: "terminado"},
          { pieza: "Cubre Motor Rectangulo", cantidad: 1, categoria: "bruto" },
          { pieza: "Cubre Motor Cuadrado", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Base Afilador 300", cantidad: 1, categoria: "bruto" },
          { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche Frontal", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche lateral", cantidad: 1, categoria: "bruto" },
          { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
          { pieza: "CabezalPintada", cantidad: 1, categoria: "terminado" },
        ],
        PreArmadoCantidadCategoria: [
          { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
          { pieza: "Bandeja 300", cantidad: 1, categoria: "bruto" },
          { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
          { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
          { pieza: "Patas", cantidad: 4, categoria: "bruto" },
          { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
          { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
          { pieza: "Cable 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Carro", cantidad: 2, categoria: "bruto" },
          { pieza: "Capacitores", cantidad: 1, categoria: "bruto" },
          { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
          { pieza: "Carros", cantidad: 1, categoria: "augeriado" },
          { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
          { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
          { pieza: "CajaMotor_300", cantidad: 1, categoria: "terminado" },
          { pieza: "basePintada300", cantidad: 1, categoria: "terminado" },
          { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
          { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
          { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
          { pieza: "Varilla 300", cantidad: 1, categoria: "soldador" },
        ],
        MotorCantidadCategoria: [
          { pieza: "Corona 300", cantidad: 1, categoria: "bruto" },
          { pieza: "Seguer", cantidad: 1, categoria: "bruto" },
          { pieza: "Sinfin", cantidad: 1, categoria: "bruto" },
          { pieza: "Motor 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6005", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6205", cantidad: 2, categoria: "bruto" },
          { pieza: "Oring", cantidad: 1, categoria: "bruto" },
          { pieza: "Ruleman6000", cantidad: 1, categoria: "bruto" },
          { pieza: "Manchon", cantidad: 1, categoria: "torno" },
          { pieza: "Eje", cantidad: 1, categoria: "torno" },
          { pieza: "Caja 300", cantidad: 1, categoria: "terminado" },
        ],
    },
    Inox_ECO: {
        ArmadoCantidadCategoria: [
          { pieza: "Brazo 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Cubrecuchilla 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Velero", cantidad: 1, categoria: "terminado" },
          { pieza: "Cuchilla 330", cantidad: 1, categoria: "bruto" },
          { pieza: "Vela 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Planchada 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Varilla Brazo 330", cantidad: 1, categoria: "terminado" },
          { pieza: "Tubo Manija", cantidad: 1, categoria: "terminado" },
          { pieza: "Afilador", cantidad: 1, categoria: "terminado" },
          { pieza: "BasePreArmada_InoxECO", cantidad: 1, categoria: "terminado" },
          { pieza: "Tapa Afilador Eco", cantidad: 1, categoria: "terminado" },
          { pieza: "Teletubi Eco", cantidad: 1, categoria: "terminado" },
          { pieza: "Perilla Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Brazo", cantidad: 1, categoria: "bruto" },
          { pieza: "Pipas", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Cubrecuchilla", cantidad: 2, categoria: "bruto" },
          { pieza: "Perilla Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Base Afilador 250", cantidad: 1, categoria: "bruto" },
          { pieza: "Piedra Afilador", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche Frontal", cantidad: 1, categoria: "bruto" },
          { pieza: "Pinche lateral", cantidad: 1, categoria: "bruto" },
          { pieza: "Pitito Teletubi Eco", cantidad: 1, categoria: "bruto" },
          { pieza: "Cuadrado Regulador", cantidad: 1, categoria: "soldador" },
          { pieza: "CabezalInox", cantidad: 1, categoria: "pulido" },
        ],
        PreArmadoCantidadCategoria: [
          { pieza: "Espiral", cantidad: 1, categoria: "bruto" },
          { pieza: "Tapita Perilla", cantidad: 1, categoria: "bruto" },
          { pieza: "Cable Eco 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Patas", cantidad: 4, categoria: "bruto" },
          { pieza: "Perilla Numerador", cantidad: 1, categoria: "bruto" },
          { pieza: "Resorte Carro", cantidad: 2, categoria: "bruto" },
          { pieza: "Resorte Movimiento", cantidad: 1, categoria: "bruto" },
          { pieza: "baseInoxECO", cantidad: 1, categoria: "terminado" },
          { pieza: "Aro Numerador", cantidad: 1, categoria: "terminado" },
          { pieza: "Eje Rectificado", cantidad: 1, categoria: "terminado" },
          { pieza: "CajaMotor_ECO", cantidad: 1, categoria: "terminado" },
          { pieza: "Rueditas", cantidad: 4, categoria: "torno" },
          { pieza: "Movimiento", cantidad: 1, categoria: "augeriado" },
          { pieza: "Carros", cantidad: 1, categoria: "augeriado" },
          { pieza: "Guia U", cantidad: 1, categoria: "balancin" },
          { pieza: "Tornillo guia", cantidad: 1, categoria: "torno" },
          { pieza: "Varilla 330", cantidad: 1, categoria: "soldador" },
        ],
        MotorCantidadCategoria: [
          { pieza: "Polea Grande", cantidad: 1, categoria: "bruto" },
          { pieza: "Polea Chica", cantidad: 1, categoria: "bruto" },
          { pieza: "Tecla", cantidad: 1, categoria: "bruto" },
          { pieza: "Capacitores", cantidad: 1, categoria: "bruto" },
          { pieza: "Conector Hembra", cantidad: 1, categoria: "bruto" },
          { pieza: "Cable Corto Eco", cantidad: 1, categoria: "bruto" },
          { pieza: "Motor ECO 220w", cantidad: 1, categoria: "bruto" },
          { pieza: "Tapa Correa Eco", cantidad: 1, categoria: "bruto" },
          { pieza: "Correa Eco", cantidad: 1, categoria: "bruto" },
          { pieza: "Capuchon Motor Dodo", cantidad: 1, categoria: "bruto" },
          { pieza: "Rectangulo Plastico Eco", cantidad: 1, categoria: "bruto" },
          { pieza: "Ventilador Motor", cantidad: 1, categoria: "bruto" },
          { pieza: "Caja Soldada Eco", cantidad: 1, categoria: "terminado" },
          { pieza: "Tornillo Teletubi Eco", cantidad: 2, categoria: "augeriado" },
          { pieza: "Buje Eje Eco", cantidad: 1, categoria: "torno" },
        ],
    }
}


router.post("/", async (req, res) => {
    try {
      // 1. Extraer cantidades del pedido
      const cantidades = {
        Inox_330: Number(req.body.Inox_330) || 0,
        Inox_300: Number(req.body.Inox_300) || 0,
        Inox_250: Number(req.body.Inox_250) || 0,
        Pintada_330: Number(req.body.Pintada_330) || 0,
        Pintada_300: Number(req.body.Pintada_300) || 0,
        Inox_ECO: Number(req.body.Inox_ECO) || 0
      };
  
      // 2. Validar que haya al menos una cantidad > 0
      if (Object.values(cantidades).every(v => v <= 0)) {
        return res.status(400).json({ error: "No se recibieron cantidades válidas" });
      }
  
      // 3. Sumar todas las piezas requeridas
      const piezasRequeridas = {};
      Object.entries(cantidades).forEach(([modelo, cantidad]) => {
        if (cantidad <= 0) return;
  
        const secciones = [
          ...(maquinas[modelo]?.ArmadoCantidadCategoria || []),
          ...(maquinas[modelo]?.PreArmadoCantidadCategoria || []),
          ...(maquinas[modelo]?.MotorCantidadCategoria || [])
        ];
  
        secciones.forEach(({ pieza, cantidad: cantidadPorMaquina, categoria }) => {
          const clave = `${pieza}||${categoria}`;
          if (!piezasRequeridas[clave]) {
            piezasRequeridas[clave] = {
              pieza,
              categoria,
              requerido: 0,
            };
          }
          piezasRequeridas[clave].requerido += cantidadPorMaquina * cantidad;
        });
      });
  
      // 4. Consultar el stock disponible para cada pieza
      const piezasDB = await Pieza.find({
        $or: Object.keys(piezasRequeridas).map(clave => {
          const [nombre, categoria] = clave.split("||");
          return { nombre, [`cantidad.${categoria}.cantidad`]: { $exists: true } };
        })
      }).lean();
  
      const stockMap = new Map();
      piezasDB.forEach(p => {
        Object.entries(p.cantidad).forEach(([cat, { cantidad }]) => {
          stockMap.set(`${p.nombre}||${cat}`, cantidad);
        });
      });
  

    // 5. Filtrar solo piezas con faltantes > 0
    const piezasConFaltantes = Object.values(piezasRequeridas)
      .map(p => {
        const clave = `${p.pieza}||${p.categoria}`;
        const disponible = stockMap.get(clave) || 0;
        return {
          ...p,
          disponible,
          faltan: Math.max(p.requerido - disponible, 0)
        };
      })
      .filter(p => p.faltan > 0)  // <- Filtramos aquí
      .sort((a, b) => a.pieza.localeCompare(b.pieza));

    // 6. Enviar respuesta
    return res.json({
      success: true,
      pedido: cantidades,
      piezasFaltantes: piezasConFaltantes ,
      maquinas: maquinas  // <- Cambiamos el nombre a "piezasFaltantes"
    });

// ... (código posterior)
  
    } catch (err) {
      console.error("Error en /api/granPedido:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor"
      });
    }
  });
  
  module.exports = router;