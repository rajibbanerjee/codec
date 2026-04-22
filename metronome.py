#!/usr/bin/env python3
"""
Python Metronome
Controls: +/- or </> adjust BPM, [/] change time signature, Space toggle, q quit
"""

import sys
import time
import threading
import termios
import tty
import select
import numpy as np
import sounddevice as sd

SAMPLE_RATE = 44100
MIN_BPM = 20
MAX_BPM = 300

ANSI_CLEAR_LINE = "\r\033[K"
ANSI_BOLD = "\033[1m"
ANSI_RESET = "\033[0m"
ANSI_GREEN = "\033[92m"
ANSI_YELLOW = "\033[93m"
ANSI_RED = "\033[91m"
ANSI_CYAN = "\033[96m"
ANSI_DIM = "\033[2m"

TIME_SIGNATURES = [2, 3, 4, 5, 6, 7, 8]


def generate_click(freq: float, duration: float = 0.06, volume: float = 0.7) -> np.ndarray:
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    envelope = np.exp(-t * 50)
    wave = np.sin(2 * np.pi * freq * t) * envelope * volume
    # add a tiny noise transient at the start for a sharper attack
    wave[:int(SAMPLE_RATE * 0.003)] += np.random.randn(int(SAMPLE_RATE * 0.003)) * 0.15 * volume
    return wave.astype(np.float32)


ACCENT_CLICK = generate_click(1400, volume=1.0)   # beat 1
NORMAL_CLICK = generate_click(900, volume=0.65)    # other beats


class Metronome:
    def __init__(self, bpm: int = 120, beats: int = 4):
        self.bpm = bpm
        self.beats = beats
        self.running = False
        self._beat_num = 0
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None

    def start(self):
        if self.running:
            return
        self.running = True
        self._beat_num = 0
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self.running = False
        if self._thread:
            self._thread.join(timeout=1)
            self._thread = None

    def toggle(self):
        if self.running:
            self.stop()
        else:
            self.start()

    def adjust_bpm(self, delta: int):
        with self._lock:
            self.bpm = max(MIN_BPM, min(MAX_BPM, self.bpm + delta))

    def adjust_beats(self, delta: int):
        with self._lock:
            idx = TIME_SIGNATURES.index(self.beats) if self.beats in TIME_SIGNATURES else 2
            idx = max(0, min(len(TIME_SIGNATURES) - 1, idx + delta))
            self.beats = TIME_SIGNATURES[idx]
            self._beat_num = 0

    def _loop(self):
        next_tick = time.perf_counter()
        while self.running:
            now = time.perf_counter()
            if now >= next_tick:
                with self._lock:
                    bpm = self.bpm
                    beats = self.beats
                    self._beat_num = (self._beat_num % beats) + 1
                    beat_num = self._beat_num

                click = ACCENT_CLICK if beat_num == 1 else NORMAL_CLICK
                sd.play(click, SAMPLE_RATE)
                _render(bpm, beats, beat_num, running=True)

                next_tick += 60.0 / bpm
            time.sleep(0.001)


def _render(bpm: int, beats: int, beat_num: int, running: bool):
    status = f"{ANSI_GREEN}▶ PLAYING{ANSI_RESET}" if running else f"{ANSI_DIM}■ STOPPED{ANSI_RESET}"

    # Beat indicator dots
    dots = []
    for i in range(1, beats + 1):
        if i == beat_num and running:
            color = ANSI_RED if i == 1 else ANSI_YELLOW
            dots.append(f"{color}{ANSI_BOLD}●{ANSI_RESET}")
        else:
            dots.append(f"{ANSI_DIM}○{ANSI_RESET}")
    beat_display = "  ".join(dots)

    sys.stdout.write(
        f"{ANSI_CLEAR_LINE}"
        f"{status}  {ANSI_CYAN}{ANSI_BOLD}{bpm:3d} BPM{ANSI_RESET}  "
        f"[{beats}/4]  {beat_display}"
        f"  {ANSI_DIM}+/- bpm  [/] sig  space  q{ANSI_RESET}"
    )
    sys.stdout.flush()


def _read_key(fd: int) -> str | None:
    """Non-blocking single keypress read."""
    if select.select([fd], [], [], 0)[0]:
        ch = sys.stdin.read(1)
        if ch == "\x1b":
            # Arrow key escape sequence
            if select.select([fd], [], [], 0.05)[0]:
                seq = sys.stdin.read(2)
                return {"[A": "UP", "[B": "DOWN", "[C": "RIGHT", "[D": "LEFT"}.get(seq, "")
        return ch
    return None


def main():
    bpm = 120
    beats = 4

    if len(sys.argv) >= 2:
        try:
            bpm = int(sys.argv[1])
            bpm = max(MIN_BPM, min(MAX_BPM, bpm))
        except ValueError:
            print(f"Usage: {sys.argv[0]} [BPM] [beats_per_measure]", file=sys.stderr)
            sys.exit(1)

    if len(sys.argv) >= 3:
        try:
            beats = int(sys.argv[2])
            beats = beats if beats in TIME_SIGNATURES else 4
        except ValueError:
            pass

    metro = Metronome(bpm=bpm, beats=beats)

    print(f"{ANSI_BOLD}Python Metronome{ANSI_RESET}")
    print("Controls: +/- or ◄►  adjust BPM  |  [/]  time signature  |  Space  start/stop  |  q  quit")
    print()

    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)

    metro.start()

    try:
        tty.setraw(fd)
        while True:
            key = _read_key(fd)
            if key is None:
                time.sleep(0.02)
                continue

            if key in ("q", "Q", "\x03"):  # q or Ctrl-C
                break
            elif key in ("+", "=", "RIGHT", "UP"):
                metro.adjust_bpm(+5)
            elif key in ("-", "_", "LEFT", "DOWN"):
                metro.adjust_bpm(-5)
            elif key == ">":
                metro.adjust_bpm(+1)
            elif key == "<":
                metro.adjust_bpm(-1)
            elif key == "]":
                metro.adjust_beats(+1)
            elif key == "[":
                metro.adjust_beats(-1)
            elif key == " ":
                metro.toggle()
                with metro._lock:
                    _render(metro.bpm, metro.beats, metro._beat_num, metro.running)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        metro.stop()
        print(f"\n{ANSI_DIM}Metronome stopped.{ANSI_RESET}")


if __name__ == "__main__":
    main()
