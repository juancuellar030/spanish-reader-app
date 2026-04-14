import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import { BackgroundLayer } from '../ui/BackgroundLayer';

interface TeacherLoginProps {
    onLogin: () => void;
    onBack: () => void;
}

export const TeacherLogin = ({ onLogin, onBack }: TeacherLoginProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (password === 'profesor123') {
                onLogin();
            } else {
                setError('Contraseña incorrecta');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            <BackgroundLayer theme="library" showIntro={false} />

            <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-card p-8 w-full max-w-md relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 text-gray-400 hover:text-charcoal transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex flex-col items-center mb-8 mt-4">
                    <div className="w-16 h-16 bg-ocean-blue rounded-full flex items-center justify-center mb-4 text-white">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-charcoal">Acceso Maestros</h2>
                    <p className="text-gray-500 text-center mt-2">
                        Ingresa tu contraseña para acceder al panel de control.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-ocean-blue focus:outline-none transition-colors font-poppins"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Ingresar
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};
