import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Docente } from "./docente.js";

export const Asignatura = sequelize.define(
    'Asignatura', //representa la tabla asignaturas
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nombre: {
            type: DataTypes.STRING(50), 
            allowNull: false,
            set(value) { this.setDataValue('nombre', value?.trim()); },
            validate: {
                notEmpty: { msg: "El nombre no puede estar vacío" },
                notNull: { msg: "El nombre es obligatorio" },
                len: {
                    args: [3, 50],
                    msg: "El nombre debe tener entre 3 y 50 caracteres"
                }
            }
        },
        codigo: {
            type: DataTypes.STRING(10), 
            allowNull: false, 
            unique: true,
            set(value) { this.setDataValue('codigo', value?.trim().toUpperCase()); },
            validate: {
                notEmpty: { msg: "El código no puede estar vacío" },
                notNull: { msg: "El código es obligatorio" },
                len: {
                    args: [2, 10],
                    msg: "El código debe tener entre 2 y 10 caracteres"
                },
                is: {
                    args: /^[A-Z0-9\-]+$/,
                    msg: "El código solo puede contener letras mayúsculas, números y guiones"
                }
            }
        },
        creditos: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
                notNull: { msg: "Los créditos son obligatorios" },
                isInt: { msg: "Los créditos deben ser un número entero" },
                min: {
                    args: 1,
                    msg: "Los créditos deben ser al menos 1"
                },
                max: {
                    args: 10,
                    msg: "Los créditos no pueden exceder 10"
                }
            }
        },
        docenteId: { type: DataTypes.INTEGER, allowNull: true } 
    },
    {
        tableName: 'asignaturas', timestamps: false //representa el nombre de la tabla en la base de datos
    }
);

// Asociación local para evitar imports circulares
Asignatura.belongsTo(Docente, { foreignKey: 'docenteId', onDelete: 'SET NULL' });