import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleListasPageRoutingModule } from './detalle-listas-routing.module';

import { DetalleListasPage } from './detalle-listas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleListasPageRoutingModule
  ],
  declarations: [DetalleListasPage]
})
export class DetalleListasPageModule {}
