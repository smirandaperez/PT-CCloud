import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private status$ = new BehaviorSubject<ConnectionStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  statusChanges() {
    return this.status$.asObservable();
  }

  get snapshot(): ConnectionStatus {
    return this.status$.value;
  }

  get isOnline(): boolean {
    return !!this.status$.value.connected;
  }

  private listener?: { remove: () => Promise<void> };

  async init(): Promise<void> {
    const current = await Network.getStatus();
    this.status$.next(current);

    this.listener = await Network.addListener('networkStatusChange', (status) => {
      this.status$.next(status);
    });
  }

  async destroy(): Promise<void> {
    if (this.listener) {
      await this.listener.remove();
      this.listener = undefined;
    }
  }
}