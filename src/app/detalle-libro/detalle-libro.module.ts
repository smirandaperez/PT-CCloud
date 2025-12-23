import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleLibroPageRoutingModule } from './detalle-libro-routing.module';

import { DetalleLibroPage } from './detalle-libro.page';
import { SinConexionModule } from '../components/sin-conexion/sin-conexion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleLibroPageRoutingModule,
    SinConexionModule
  ],
  declarations: [DetalleLibroPage]
})
export class DetalleLibroPageModule { }
