import os
import json
import hashlib
import logging
from typing import Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class CacheService:
    """
    Distributed caching layer for Lexicon AI.

    Caches:
      - Token schemas (LLM prompt structures)
      - Embedding / intermediate LLM computations
      - Common search queries

    Uses Redis as the backing store. Falls back gracefully to
    no-op behaviour if Redis is unreachable so the app never
    crashes on a missing cache node.
    """

    # TTL constants (seconds)
    TTL_TOKEN_SCHEMA = 3600        # 1 hour  — prompt templates change rarely
    TTL_EMBEDDING    = 1800        # 30 mins — intermediate research results
    TTL_QUERY        = 900         # 15 mins — common search queries
    TTL_MEMORY       = 300         # 5  mins — user memory context reads

    def __init__(self) -> None:
        self._client = None
        self._connect()

    def _connect(self) -> None:
        """Attempt to connect to Redis. Silently disable if unavailable."""
        try:
            import redis
            self._client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                password=os.getenv("REDIS_PASSWORD") or None,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            # Ping to verify the connection is real
            self._client.ping()
            logger.info("CacheService: connected to Redis at %s:%s",
                        os.getenv("REDIS_HOST", "localhost"),
                        os.getenv("REDIS_PORT", 6379))
        except Exception as exc:
            logger.warning(
                "CacheService: Redis unavailable (%s). Running without cache.", exc
            )
            self._client = None

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _make_key(namespace: str, raw: str) -> str:
        """
        Build a deterministic cache key.
        Format: lexicon:<namespace>:<sha256 of raw string>
        Keeps keys short regardless of input length.
        """
        digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
        return f"lexicon:{namespace}:{digest}"

    def _get(self, key: str) -> Optional[Any]:
        """Return deserialised value or None (cache miss / Redis down)."""
        if not self._client:
            return None
        try:
            raw = self._client.get(key)
            return json.loads(raw) if raw is not None else None
        except Exception as exc:
            logger.warning("CacheService.get failed for key=%s: %s", key, exc)
            return None

    def _set(self, key: str, value: Any, ttl: int) -> None:
        """Serialise value and store with TTL. Silent on failure."""
        if not self._client:
            return
        try:
            self._client.setex(key, ttl, json.dumps(value))
        except Exception as exc:
            logger.warning("CacheService.set failed for key=%s: %s", key, exc)

    def _delete(self, key: str) -> None:
        """Remove a key. Silent on failure."""
        if not self._client:
            return
        try:
            self._client.delete(key)
        except Exception as exc:
            logger.warning("CacheService.delete failed for key=%s: %s", key, exc)

    # ── Public API ─────────────────────────────────────────────────────────────

    @property
    def is_available(self) -> bool:
        """True when Redis is reachable."""
        return self._client is not None

    # Token-schema cache

    def get_token_schema(self, query: str, context: Optional[str]) -> Optional[str]:
        """Return cached LLM response for this (query, context) pair, or None."""
        raw = f"schema:{query}:{(context or '')[:500]}"
        return self._get(self._make_key("schema", raw))

    def set_token_schema(self, query: str, context: Optional[str], value: str) -> None:
        raw = f"schema:{query}:{(context or '')[:500]}"
        self._set(self._make_key("schema", raw), value, self.TTL_TOKEN_SCHEMA)

    # Embedding / intermediate result cache

    def get_embedding(self, phase: str, content: str) -> Optional[str]:
        """Return cached intermediate LLM output for a given phase + content."""
        raw = f"embed:{phase}:{content[:1000]}"
        return self._get(self._make_key("embed", raw))

    def set_embedding(self, phase: str, content: str, value: str) -> None:
        raw = f"embed:{phase}:{content[:1000]}"
        self._set(self._make_key("embed", raw), value, self.TTL_EMBEDDING)

    # Query cache

    def get_query(self, query: str) -> Optional[str]:
        """Return cached synthesis result for a common search query."""
        return self._get(self._make_key("query", query))

    def set_query(self, query: str, value: str) -> None:
        self._set(self._make_key("query", query), value, self.TTL_QUERY)

    # User memory cache

    def get_memory(self, user_id: str) -> Optional[str]:
        """Return cached memory context for a user."""
        return self._get(self._make_key("memory", user_id))

    def set_memory(self, user_id: str, value: str) -> None:
        self._set(self._make_key("memory", user_id), value, self.TTL_MEMORY)

    def invalidate_memory(self, user_id: str) -> None:
        """Call this when user memory is updated so stale data is evicted."""
        self._delete(self._make_key("memory", user_id))


# Module-level singleton — imported once, reused everywhere
cache = CacheService()