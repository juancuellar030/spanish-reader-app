import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Award,
  LogOut,
  Loader2,
  BarChart2,
} from "lucide-react";
import { StudentTable } from "./StudentTable";
import { AssignmentPanel } from "./AssignmentPanel";
import { SummaryReportModal } from "./SummaryReportModal";
import { getAllStudents } from "../../services/firestore";
import { computeClassAverageCompletion } from "../../utils/classStats";
import { BackgroundLayer } from "../ui/BackgroundLayer";
import type { BackgroundTheme } from "../ui/BackgroundLayer";
import { ThemeSelector } from "../ui/ThemeSelector";
import {
  loadStoredTeacherTheme,
  saveTeacherTheme,
} from "../../data/backgroundThemes";
import {
  STAT_ICON_TILE,
  ICON_BRAND,
  brandIconStyle,
} from "../../constants/brandColors";
import type { Student } from "../../types";

interface TeacherDashboardProps {
  onLogout: () => void;
}

export const TeacherDashboard = ({ onLogout }: TeacherDashboardProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classAveragePercent, setClassAveragePercent] = useState<number | null>(
    null,
  );
  const [isLoadingAverage, setIsLoadingAverage] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(() =>
    loadStoredTeacherTheme(),
  );
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  // #region agent log
  useEffect(() => {
    if (isLoading) return;
    const iconEl = document.querySelector(
      "[data-debug-dash-icon]",
    ) as SVGElement | null;
    const payload = {
      sessionId: "cbfc31",
      location: "TeacherDashboard.tsx:iconProbe",
      message: "dashboard stat icon computed color",
      data: {
        iconColor: iconEl ? window.getComputedStyle(iconEl).color : "no-el",
        iconStroke: iconEl ? window.getComputedStyle(iconEl).stroke : "no-el",
      },
      timestamp: Date.now(),
      hypothesisId: "C",
      runId: "post-fix-v2",
    };
    fetch("http://127.0.0.1:7623/ingest/d6025ec4-1902-461d-ae6d-4b4976ec2ce2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "cbfc31",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [isLoading]);
  // #endregion

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getAllStudents();
        setStudents(data);

        setIsLoadingAverage(true);
        const avg = await computeClassAverageCompletion(data);
        setClassAveragePercent(avg);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setIsLoading(false);
        setIsLoadingAverage(false);
      }
    };
    loadStudents();
  }, []);

  const handleThemeChange = (theme: BackgroundTheme) => {
    setCurrentTheme(theme);
    saveTeacherTheme(theme);
  };

  const classAverageDisplay = isLoadingAverage
    ? "…"
    : classAveragePercent !== null
      ? `${classAveragePercent}%`
      : "—";

  const stats = [
    { label: "Total Estudiantes", value: students.length, icon: Users },
    {
      label: "Historias Asignadas",
      value: students.reduce(
        (acc, s) => acc + (s.assignedStories?.length ?? 0),
        0,
      ),
      icon: BookOpen,
    },
    {
      label: "Promedio Clase",
      value: classAverageDisplay,
      subtitle: "Lecturas completadas",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundLayer theme={currentTheme} showIntro={false} />
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[0px]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="relative z-30 flex flex-wrap justify-between items-center gap-4 overflow-visible bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/60">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">
                Panel de Maestros
              </h1>
              <p className="text-gray-500">Vista general de la clase</p>
            </div>
            <div className="relative z-40 flex items-center gap-3">
              <button
                onClick={() => setShowSummaryReport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-semibold"
              >
                <BarChart2 size={20} />
                <span>Reporte</span>
              </button>
              <ThemeSelector
                theme={currentTheme}
                onThemeChange={handleThemeChange}
                variant="solid"
                menuAlign="right"
              />
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-semibold">Salir</span>
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60">
              <Loader2 className="animate-spin text-brand mb-4" size={40} />
              <p className="text-gray-500 font-medium">
                Cargando datos de estudiantes...
              </p>
            </div>
          ) : (
            <>
              <div className="relative z-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/60 flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${STAT_ICON_TILE}`}
                    >
                      <stat.icon
                        data-debug-dash-icon
                        size={24}
                        className={ICON_BRAND}
                        style={brandIconStyle}
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-charcoal">
                        {stat.value}
                      </p>
                      {"subtitle" in stat && stat.subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <AssignmentPanel />
              </div>

              <div className="space-y-4 mt-8">
                <h2 className="text-xl font-bold text-white px-2 drop-shadow-sm">
                  Estudiantes
                </h2>
                <StudentTable students={students} />
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSummaryReport && (
          <SummaryReportModal
            onClose={() => setShowSummaryReport(false)}
            onViewStudentDetails={(student) => {
              setShowSummaryReport(false);
              // Set a tiny delay so the modal can close smoothly before triggering the next modal
              setTimeout(() => {
                const customEvent = new CustomEvent("view-student-details", {
                  detail: student,
                });
                window.dispatchEvent(customEvent);
              }, 50);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
