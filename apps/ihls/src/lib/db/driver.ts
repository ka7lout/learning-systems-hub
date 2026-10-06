import "server-only";

/**
 * Storage abstraction (§188, §206).
 *
 * MongoDB is the production source of truth. A file-backed driver implements the
 * same contract so the application runs — with real persistence — before an Atlas
 * cluster is provisioned. The driver in use is reported truthfully in /settings
 * and /admin; it is never hidden from the operator.
 */

export type Primitive = string | number | boolean | null;
export type FilterValue = Primitive | { $in: Primitive[] } | { $lt?: Primitive; $lte?: Primitive; $gt?: Primitive; $gte?: Primitive } | { $ne: Primitive } | { $exists: boolean };
export type Filter = Record<string, FilterValue | undefined>;

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface Doc {
  _id: string;
  [key: string]: unknown;
}

export interface CollectionDriver<T extends Doc = Doc> {
  find(filter: Filter, options?: FindOptions): Promise<T[]>;
  findOne(filter: Filter): Promise<T | null>;
  insertOne(doc: T): Promise<T>;
  insertMany(docs: T[]): Promise<number>;
  updateOne(filter: Filter, patch: Partial<T>): Promise<T | null>;
  upsert(filter: Filter, doc: T): Promise<T>;
  deleteMany(filter: Filter): Promise<number>;
  count(filter: Filter): Promise<number>;
}

export interface DatabaseDriver {
  readonly kind: "mongodb" | "file";
  readonly label: string;
  collection<T extends Doc = Doc>(name: string): CollectionDriver<T>;
  ping(): Promise<boolean>;
}

/** Shared predicate evaluation so both drivers agree on semantics. */
export function matches(doc: Record<string, unknown>, filter: Filter): boolean {
  for (const [key, cond] of Object.entries(filter)) {
    if (cond === undefined) continue;
    const value = doc[key];
    if (cond !== null && typeof cond === "object") {
      const c = cond as Record<string, unknown>;
      if ("$in" in c) {
        if (!Array.isArray(c.$in) || !c.$in.includes(value as Primitive)) return false;
      }
      if ("$ne" in c && value === c.$ne) return false;
      if ("$exists" in c) {
        const present = value !== undefined && value !== null;
        if (present !== Boolean(c.$exists)) return false;
      }
      for (const op of ["$lt", "$lte", "$gt", "$gte"] as const) {
        if (op in c) {
          const target = c[op];
          if (value === undefined || value === null) return false;
          const a = value as number | string;
          const b = target as number | string;
          if (op === "$lt" && !(a < b)) return false;
          if (op === "$lte" && !(a <= b)) return false;
          if (op === "$gt" && !(a > b)) return false;
          if (op === "$gte" && !(a >= b)) return false;
        }
      }
    } else if (value !== cond) {
      return false;
    }
  }
  return true;
}

export function sortDocs<T extends Record<string, unknown>>(docs: T[], sort?: Record<string, 1 | -1>): T[] {
  if (!sort) return docs;
  const entries = Object.entries(sort);
  return [...docs].sort((x, y) => {
    for (const [key, dir] of entries) {
      const a = x[key] as string | number | undefined;
      const b = y[key] as string | number | undefined;
      if (a === b) continue;
      if (a === undefined) return 1;
      if (b === undefined) return -1;
      return a < b ? -dir : dir;
    }
    return 0;
  });
}
