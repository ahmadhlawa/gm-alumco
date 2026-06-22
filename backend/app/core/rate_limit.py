"""In-memory login rate limiting.

A small dependency-free limiter that counts *failed* login attempts per client
key (IP) within a sliding window and blocks further attempts once the threshold
is reached.

LIMITATIONS (read before deploying):
- State is per-process and in memory only. It is appropriate for a single
  worker / single-process deployment.
- Behind multiple workers or replicas, each process keeps its own counters, so
  the effective limit is multiplied by the number of processes.
- For multi-process or distributed deployments, back this with a shared store
  (e.g. Redis) or enforce limits at the gateway / reverse proxy instead.
- The key is the client IP; behind a proxy ensure the real client IP is
  forwarded, otherwise all clients share one bucket.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque


class LoginRateLimiter:
    def __init__(self, max_attempts: int = 5, window_seconds: int = 300) -> None:
        self._max = max_attempts
        self._window = window_seconds
        self._failures: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def _prune(self, key: str, now: float) -> None:
        bucket = self._failures[key]
        while bucket and now - bucket[0] > self._window:
            bucket.popleft()

    def retry_after(self, key: str) -> int | None:
        """Seconds to wait if `key` is currently blocked, else None."""
        now = time.monotonic()
        with self._lock:
            self._prune(key, now)
            bucket = self._failures[key]
            if len(bucket) >= self._max:
                return max(1, int(self._window - (now - bucket[0])) + 1)
            return None

    def register_failure(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            self._prune(key, now)
            self._failures[key].append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)

    def reset_all(self) -> None:
        with self._lock:
            self._failures.clear()


# Shared instance: max 5 failed attempts per 5 minutes per client IP.
login_rate_limiter = LoginRateLimiter(max_attempts=5, window_seconds=300)
