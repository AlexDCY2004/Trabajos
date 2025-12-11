import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Asignatura } from "./asignatura.js";

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

// Relaciones
Docente.hasMany(Asignatura, { foreignKey: "docenteId", onDelete: "SET NULL" });
Asignatura.belongsTo(Docente, { foreignKey: "docenteId", onDelete: "SET NULL" });