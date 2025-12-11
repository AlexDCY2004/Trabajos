import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Docente = sequelize.define(
    "Docente",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        departamento: { type: DataTypes.STRING(100), allowNull: false }
    },
    {
        tableName: "docentes", timestamps: false
    }
);