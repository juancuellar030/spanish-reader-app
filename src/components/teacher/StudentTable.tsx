import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  BRAND_PRIMARY,
  STAT_ICON_TILE,
  STAT_CARD,
  ICON_BRAND,
  brandIconStyle,
} from "../../constants/brandColors";
import { studentMatchesSearch } from "../../utils/studentSearch";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Search,
  X,
  BookOpen,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Settings,
  RotateCcw,
  UserX,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import type { Student } from "../../types";
import {
  getStudentProgress,
  resetStudentData,
  deleteStudent,
} from "../../services/firestore";
import type { Progress } from "../../types";
import storiesData from "../../data/stories.json";

interface StudentTableProps {
  students: Student[];
}

const GRADE_FILTER_OPTIONS: { value: number | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: 1, label: "Grado Primero" },
  { value: 2, label: "Grado Segundo" },
  { value: 3, label: "Grado Tercero" },
  { value: 4, label: "Grado Cuarto" },
  { value: 5, label: "Grado Quinto" },
  { value: 0, label: "Cuenta de Prueba" },
];

export const StudentTable = ({ students }: StudentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [showPassword, setShowPassword] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "grade";
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!selectedStudent) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedStudent]);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Reset states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter and Sort Logic
  const filteredAndSortedStudents = [...students]
    .filter((student) => {
      const matchesName = studentMatchesSearch(student.name ?? "", searchTerm);
      const studentGrade = Number(student.grade);
      const matchesGrade =
        gradeFilter === "all" || studentGrade === gradeFilter;
      return matchesName && matchesGrade;
    })
    .sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortConfig.direction === "asc"
          ? a.grade - b.grade
          : b.grade - a.grade;
      }
    });

  const handleSort = (key: "name" | "grade") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleViewDetails = async (student: Student) => {
    setSelectedStudent(student);
    setShowPassword(false);
    setShowSettings(false);
    setLoadingProgress(true);
    setShowResetConfirm(false);
    try {
      const progress = await getStudentProgress(student.id);
      setStudentProgress(progress);
    } catch (err) {
      console.error("Failed to load progress:", err);
      setStudentProgress([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    const handleViewStudentDetailsEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Student>;
      if (customEvent.detail) {
        handleViewDetails(customEvent.detail);
      }
    };

    window.addEventListener(
      "view-student-details",
      handleViewStudentDetailsEvent,
    );

    return () => {
      window.removeEventListener(
        "view-student-details",
        handleViewStudentDetailsEvent,
      );
    };
  }, []);

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setStudentProgress([]);
    setShowResetConfirm(false);
    setShowDeleteConfirm(false);
    setShowPassword(false);
    setShowSettings(false);
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
      console.error("Failed to reset data:", err);
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
      console.error("Failed to delete student:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const SortIcon = ({ column }: { column: "name" | "grade" }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const statusLabel = (status: string) => {
    if (status === "completed")
      return {
        text: "Completado",
        icon: faCheck,
        useLucideStar: false,
        color: "bg-green-100 text-green-700",
        textColor: undefined as string | undefined,
      };
    if (status === "in-progress")
      return {
        text: "En progreso",
        icon: faHourglassHalf,
        useLucideStar: false,
        color: "bg-yellow-100 text-yellow-700",
        textColor: undefined as string | undefined,
      };
    if (status === "new")
      return {
        text: "Nuevo",
        icon: null,
        useLucideStar: true,
        color: "bg-purple-100",
        textColor: BRAND_PRIMARY,
      };
    return {
      text: status,
      icon: null,
      useLucideStar: false,
      color: "bg-gray-100 text-gray-600",
      textColor: undefined,
    };
  };

  const assignedStoryCards = useMemo(() => {
    if (!selectedStudent) return [];
    const stories = storiesData as {
      id: string;
      title: string;
      coverImage: string;
      type?: string;
    }[];
    return (selectedStudent.assignedStories ?? []).map((storyId) => {
      const story = stories.find((s) => s.id === storyId);
      const progress = studentProgress.find((p) => p.storyId === storyId);
      const status =
        progress?.status ??
        (progress?.completed ? "completed" : progress ? "in-progress" : "new");
      return { storyId, story, progress, status };
    });
  }, [selectedStudent, studentProgress]);

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search & grade filters */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {GRADE_FILTER_OPTIONS.map((option) => {
              const isActive = gradeFilter === option.value;
              const count =
                option.value === "all"
                  ? students.length
                  : students.filter((s) => s.grade === option.value).length;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setGradeFilter(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-brand text-white border-brand shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: BRAND_PRIMARY,
                          borderColor: BRAND_PRIMARY,
                        }
                      : undefined
                  }
                >
                  {option.label}
                  <span
                    className={`ml-1.5 text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
          {(searchTerm || gradeFilter !== "all") && (
            <p className="text-sm text-gray-500">
              Mostrando {filteredAndSortedStudents.length} de {students.length}{" "}
              estudiantes
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Nombre <SortIcon column="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("grade")}
                  className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Grado <SortIcon column="grade" />
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Historias Asignadas
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                  Acciones
                </th>
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
                      <div
                        className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: BRAND_PRIMARY }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-600">
                      {student.grade === 0
                        ? "Prueba"
                        : `Grado ${student.grade}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.assignedStories?.length ?? 0} historias
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="text-sm font-medium text-brand hover:underline"
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
          <div className="p-8 text-center text-gray-500">
            No se encontraron estudiantes
          </div>
        )}
      </div>

      {/* Student Detail Modal — portaled so overlay covers full viewport */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                key="detail-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-0 left-0 z-[200] flex min-h-[100dvh] h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-6"
                onClick={handleCloseDetails}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative my-auto flex w-full max-w-xl flex-col rounded-3xl bg-white p-6 shadow-2xl sm:max-w-2xl sm:p-8 lg:max-w-3xl max-h-[min(90dvh,900px)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header actions */}
                  <div className="absolute top-5 right-5 z-40 flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSettings((v) => !v);
                          setShowResetConfirm(false);
                          setShowDeleteConfirm(false);
                        }}
                        className={`p-2 rounded-xl transition-colors ${showSettings ? "bg-purple-100" : "text-gray-400 hover:bg-gray-100 hover:text-charcoal"}`}
                        style={
                          showSettings ? { color: BRAND_PRIMARY } : undefined
                        }
                        aria-label="Configuración del estudiante"
                        aria-expanded={showSettings}
                      >
                        <Settings size={22} strokeWidth={2} />
                      </button>

                      {/* Settings dropdown menu */}
                      <AnimatePresence>
                        {showSettings && (
                          <>
                            <div
                              className="fixed inset-0 z-0"
                              onClick={() => {
                                setShowSettings(false);
                                setShowResetConfirm(false);
                                setShowDeleteConfirm(false);
                              }}
                              aria-hidden
                            />
                            <motion.div
                              key="settings-menu"
                              initial={{ opacity: 0, y: -8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-2 z-10 w-[20rem] sm:w-[24rem] max-h-[70vh] overflow-y-auto custom-scrollbar rounded-2xl border border-gray-100 bg-white shadow-2xl p-4 origin-top-right"
                            >
                              <h3 className="font-semibold text-charcoal flex items-center gap-2 text-sm mb-4">
                                <Settings
                                  size={18}
                                  className={ICON_BRAND}
                                  style={brandIconStyle}
                                />
                                Configuración del estudiante
                              </h3>

                              {/* Password */}
                              <div className={`p-4 mb-4 ${STAT_CARD}`}>
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <div className="flex items-center gap-2 text-charcoal font-semibold text-sm">
                                    <KeyRound
                                      size={18}
                                      className={ICON_BRAND}
                                      style={brandIconStyle}
                                    />
                                    Contraseña de acceso
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="flex items-center gap-1.5 text-sm font-medium brand-text transition-colors"
                                    style={{ color: BRAND_PRIMARY }}
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
                                  className={`font-mono text-lg tracking-widest rounded-xl px-4 py-3 border transition-all ${
                                    showPassword
                                      ? "bg-white border-brand/30 text-charcoal"
                                      : "bg-gray-100 border-gray-200 text-gray-500 select-none"
                                  }`}
                                  aria-label={
                                    showPassword
                                      ? `Contraseña: ${selectedStudent.password}`
                                      : "Contraseña oculta"
                                  }
                                >
                                  {showPassword
                                    ? selectedStudent.password
                                    : "•".repeat(
                                        Math.max(
                                          selectedStudent.password?.length ?? 0,
                                          6,
                                        ),
                                      )}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  El estudiante usa esta contraseña al iniciar
                                  sesión en la app.
                                </p>
                              </div>

                              {/* Account actions */}
                              {!showResetConfirm && !showDeleteConfirm && (
                                <div className="flex flex-col gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowResetConfirm(true);
                                      setShowDeleteConfirm(false);
                                    }}
                                    className="flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-50 transition-colors"
                                  >
                                    <RotateCcw
                                      size={20}
                                      className="text-orange-500 shrink-0 mt-0.5"
                                    />
                                    <div>
                                      <p className="font-semibold text-orange-800 text-sm">
                                        Reiniciar progreso y puntos
                                      </p>
                                      <p className="text-xs text-orange-700/80 mt-0.5">
                                        Pone los puntos en 0 y borra el
                                        historial de lectura. El estudiante
                                        permanece en la lista.
                                      </p>
                                    </div>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowDeleteConfirm(true);
                                      setShowResetConfirm(false);
                                    }}
                                    className="flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-50 transition-colors"
                                  >
                                    <UserX
                                      size={20}
                                      className="text-red-500 shrink-0 mt-0.5"
                                    />
                                    <div>
                                      <p className="font-semibold text-red-800 text-sm">
                                        Eliminar estudiante de la lista
                                      </p>
                                      <p className="text-xs text-red-700/80 mt-0.5">
                                        Borra todos sus datos y lo quita del
                                        panel. Esta acción no se puede deshacer.
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              )}

                              {/* Reset confirmation */}
                              {showResetConfirm && (
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                                  <div className="flex items-start gap-3 text-orange-800 mb-3">
                                    <AlertTriangle
                                      size={20}
                                      className="shrink-0 mt-0.5"
                                    />
                                    <div className="text-sm">
                                      <p className="font-bold">
                                        ¿Resetear datos del estudiante?
                                      </p>
                                      <p className="opacity-90">
                                        Esto reiniciará los puntos a 0 y borrará
                                        el historial de lectura.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
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
                                      className="px-4 py-1.5 text-sm font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                      {isResetting
                                        ? "Borrando..."
                                        : "Sí, resetear"}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Delete confirmation */}
                              {showDeleteConfirm && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                  <div className="flex items-start gap-3 text-red-800 mb-3">
                                    <AlertTriangle
                                      size={20}
                                      className="shrink-0 mt-0.5"
                                    />
                                    <div className="text-sm">
                                      <p className="font-bold">
                                        ¿Eliminar estudiante por completo?
                                      </p>
                                      <p className="opacity-90">
                                        Esta acción borrará todos sus datos y
                                        removerá al estudiante de la lista. Es
                                        irreversible.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() =>
                                        setShowDeleteConfirm(false)
                                      }
                                      disabled={isDeleting}
                                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={handleDeleteStudent}
                                      disabled={isDeleting}
                                      className="px-4 py-1.5 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                      {isDeleting
                                        ? "Eliminando..."
                                        : "Sí, eliminar"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseDetails}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      aria-label="Cerrar"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="mb-6 flex items-center gap-4 pr-24">
                    <div
                      className="w-14 h-14 shrink-0 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold"
                      style={{ backgroundColor: BRAND_PRIMARY }}
                    >
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-charcoal leading-snug sm:text-2xl lg:whitespace-nowrap">
                        {selectedStudent.name}
                      </h2>
                      <p className="text-gray-500">
                        {selectedStudent.grade === 0
                          ? "Prueba"
                          : `Grado ${selectedStudent.grade}`}{" "}
                        · {selectedStudent.points || 0} puntos
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
                    {[
                      {
                        icon: CheckCircle,
                        value: studentProgress.filter((p) => p.completed)
                          .length,
                        label: "Completadas",
                      },
                      {
                        icon: Clock,
                        value: studentProgress.filter(
                          (p) => p.status === "in-progress",
                        ).length,
                        label: "En progreso",
                      },
                      {
                        icon: Star,
                        value: selectedStudent.points || 0,
                        label: "Puntos",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`p-4 text-center ${STAT_CARD}`}
                      >
                        <stat.icon
                          size={22}
                          className={`mx-auto mb-2 ${ICON_BRAND}`}
                          style={brandIconStyle}
                          strokeWidth={2}
                        />
                        <p className="text-2xl font-bold text-charcoal">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Assigned stories */}
                  <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-1 ${STAT_ICON_TILE}`}
                    >
                      <BookOpen
                        size={16}
                        className={ICON_BRAND}
                        style={brandIconStyle}
                        strokeWidth={2}
                      />
                    </span>
                    Actividad de Lectura
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      ({assignedStoryCards.length}{" "}
                      {assignedStoryCards.length === 1
                        ? "historia"
                        : "historias"}
                      )
                    </span>
                  </h3>
                  {loadingProgress ? (
                    <p className="text-gray-400 text-center py-8">
                      Cargando historias...
                    </p>
                  ) : assignedStoryCards.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 rounded-2xl bg-gray-50 border border-gray-100">
                      No hay historias asignadas a este estudiante.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex-1 pb-2">
                      {assignedStoryCards.map(
                        ({ storyId, story, progress, status }) => {
                          const st = statusLabel(status);
                          return (
                            <div
                              key={storyId}
                              className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col"
                            >
                              <div className="aspect-[3/4] relative bg-gray-100">
                                {story?.coverImage ? (
                                  <img
                                    src={story.coverImage}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <BookOpen size={24} />
                                  </div>
                                )}
                                <div className="absolute top-1 right-1">
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 shadow-sm ${st.color}`}
                                    style={
                                      st.textColor
                                        ? { color: st.textColor }
                                        : undefined
                                    }
                                  >
                                    {st.useLucideStar && (
                                      <Star
                                        size={9}
                                        fill={BRAND_PRIMARY}
                                        stroke={BRAND_PRIMARY}
                                        strokeWidth={2}
                                      />
                                    )}
                                    {st.icon && (
                                      <FontAwesomeIcon
                                        icon={st.icon}
                                        className="text-[8px]"
                                      />
                                    )}
                                    {st.text}
                                  </span>
                                </div>
                                {progress?.pointsEarned ? (
                                  <span className="absolute bottom-1 left-1 text-[9px] text-yellow-700 font-bold bg-yellow-50/95 px-1 py-0.5 rounded-full border border-yellow-100">
                                    +{progress.pointsEarned}
                                  </span>
                                ) : null}
                              </div>
                              <p className="px-1.5 py-1.5 text-[11px] font-semibold text-charcoal leading-tight line-clamp-2">
                                {story?.title ?? storyId}
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
