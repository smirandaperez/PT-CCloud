import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListaService } from '../servicios/lista.service';
import { Lista } from '../modelos/lista.model';
import { Libro } from '../modelos/libro.modelo';

@Component({
  selector: 'app-detalle-listas',
  templateUrl: './detalle-listas.page.html',
  styleUrls: ['./detalle-listas.page.scss'],
  standalone: false,
})
export class DetalleListasPage implements OnInit {
  lista?: Lista;
  libros: Libro[] = [];
  constructor(private route: ActivatedRoute, private listaService: ListaService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { return; }

    this.lista = this.listaService.getListas().find(l => l.id === id) ?? { id, nombre: '', createdAt: Date.now() };

  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.lista = this.listaService.getListaById(id);
    this.libros = this.listaService.getLibrosDeLista(id);
  }

  removeLibro(libroId: string) {
    const listaId = this.route.snapshot.paramMap.get('id')!;
    this.listaService.removeLibroDeLista(listaId, libroId);
    this.libros = this.listaService.getLibrosDeLista(listaId);
  }

}
