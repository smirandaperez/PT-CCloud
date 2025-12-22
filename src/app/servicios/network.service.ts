import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private status$ = new BehaviorSubject<ConnectionStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  /** Observable para escuchar cambios */
  statusChanges() {
    return this.status$.asObservable();
  }

  /** Snapshot actual */
  get snapshot(): ConnectionStatus {
    return this.status$.value;
  }

  /** Helper */
  get isOnline(): boolean {
    return !!this.status$.value.connected;
  }

  private listener?: { remove: () => Promise<void> };

  /** Llamar 1 sola vez al iniciar la app (AppComponent) */
  async init(): Promise<void> {
    // estado inicial
    const current = await Network.getStatus();
    this.status$.next(current);

    // escuchar cambios
    this.listener = await Network.addListener('networkStatusChange', (status) => {
      this.status$.next(status);
    });
  }

  /** opcional: limpiar listener */
  async destroy(): Promise<void> {
    if (this.listener) {
      await this.listener.remove();
      this.listener = undefined;
    }
  }
}