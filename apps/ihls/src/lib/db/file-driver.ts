import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { matches, sortDocs, type CollectionDriver, type DatabaseDriver, type Doc, type Filter, type FindOptions } from "./driver";

/**
 * File-backed document store with the same contract as the MongoDB driver.
 * Real persistence on disk — not an in-memory mock. Writes are serialised per
 * collection and committed atomically (write temp file, then rename).
 */

/**
 * Default store location sits NEXT TO the project, not inside it: the Next.js
 * development file watcher treats writes inside the project tree as source
 * changes, and a busy write-heavy store makes it thrash and eventually exit.
 * Override with DATA_DIR.
 */
const ROOT = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), "..", ".ihls-data");

type Cache = Map<string, Doc[]>;
const cache: Cache = new Map();
const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(name) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  locks.set(name, previous.then(() => gate));
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function load(name: string): Promise<Doc[]> {
  const cached = cache.get(name);
  if (cached) return cached;
  const file = path.join(ROOT, `${name}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Doc[];
    cache.set(name, parsed);
    return parsed;
  } catch {
    cache.set(name, []);
    return cache.get(name)!;
  }
}

async function persist(name: string, docs: Doc[]): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
  const file = path.join(ROOT, `${name}.json`);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(docs), "utf8");
  await fs.rename(tmp, file);
  cache.set(name, docs);
}

class FileCollection<T extends Doc> implements CollectionDriver<T> {
  constructor(private readonly name: string) {}

  async find(filter: Filter, options: FindOptions = {}): Promise<T[]> {
    const docs = (await load(this.name)) as T[];
    let out = docs.filter((d) => matches(d, filter));
    out = sortDocs(out, options.sort);
    if (options.skip) out = out.slice(options.skip);
    if (options.limit !== undefined) out = out.slice(0, options.limit);
    return out.map((d) => structuredClone(d));
  }

  async findOne(filter: Filter): Promise<T | null> {
    const [first] = await this.find(filter, { limit: 1 });
    return first ?? null;
  }

  async insertOne(doc: T): Promise<T> {
    return withLock(this.name, async () => {
      const docs = (await load(this.name)) as T[];
      const next = [...docs, structuredClone(doc)];
      await persist(this.name, next as Doc[]);
      return doc;
    });
  }

  async insertMany(docs: T[]): Promise<number> {
    if (docs.length === 0) return 0;
    return withLock(this.name, async () => {
      const existing = (await load(this.name)) as T[];
      await persist(this.name, [...existing, ...docs.map((d) => structuredClone(d))] as Doc[]);
      return docs.length;
    });
  }

  async updateOne(filter: Filter, patch: Partial<T>): Promise<T | null> {
    return withLock(this.name, async () => {
      const docs = (await load(this.name)) as T[];
      const index = docs.findIndex((d) => matches(d, filter));
      if (index === -1) return null;
      const updated = { ...docs[index], ...patch } as T;
      const next = [...docs];
      next[index] = updated;
      await persist(this.name, next as Doc[]);
      return structuredClone(updated);
    });
  }

  async upsert(filter: Filter, doc: T): Promise<T> {
    return withLock(this.name, async () => {
      const docs = (await load(this.name)) as T[];
      const index = docs.findIndex((d) => matches(d, filter));
      const next = [...docs];
      if (index === -1) next.push(structuredClone(doc));
      else next[index] = { ...docs[index], ...doc } as T;
      await persist(this.name, next as Doc[]);
      return structuredClone((index === -1 ? doc : next[index]) as T);
    });
  }

  async deleteMany(filter: Filter): Promise<number> {
    return withLock(this.name, async () => {
      const docs = (await load(this.name)) as T[];
      const kept = docs.filter((d) => !matches(d, filter));
      const removed = docs.length - kept.length;
      if (removed) await persist(this.name, kept as Doc[]);
      return removed;
    });
  }

  async count(filter: Filter): Promise<number> {
    return (await this.find(filter)).length;
  }
}

export class FileDatabaseDriver implements DatabaseDriver {
  readonly kind = "file" as const;
  readonly label = `File store (${ROOT})`;
  private readonly collections = new Map<string, FileCollection<Doc>>();

  collection<T extends Doc = Doc>(name: string): CollectionDriver<T> {
    let existing = this.collections.get(name);
    if (!existing) {
      existing = new FileCollection<Doc>(name);
      this.collections.set(name, existing);
    }
    return existing as unknown as CollectionDriver<T>;
  }

  async ping(): Promise<boolean> {
    await fs.mkdir(ROOT, { recursive: true });
    return true;
  }
}

/** Used by the seed script to start from a known state. */
export async function resetFileStore(): Promise<void> {
  cache.clear();
  await fs.rm(ROOT, { recursive: true, force: true });
  await fs.mkdir(ROOT, { recursive: true });
}
