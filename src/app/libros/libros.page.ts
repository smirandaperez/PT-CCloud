import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OpenLibraryService } from '../servicios/open-library.service';
import { Libro } from '../modelos/libro.modelo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.page.html',
  styleUrls: ['./libros.page.scss'],
  standalone: false,
})
export class LibrosPage implements OnInit {

  libros: any[] = [];
  loading = true;
  loadingMore = false;
  error = false;
  errorMessage = '';
  genero = '';
  offset = 0;
  limit = 10;
  hasMore = true;

  constructor(private router: Router, private route: ActivatedRoute, private openLibraryService: OpenLibraryService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const g = this.route.snapshot.paramMap.get('genero');
      if (g) {
        this.genero = g;
        this.resetPagination();
        this.cargarLibros(g, true);
      }
    });
  }

  resetPagination() {
    this.offset = 0;
    this.hasMore = true;
    this.libros = [];
  }

  cargarLibros(genero: string, reset: boolean = false) {
    if (reset) {
      this.loading = true;
      this.errorMessage = '';
      this.libros = [];
      this.offset = 0;
      this.hasMore = true;
    } else {
      this.loadingMore = true;
    }

    this.openLibraryService.getLibrosByGenero(genero, this.limit, this.offset).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.libros = [...this.libros, ...data];
          this.offset += data.length;
          this.hasMore = data.length === this.limit;
        } else {
          this.hasMore = false;
        }
        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los libros';
        this.loading = false;
        this.loadingMore = false;
        this.error = true;
      }
    });

  }

  cargarMas() {
    if (!this.loadingMore && this.hasMore) {
      this.cargarLibros(this.genero, false);
    }
  }

  verDetalleLibro(libro: Libro) {
    const id = encodeURIComponent(libro.id);
    const genero = this.genero;
    const returnUrl = `/tabs/libros/${genero}`;
    this.router.navigate(['/tabs/detalle-libro', encodeURIComponent(id)], {
      queryParams: { returnUrl, origen: 'tab1' }
    });
  }
}
