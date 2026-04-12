import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DocItem {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  propertyId?: string;
  propertyReference?: string;
  mandateId?: string;
  mandateReference?: string;
  contactId?: string;
  contactName?: string;
  uploadedByName?: string;
  notes?: string;
  folderPath?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly _change = new Subject<void>();
  readonly change$ = this._change.asObservable();

  getAll(params?: { type?: string; folder?: string; personal?: boolean; propertyId?: string; mandateId?: string; contactId?: string }): Observable<DocItem[]> {
    let p = new HttpParams();
    if (params?.type) p = p.set('type', params.type);
    if (params?.folder) p = p.set('folder', params.folder);
    if (params?.personal) p = p.set('personal', 'true');
    if (params?.propertyId) p = p.set('propertyId', params.propertyId);
    if (params?.mandateId) p = p.set('mandateId', params.mandateId);
    if (params?.contactId) p = p.set('contactId', params.contactId);
    return this.http.get<DocItem[]>('/api/documents', { params: p });
  }

  getFolders(): Observable<string[]> {
    return this.http.get<string[]>('/api/documents/folders');
  }

  upload(file: File, type: string, opts?: { folderPath?: string; propertyId?: string; mandateId?: string; contactId?: string }): Observable<DocItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    if (opts?.folderPath) form.append('folderPath', opts.folderPath);
    if (opts?.propertyId) form.append('propertyId', opts.propertyId);
    if (opts?.mandateId) form.append('mandateId', opts.mandateId);
    if (opts?.contactId) form.append('contactId', opts.contactId);
    return this.http.post<DocItem>('/api/documents/upload', form);
  }

  createFolder(name: string): Observable<void> {
    return this.http.post<{ name: string }>('/api/documents/folders', { name }).pipe(
      map(() => undefined)
    );
  }

  deleteFolder(name: string): Observable<void> {
    return this.http.delete<void>(`/api/documents/folders/${encodeURIComponent(name)}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/documents/${id}`);
  }

  notifyChange(): void { this._change.next(); }

  formatSize(bytes?: number): string {
    if (!bytes) return '—';
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} Go`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${bytes} o`;
  }

  getIcon(type: string, mime?: string): { icon: string; color: string } {
    if (mime?.startsWith('image/')) return { icon: 'pi-image', color: '#8b5cf6' };
    const map: Record<string, { icon: string; color: string }> = {
      MANDATE:   { icon: 'pi-file-edit', color: '#1B4F72' },
      COMPROMIS: { icon: 'pi-file', color: '#F39C12' },
      DPE:       { icon: 'pi-bolt', color: '#10b981' },
      PHOTO:     { icon: 'pi-image', color: '#8b5cf6' },
      INVOICE:   { icon: 'pi-receipt', color: '#ef4444' },
      OTHER:     { icon: 'pi-file', color: '#64748b' },
    };
    return map[type?.toUpperCase()] ?? { icon: 'pi-file', color: '#64748b' };
  }
}
