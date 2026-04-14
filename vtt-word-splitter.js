/**
 * VTT Word Splitter - Converts multi-word VTT cues into individual word cues
 * Usage: node vtt-word-splitter.js <input.vtt> <output.vtt>
 */

import { readFileSync, writeFileSync } from 'fs';

function parseTimestamp(ts) {
    // Format: 00:00:00.000 or 00:00.000
    const parts = ts.trim().split(':');
    if (parts.length === 3) {
        const [h, m, s] = parts;
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    } else if (parts.length === 2) {
        const [m, s] = parts;
        return parseInt(m) * 60 + parseFloat(s);
    } else {
        return parseFloat(parts[0]);
    }
}

function formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
}

function splitVTTCues(inputFile, outputFile) {
    const content = readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n');

    const outputLines = ['WEBVTT', ''];
    let cueNumber = 1;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        // Check if this is a cue identifier line (e.g., "cue-1")
        if (line.startsWith('cue-')) {
            // Next line should be the timestamp
            if (i + 1 < lines.length && lines[i + 1].includes('-->')) {
                const timestampLine = lines[i + 1].trim();
                // Next line should be the text
                if (i + 2 < lines.length) {
                    const textLine = lines[i + 2].trim();

                    // Parse timestamp
                    const match = timestampLine.match(/(.+?)\s*-->\s*(.+)/);
                    if (match) {
                        const [, startStr, endStr] = match;
                        const startTime = parseTimestamp(startStr);
                        const endTime = parseTimestamp(endStr);

                        // Split text into words
                        const words = textLine.split(/\s+/).filter(w => w.length > 0);

                        if (words.length > 1) {
                            // Calculate time per word
                            const totalDuration = endTime - startTime;
                            const timePerWord = totalDuration / words.length;

                            // Create individual cues for each word
                            words.forEach((word, wordIdx) => {
                                const wordStart = startTime + (wordIdx * timePerWord);
                                const wordEnd = wordStart + timePerWord;

                                outputLines.push(`cue-${cueNumber}`);
                                outputLines.push(`${formatTimestamp(wordStart)} --> ${formatTimestamp(wordEnd)}`);
                                outputLines.push(word);
                                outputLines.push('');
                                cueNumber++;
                            });
                        } else {
                            // Single word, keep as is
                            outputLines.push(`cue-${cueNumber}`);
                            outputLines.push(timestampLine);
                            outputLines.push(textLine);
                            outputLines.push('');
                            cueNumber++;
                        }
                    }

                    i += 3; // Skip cue id, timestamp, and text lines
                    continue;
                }
            }
        }

        i++;
    }

    // Write output
    writeFileSync(outputFile, outputLines.join('\n'), 'utf-8');

    console.log('✅ Conversion complete!');
    console.log(`   Input: ${inputFile}`);
    console.log(`   Output: ${outputFile}`);
    console.log(`   Total cues created: ${cueNumber - 1}`);
}

// Main
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: node vtt-word-splitter.js <input.vtt> <output.vtt>');
    process.exit(1);
}

const [inputFile, outputFile] = args;
splitVTTCues(inputFile, outputFile);
