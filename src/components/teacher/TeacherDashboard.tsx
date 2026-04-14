import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, LogOut, Loader2 } from 'lucide-react';
import { StudentTable } from './StudentTable';
import { AssignmentPanel } from './AssignmentPanel';
import { getAllStudents } from '../../services/firestore';
import type { Student } from '../../types';

interface TeacherDashboardProps {
    onLogout: () => void;
}

export const TeacherDashboard = ({ onLogout }: TeacherDashboardProps) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await getAllStudents();
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch students', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStudents();
    }, []);

    const stats = [
        { label: 'Total Estudiantes', value: students.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Historias Asignadas', value: students.reduce((acc, s) => acc + s.assignedStories.length, 0), icon: BookOpen, color: 'bg-green-100 text-green-600' },
        { label: 'Promedio Clase', value: '85%', icon: Award, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-soft-gray p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal">Panel de Maestros</h1>
                        <p className="text-gray-500">Vista general de la clase</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold">Salir</span>
                    </button>
                </header>

                {/* Main Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="animate-spin text-ocean-blue mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Cargando datos de estudiantes...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <AssignmentPanel />
                        </div>

                        <div className="space-y-4 mt-8">
                            <h2 className="text-xl font-bold text-charcoal px-2">Estudiantes</h2>
                            <StudentTable students={students} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
