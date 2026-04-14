import { useState, useEffect } from 'react';

export interface VTTCue {
    startTime: number;
    endTime: number;
    text: string;
    wordIndex: number;
}

export const useVTTParser = (vttUrl: string | null) => {
    const [cues, setCues] = useState<VTTCue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!vttUrl) {
            setCues([]);
            return;
        }

        const parseVTT = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(vttUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch VTT file: ${response.statusText}`);
                }

                const text = await response.text();
                const parsedCues = parseVTTContent(text);
                setCues(parsedCues);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse VTT file');
                console.error('VTT parsing error:', err);
            } finally {
                setLoading(false);
            }
        };

        parseVTT();
    }, [vttUrl]);

    return { cues, loading, error };
};

const parseVTTContent = (content: string): VTTCue[] => {
    const lines = content.split('\n');
    const cues: VTTCue[] = [];
    let wordIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Look for timestamp lines (format: 00:00:00.000 --> 00:00:00.500)
        if (line.includes('-->')) {
            const [startStr, endStr] = line.split('-->').map(s => s.trim());
            const startTime = parseTimestamp(startStr);
            const endTime = parseTimestamp(endStr);

            // The next line should contain the word/text
            const textLine = lines[i + 1]?.trim();
            if (textLine) {
                cues.push({
                    startTime,
                    endTime,
                    text: textLine,
                    wordIndex: wordIndex++
                });
            }
        }
    }

    return cues;
};

const parseTimestamp = (timestamp: string): number => {
    // Format: 00:00:00.000 or 00:00.000
    const parts = timestamp.split(':');
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (parts.length === 3) {
        // HH:MM:SS.mmm
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        seconds = parseFloat(parts[2]);
    } else if (parts.length === 2) {
        // MM:SS.mmm
        minutes = parseInt(parts[0], 10);
        seconds = parseFloat(parts[1]);
    } else {
        // SS.mmm
        seconds = parseFloat(parts[0]);
    }

    return hours * 3600 + minutes * 60 + seconds;
};
