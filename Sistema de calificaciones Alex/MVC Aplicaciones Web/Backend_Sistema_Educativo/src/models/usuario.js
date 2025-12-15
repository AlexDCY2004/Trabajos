import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Usuario = sequelize.define(
    'Usuario',
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            set(value) { this.setDataValue('username', value?.trim().toLowerCase()); },
            validate: {
                notEmpty: { msg: "El usuario no puede estar vacío" },
                len: {
                    args: [3, 50],
                    msg: "El usuario debe tener entre 3 y 50 caracteres"
                },
                is: {
                    args: /^[a-z0-9_\-]+$/,
                    msg: "El usuario solo puede contener letras minúsculas, números, guiones y guiones bajos"
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: { msg: "La contraseña no puede estar vacía" },
                len: {
                    args: [6, 255],
                    msg: "La contraseña debe tener al menos 6 caracteres"
                }
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            set(value) { this.setDataValue('email', value?.trim().toLowerCase()); },
            validate: {
                isEmail: { msg: "El formato del email no es válido" },
                notEmpty: { msg: "El email no puede estar vacío" }
            }
        },
        rol: {
            type: DataTypes.ENUM('admin', 'docente', 'estudiante'),
            allowNull: false,
            defaultValue: 'estudiante'
        },
        estado: {
            type: DataTypes.ENUM('activo', 'inactivo'),
            allowNull: false,
            defaultValue: 'activo'
        }
    },
    {
        tableName: 'usuarios',
        timestamps: false
    }
);
