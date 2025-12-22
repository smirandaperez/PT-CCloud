import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Libro } from '../modelos/libro.modelo';
import { Lista } from '../modelos/lista.model';
import { DatabaseService } from './database.service';

type StorageShape = {
  listas: Lista[];
  listaItemsId: Record<string, Libro[]>;
};

type DataStatus = 'loading' | 'ready' | 'empty' | 'error';

const MAX_LISTAS = 3;

@Injectable({ providedIn: 'root' })
export class ListaService {
    constructor(private db: DatabaseService) {}

    private state$ = new BehaviorSubject<StorageShape>({ listas: [], listaItemsId: {} });
    private status$ = new BehaviorSubject<DataStatus>('loading');

    stateChanges() { return this.state$.asObservable(); }

    statusChanges() { return this.status$.asObservable(); }

    get status() { return this.status$.value; }
    get snapshot(): StorageShape { return this.state$.value; }

    getListas(): Lista[] { return this.snapshot.listas; }

    getListaById(listaId: string): Lista | undefined {
        return this.snapshot.listas.find(l => l.id === listaId);
    }

    getLibrosDeLista(listaId: string) {
        return this.snapshot.listaItemsId[listaId] ?? [];
    }

    async init() {
        try {
            this.status$.next('loading');
            await this.db.init();
            await this.refreshFromDb();
            this.status$.next(this.snapshot.listas.length ? 'ready' : 'empty');
        } catch (e) {
            console.error('Init DB error', e);
            this.status$.next('error');
        }
    }

    private async refreshFromDb() {
        
        const listasRes = await this.db.connection.query(`SELECT * FROM listas`);
        const listas: Lista[] = (listasRes.values ?? []).map(r => ({
            id: r.id,
            nombre: r.nombre,
            createdAt: new Date(r.createdAt),
        }));

        const relRes = await this.db.connection.query(`SELECT * FROM lista_libros`);
        const rel = relRes.values ?? [];

        const libroIds = [...new Set(rel.map((r: any) => r.libroId))];
        const librosMap: Record<string, Libro> = {};

        if (libroIds.length) {
            const q = `SELECT * FROM libros WHERE id IN (${libroIds.map(() => '?').join(',')})`;
            const librosRes = await this.db.connection.query(q, libroIds);

            for (const b of librosRes.values ?? []) {
                librosMap[b.id] = {
                    id: b.id,
                    titulo: b.titulo,
                    autor: JSON.parse(b.autor ?? '[]'),
                    genero: b.genero,
                    descripcion: b.descripcion,
                    fechaPublicacion: b.fechaPublicacion ? new Date(b.fechaPublicacion) : new Date(),
                    portada: b.portada,
                };
            }
        }

        const listaItemsId: Record<string, Libro[]> = {};
        for (const l of listas) listaItemsId[l.id] = [];

        for (const r of rel) {
            const libro = librosMap[r.libroId];
            if (libro) listaItemsId[r.listaId].push(libro);
        }

        this.state$.next({ listas, listaItemsId });
    }

    private validateNombre(nombre: string): string {
        const limpiar = (nombre ?? '').trim();
        if (!limpiar) throw new Error('El nombre de la lista no puede estar vacío');
        if (limpiar.length > 20) throw new Error('El nombre de la lista no puede tener más de 20 caracteres');
        return limpiar;
    }

    private async findListaByNombre(nombre: string): Promise<Lista | undefined> {
        const clean = this.validateNombre(nombre).toLowerCase();
        const res = await this.db.connection.query(
            `SELECT * FROM listas WHERE LOWER(nombre)=? LIMIT 1`,
            [clean]
        );
        const row = res.values?.[0];
        if (!row) return undefined;
        return { id: row.id, nombre: row.nombre, createdAt: new Date(row.createdAt) };
    }

    async createLista(nombre: string): Promise<string> {
        const limpiar = this.validateNombre(nombre);
      
        await this.db.init();

        const { listas, listaItemsId } = this.snapshot;
        if (listas.length >= MAX_LISTAS) {
          throw new Error('No se puede crear más listas');
        }
 
        const existe = listas.find(l => l.nombre.toLowerCase() === limpiar.toLowerCase());
        if (existe) throw new Error('La lista ya existe');
      
        const id = crypto.randomUUID?.() ?? Date.now().toString();
        const createdAt = new Date().toISOString();
   
        await this.db.connection.run(
          `INSERT INTO listas (id, nombre, createdAt) VALUES (?, ?, ?)`,
          [id, limpiar, createdAt]
        );
      
        const nuevaLista: Lista = { id, nombre: limpiar, createdAt: new Date(createdAt) };
      
        const siguiente: StorageShape = {
          listas: [...listas, nuevaLista],
          listaItemsId: { ...listaItemsId, [id]: [] },
        };
      
        this.state$.next(siguiente);
        this.status$.next('ready');
      
        return id;
      }

      async renameLista(listaId: string, nuevoNombre: string) {
        const limpiar = this.validateNombre(nuevoNombre);
        await this.db.init();
      
        await this.db.connection.run(
          `UPDATE listas SET nombre=? WHERE id=?`,
          [limpiar, listaId]
        );
      
        const listas = this.snapshot.listas.map(l => l.id === listaId ? { ...l, nombre: limpiar } : l);
        this.state$.next({ ...this.snapshot, listas });
      }
      
      async deleteLista(listaId: string) {
        await this.db.init();

        await this.db.connection.run(`DELETE FROM lista_libros WHERE listaId=?`, [listaId]);
        await this.db.connection.run(`DELETE FROM listas WHERE id=?`, [listaId]);

        const listas = this.snapshot.listas.filter(l => l.id !== listaId);
        const listaItemsId = { ...this.snapshot.listaItemsId };
        delete listaItemsId[listaId];
      
        this.state$.next({ listas, listaItemsId });
      }

    async addLibroALista(listaId: string, libroId: string) {
        await this.db.init();
        await this.db.connection.run(
        `INSERT OR IGNORE INTO lista_libros (listaId, libroId) VALUES (?, ?)`,
        [listaId, libroId]
        );
        await this.refreshFromDb();
    }

  async removeLibroDeLista(listaId: string, libroId: string) {
    await this.db.init();
    await this.db.connection.run(
      `DELETE FROM lista_libros WHERE listaId=? AND libroId=?`,
      [listaId, libroId]
    );
    await this.refreshFromDb();
  }

  async getOrCreateListaByNombre(nombre: string): Promise<string> {
    await this.db.init();
    const limpiar = this.validateNombre(nombre);

    const existente = await this.findListaByNombre(limpiar);
    if (existente) return existente.id;

    return await this.createLista(limpiar);
  }

  async getOrCreateListaDeLectura(): Promise<string> {
    await this.db.init();

    const res = await this.db.connection.query(`SELECT * FROM listas WHERE id=? LIMIT 1`, ['lectura']);
    const row = res.values?.[0];
    if (row) return 'lectura';

    await this.db.connection.run(
      `INSERT INTO listas (id, nombre, createdAt) VALUES (?, ?, ?)`,
      ['lectura', 'Lectura', new Date().toISOString()]
    );

    await this.refreshFromDb();
    return 'lectura';
  }
}