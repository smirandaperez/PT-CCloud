import { Libro } from "./libro.modelo";

export interface ListaItem {
    id: string;
    libro: Libro;
    createdAt: number;
}