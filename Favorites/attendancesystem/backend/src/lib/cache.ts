// Lightweight in-process LRU cache.
// Used to avoid redundant DB lookups on hot paths (org membership checks).
// TTL is intentionally short so role changes propagate quickly.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<K, V> {
  private readonly map = new Map<K, CacheEntry<V>>();

  constructor(
    private readonly maxSize: number,
    private readonly defaultTtlMs: number,
  ) {}

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // Move to end (most recently used)
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    if (this.map.size >= this.maxSize) {
      // Evict the oldest entry (first key)
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

// Cache for org membership lookups: key = `${userId}:${orgId}`
// 30 second TTL so a role change takes at most 30s to propagate.
export const membershipCache = new LRUCache<string, import('../types').OrgMember | null>(
  5000,
  30_000,
);

// Cache for organization settings: key = orgId
// 60 second TTL.
export const orgSettingsCache = new LRUCache<string, import('../types').Organization | null>(
  500,
  60_000,
);
