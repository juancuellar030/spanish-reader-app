import { useState, useEffect } from 'react';
import { StudentLogin } from './components/auth/StudentLogin';
import { StoryLibrary } from './components/library';
import { StoryReader } from './components/reader';
import { FlipbookViewer } from './components/reader/FlipbookViewer';
import { BackgroundLayer } from './components/ui/BackgroundLayer';
import type { BackgroundTheme } from './components/ui/BackgroundLayer';
import { TeacherLogin, TeacherDashboard } from './components/teacher';
import { WeeklyProgress, Scoreboard } from './components/gamification';
import { CollectibleReveal } from './components/gamification/CollectibleReveal';
import { CollectionCase } from './components/gamification/CollectionCase';
import { getStudentProgress, getStudent } from './services/firestore';
import { getCurrentWeekId } from './utils/dateUtils';
import type { Student, Story, Progress } from './types';
import storiesData from './data/stories.json';
import story1Data from './data/stories/story-1.json';
import story2Data from './data/stories/story-2.json';
import grade1Story2Data from './data/stories/grade-1-story-2.json';
import grade1Story3Data from './data/stories/grade-1-story-3.json';
import './index.css';

function App() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('library');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  // Collectible reveal state
  const [pendingCollectible, setPendingCollectible] = useState<{ storyId: string; image: string; name: string } | null>(null);

  // Compute active assigned stories — only show if lastAssignedWeek matches current ISO week
  const getActiveAssignedStories = (student: Student): string[] => {
    const currentWeek = getCurrentWeekId();
    if (student.lastAssignedWeek === currentWeek) {
      return student.assignedStories;
    }
    // Teacher hasn't assigned anything this week yet → show empty library
    return [];
  };

  useEffect(() => {
    if (currentStudent) {
      const loadProgress = async () => {
        try {
          const progress = await getStudentProgress(currentStudent.id);
          setStudentProgress(progress);
        } catch (error) {
          console.error("Failed to load progress:", error);
        }
      };
      loadProgress();
    } else {
      setStudentProgress([]);
    }
  }, [currentStudent]);

  const handleLogin = (student: Student, theme: BackgroundTheme) => {
    setCurrentStudent(student);
    setCurrentTheme(theme);
    localStorage.setItem('currentStudent', JSON.stringify(student));
    localStorage.setItem(`theme_${student.id}`, theme);
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    localStorage.removeItem('currentStudent');
  };

  const handleTeacherLogin = () => {
    setIsTeacherAuthenticated(true);
    setIsTeacherLoginOpen(false);
  };

  const handleTeacherLogout = () => {
    setIsTeacherAuthenticated(false);
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
  };

  const handleCollectibleEarned = (storyId: string) => {
    // Find the collectible info from stories data
    const storyMeta = (storiesData as any[]).find(s => s.id === storyId);
    if (storyMeta?.collectibleImage) {
      setPendingCollectible({
        storyId,
        image: storyMeta.collectibleImage,
        name: storyMeta.collectibleName || '¡Coleccionable!',
      });
    }
  };

  const handleBackToLibrary = async () => {
    setSelectedStory(null);
    if (currentStudent) {
      try {
        const freshStudentData = await getStudent(currentStudent.id);
        if (freshStudentData) {
          setCurrentStudent(freshStudentData);
          localStorage.setItem('currentStudent', JSON.stringify(freshStudentData));
        }
        const freshProgress = await getStudentProgress(currentStudent.id);
        setStudentProgress(freshProgress);
      } catch (err) {
        console.error("Failed to refresh data", err);
      }
    }
  };

  // Event listener for teacher login request from StudentLogin component
  useEffect(() => {
    const handleTeacherRequest = () => setIsTeacherLoginOpen(true);
    window.addEventListener('teacher-login-request', handleTeacherRequest);
    return () => window.removeEventListener('teacher-login-request', handleTeacherRequest);
  }, []);

  // Check for existing session on mount — always fetch fresh student data from Firestore
  useEffect(() => {
    const savedStudent = localStorage.getItem('currentStudent');
    if (savedStudent) {
      const parsed = JSON.parse(savedStudent) as Student;
      const savedTheme = localStorage.getItem(`theme_${parsed.id}`) as BackgroundTheme;
      if (savedTheme) setCurrentTheme(savedTheme);
      getStudent(parsed.id).then(freshData => {
        if (freshData) {
          setCurrentStudent(freshData);
          localStorage.setItem('currentStudent', JSON.stringify(freshData));
        } else {
          setCurrentStudent(null);
          localStorage.removeItem('currentStudent');
        }
      }).catch(() => {
        setCurrentStudent(parsed);
      });
    }
  }, []);

  // Render Logic
  if (isTeacherAuthenticated) {
    return <TeacherDashboard onLogout={handleTeacherLogout} />;
  }

  if (isTeacherLoginOpen) {
    return (
      <TeacherLogin
        onLogin={handleTeacherLogin}
        onBack={() => setIsTeacherLoginOpen(false)}
      />
    );
  }

  if (!currentStudent) {
    return <StudentLogin onLogin={handleLogin} />;
  }

  if (selectedStory) {
    if (selectedStory.type === 'flipbook') {
      let flipbookData = selectedStory as any;
      if (selectedStory.id === 'grade-1-story-1-flipbook') {
        flipbookData = story1Data;
      } else if (selectedStory.id === 'grade-2-story-1-flipbook') {
        flipbookData = story2Data;
      } else if (selectedStory.id === 'grade-1-story-2-flipbook') {
        flipbookData = grade1Story2Data;
      } else if (selectedStory.id === 'grade-1-story-3-flipbook') {
        flipbookData = grade1Story3Data;
      }

      // Pass collectible info from stories.json to FlipbookViewer so QuizModal can award it
      const collectibleImage = (storiesData as any[]).find(s => s.id === selectedStory.id)?.collectibleImage;

      return (
        <FlipbookViewer
          story={flipbookData as any}
          studentId={currentStudent.id}
          studentGrade={currentStudent.grade}
          studentCollectibles={currentStudent.collectibles || []}
          onBack={handleBackToLibrary}
          onCollectibleEarned={handleCollectibleEarned}
          collectibleImage={collectibleImage}
        />
      );
    }

    return (
      <StoryReader
        story={selectedStory}
        studentId={currentStudent.id}
        onBack={handleBackToLibrary}
      />
    );
  }

  const activeStories = getActiveAssignedStories(currentStudent);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Collectible Reveal Overlay */}
      {pendingCollectible && (
        <CollectibleReveal
          image={pendingCollectible.image}
          name={pendingCollectible.name}
          onClose={() => setPendingCollectible(null)}
        />
      )}

      {/* Fixed Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <BackgroundLayer theme={currentTheme} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white shadow-sm drop-shadow-sm">
              ¡Hola, {currentStudent.name.split(' ')[0]}!
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white/90 backdrop-blur rounded-lg shadow hover:shadow-md transition-shadow text-charcoal font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Top Gamification Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <WeeklyProgress
                assigned={activeStories.length}
                completed={studentProgress.filter(p => activeStories.includes(p.storyId) && p.completed).length}
              />
            </div>
            <div>
              <Scoreboard score={currentStudent.points || 0} />
            </div>
          </div>

          {/* Story Library */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm mb-8">
            <StoryLibrary
              assignedStories={activeStories}
              studentProgress={studentProgress}
              onStorySelect={handleStorySelect}
            />
          </div>

          {/* Mi Colección — only show if student has collectibles or assigned stories with collectibles */}
          <CollectionCase
            earnedCollectibles={currentStudent.collectibles || []}
            assignedStories={activeStories}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
