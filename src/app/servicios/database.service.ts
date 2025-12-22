import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;

  private initPromise: Promise<void> | null = null;
  private isReady = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  init(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        await this.sqlite.initWebStore();
      }
      const dbName = 'PT-CCloud_db';
      this.db = await this.sqlite.createConnection(
        dbName,
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      await this.createTables();

      this.isReady = true;
    })();

    return this.initPromise;
  }

  get connection(): SQLiteDBConnection {
    if (!this.isReady) {
      throw new Error('DB no inicializada. Llama db.init() primero.');
    }
    return this.db;
  }

  private async createTables() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS listas (
        id TEXT PRIMARY KEY NOT NULL,
        nombre TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS libros (
        id TEXT PRIMARY KEY NOT NULL,
        titulo TEXT,
        autor TEXT,
        genero TEXT,
        descripcion TEXT,
        fechaPublicacion TEXT,
        portada TEXT
      );

      CREATE TABLE IF NOT EXISTS lista_libros (
        listaId TEXT NOT NULL,
        libroId TEXT NOT NULL,
        PRIMARY KEY (listaId, libroId)
      );
    `);
  }
}