import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenLibraryService } from '../servicios/open-library.service';
import { ActivatedRoute } from '@angular/router';
import { ListaService } from '../servicios/lista.service';
import { GuardarListaComponent } from '../modals/guardar-lista-modal/guardar-lista.component';
import { ModalController, ToastController } from '@ionic/angular';
import { LibroRepository } from '../servicios/libro.respository';
import { NetworkService } from '../servicios/network.service';

@Component({
  selector: 'app-detalle-libro',
  templateUrl: './detalle-libro.page.html',
  styleUrls: ['./detalle-libro.page.scss'],
  standalone: false,
})
export class DetalleLibroPage implements OnInit {

  detalleLibro: any;
  loading = true;
  defaultBackHref: string | null = null;
  online$ = this.networkService.statusChanges();

  constructor(
    private listaService: ListaService,
    private router: Router,
    private route: ActivatedRoute,
    private api: OpenLibraryService,
    private modalController: ModalController,
    private toastController: ToastController,
    private libroRepository: LibroRepository,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (!rawId) { return; }
    const id = decodeURIComponent(rawId);
    if (!id) { return; }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.defaultBackHref = returnUrl;
    } else {
      const origen = this.route.snapshot.queryParamMap.get('origen');
      if (origen) {
        this.defaultBackHref = origen === 'tab2' ? '/tabs/tab2' : '/tabs/tab1';
      } else {
        this.defaultBackHref = null;
      }
    }

    this.api.getLibroById(id).subscribe({
      next: (data) => { this.detalleLibro = data; this.loading = false; },
      error: () => { this.loading = false },
    });
  }

  async abrirGuardarEnLista() {
    const listas = this.listaService.getListas();

    const modal = await this.modalController.create({
      component: GuardarListaComponent,
      componentProps: { listas }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role !== 'ok' || !data) return;

    try {
      let listaId: string;

      if (data.mode === 'existente') {
        listaId = data.listaId;
      } else {
        listaId = await this.listaService.getOrCreateListaByNombre(data.nombre);
      }

      await this.guardarLibroEnLista(listaId);

      const t = await this.toastController.create({
        message: 'Libro guardado en la lista',
        duration: 1500,
        position: 'bottom',
      });
      t.present();
    } catch (e: any) {
      const t = await this.toastController.create({
        message: e?.message ?? 'No se pudo guardar',
        duration: 1800,
        color: 'danger',
      });
      t.present();
    }
  }

  async agregarAListaDeLectura() {
    const listaId = await this.listaService.getOrCreateListaDeLectura();
    await this.guardarLibroEnLista(listaId);
  }

  async guardarLibroEnLista(listaId: string) {
    const libro = {
      id: this.detalleLibro.id,
      titulo: this.detalleLibro.titulo,
      autor: this.detalleLibro.autor,
      descripcion: this.detalleLibro.descripcion,
      portada: this.detalleLibro.portada,
      genero: this.detalleLibro.genero,
      fechaPublicacion: this.detalleLibro.fechaPublicacion,
    };

    await this.libroRepository.save(libro);

    await this.listaService.addLibroALista(listaId, libro.id);

  }

  get titulo(): string {
    return this.detalleLibro?.title ?? this.detalleLibro?.titulo ?? 'Sin título';
  }

  get autores(): string[] {

    if (Array.isArray(this.detalleLibro?.autor)) return this.detalleLibro.autor;
    if (Array.isArray(this.detalleLibro?.authors)) return this.detalleLibro.authors;
    return [];
  }

  get descripcion(): string {
    return this.detalleLibro?.descripcion ?? this.detalleLibro?.description ?? 'Sin descripción disponible.';
  }

  get fechaPublicacion(): string {
    return this.detalleLibro?.fechaPublicacion ?? this.detalleLibro?.publish_date ?? 'Sin fecha de publicación disponible.';
  }

  get coverUrl(): string | null {
    return this.detalleLibro?.portada ?? this.detalleLibro?.coverUrl ?? null;
  }
}
