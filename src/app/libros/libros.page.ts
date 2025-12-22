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
  error = false;
  errorMessage = '';
  genero = '';

  constructor(private router: Router, private route: ActivatedRoute, private openLibraryService: OpenLibraryService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const g = this.route.snapshot.paramMap.get('genero');
      if(g){
        this.genero = g;
        this.cargarLibros(g);
      }
    });
  }

    cargarLibros(genero: string) {    
    this.loading = true;
    this.errorMessage = '';
    this.libros = [];

    this.openLibraryService.getLibrosByGenero(genero).subscribe({
      next: (data) => {        
        this.libros = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los libros';        
        this.loading = false;
        this.error = true;
      }
    });
    
    }

    verDetalleLibro(libro: Libro) {
      const id = encodeURIComponent(libro.id);
      this.router.navigate(['/tabs/detalle-libro', encodeURIComponent(id)]);
    }
  }
