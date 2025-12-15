import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Docente = sequelize.define(
    "Docente",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        cedula: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            set(value) { this.setDataValue('cedula', value?.trim()); },
            validate: {
                notEmpty: { msg: "La cédula no puede estar vacía" },
                notNull: { msg: "La cédula es obligatoria" },
                len: {
                       args: [11, 11],
                       msg: "La cédula debe tener exactamente 11 dígitos"
                },
                is: {
                    args: /^[0-9]+$/,
                    msg: "La cédula solo puede contener números"
                }
            }
        },
        email: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            validate: { 
                isEmail: { msg: "El formato del email no es válido" }
            } 
        },
        telefono: { 
            type: DataTypes.STRING(20), 
            allowNull: true,
            validate: {
                is: {
                    args: /^[0-9+\-\s()]*$/,
                    msg: "El teléfono solo puede contener números, +, -, espacios y paréntesis"
                },
                len: {
                    args: [7, 20],
                    msg: "El teléfono debe tener entre 7 y 20 caracteres"
                }
            }
        },
        direccion: { 
            type: DataTypes.STRING(200), 
            allowNull: true,
            validate: {
                len: {
                    args: [0, 200],
                    msg: "La dirección no puede exceder 200 caracteres"
                }
            }
        },
        fechaContratacion: { 
            type: DataTypes.DATE, 
            allowNull: true,
            validate: {
                isDate: { msg: "Debe ser una fecha válida" },
                isNotFuture(value) {
                    if (value && new Date(value) > new Date()) {
                        throw new Error('La fecha de contratación no puede ser futura');
                    }
                }
            }
        },
        especialidad: { 
            type: DataTypes.STRING(100), 
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: "La especialidad no puede exceder 100 caracteres"
                }
            }
        },
        horasLaborales: { 
            type: DataTypes.STRING(100), 
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: "Las horas laborales no pueden exceder 100 caracteres"
                }
            }
        },
        departamento: { 
            type: DataTypes.STRING(100), 
            allowNull: false,
            set(value) { this.setDataValue('departamento', value?.trim()); },
            validate: {
                notEmpty: { msg: "El departamento no puede estar vacío" },
                notNull: { msg: "El departamento es obligatorio" },
                len: {
                    args: [2, 100],
                    msg: "El departamento debe tener entre 2 y 100 caracteres"
                }
            }
        }
    },
    {
        tableName: "docentes", timestamps: false
    }
);