import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageService } from '@app/core/services/storage/storage.service';

const SIDEBAR_EXPANDED_KEY = 'sidebar-is-expanded';
const SIDEBAR_EXPANDED_DEFAULT = true; // change to false to start collapsed by default

@Injectable({
  providedIn: 'root',
})
export class SidebarStateService {
  private readonly storage = inject(LocalStorageService);
  readonly sidebarIsExpanded = signal(this.loadInitialValue());

  toggleSidebar(): void {
    const expanded = !this.sidebarIsExpanded();
    this.sidebarIsExpanded.set(expanded);
    this.storage.setItem(SIDEBAR_EXPANDED_KEY, expanded);
  }

  private loadInitialValue(): boolean {
    const storedValue = this.storage.getItem<boolean>(SIDEBAR_EXPANDED_KEY);
    return storedValue ?? SIDEBAR_EXPANDED_DEFAULT;
  }
}
