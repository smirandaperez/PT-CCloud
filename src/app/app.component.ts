import { Component, OnInit } from '@angular/core';
import { DatabaseService } from './servicios/database.service';
import { NetworkService } from './servicios/network.service';
import { ListaService } from './servicios/lista.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private db: DatabaseService, private network: NetworkService, private listaService: ListaService) {
    this.bootstrap();
  }
  async ngOnInit() {
    await this.network.init();
    await this.listaService.init();
  }
  async bootstrap() {
    try {
      await this.db.init();
      console.log('DB inicializada');
    } catch(e: any) {
      console.error('Error al inicializar la DB', e);
    }
  }
}
