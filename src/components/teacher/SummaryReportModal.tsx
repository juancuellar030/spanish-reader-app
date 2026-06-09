import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { getAllStudents, getStudentProgress } from "../../services/firestore";
import type { Student, Progress } from "../../types";

interface SummaryReportModalProps {
  onClose: () => void;
  onViewStudentDetails: (student: Student) => void;
}

type TimeFrame =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "last_month"
  | "all_time"
  | "custom";

export const SummaryReportModal = ({
  onClose,
  onViewStudentDetails,
}: SummaryReportModalProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("this_week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentsData = await getAllStudents();
        setStudents(studentsData);

        const pMap: Record<string, Progress[]> = {};
        await Promise.all(
          studentsData.map(async (student) => {
            const prog = await getStudentProgress(student.id);
            pMap[student.id] = prog;
          }),
        );
        setProgressMap(pMap);
      } catch (err) {
        console.error("Failed to load summary data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getTimeRange = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let start = new Date(now);
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (timeFrame) {
      case "today":
        break;
      case "yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case "this_week":
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        break;
      case "last_week":
        start.setDate(start.getDate() - start.getDay() - 6);
        end.setDate(start.getDate() + 6);
        break;
      case "last_month":
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
        break;
      case "all_time":
        start = new Date(0);
        break;
      case "custom":
        if (startDate) start = new Date(startDate);
        if (endDate) {
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
    }
    return { start: start.getTime(), end: end.getTime() };
  };

  const { start, end } = getTimeRange();

  const isInRange = (timestamp?: number | any) => {
    if (!timestamp) return false;
    const time =
      typeof timestamp === "number"
        ? timestamp
        : timestamp.toMillis
          ? timestamp.toMillis()
          : 0;
    return time >= start && time <= end;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-charcoal">Reporte Resumido</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-end bg-white">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Período de Tiempo
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
              className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-brand"
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="this_week">Esta Semana</option>
              <option value="last_week">Semana Pasada</option>
              <option value="last_month">Mes Pasado</option>
              <option value="all_time">Todo el Tiempo</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {timeFrame === "custom" && (
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-brand bg-gray-50/50 hover:bg-white transition-colors"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-brand bg-gray-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto mb-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-5 h-5 text-brand rounded border-gray-300 focus:ring-brand focus:ring-2 cursor-pointer transition-colors"
              />
            </div>
            <label
              htmlFor="activeOnly"
              className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
            >
              Ocultar estudiantes inactivos
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-brand mb-4" size={40} />
              <p className="text-gray-500 font-medium">Cargando reporte...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <thead className="bg-gray-100/50 text-gray-600 text-sm font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Estudiante</th>
                    <th className="p-4 text-center">Visitó la Plataforma</th>
                    <th className="p-4 text-center">Leyó el Libro Asignado</th>
                    <th className="p-4 text-center">Respondió el Quiz</th>
                    <th className="p-4 text-center">Veces Leyó un Libro</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const stdProgress = progressMap[student.id] || [];

                    // Visited the platform: check student doc's lastLogin or any progress openedAt in timeframe
                    const hasVisited =
                      isInRange((student as any).lastLogin) ||
                      stdProgress.some(
                        (p) =>
                          isInRange(p.openedAt) || isInRange(p.completedAt),
                      );

                    // Read the assigned book: check if any progress in timeframe is completed
                    // and if its storyId is in assignedStories
                    const readAssigned = stdProgress.some(
                      (p) =>
                        student.assignedStories.includes(p.storyId) &&
                        p.completed &&
                        isInRange(p.completedAt),
                    );

                    // Answered the quiz: check if any progress has quizAttempts and was updated in timeframe
                    const answeredQuiz = stdProgress.some(
                      (p) =>
                        p.quizAttempts &&
                        p.quizAttempts.length > 0 &&
                        isInRange(p.completedAt),
                    );

                    // Amount of times they read a book: count the number of progress docs completed in timeframe
                    // Alternatively, we could count the number of unique story opens
                    const timesRead = stdProgress.filter((p) =>
                      isInRange(p.completedAt),
                    ).length;

                    // Filter logic
                    const hasActivity =
                      hasVisited ||
                      readAssigned ||
                      answeredQuiz ||
                      timesRead > 0;
                    if (showActiveOnly && !hasActivity) {
                      return null;
                    }

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="p-4 font-medium text-charcoal">
                          {student.name}
                        </td>
                        <td className="p-4 text-center">
                          {hasVisited ? (
                            <span className="text-green-500 font-bold">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {readAssigned ? (
                            <span className="text-green-500 font-bold">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {answeredQuiz ? (
                            <span className="text-green-500 font-bold">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-700">
                          {timesRead}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onViewStudentDetails(student)}
                            className="text-sm font-medium text-brand hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
