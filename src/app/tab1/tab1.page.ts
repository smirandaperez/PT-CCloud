import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListaService } from '../servicios/lista.service';
import { NetworkService } from '../servicios/network.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  constructor(private router: Router, private listaService: ListaService, private network: NetworkService) {}

  status$ = this.listaService.statusChanges();
  online$ = this.network.statusChanges();

  generos = [
    { id: 'romance', nombre: 'Romance' },
    { id: 'horror', nombre: 'Terror' },
    { id: 'mystery', nombre: 'Misterio' },
    { id: 'fantasy', nombre: 'Fantasía' },

  ];
  

  navigateToGenero(genero: any) {
    this.router.navigate(['/tabs/libros', genero.id]);
  }
}
