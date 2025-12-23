import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Libro } from '../modelos/libro.modelo';
import {map} from 'rxjs/operators';
import { catchError, of, timeout, Observable } from 'rxjs';
import { forkJoin, switchMap} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class OpenLibraryService {

    private apiUrl = environment.apiBaseUrl;
    

    constructor(private http: HttpClient) {}

    private getUrl(endpoint: string): string {
      const fullUrl = `${this.apiUrl}${endpoint}`;
      return `${fullUrl}`;
  }

    private processProxyResponse(response: any): any {
        if (response?.contents) {
            try {
                return JSON.parse(response.contents);
            } catch (e) {
                console.error('Error parsing proxy response', e);
                return response;
            }
        }
        return response;
    }

    getLibrosByGenero(genero: string, limit: number = 10, offset: number = 0){
        console.log(genero);
        return this.http.get<any>(this.getUrl(`/subjects/${genero}.json?limit=${limit}&offset=${offset}`))
        .pipe(
            map(response => this.processProxyResponse(response)),
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


    
searchLibro(query: string, limit: number = 10, offset: number = 0){
    return this.http.get<any>(this.getUrl(`/search.json?q=${query}&limit=${limit}&offset=${offset}`))
    .pipe(
        map(response => this.processProxyResponse(response)),
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
        catchError(error => {
            console.error('Error al buscar libros', error);
            return of([]);
        }),     
    );
}

private getAutorNameByKey(authorKey: string) {
    return this.http.get<any>(this.getUrl(`${authorKey}.json`)).pipe(
      map(response => this.processProxyResponse(response)),
      map(a => a?.name ?? ''),
      catchError(() => of(''))
    );
  }

getLibroById(id: string) {
    const decodedId = id.replace(/%2F/g, '/');
    const cleanedId = decodedId.replace(/\/+/g, '/');
    const normalizedId = cleanedId.startsWith('/') ? cleanedId : `/${cleanedId}`;
    return this.http.get<any>(this.getUrl(`${normalizedId}.json`)).pipe(
      map(response => this.processProxyResponse(response)),
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