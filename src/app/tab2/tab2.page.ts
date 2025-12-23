import { Component } from '@angular/core';
import { OpenLibraryService } from '../servicios/open-library.service';
import { Libro } from '../modelos/libro.modelo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  libros: Libro[] = [];
  loading = false;
  loadingMore = false;
  offset = 0;
  limit = 10;
  hasMore = true;
  currentQuery = '';

  constructor(
    private openLibraryService: OpenLibraryService,
    private router: Router
  ) { }

  buscarLibro(event: any) {
    const value = event.detail.value?.trim();

    if (!value || value.length < 3) {
      this.libros = [];
      this.resetPagination();
      return;
    }

    if (this.currentQuery !== value) {
      this.resetPagination();
      this.currentQuery = value;
    }

    this.loading = true;

    this.openLibraryService.searchLibro(value, this.limit, this.offset).subscribe({
      next: resultados => {
        console.log('RESULTADO: ', resultados);
        if (this.offset === 0) {
          this.libros = resultados;
        } else {
          this.libros = [...this.libros, ...resultados];
        }

        this.offset += resultados.length;
        this.hasMore = resultados.length === this.limit;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar libros', err);
        this.loading = false;
      }
    });
  }

  resetPagination() {
    this.offset = 0;
    this.hasMore = true;
    this.libros = [];
  }

  cargarMas() {
    if (!this.loadingMore && this.hasMore && this.currentQuery) {
      this.loadingMore = true;
      this.openLibraryService.searchLibro(this.currentQuery, this.limit, this.offset).subscribe({
        next: resultados => {
          this.libros = [...this.libros, ...resultados];
          this.offset += resultados.length;
          this.hasMore = resultados.length === this.limit;
          this.loadingMore = false;
        },
        error: (err) => {
          console.error('Error al cargar más libros', err);
          this.loadingMore = false;
        }
      });
    }
  }

  verDetalleLibro(libro: Libro) {
    const id = encodeURIComponent(libro.id);
    this.router.navigate(['/tabs/detalle-libro', encodeURIComponent(id)], {
      queryParams: { origen: 'tab2' }
    });
  }
}

