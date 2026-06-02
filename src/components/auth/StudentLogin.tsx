import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, EyeOff, TreePine, Rocket, Sun, Palette, ChevronDown, Waves, Leaf, BookOpen, Loader2 } from 'lucide-react';
import { getAllStudents } from '../../services/firestore';
import { BackgroundLayer } from '../ui/BackgroundLayer';
import type { BackgroundTheme } from '../ui/BackgroundLayer';
import type { Student } from '../../types';
import { studentMatchesSearch } from '../../utils/studentSearch';
import { BRAND_FILL_CLASS, BRAND_TEXT_CLASS, brandInlineBg, brandIconStyle } from '../../constants/brandColors';

interface StudentLoginProps {
    onLogin: (student: Student, theme: BackgroundTheme) => void;
}

export const StudentLogin = ({ onLogin }: StudentLoginProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('library');
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasEngagedWithThemes, setHasEngagedWithThemes] = useState(false);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await getAllStudents();
                setStudents(data);
            } catch (err) {
                console.error("Failed to load students", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return students.filter((student) =>
            studentMatchesSearch(student.name ?? '', searchTerm)
        );
    }, [searchTerm, students]);

    // #region agent log
    useEffect(() => {
        const probe = () => {
            const gradeEl = document.querySelector('[data-debug-ocean]') as HTMLElement | null;
            const temasEl = document.querySelector('[data-debug-temas]') as HTMLElement | null;
            const btnEl = document.querySelector('[data-debug-btn]') as HTMLElement | null;
            const payload = {
                sessionId: 'cbfc31',
                runId: 'post-fix-v2',
                location: 'StudentLogin.tsx:probe',
                message: 'computed CSS probe',
                data: {
                    gradeCircle_bgColor: gradeEl ? window.getComputedStyle(gradeEl).backgroundColor : 'no-el',
                    gradeCircle_classes: gradeEl?.className ?? 'no-el',
                    temas_bgColor: temasEl ? window.getComputedStyle(temasEl).backgroundColor : 'no-el',
                    temas_classes: temasEl?.className ?? 'no-el',
                    btn_bgColor: btnEl ? window.getComputedStyle(btnEl).backgroundColor : 'no-el',
                },
                timestamp: Date.now(),
                hypothesisId: 'A-B-D-E',
            };
            fetch('http://127.0.0.1:7623/ingest/d6025ec4-1902-461d-ae6d-4b4976ec2ce2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cbfc31' },
                body: JSON.stringify(payload),
            }).catch(() => {});
        };
        const t = setTimeout(probe, 600);
        return () => clearTimeout(t);
    }, [searchTerm, selectedStudent]);
    // #endregion

    const gradeLabels: Record<number, string> = {
        0: 'Cuenta de Prueba',
        1: 'Grado Primero',
        2: 'Grado Segundo',
        3: 'Grado Tercero',
        4: 'Grado Cuarto',
        5: 'Grado Quinto'
    };

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        setSearchTerm(student.name);
        setPassword('');
        setError(false);
        setHasEngagedWithThemes(false);
        setIsThemeMenuOpen(false);
        // Restore this student's previously chosen theme
        const savedTheme = localStorage.getItem(`theme_${student.id}`) as BackgroundTheme | null;
        if (savedTheme) {
            setCurrentTheme(savedTheme);
        } else {
            setCurrentTheme('library'); // Default for new students
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudent && password.toUpperCase() === selectedStudent.password) {
            onLogin(selectedStudent, currentTheme);
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            <BackgroundLayer theme={currentTheme} />

            {/* Theme Selector - Top Right dropdown (Only shown when student is selected) */}
            {selectedStudent && (
                <div className="absolute top-4 right-4 z-50">
                    <div className="relative flex flex-col items-end">
                        <div className="relative">
                        <motion.button
                            type="button"
                            data-debug-temas
                            style={brandInlineBg}
                            onClick={() => {
                                setHasEngagedWithThemes(true);
                                setIsThemeMenuOpen(!isThemeMenuOpen);
                            }}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white font-semibold font-poppins transition-colors ${BRAND_FILL_CLASS} ${!hasEngagedWithThemes
                                ? 'ring-2 ring-yellow-300/90 shadow-[0_0_20px_rgba(250,204,21,0.45)]'
                                : ''
                                }`}
                            animate={
                                !hasEngagedWithThemes
                                    ? { y: [0, -5, 0], scale: [1, 1.04, 1] }
                                    : { y: 0, scale: 1 }
                            }
                            transition={
                                !hasEngagedWithThemes
                                    ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                                    : { duration: 0.2 }
                            }
                        >
                            {!hasEngagedWithThemes && (
                                <motion.span
                                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[11px] font-bold text-amber-950 shadow-md"
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                                    aria-hidden
                                >
                                    !
                                </motion.span>
                            )}
                            <Palette size={20} className={!hasEngagedWithThemes ? 'animate-pulse' : ''} />
                            <span>Temas</span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-300 ${isThemeMenuOpen ? 'rotate-180' : ''} ${!hasEngagedWithThemes ? 'animate-bounce' : ''}`}
                            />
                        </motion.button>

                        <AnimatePresence>
                            {isThemeMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 z-10 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden py-2"
                                >
                                    {[
                                        { id: 'library', name: 'Biblioteca Mágica', icon: <BookOpen size={18} />, color: 'text-purple-600', bg: 'hover:bg-purple-50' },
                                        { id: 'forest', name: 'Bosque Encantado', icon: <TreePine size={18} />, color: 'text-green-600', bg: 'hover:bg-green-50' },
                                        { id: 'space', name: 'Viaje Espacial', icon: <Rocket size={18} />, color: 'text-indigo-600', bg: 'hover:bg-indigo-50' },
                                        { id: 'desert', name: 'Desierto Salvaje', icon: <Sun size={18} />, color: 'text-orange-600', bg: 'hover:bg-orange-50' },
                                        { id: 'underwater', name: 'Océano Profundo', icon: <Waves size={18} />, color: 'text-blue-600', bg: 'hover:bg-blue-50' },
                                        { id: 'jungle', name: 'Templo en la Jungla', icon: <Leaf size={18} />, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' }
                                    ].map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => {
                                                setCurrentTheme(theme.id as BackgroundTheme);
                                                setHasEngagedWithThemes(true);
                                                setIsThemeMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${theme.bg} ${currentTheme === theme.id ? 'bg-gray-100/50 font-bold' : 'font-medium'
                                                } text-charcoal font-poppins`}
                                        >
                                            <span className={theme.color}>{theme.icon}</span>
                                            {theme.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {!hasEngagedWithThemes && !isThemeMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    className="mt-2 mr-1 max-w-[220px] rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl border border-purple-200 text-charcoal relative"
                                >
                                    <div
                                        className="absolute -top-2 right-8 w-4 h-4 bg-white/95 border-l border-t border-purple-200 rotate-45"
                                        aria-hidden
                                    />
                                    <p className="text-sm font-semibold text-purple-800 leading-snug">
                                        ¡Elige tu tema de fondo! 🎨
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Toca <span className="font-bold">Temas</span> antes de entrar
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <motion.div
                className="w-full max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Greeting */}
                <motion.h1
                    className={`text-5xl md:text-6xl font-bold text-center mb-8 transition-all duration-500 ${currentTheme === 'library'
                        ? 'text-indigo-950 drop-shadow-[0_2px_10px_rgba(255,255,255,0.9)]'
                        : 'text-white'
                        }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    ¿Quién está leyendo?
                </motion.h1>

                {/* Main Content Area */}
                {!selectedStudent ? (
                    <>
                        {/* Search Input */}
                        <motion.div
                            className="relative mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal">
                                <Search data-debug-icon size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="Busca tu nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-14 pl-14 pr-4 rounded-2xl shadow-lg text-lg font-poppins focus:outline-none focus:ring-4 focus:ring-brand focus:ring-opacity-50 transition-all"
                                autoFocus
                            />
                        </motion.div>

                        {/* Student List */}
                        {searchTerm.trim().length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {isLoading ? (
                                    <div className="p-8 text-center text-charcoal flex flex-col items-center justify-center">
                                        <Loader2 className={`animate-spin mb-4 ${BRAND_TEXT_CLASS}`} style={brandIconStyle} size={32} />
                                        <p className="text-gray-500">Cargando estudiantes...</p>
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="p-8 text-center text-charcoal">
                                        <p className="text-xl">No se encontraron estudiantes</p>
                                        <p className="text-sm text-gray-500 mt-2">Intenta con otro nombre</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.05 },
                                            },
                                        }}
                                    >
                                        {filteredStudents.map((student, index) => (
                                            <motion.div
                                                key={student.id}
                                                variants={{
                                                    hidden: { opacity: 0, x: -20 },
                                                    show: { opacity: 1, x: 0 },
                                                }}
                                                whileHover={{ scale: 1.02, backgroundColor: '#F5F7FA' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleStudentSelect(student)}
                                                className={`p-4 cursor-pointer transition-colors ${index !== filteredStudents.length - 1 ? 'border-b border-light-gray' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-lg font-semibold text-charcoal">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{gradeLabels[student.grade] || `Grado ${student.grade}`}</p>
                                                    </div>
                                                    <div
                                                        data-debug-ocean
                                                        style={brandInlineBg}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${BRAND_FILL_CLASS}`}
                                                    >
                                                        {student.grade}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Password Prompt */
                    <motion.div
                        className="bg-white rounded-2xl shadow-lg p-8 relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <button
                            onClick={() => {
                                setSelectedStudent(null);
                                setPassword('');
                                setError(false);
                                setHasEngagedWithThemes(false);
                                setIsThemeMenuOpen(false);
                            }}
                            className="absolute top-4 left-4 text-gray-400 hover:text-charcoal"
                        >
                            &larr; Volver
                        </button>

                        <div className="text-center mt-6">
                            <h2 className="text-2xl font-bold text-charcoal mb-2">¡Hola, {selectedStudent.name.split(' ')[0]}!</h2>
                            <p className="text-gray-500 mb-6">Ingresa tu contraseña para continuar</p>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-4 relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(false);
                                        }}
                                        placeholder="······"
                                        className={`w-full text-center tracking-widest text-2xl h-14 rounded-xl border-2 focus:outline-none transition-colors uppercase pr-12 ${error ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand'
                                            }`}
                                        autoFocus
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                    </button>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm mb-4 animate-bounce">
                                        Contraseña incorrecta. ¡Intenta de nuevo!
                                    </p>
                                )}

                                <button
                                    data-debug-btn
                                    type="submit"
                                    style={brandInlineBg}
                                    className={`w-full h-14 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:opacity-90 ${BRAND_FILL_CLASS}`}
                                >
                                    ¡Vamos a leer!
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Teacher Access Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                onClick={() => window.dispatchEvent(new CustomEvent('teacher-login-request'))}
                className="absolute bottom-6 right-6 text-sm text-gray-400 hover:text-[rgb(147,51,234)] transition-colors font-medium flex items-center gap-2"
            >
                Acceso Maestros
            </motion.button>
        </div>
    );
};
