#!/usr/bin/env python3
"""
Video Transcription Tool

Transcribes YouTube, TikTok, Instagram, and local video files using Whisper.
"""

import os
import sys
import argparse
import json
import re
from pathlib import Path

try:
    import yt_dlp
    from faster_whisper import WhisperModel
except ImportError as e:
    print(f"Error: Missing dependency - {e}")
    print("Install with: pip install yt-dlp faster-whisper")
    sys.exit(1)


class VideoTranscriber:
    """Transcribe videos from URLs or local files."""

    # Supported video platforms
    URL_PATTERNS = {
        'youtube': r'(youtube\.com|youtu\.be)/',
        'tiktok': r'tiktok\.com/',
        'instagram': r'instagram\.com/',
    }

    def __init__(self, model_size='base', device='cpu'):
        """
        Initialize transcriber.

        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            device: Device to run on (cpu, cuda)
        """
        print(f"Loading Whisper model ({model_size})...")
        self.model = WhisperModel(model_size, device=device)
        self.model_size = model_size
        self.temp_dir = Path.home() / '.claude' / 'skills' / 'video-transcribe' / 'temp'
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def detect_source(self, input_path):
        """Detect if input is a URL or local file."""
        if os.path.exists(input_path):
            return 'file', input_path

        for platform, pattern in self.URL_PATTERNS.items():
            if re.search(pattern, input_path):
                return platform, input_path

        return 'url', input_path  # Assume it's a URL

    def download_audio(self, url):
        """Download audio from video URL."""
        output_path = self.temp_dir / "audio_%(id)s.%(ext)s"

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': str(output_path),
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            audio_file = ydl.prepare_filename(info)
            # Replace extension with mp3/m4a
            audio_file = Path(audio_file).with_suffix('.m4a')
            # Find the actual downloaded file
            for f in self.temp_dir.glob("audio_*"):
                if f.is_file():
                    return str(f)

        raise RuntimeError("Failed to download audio")

    def transcribe(self, input_path, summarize=False):
        """
        Transcribe video or audio file.

        Args:
            input_path: URL or local file path
            summarize: If True, generate summary

        Returns:
            dict with transcript, summary, metadata
        """
        source_type, path = self.detect_source(input_path)

        print(f"Source: {source_type}")
        print(f"Processing: {path[:60]}...")

        # Download if URL
        if source_type != 'file':
            print("Downloading audio...")
            audio_file = self.download_audio(path)
        else:
            audio_file = path

        print("Transcribing...")
        segments, info = self.model.transcribe(
            audio_file,
            beam_size=5,
            vad_filter=True,
            word_timestamps=True
        )

        # Build transcript with timestamps
        transcript_lines = []
        full_text = []

        for segment in segments:
            start = segment.start
            end = segment.end
            text = segment.text.strip()

            timestamp = self.format_timestamp(start)
            transcript_lines.append(f"[{timestamp}] {text}")
            full_text.append(text)

        transcript = '\n'.join(transcript_lines)
        full_text_str = ' '.join(full_text)

        # Generate summary if requested
        summary = None
        if summarize and len(full_text_str) > 100:
            summary = self.generate_summary(full_text_str, info)

        # Cleanup downloaded files
        if source_type != 'file' and os.path.exists(audio_file):
            os.remove(audio_file)

        return {
            'transcript': transcript,
            'summary': summary,
            'metadata': {
                'source_type': source_type,
                'language': info.language,
                'language_probability': info.language_probability,
                'duration': info.duration,
                'model': self.model_size
            }
        }

    def format_timestamp(self, seconds):
        """Format seconds as MM:SS."""
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes:02d}:{secs:02d}"

    def generate_summary(self, text, info):
        """Generate simple summary from transcript."""
        words = text.split()
        sentences = [s.strip() for s in text.split('.') if s.strip()]

        return {
            'duration_minutes': round(info.duration / 60, 1),
            'word_count': len(words),
            'sentence_count': len(sentences),
            'language': info.language,
            'preview': ' '.join(words[:50]) + ('...' if len(words) > 50 else '')
        }

    def print_result(self, result):
        """Print transcription result."""
        metadata = result['metadata']

        print("\n" + "="*60)
        print(f"TRANSCRIPTION COMPLETE")
        print("="*60)

        if result['summary']:
            print(f"\nDuration: {metadata['duration_minutes']} minutes")
            print(f"Language: {metadata['language']} ({metadata['language_probability']:.1%} confident)")
            print(f"Word count: {result['summary']['word_count']}")
            print("\nPreview:")
            print(result['summary']['preview'])
            print("\n" + "-"*60)

        print("\nTRANSCRIPT:")
        print("-"*60)
        print(result['transcript'])
        print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description='Transcribe video or audio from URLs or local files'
    )
    parser.add_argument(
        'input',
        help='YouTube/TikTok/Instagram URL or local video file path'
    )
    parser.add_argument(
        '--summarize', '-s',
        action='store_true',
        help='Generate summary with metadata'
    )
    parser.add_argument(
        '--model', '-m',
        default='base',
        choices=['tiny', 'base', 'small', 'medium', 'large'],
        help='Whisper model size (default: base)'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output JSON file path'
    )

    args = parser.parse_args()

    transcriber = VideoTranscriber(model_size=args.model)
    result = transcriber.transcribe(args.input, summarize=args.summarize)

    transcriber.print_result(result)

    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Saved to: {args.output}")


if __name__ == '__main__':
    main()
