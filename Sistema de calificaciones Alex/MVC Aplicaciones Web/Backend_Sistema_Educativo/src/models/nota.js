import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Estudiante } from "./estudiante.js";
import { Asignatura } from "./asignatura.js";
import { Docente } from "./docente.js";

export const Nota = sequelize.define(
    "Nota",
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },

        estudianteId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        asignaturaId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        docenteId: { 
            type: DataTypes.INTEGER, 
            allowNull: true 
        },

        parcial: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: { 
                min: 1, 
                max: 3,
                isInt: { msg: "El parcial debe ser 1, 2 o 3" }
            }
        },

        tarea: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "La tarea debe ser un número entre 0 y 20" }
            }
        },
        informe: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "El informe debe ser un número entre 0 y 20" }
            }
        },
        leccion: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "La lección debe ser un número entre 0 y 20" }
            }
        },
        examen: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "El examen debe ser un número entre 0 y 20" }
            }
        },
        
        notaFinal: { 
            type: DataTypes.FLOAT, 
            allowNull: true,
        },

        estado: { 
            type: DataTypes.ENUM('aprobado', 'reprobado', 'pendiente'), 
            allowNull: false, 
            defaultValue: 'pendiente'
        },

        observaciones: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        },
        tipoEvaluacion: {
            type: DataTypes.ENUM('tarea', 'informe', 'leccion', 'examen', 'proyecto', 'participacion'),
            allowNull: true,
            defaultValue: 'examen'
        },
        fechaEvaluacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        docenteModifico: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ID del docente que realizó la última modificación"
        },
        fechaModificacion: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Fecha de la última modificación"
        },
        fecha: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        }
    },
    {
        tableName: "notas",
        timestamps: false,

        hooks: {
            beforeCreate: (nota) => {
                // Calcular nota final del parcial
                nota.notaFinal = calcularNotaFinal(
                    nota.tarea, 
                    nota.informe, 
                    nota.leccion, 
                    nota.examen
                );
                
                // Determinar estado del parcial
                nota.estado = nota.notaFinal >= 14 ? 'aprobado' : 'reprobado';
            },
            beforeUpdate: (nota) => {
                // Solo recalcular si cambió alguna evaluación
                if (nota.changed('tarea') || nota.changed('informe') || 
                    nota.changed('leccion') || nota.changed('examen')) {
                    
                    nota.notaFinal = calcularNotaFinal(
                        nota.tarea, 
                        nota.informe, 
                        nota.leccion, 
                        nota.examen
                    );
                    
                    nota.estado = nota.notaFinal >= 14 ? 'aprobado' : 'reprobado';
                }
            }
        }
    }
);

function calcularNotaFinal(tarea, informe, leccion, examen) {
    const notaTarea = parseFloat(tarea) * 0.20;    // 20%
    const notaInforme = parseFloat(informe) * 0.20; // 20%
    const notaLeccion = parseFloat(leccion) * 0.20; // 20%
    const notaExamen = parseFloat(examen) * 0.40;   // 40%
    
    return parseFloat((notaTarea + notaInforme + notaLeccion + notaExamen).toFixed(2));
}

// RELACIONES
Estudiante.hasMany(Nota, { 
    foreignKey: "estudianteId", 
    onDelete: "CASCADE" 
});
Nota.belongsTo(Estudiante, { 
    foreignKey: "estudianteId" 
});

Asignatura.hasMany(Nota, { 
    foreignKey: "asignaturaId", 
    onDelete: "CASCADE" 
});
Nota.belongsTo(Asignatura, { 
    foreignKey: "asignaturaId" 
});

Docente.hasMany(Nota, { 
    foreignKey: "docenteId", 
    onDelete: "SET NULL" 
});
Nota.belongsTo(Docente, { 
    foreignKey: "docenteId" 
});



