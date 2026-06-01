import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Search, X, BookOpen, Star, CheckCircle, Clock, Trash2, AlertTriangle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHourglassHalf, faStar } from '@fortawesome/free-solid-svg-icons';
import type { Student } from '../../types';
import { getStudentProgress, resetStudentData, deleteStudent } from '../../services/firestore';
import type { Progress } from '../../types';
import storiesData from '../../data/stories.json';

interface StudentTableProps {
    students: Student[];
}

const GRADE_FILTER_OPTIONS: { value: number | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 1, label: 'Grado Primero' },
    { value: 2, label: 'Grado Segundo' },
    { value: 3, label: 'Grado Tercero' },
    { value: 4, label: 'Grado Cuarto' },
    { value: 5, label: 'Grado Quinto' },
    { value: 0, label: 'Cuenta de Prueba' },
];

export const StudentTable = ({ students }: StudentTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
    const [showPassword, setShowPassword] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        key: 'name' | 'grade';
        direction: 'asc' | 'desc';
    }>({ key: 'name', direction: 'asc' });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Reset states
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter and Sort Logic
    const filteredAndSortedStudents = [...students]
        .filter((student) => {
            const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
            return matchesName && matchesGrade;
        })
        .sort((a, b) => {
            if (sortConfig.key === 'name') {
                return sortConfig.direction === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else {
                return sortConfig.direction === 'asc'
                    ? a.grade - b.grade
                    : b.grade - a.grade;
            }
        });

    const handleSort = (key: 'name' | 'grade') => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleViewDetails = async (student: Student) => {
        setSelectedStudent(student);
        setShowPassword(false);
        setLoadingProgress(true);
        setShowResetConfirm(false);
        try {
            const progress = await getStudentProgress(student.id);
            setStudentProgress(progress);
        } catch (err) {
            console.error('Failed to load progress:', err);
            setStudentProgress([]);
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleCloseDetails = () => {
        setSelectedStudent(null);
        setStudentProgress([]);
        setShowResetConfirm(false);
        setShowDeleteConfirm(false);
        setShowPassword(false);
    };

    const handleResetData = async () => {
        if (!selectedStudent) return;
        setIsResetting(true);
        try {
            await resetStudentData(selectedStudent.id);
            // Refresh local state to show zero points and empty read history
            setSelectedStudent({ ...selectedStudent, points: 0 });
            setStudentProgress([]);
            setShowResetConfirm(false);

            // Also need to let parent components know if it affects the main list
            // For now, next page reload or closing/opening dashboard will fetch fresh
        } catch (err) {
            console.error('Failed to reset data:', err);
        } finally {
            setIsResetting(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;
        setIsDeleting(true);
        try {
            await deleteStudent(selectedStudent.id);
            setShowDeleteConfirm(false);
            setSelectedStudent(null);
            // Simple page reload to refresh the student list
            window.location.reload();
        } catch (err) {
            console.error('Failed to delete student:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const SortIcon = ({ column }: { column: 'name' | 'grade' }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
    };

    const statusLabel = (status: string) => {
        if (status === 'completed') return {
            text: 'Completado',
            icon: faCheck,
            color: 'bg-green-100 text-green-700'
        };
        if (status === 'in-progress') return {
            text: 'En progreso',
            icon: faHourglassHalf,
            color: 'bg-yellow-100 text-yellow-700'
        };
        if (status === 'new') return {
            text: 'Nuevo',
            icon: faStar,
            color: 'bg-blue-100 text-blue-700'
        };
        return { text: status, icon: null, color: 'bg-gray-100 text-gray-600' };
    };

    const getStoryTitle = (storyId: string) => {
        const story = (storiesData as any[]).find(s => s.id === storyId);
        return story ? story.title : storyId;
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search & grade filters */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ocean-blue/20 focus:border-ocean-blue transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {GRADE_FILTER_OPTIONS.map((option) => {
                            const isActive = gradeFilter === option.value;
                            const count =
                                option.value === 'all'
                                    ? students.length
                                    : students.filter((s) => s.grade === option.value).length;
                            return (
                                <button
                                    key={String(option.value)}
                                    type="button"
                                    onClick={() => setGradeFilter(option.value)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${isActive
                                        ? 'bg-ocean-blue text-white border-ocean-blue shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                    <span className={`ml-1.5 text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                                        ({count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {(searchTerm || gradeFilter !== 'all') && (
                        <p className="text-sm text-gray-500">
                            Mostrando {filteredAndSortedStudents.length} de {students.length} estudiantes
                        </p>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th onClick={() => handleSort('name')} className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                    <div className="flex items-center gap-2">Nombre <SortIcon column="name" /></div>
                                </th>
                                <th onClick={() => handleSort('grade')} className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                    <div className="flex items-center gap-2">Grado <SortIcon column="grade" /></div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Historias Asignadas</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAndSortedStudents.map((student) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-charcoal">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-ocean-blue text-white flex items-center justify-center text-xs font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-600">
                                            {student.grade === 0 ? 'Prueba' : `Grado ${student.grade}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {student.assignedStories.length} historias
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewDetails(student)}
                                            className="text-sm font-medium text-ocean-blue hover:underline"
                                        >
                                            Ver detalles
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No se encontraron estudiantes</div>
                )}
            </div>

            {/* Student Detail Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div
                        key="detail-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseDetails}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 relative flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button onClick={handleCloseDetails} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors">
                                <X size={24} />
                            </button>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pr-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-ocean-blue text-white flex items-center justify-center text-xl font-bold shrink-0">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-charcoal leading-tight">{selectedStudent.name}</h2>
                                        <p className="text-gray-500">{selectedStudent.grade === 0 ? 'Prueba' : `Grado ${selectedStudent.grade}`} · {selectedStudent.points || 0} puntos</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => { setShowResetConfirm(true); setShowDeleteConfirm(false); }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition-colors font-medium border border-transparent hover:border-orange-100"
                                        title="Borrar progreso y puntos pero mantener el estudiante"
                                    >
                                        <Trash2 size={16} />
                                        <span className="hidden sm:inline">Resetear</span>
                                    </button>
                                    <button
                                        onClick={() => { setShowDeleteConfirm(true); setShowResetConfirm(false); }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                                        title="Eliminar estudiante y todos sus datos"
                                    >
                                        <X size={16} className="bg-red-500 text-white rounded-full p-0.5" />
                                        <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Reset & Delete Confirmation Inline Banners */}
                            <AnimatePresence>
                                {showResetConfirm && (
                                    <motion.div
                                        key="reset-confirm"
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3 text-orange-800">
                                                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-bold">¿Resetear datos del estudiante?</p>
                                                    <p className="opacity-90">Esto reiniciará los puntos a 0 y borrará el historial de lectura.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setShowResetConfirm(false)}
                                                    disabled={isResetting}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleResetData}
                                                    disabled={isResetting}
                                                    className="px-4 py-1.5 text-sm font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isResetting ? 'Borrando...' : 'Sí, resetear'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {showDeleteConfirm && (
                                    <motion.div
                                        key="delete-confirm"
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3 text-red-800">
                                                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-bold">¿Eliminar estudiante por completo?</p>
                                                    <p className="opacity-90">Esta acción borrará todos sus datos y removerá al estudiante de la lista. Es irreversible.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    disabled={isDeleting}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleDeleteStudent}
                                                    disabled={isDeleting}
                                                    className="px-4 py-1.5 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Account password */}
                            <div className="mb-6 shrink-0 rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 text-charcoal font-semibold text-sm">
                                        <KeyRound size={18} className="text-ocean-blue" />
                                        Contraseña de acceso
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="flex items-center gap-1.5 text-sm font-medium text-ocean-blue hover:text-ocean-blue/80 transition-colors"
                                    >
                                        {showPassword ? (
                                            <>
                                                <EyeOff size={16} />
                                                Ocultar
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={16} />
                                                Mostrar
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p
                                    className={`font-mono text-lg tracking-widest rounded-xl px-4 py-3 border transition-all ${showPassword
                                        ? 'bg-white border-ocean-blue/30 text-charcoal'
                                        : 'bg-gray-100 border-gray-200 text-transparent select-none'
                                        }`}
                                    aria-label={showPassword ? `Contraseña: ${selectedStudent.password}` : 'Contraseña oculta'}
                                >
                                    {showPassword
                                        ? selectedStudent.password
                                        : '••••••'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    El estudiante usa esta contraseña al iniciar sesión en la app.
                                </p>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <CheckCircle size={20} className="mx-auto text-green-500 mb-1" />
                                    <p className="text-2xl font-bold text-green-700">{studentProgress.filter(p => p.completed).length}</p>
                                    <p className="text-xs text-green-600">Completadas</p>
                                </div>
                                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                                    <Clock size={20} className="mx-auto text-yellow-500 mb-1" />
                                    <p className="text-2xl font-bold text-yellow-700">{studentProgress.filter(p => p.status === 'in-progress').length}</p>
                                    <p className="text-xs text-yellow-600">En progreso</p>
                                </div>
                                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                                    <Star size={20} className="mx-auto text-purple-500 mb-1" />
                                    <p className="text-2xl font-bold text-purple-700">{selectedStudent.points || 0}</p>
                                    <p className="text-xs text-purple-600">Puntos</p>
                                </div>
                            </div>

                            {/* Progress List */}
                            <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2 shrink-0">
                                <BookOpen size={18} /> Actividad de Lectura
                            </h3>
                            {loadingProgress ? (
                                <p className="text-gray-400 text-center py-4">Cargando...</p>
                            ) : studentProgress.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Sin actividad registrada aún</p>
                            ) : (
                                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex-1">
                                    {studentProgress.map((p) => {
                                        const st = statusLabel(p.status || 'new');
                                        return (
                                            <div key={p.storyId} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <span className="text-sm text-charcoal font-medium truncate max-w-[60%]">
                                                    {getStoryTitle(p.storyId)}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${st.color}`}>
                                                        {st.icon && <FontAwesomeIcon icon={st.icon} className="text-[10px]" />}
                                                        {st.text}
                                                    </span>
                                                    {p.pointsEarned ? <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">+{p.pointsEarned}pts</span> : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
