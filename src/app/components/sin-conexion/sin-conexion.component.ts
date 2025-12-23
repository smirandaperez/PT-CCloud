import { Component, Input } from '@angular/core';
import { NetworkService } from '../../servicios/network.service';

@Component({
  selector: 'app-sin-conexion',
  templateUrl: './sin-conexion.component.html',
  styleUrls: ['./sin-conexion.component.scss'],
  standalone: false,
})
export class SinConexionComponent {
  @Input() mensaje: string = 'Sin conexión a internet';
  @Input() mostrarIcono: boolean = true;

  online$ = this.networkService.statusChanges();

  constructor(private networkService: NetworkService) {}

  reintentar() {
    window.location.reload();
  }
}

