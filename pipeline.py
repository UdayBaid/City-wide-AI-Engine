from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_step(label: str, command: list[str]) -> None:
    print(f"\n=== {label} ===")
    result = subprocess.run(command, cwd=str(ROOT), check=False)
    if result.returncode != 0:
        raise RuntimeError(f"{label} failed with exit code {result.returncode}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the full vehicle tracking and sequence training pipeline.")
    parser.add_argument("--source", type=Path, default=Path("AICity22_Track1_MTMC_Tracking"), help="Dataset source directory")
    parser.add_argument("--output", type=Path, default=Path("frames"), help="Frame extraction output directory")
    parser.add_argument("--every-nth-frame", type=int, default=1, help="Only save every Nth frame from video")
    parser.add_argument("--epochs", type=int, default=5, help="Training epochs for the LSTM-Transformer model")
    parser.add_argument("--batch-size", type=int, default=8, help="Training batch size")
    parser.add_argument("--sequence-length", type=int, default=16, help="Frame sequence length used by the model")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--force-extract", action="store_true", help="Force re-extraction even if a manifest already exists")
    args = parser.parse_args()

    run_step(
        "Extract frames",
        [
            sys.executable,
            "extract_frames.py",
            "--source",
            str(args.source),
            "--output",
            str(args.output),
            "--manifest",
            "dataset_manifest.json",
            "--every-nth-frame",
            str(args.every_nth_frame),
        ] + (["--force"] if args.force_extract else []),
    )

    run_step("YOLO detection", [sys.executable, "module/yolov8.py"])
    run_step("ByteTrack tracking", [sys.executable, "module/bytetrack.py"])
    run_step("Vehicle cropping", [sys.executable, "module/veichle_crop.py"])
    run_step("ResNet feature extraction", [sys.executable, "module/resnet_sequence.py"])
    run_step(
        "Train sequence model",
        [
            sys.executable,
            "module/train_sequence.py",
            "--source",
            str(args.source),
            "--output",
            str(args.output),
            "--every-nth-frame",
            str(args.every_nth_frame),
            "--sequence-length",
            str(args.sequence_length),
            "--batch-size",
            str(args.batch_size),
            "--epochs",
            str(args.epochs),
            "--lr",
            str(args.lr),
        ],
    )

    print("\nFull pipeline completed successfully.")


if __name__ == "__main__":
    main()
