import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LibrosPageRoutingModule } from './libros-routing.module';

import { LibrosPage } from './libros.page';
import { SinConexionModule } from '../components/sin-conexion/sin-conexion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibrosPageRoutingModule,
    SinConexionModule
  ],
  declarations: [LibrosPage]
})
export class LibrosPageModule {}
