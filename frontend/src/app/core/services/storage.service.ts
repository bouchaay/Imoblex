import { Injectable, signal } from '@angular/core';

export interface StorageInfo {
  usedBytes: number;
  quotaBytes: number;
  usedMB: number;
  quotaMB: number;
  usedGB: number;
  quotaGB: number;
  percentUsed: number;
  level: 'ok' | 'warning' | 'critical';
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  info = signal<StorageInfo | null>(null);

  async refresh(): Promise<void> {
    if (!navigator.storage?.estimate) return;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const pct = quota > 0 ? (usage / quota) * 100 : 0;
    this.info.set({
      usedBytes: usage,
      quotaBytes: quota,
      usedMB: Math.round(usage / (1024 * 1024)),
      quotaMB: Math.round(quota / (1024 * 1024)),
      usedGB: +(usage / (1024 ** 3)).toFixed(2),
      quotaGB: +(quota / (1024 ** 3)).toFixed(2),
      percentUsed: Math.round(pct),
      level: pct >= 90 ? 'critical' : pct >= 75 ? 'warning' : 'ok'
    });
  }

  formatSize(bytes: number): string {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} Go`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} Mo`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${bytes} o`;
  }
}
