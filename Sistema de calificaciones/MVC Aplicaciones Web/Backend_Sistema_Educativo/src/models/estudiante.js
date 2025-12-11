import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Estudiante = sequelize.define(
    'Estudiante', //representa la tabla estudiantes
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nombre: {type: DataTypes.STRING(50), allowNull: false},
        carrera: {type: DataTypes.STRING(50), allowNull: false},
    },
    {
        tableName: 'estudiantes', timestamps: false //representa el nombre de la tabla en la base de datos
    }


);

