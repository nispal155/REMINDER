import { Table } from 'dexie';

export abstract class BaseRepository<T, K> {
  constructor(protected readonly table: Table<T, K>) {}

  async getById(id: K): Promise<T | undefined> {
    return this.table.get(id);
  }

  async getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async create(item: T): Promise<K> {
    return this.table.add(item);
  }

  async put(item: T): Promise<K> {
    return this.table.put(item);
  }

  async update(id: K, changes: Partial<T>): Promise<number> {
    return this.table.update(id, changes as any);
  }

  async delete(id: K): Promise<void> {
    return this.table.delete(id);
  }

  async count(): Promise<number> {
    return this.table.count();
  }

  async clear(): Promise<void> {
    return this.table.clear();
  }

  getTable(): Table<T, K> {
    return this.table;
  }
}

