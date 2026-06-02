import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { BRAND_PRIMARY, ICON_BRAND, brandIconStyle } from '../../constants/brandColors';

export const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number }>({ days: 0, hours: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
            nextMonday.setHours(8, 0, 0, 0);

            // If it's already past 8AM on Monday, target next week
            if (nextMonday <= now) {
                nextMonday.setDate(nextMonday.getDate() + 7);
            }

            const difference = nextMonday.getTime() - now.getTime();
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

            setTimeLeft({ days, hours });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <Clock size={18} className={ICON_BRAND} style={brandIconStyle} />
            <span className="text-sm font-semibold text-charcoal">
                Termina en:{' '}
                <span className="font-bold brand-text" style={{ color: BRAND_PRIMARY }}>
                    {timeLeft.days}d {timeLeft.hours}h
                </span>
            </span>
        </div>
    );
};
