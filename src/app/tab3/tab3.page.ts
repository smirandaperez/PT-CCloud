import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ListaService } from '../servicios/lista.service';
import { Lista } from '../modelos/lista.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  listas: Lista[] = [];

  constructor(
    public listaService: ListaService, 
    private alertController: AlertController, 
    private router: Router
  ) {}

  async ionViewWillEnter() {
    this.listas = this.listaService.getListas();
  }

  async crearLista() {
    const alert = await this.alertController.create({
      header: 'Crear lista',
      inputs: [{ type: 'text', placeholder: 'Nombre de la lista', name: 'nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            try {
              this.listaService.createLista(data.nombre);
              this.listas = this.listaService.getListas();
              return true;
            } catch (e) {
              console.error(e);
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async renombrarLista(lista: Lista) {
    const alert = await this.alertController.create({
      header: 'Renombrar lista',
      inputs: [{ type: 'text', name: 'nombre', value: lista.nombre }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              await this.listaService.renameLista(lista.id, data.nombre);
              this.listas = this.listaService.getListas();
              return true;
            } catch (error) {
              console.error(error);
              return false;
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

  async eliminarLista(id: string) {
    await this.listaService.deleteLista(id);
    this.listas = this.listaService.getListas();
  }

  abrirLista(lista: Lista){
    this.router.navigate(['/tabs/detalle-lista', lista.id]);
  }
}
