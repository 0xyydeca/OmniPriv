import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EncryptedCredential, VaultRecord } from './types';

interface VaultDB extends DBSchema {
  credentials: {
    key: string;
    value: VaultRecord;
    indexes: { 'by-expiry': number; 'by-added': number };
  };
}

const DB_NAME = 'omnipriv-vault';
const DB_VERSION = 1;

/**
 * Vault manager for client-side encrypted credential storage
 */
export class Vault {
  private db: IDBPDatabase<VaultDB> | null = null;

  /**
   * Initialize the vault database
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<VaultDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('credentials')) {
          const store = db.createObjectStore('credentials', { keyPath: 'id' });
          store.createIndex('by-expiry', 'credential.expiry');
          store.createIndex('by-added', 'addedAt');
        }
      },
    });
  }

  /**
   * Add an encrypted credential to the vault
   */
  async addCredential(
    id: string,
    credential: EncryptedCredential
  ): Promise<void> {
    await this.ensureInit();

    const record: VaultRecord = {
      id,
      credential,
      addedAt: Date.now(),
    };

    await this.db!.put('credentials', record);
  }

  /**
   * Get a credential by ID
   */
  async getCredential(id: string): Promise<VaultRecord | undefined> {
    await this.ensureInit();
    return await this.db!.get('credentials', id);
  }

  /**
   * Get all credentials
   */
  async getAllCredentials(): Promise<VaultRecord[]> {
    await this.ensureInit();
    return await this.db!.getAll('credentials');
  }

  /**
   * Get valid (non-expired) credentials
   */
  async getValidCredentials(): Promise<VaultRecord[]> {
    const all = await this.getAllCredentials();
    const now = Math.floor(Date.now() / 1000);
    return all.filter((r) => r.credential.expiry > now);
  }

  /**
   * Remove a credential
   */
  async removeCredential(id: string): Promise<void> {
    await this.ensureInit();
    await this.db!.delete('credentials', id);
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    await this.ensureInit();
    const record = await this.getCredential(id);
    if (record) {
      record.lastUsed = Date.now();
      await this.db!.put('credentials', record);
    }
  }

  /**
   * Clear all credentials (use with caution!)
   */
  async clear(): Promise<void> {
    await this.ensureInit();
    await this.db!.clear('credentials');
  }

  /**
   * Export vault data for backup
   */
  async exportVault(): Promise<VaultRecord[]> {
    return await this.getAllCredentials();
  }

  /**
   * Import vault data from backup
   */
  async importVault(records: VaultRecord[]): Promise<void> {
    await this.ensureInit();
    const tx = this.db!.transaction('credentials', 'readwrite');
    await Promise.all(records.map((r) => tx.store.put(r)));
    await tx.done;
  }

  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }
}

// Singleton instance
let vaultInstance: Vault | null = null;

export function getVault(): Vault {
  if (!vaultInstance) {
    vaultInstance = new Vault();
  }
  return vaultInstance;
}

