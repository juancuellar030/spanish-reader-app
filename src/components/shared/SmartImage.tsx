import React, { useState, useEffect } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, ...props }) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState(false);

    // Reset when src changes
    useEffect(() => {
        setCurrentSrc(src);
        setAttempt(0);
        setError(false);
    }, [src]);

    const handleError = () => {
        if (error) return;

        const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

        const lastDotIndex = src.lastIndexOf('.');
        if (lastDotIndex === -1) {
            setError(true);
            return;
        }

        const basePath = src.substring(0, lastDotIndex);

        let nextAttempt = attempt;

        // Ensure we advance the attempt if the generated extension is identical to the currently failing src
        while (nextAttempt < extensions.length) {
            if (`${basePath}${extensions[nextAttempt]}` !== currentSrc) {
                break;
            }
            nextAttempt++;
        }

        if (nextAttempt < extensions.length) {
            setCurrentSrc(`${basePath}${extensions[nextAttempt]}`);
            setAttempt(nextAttempt + 1);
        } else {
            setError(true);
        }
    };

    if (error) {
        // Render a broken image placeholder or nothing
        return null;
    }

    return (
        <img
            src={currentSrc}
            alt={alt}
            onError={handleError}
            {...props}
        />
    );
};
