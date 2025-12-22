import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleListasPage } from './detalle-listas.page';

describe('DetalleListasPage', () => {
  let component: DetalleListasPage;
  let fixture: ComponentFixture<DetalleListasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleListasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
