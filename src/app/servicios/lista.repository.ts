import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class ListaRepository {
  constructor(private db: DatabaseService) {}

  async getAll() {
    const res = await this.db.connection.query(`SELECT * FROM listas`);
    return res.values ?? [];
  }

  async create(lista: any) {
    await this.db.connection.run(
      `INSERT INTO listas (id, nombre, createdAt) VALUES (?, ?, ?)`,
      [lista.id, lista.nombre, lista.createdAt]
    );
  }

  async delete(id: string) {
    await this.db.connection.run(`DELETE FROM listas WHERE id = ?`, [id]);
    await this.db.connection.run(`DELETE FROM lista_libros WHERE listaId = ?`, [id]);
  }
}