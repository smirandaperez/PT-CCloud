import { Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListaService } from '../../servicios/lista.service';
import { Libro } from '../../modelos/libro.modelo';
import { ModalController } from '@ionic/angular';
import { Lista } from '../../modelos/lista.model';

@Component({
  selector: 'app-guardar-lista',
  templateUrl: './guardar-lista.component.html',
  styleUrls: ['./guardar-lista.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class GuardarListaComponent {
    @Input() lista: Lista[] = [];

    modo: 'existente' | 'nueva' = 'existente';
    listaSeleccionada: string | null = null;
    nuevoNombre = '';
    listas: Lista[] = [];

    constructor(private modalController: ModalController, private listaService: ListaService) {}

    ngOnInit() {
        this.listas = this.listaService.getListas();

        if(this.listas.length && !this.listaSeleccionada) {
            this.listaSeleccionada = this.listas[0].id;
        }
    }

    cancelar() {
        this.modalController.dismiss(null, 'cancel');
    }

    guardar() {        
        if(this.modo === 'existente') {
            if(!this.listaSeleccionada) return;
            this.modalController.dismiss({mode: 'existente', listaId: this.listaSeleccionada}, 'ok');
            return;
        }
        const nombre = (this.nuevoNombre ?? '').trim();
        if(!nombre) return;

        try{
            this.listaService.createLista(nombre);

            this.listas = this.listaService.getListas();
            const ultimaLista = this.listas[this.listas.length - 1];
            if(!ultimaLista) return;

            this.modalController.dismiss({mode: 'nueva', listaId: ultimaLista.id, nombre: ultimaLista.nombre}, 'ok');   
        } catch(e: any) {
            console.error(e);
        }
    }
}