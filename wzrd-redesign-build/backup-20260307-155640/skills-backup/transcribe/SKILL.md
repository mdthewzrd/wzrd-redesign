---
name: transcribe
description: Audio and video transcription using Whisper and other tools
category: media
priority: P2
tags: [transcription, audio, video, whisper]
subskills:
  - whisper-local
  - transcription-services
  - timestamp-extraction
  - transcript-summary
---

# Transcribe Skill

## Purpose
Convert audio and video to text using local tools or cloud services.

## Core Principle
**"Audio is just frozen text. Transcribe it to make it searchable."**

## Local Transcription (Whisper)

### OpenAI Whisper

```bash
# Install Whisper
pip install openai-whisper

# Basic transcription
whisper audio.mp3

# Specify model (tiny, base, small, medium, large)
whisper audio.mp3 --model small

# Output to file
whisper audio.mp3 --output_dir transcripts

# With timestamps
whisper audio.mp3 --word_timestamps True

# Translate to English
whisper audio.mp3 --task translate
```

### Model Selection

| Model | Size | Speed | Accuracy | VRAM |
|-------|------|-------|----------|------|
| tiny | 39 MB | ⚡⚡⚡ | Good | ~1 GB |
| base | 74 MB | ⚡⚡ | Very Good | ~1 GB |
| small | 244 MB | ⚡ | Excellent | ~2 GB |
| medium | 769 MB | Moderate | Best | ~5 GB |
| large | 1550 MB | Slow | Best | ~10 GB |

**Recommendation:** Use `small` for balance of speed and accuracy.

### Python API

```python
import whisper

# Load model
model = whisper.load_model("small")

# Transcribe audio
result = model.transcribe("audio.mp3")

# With timestamps
result = model.transcribe("audio.mp3", word_timestamps=True)

# Translate to English
result = model.transcribe("audio.mp3", task="translate")

# Save transcript
with open("transcript.txt", "w") as f:
    f.write(result["text"])
```

### Batch Processing

```python
import whisper
import glob

model = whisper.load_model("small")

for audio_file in glob.glob("audio/*.mp3"):
    print(f"Transcribing {audio_file}...")
    result = model.transcribe(audio_file)

    # Save transcript
    output_file = audio_file.replace(".mp3", ".txt")
    with open(output_file, "w") as f:
        f.write(result["text"])
```

## Cloud Services

### OpenAI API

```python
import openai

audio_file = open("audio.mp3", "rb")
transcript = openai.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="verbose_json"  # timestamps
)

print(transcript["text"])
```

### Free Alternatives

```
# Google Cloud Speech-to-Text (free tier)
# AssemblyAI (free tier: 3 hours/month)
# Rev.ai (paid but accurate)
# Veed.io (web-based, has free tier)
```

## Video Transcription

### Extract Audio First

```bash
# Extract audio from video
ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav

# Then transcribe
whisper audio.wav
```

### With Speakers

```python
import whisper

# Load model with diarization
model = whisper.load_model("large")

# Transcribe with speaker detection
result = model.transcribe(
    "video.mp4",
    word_timestamps=True,
    task="transcribe"
)

# Process speaker segments
for segment in result["segments"]:
    print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s]")
    print(f"Speaker {segment.get('speaker', '?')}: {segment['text']}")
```

## Timestamp Extraction

### Format: SRT Subtitles

```python
import whisper

model = whisper.load_model("small")
result = model.transcribe("audio.mp3", word_timestamps=True)

# Generate SRT
with open("output.srt", "w") as f:
    for i, segment in enumerate(result["segments"]):
        start_time = segment["start"]
        end_time = segment["end"]

        # Format timestamps
        start = f"{int(start_time//60):02d}:{int(start_time%60):02d},{int((start_time%1)*1000):03d}"
        end = f"{int(end_time//60):02d}:{int(end_time%60):02d},{int((end_time%1)*1000):03d}"

        f.write(f"{i+1}\n")
        f.write(f"{start} --> {end}\n")
        f.write(f"{segment['text']}\n\n")
```

## Workflow: Meeting Recording

```
1. Extract Audio
   ffmpeg -i meeting.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav

2. Transcribe
   whisper audio.wav --model small --output_dir transcripts/

3. Process Output
   - Review transcript.txt
   - Extract key points
   - Generate summary
```

## Summary from Transcript

```python
import whisper
from textwrap import dedent

# Transcribe
model = whisper.load_model("small")
result = model.transcribe("meeting.mp3")

# Generate summary
transcript = result["text"]

# Key points extraction (simple approach)
sentences = transcript.split(". ")
key_points = [s.strip() for s in sentences if len(s) > 50]

print("=== MEETING SUMMARY ===")
print(f"\nKey Points:\n")
for i, point in enumerate(key_points[:5], 1):
    print(f"{i}. {point}")
```

## Role-Shifting

When shifting **to** transcription mode:
```
"Shifting to transcription mode..."
→ Get audio/video file
→ Extract audio if video
→ Run transcription
→ Format output
→ Summarize if needed
```

## Gold Standard Integration

### Read-Back Verification
- Verify transcript file was created
- Check transcript quality (spot check)
- Confirm output format is correct

### Executable Proof
- Show transcript snippet
- Demonstrate timestamp accuracy
- Verify file sizes match expected

---

**"Transcription turns frozen speech into actionable text."**
