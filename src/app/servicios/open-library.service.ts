import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Libro } from '../modelos/libro.modelo';
import {map} from 'rxjs/operators';
import { catchError, of, timeout, Observable } from 'rxjs';
import { forkJoin, switchMap} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OpenLibraryService {

    private apiUrl = '/openlibrary';

    constructor(private http: HttpClient) {}

    getLibrosByGenero(genero: string){
        console.log(genero);
        return this.http.get<any>(`${this.apiUrl}/subjects/${genero}.json?limit=10`)
        .pipe(
            //timeout(5000),
            map(response  => 
            {
                const works = Array.isArray(response?.works) ? response.works : []; 
                return works.map((work:any) : Libro => ({
                    id: work.key, 
                    titulo: work.title ?? 'Sin titulo', 
                    autor: Array.isArray(work?.authors) ? work.authors.map((a:any) => a.name) : [],
                    genero: work.subject?.[0] ?? 'Sin genero',
                    descripcion: work.description ?? 'Sin descripcion',
                    fechaPublicacion: work.publish_date ?? new Date(),
                    portada: work.cover_i ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg` : '',
                }))
            }),
            catchError(error => {
                console.error('Error al cargar los libros OL', error);
                return of([]);
            })
        )
    };


    
searchLibro(query: string){
    return this.http.get<any>(`${this.apiUrl}/search.json?q=${query}&limit=10`)
    .pipe(
        map(response  => {
            const docs = Array.isArray(response?.docs) ? response.docs : [];
            return docs.map((item:any) => ({
                id: item.key, 
                titulo: item.title ?? 'Sin titulo', 
                autor: Array.isArray(item.author_name) ? item.author_name :[], 
                genero: item.subject?.[0] ?? 'Sin genero',
                descripcion: item.description ?? 'Sin descripcion',
                fechaPublicacion: item.publish_date ?? new Date(),
                portada: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
            }));
        }),     
    );
}

private getAutorNameByKey(authorKey: string) {
    // authorKey viene como "/authors/OLxxxA"
    return this.http.get<any>(`${this.apiUrl}${authorKey}.json`).pipe(
      map(a => a?.name ?? ''),
      catchError(() => of(''))
    );
  }

getLibroById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}.json`).pipe(
      switchMap(work => {
        const desc =
          typeof work?.description === 'string'
            ? work.description
            : work?.description?.value ?? 'Sin descripción';
  
        const covers = Array.isArray(work?.covers) ? work.covers : [];
        const portada = covers.length
          ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`
          : null;
  
        const subjects = Array.isArray(work?.subjects) ? work.subjects : [];
  
        const authorKeys: string[] = Array.isArray(work?.authors)
          ? work.authors
              .map((a: any) => a?.author?.key)
              .filter((k: any) => typeof k === 'string')
          : [];
  
        if (authorKeys.length === 0) {
          return of({
            id: work?.key ?? id,
            titulo: work?.title ?? 'Sin título',
            autor: [],
            genero: subjects?.[0] ?? 'Sin genero',
            descripcion: desc,
            fechaPublicacion: work?.first_publish_date ?? work?.created?.value ?? null,
            portada,
          });
        }
  
        return forkJoin(authorKeys.map(k => this.getAutorNameByKey(k))).pipe(
          map((names) => names.filter(Boolean)),
          map((autor) => ({
            id: work?.key ?? id,
            titulo: work?.title ?? 'Sin título',
            autor,
            genero: subjects?.[0] ?? 'Sin genero',
            descripcion: desc,
            fechaPublicacion: work?.first_publish_date ?? work?.created?.value ?? null,
            portada,
          }))
        );
      }),
      catchError(err => {
        console.error('Error getLibroById', err);
        return of(null);
      })
    );
  }
}