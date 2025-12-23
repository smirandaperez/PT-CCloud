import { Component } from '@angular/core';
import { ListaService } from '../servicios/lista.service';
import { NetworkService } from '../servicios/network.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  constructor(private listaService: ListaService, private network: NetworkService, private navCtrl: NavController) {}

  status$ = this.listaService.statusChanges();
  online$ = this.network.statusChanges();

  generos = [
    { id: 'romance', nombre: 'Romance' },
    { id: 'horror', nombre: 'Terror' },
    { id: 'mystery', nombre: 'Misterio' },
    { id: 'fantasy', nombre: 'Fantasía' },

  ];
  

  navigateToGenero(genero: any) {    
    this.navCtrl.navigateForward(['/tabs/libros', genero.id]);
  }
}
