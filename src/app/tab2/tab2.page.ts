import { Component } from '@angular/core';
import { OpenLibraryService } from '../servicios/open-library.service';
import { Libro } from '../modelos/libro.modelo';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  libros: Libro[] = [];
  loading = false;

  constructor(private openLibraryService: OpenLibraryService) {}

  buscarLibro(event: any) {
    const value = event.detail.value?.trim();

    if(!value || value.length < 3){
      this.libros = [];
      return;
    }
    this.loading = true;

    this.openLibraryService.searchLibro(value).subscribe({
      next: resultados => {
        console.log('RESULTADO: ',resultados);
        this.libros = resultados;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar libros', err);
        this.loading = false;
      }
    });
  }
}

