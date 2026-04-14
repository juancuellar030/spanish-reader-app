#!/usr/bin/env python3
"""
VTT Word Splitter - Converts multi-word VTT cues into individual word cues
"""

import re
import sys

def parse_timestamp(ts):
    """Convert timestamp string to seconds"""
    # Format: 00:00:00.000 or 00:00.000
    parts = ts.strip().split(':')
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    else:
        return float(parts[0])

def format_timestamp(seconds):
    """Convert seconds to VTT timestamp format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

def split_vtt_cues(input_file, output_file):
    """Split multi-word cues into individual word cues"""
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    output_lines = []
    output_lines.append("WEBVTT\n\n")
    
    cue_number = 1
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if this is a cue identifier line (e.g., "cue-1")
        if line.startswith('cue-'):
            # Next line should be the timestamp
            if i + 1 < len(lines) and '-->' in lines[i + 1]:
                timestamp_line = lines[i + 1].strip()
                # Next line should be the text
                if i + 2 < len(lines):
                    text_line = lines[i + 2].strip()
                    
                    # Parse timestamp
                    match = re.match(r'(.+?)\s*-->\s*(.+)', timestamp_line)
                    if match:
                        start_str, end_str = match.groups()
                        start_time = parse_timestamp(start_str)
                        end_time = parse_timestamp(end_str)
                        
                        # Split text into words
                        words = text_line.split()
                        
                        if len(words) > 1:
                            # Calculate time per word
                            total_duration = end_time - start_time
                            time_per_word = total_duration / len(words)
                            
                            # Create individual cues for each word
                            for word_idx, word in enumerate(words):
                                word_start = start_time + (word_idx * time_per_word)
                                word_end = word_start + time_per_word
                                
                                output_lines.append(f"cue-{cue_number}\n")
                                output_lines.append(f"{format_timestamp(word_start)} --> {format_timestamp(word_end)}\n")
                                output_lines.append(f"{word}\n")
                                output_lines.append("\n")
                                cue_number += 1
                        else:
                            # Single word, keep as is
                            output_lines.append(f"cue-{cue_number}\n")
                            output_lines.append(f"{timestamp_line}\n")
                            output_lines.append(f"{text_line}\n")
                            output_lines.append("\n")
                            cue_number += 1
                    
                    i += 3  # Skip cue id, timestamp, and text lines
                    continue
        
        i += 1
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print(f"✅ Conversion complete!")
    print(f"   Input: {input_file}")
    print(f"   Output: {output_file}")
    print(f"   Total cues created: {cue_number - 1}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python vtt_word_splitter.py <input.vtt> <output.vtt>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    split_vtt_cues(input_file, output_file)
