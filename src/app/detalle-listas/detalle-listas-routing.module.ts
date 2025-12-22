import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleListasPage } from './detalle-listas.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleListasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleListasPageRoutingModule {}
