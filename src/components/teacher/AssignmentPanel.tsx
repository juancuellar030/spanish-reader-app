import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Loader2 } from 'lucide-react';
import { getWeeklyAssignments, saveWeeklyAssignments } from '../../services/firestore';
import { getCurrentWeekId } from '../../utils/dateUtils';
import storiesData from '../../data/stories.json';
import type { Story } from '../../types';

export const AssignmentPanel = () => {
    const [selectedGrade, setSelectedGrade] = useState<number>(1);
    const [assignments, setAssignments] = useState<Record<number, string[]>>({
        1: [], 2: [], 3: [], 4: [], 5: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const weekId = getCurrentWeekId();

    // Filter available stories by the selected grade
    const availableStories: Story[] = (storiesData as Story[]).filter(s => s.grade === selectedGrade);

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                const data = await getWeeklyAssignments(weekId);
                if (data) {
                    // Extract only the grade arrays from the firestore document (ignore updatedAt, etc.)
                    const loadedAssignments: Record<number, string[]> = {
                        1: data['1'] || [],
                        2: data['2'] || [],
                        3: data['3'] || [],
                        4: data['4'] || [],
                        5: data['5'] || []
                    };
                    setAssignments(loadedAssignments);
                }
            } catch (err) {
                console.error("Failed to load assignments", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadAssignments();
    }, [weekId]);

    const handleToggleStory = (storyId: string) => {
        setAssignments(prev => {
            const currentGradeAssignments = prev[selectedGrade] || [];

            if (currentGradeAssignments.includes(storyId)) {
                // Remove it
                return {
                    ...prev,
                    [selectedGrade]: currentGradeAssignments.filter(id => id !== storyId)
                };
            } else {
                // Add it if under limit
                if (currentGradeAssignments.length >= 3) {
                    alert("Solo puedes asignar un máximo de 3 historias por semana para este grado.");
                    return prev;
                }
                return {
                    ...prev,
                    [selectedGrade]: [...currentGradeAssignments, storyId]
                };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveWeeklyAssignments(weekId, assignments);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving assignments:", error);
            alert("Error al guardar las asignaciones.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-ocean-blue" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-charcoal">Asignar Lecturas</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">SEMANA ACTUAL: {weekId}</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-ocean-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-ocean-blue/90 disabled:opacity-50 transition-all shadow-sm"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : (showSuccess ? <Check size={20} /> : <Save size={20} />)}
                    <span>{isSaving ? 'Guardando...' : (showSuccess ? '¡Guardado!' : 'Guardar Asignaciones')}</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Grade Tabs Sidebar */}
                <div className="md:w-48 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex md:flex-col gap-2 overflow-x-auto">
                    {[1, 2, 3, 4, 5].map(grade => (
                        <button
                            key={grade}
                            onClick={() => setSelectedGrade(grade)}
                            className={`px-4 py-3 rounded-xl font-semibold text-left whitespace-nowrap transition-colors ${selectedGrade === grade
                                    ? 'bg-ocean-blue/10 text-ocean-blue'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Grado {grade}
                            <span className="ml-2 inline-block px-2 border rounded-full text-xs bg-white text-gray-400">
                                {(assignments[grade] || []).length}/3
                            </span>
                        </button>
                    ))}
                </div>

                {/* Stories Selection Area */}
                <div className="flex-1 p-6 bg-soft-gray/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableStories.map(story => {
                            const isAssigned = (assignments[selectedGrade] || []).includes(story.id);

                            return (
                                <motion.div
                                    key={story.id}
                                    whileHover={{ y: -4 }}
                                    className={`relative bg-white rounded-2xl p-4 cursor-pointer transition-all border-2 ${isAssigned ? 'border-ocean-blue shadow-md' : 'border-transparent shadow-sm hover:border-ocean-blue/30'
                                        }`}
                                    onClick={() => handleToggleStory(story.id)}
                                >
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                                        <img
                                            src={story.coverImage}
                                            alt={story.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {isAssigned && (
                                            <div className="absolute inset-0 bg-ocean-blue/20 flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="bg-ocean-blue text-white p-2 rounded-full shadow-lg">
                                                    <Check size={24} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-charcoal line-clamp-2 leading-tight">
                                        {story.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">
                                        {story.type === 'flipbook' ? '📖 Flipbook' : '🎵 Karaoke'} • {story.wordCount} p.
                                    </p>
                                </motion.div>
                            );
                        })}
                        {availableStories.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                No hay historias disponibles para este grado.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
