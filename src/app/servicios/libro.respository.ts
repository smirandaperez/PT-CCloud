import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Libro } from '../modelos/libro.modelo';


@Injectable({ providedIn: 'root' })
export class LibroRepository {
  constructor(private db: DatabaseService) {}

  async save(libro: Libro) {
    await this.db.connection.run(
      `INSERT OR REPLACE INTO libros
       (id, titulo, autores, descripcion, portada)
       VALUES (?, ?, ?, ?, ?)`,
      [
        libro.id,
        libro.titulo,
        JSON.stringify(libro.autor ?? []),
        libro.descripcion ?? '',
        libro.portada ?? null,
      ]
    );
  }

  async getById(id: string): Promise<Libro | null> {
    const res = await this.db.connection.query(
      `SELECT * FROM libros WHERE id = ?`,
      [id]
    );

    if (!res.values?.length) return null;

    const row = res.values[0];
    return {
      id: row.id,
      titulo: row.titulo,
      autor: JSON.parse(row.autores ?? '[]'),
      genero: row.genero,
      fechaPublicacion: row.fechaPublicacion,
      descripcion: row.descripcion,
      portada: row.portada,
    };
  }

  async getAll(): Promise<Libro[]> {
    const res = await this.db.connection.query(`SELECT * FROM libros`);
    return (res.values ?? []).map(r => ({
      id: r.id,
      titulo: r.titulo,
      autor: JSON.parse(r.autores ?? '[]'),
      genero: r.genero,
      fechaPublicacion: r.fechaPublicacion,
      descripcion: r.descripcion,
      portada: r.portada,
    }));
  }
}