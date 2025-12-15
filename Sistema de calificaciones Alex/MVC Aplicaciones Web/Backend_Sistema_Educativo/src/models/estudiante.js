import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Curso } from "./curso.js";

export const Estudiante = sequelize.define(
    'Estudiante', //representa la tabla estudiantes
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
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
        fechaNacimiento: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: { msg: "Debe ser una fecha válida" },
                isNotFuture(value) {
                    if (value && new Date(value) > new Date()) {
                        throw new Error('La fecha de nacimiento no puede ser futura');
                    }
                },
                isReasonableAge(value) {
                    if (value) {
                        const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
                        if (age < 3 || age > 100) {
                            throw new Error('La edad debe estar entre 3 y 100 años');
                        }
                    }
                }
            }
        },
        foto: {type: DataTypes.TEXT, allowNull: true},
        estado: {type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo'},
        cursoId: { type: DataTypes.INTEGER, allowNull: true }, // FK hacia cursos
    },
    {
        tableName: 'estudiantes', timestamps: false //representa el nombre de la tabla en la base de datos
    }


);

// Relación: un Estudiante pertenece a un Curso
Estudiante.belongsTo(Curso, { foreignKey: 'cursoId' });
// Registrar la relación complementaria: un Curso tiene muchos Estudiantes
Curso.hasMany(Estudiante, { foreignKey: 'cursoId', onDelete: 'SET NULL' });

