import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'imoblex_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private ids = signal<Set<string>>(this.load());

  readonly count = computed(() => this.ids().size);

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  toggle(id: string): void {
    const current = new Set(this.ids());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.ids.set(current);
    this.save(current);
  }

  remove(id: string): void {
    const current = new Set(this.ids());
    if (current.has(id)) {
      current.delete(id);
      this.ids.set(current);
      this.save(current);
    }
  }

  getFavoriteIds(): string[] {
    return Array.from(this.ids());
  }

  private load(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }

  private save(ids: Set<string>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  }
}
