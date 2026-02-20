#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

TIME_RANGES: list[tuple[str, str]] = [
    ("00:00", "00:04"),
    ("00:05", "00:10"),
    ("00:11", "00:17"),
    ("00:18", "00:24"),
    ("00:25", "00:34"),
    ("00:35", "00:37"),
]


def parse_timestamp(value: str) -> int:
    parts = value.split(":")
    if len(parts) == 2:
        mm, ss = parts
        return int(mm) * 60 + int(ss)
    if len(parts) == 3:
        hh, mm, ss = parts
        return int(hh) * 3600 + int(mm) * 60 + int(ss)
    raise ValueError(f"Unsupported timestamp format: {value}")


def format_timestamp(seconds_total: int) -> str:
    if seconds_total < 0:
        raise ValueError("Timestamp cannot be negative.")

    hh, rem = divmod(seconds_total, 3600)
    mm, ss = divmod(rem, 60)
    if hh > 0:
        return f"{hh:02d}:{mm:02d}:{ss:02d}"
    return f"{mm:02d}:{ss:02d}"


def find_ffmpeg() -> str | None:
    from_env = os.environ.get("FFMPEG_PATH")
    if from_env and Path(from_env).exists():
        return from_env

    from_path = shutil.which("ffmpeg")
    if from_path:
        return from_path

    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def validate_ranges(ranges: Iterable[tuple[str, str]]) -> None:
    prev_end = -1
    for index, (start, end) in enumerate(ranges, start=1):
        s = parse_timestamp(start)
        e = parse_timestamp(end)
        if s >= e:
            raise ValueError(f"Range #{index} is invalid: start >= end ({start} - {end})")
        if s < prev_end:
            raise ValueError(f"Range #{index} overlaps with previous: ({start} - {end})")
        prev_end = e


def shift_ranges(ranges: Iterable[tuple[str, str]], shift_seconds: int) -> list[tuple[str, str]]:
    shifted: list[tuple[str, str]] = []
    for start, end in ranges:
        shifted_start = parse_timestamp(start) + shift_seconds
        shifted_end = parse_timestamp(end) + shift_seconds
        if shifted_start < 0 or shifted_end < 0:
            raise ValueError(
                f"Shift {shift_seconds} makes range invalid: {start}-{end} -> negative timestamp"
            )
        shifted.append((format_timestamp(shifted_start), format_timestamp(shifted_end)))
    return shifted


def split_audio(input_file: Path, output_dir: Path, ffmpeg_bin: str, ranges: Iterable[tuple[str, str]]) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    created: list[Path] = []

    for i, (start, end) in enumerate(ranges, start=1):
        name = f"segment_{i:02d}_{start.replace(':', '-')}_{end.replace(':', '-')}{input_file.suffix.lower()}"
        out_file = output_dir / name

        cmd = [
            ffmpeg_bin,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            start,
            "-to",
            end,
            "-i",
            str(input_file),
            "-c",
            "copy",
            str(out_file),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            raise RuntimeError(f"Failed to cut range {start}-{end}: {stderr or 'unknown ffmpeg error'}")

        created.append(out_file)

    return created


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Split 'переговоры.mp3' into 6 clips by fixed timecodes from the task screenshot."
    )
    parser.add_argument(
        "--input",
        default="storage/media/переговоры.mp3",
        help="Path to source audio file (default: storage/media/переговоры.mp3)",
    )
    parser.add_argument(
        "--output-dir",
        default="storage/media/переговоры_segments",
        help="Output directory for generated clips (default: storage/media/переговоры_segments)",
    )
    parser.add_argument(
        "--shift-seconds",
        type=int,
        default=0,
        help="Shift all timecodes by N seconds (e.g. +3 or -2).",
    )
    args = parser.parse_args()

    source = Path(args.input).resolve()
    target_dir = Path(args.output_dir).resolve()

    if not source.exists():
        print(f"Input file not found: {source}", file=sys.stderr)
        return 1

    ffmpeg_bin = find_ffmpeg()
    if not ffmpeg_bin:
        print(
            "ffmpeg was not found. Install ffmpeg or run:\n"
            "  pip install imageio-ffmpeg\n"
            "or set FFMPEG_PATH to ffmpeg executable.",
            file=sys.stderr,
        )
        return 2

    ranges = shift_ranges(TIME_RANGES, args.shift_seconds)
    validate_ranges(ranges)
    created = split_audio(source, target_dir, ffmpeg_bin, ranges)

    print(f"Created {len(created)} files in: {target_dir}")
    for file in created:
        print(f"- {file.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
