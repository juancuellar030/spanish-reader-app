import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

interface WeeklyProgressProps {
  assigned: number;
  completed: number;
  deadline?: number;
}

export const WeeklyProgress = ({
  assigned,
  completed,
  deadline,
}: WeeklyProgressProps) => {
  // Generate star icons (filled or empty)
  const stars = Array.from({ length: assigned }, (_, i) => i < completed);

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full opacity-50 -mr-10 -mt-10" />

      <div className="flex items-center gap-4 z-10">
        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
          <Trophy size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-charcoal">Meta Semanal</h3>
          <p className="text-sm text-gray-500">
            Lee {assigned} historias para ganar una medalla
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 z-10">
        {/* Visual Progress Steps */}
        <div className="flex items-center gap-2">
          {stars.map((isCompleted, index) => (
            <motion.div
              key={index}
              className={`w-4 h-4 rounded-full ${isCompleted ? "bg-gold" : "bg-gray-200"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
          <span className="text-sm font-bold text-gray-600 ml-2">
            {completed}/{assigned}
          </span>
        </div>

        <div className="w-px h-10 bg-gray-100 hidden md:block" />

        <CountdownTimer deadline={deadline} />
      </div>
    </div>
  );
};
