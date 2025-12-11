import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Estudiante } from "./estudiante.js";

export const Nota = sequelize.define(
    "Nota", //representa la tabla notas
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        //asignatura: {type: DataTypes.STRING(100), allowNull: false},
        asignaturaId: { type: DataTypes.INTEGER, allowNull: false },
        nota1: {type: DataTypes.FLOAT, allowNull: false, validate: {min: 0, max: 20}},
        nota2: {type: DataTypes.FLOAT, allowNull: false, validate: {min: 0, max: 20}},
        nota3: {type: DataTypes.FLOAT, allowNull: false, validate: {min: 0, max: 20}},
        promedio: {type: DataTypes.FLOAT, allowNull: false},
        categoria: {type: DataTypes.STRING(50), allowNull: false},

    },
    {
        tableName: "notas", timestamps: false //representa el nombre de la tabla en la base de datos
    }
);

    Estudiante.hasMany(Nota, {foreignKey: "estudianteId", onDelete: "CASCADE"}); //cascade sirve para que al eliminar un estudiante se eliminen sus notas
    Nota.belongsTo(Estudiante, {foreignKey: "estudianteId"});
    //has many: un estudiante tiene muchas notas
    //belongs to: una nota pertenece a un estudiante



