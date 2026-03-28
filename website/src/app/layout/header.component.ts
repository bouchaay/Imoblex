import { Component, OnInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header" [class.header--transparent]="isTransparent() && isHomePage()" [class.header--solid]="!isTransparent() || !isHomePage()">
      <div class="container-fluid">
        <div class="flex items-center justify-between h-20">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span class="logo-text font-heading font-bold text-2xl tracking-tight"
                  [class.text-white]="isTransparent() && isHomePage()"
                  [class.text-primary]="!isTransparent() || !isHomePage()">
              Imoblex
            </span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-8">
            <a routerLink="/vente" routerLinkActive="active" class="nav-link"
               [class.text-white]="isTransparent() && isHomePage()"
               [class.text-primary]="!isTransparent() || !isHomePage()">
              Vente
            </a>
            <a routerLink="/location" routerLinkActive="active" class="nav-link"
               [class.text-white]="isTransparent() && isHomePage()"
               [class.text-primary]="!isTransparent() || !isHomePage()">
              Location
            </a>
            <a routerLink="/estimation" routerLinkActive="active" class="nav-link"
               [class.text-white]="isTransparent() && isHomePage()"
               [class.text-primary]="!isTransparent() || !isHomePage()">
              Estimation
            </a>
            <a routerLink="/simulateur-pret" routerLinkActive="active" class="nav-link"
               [class.text-white]="isTransparent() && isHomePage()"
               [class.text-primary]="!isTransparent() || !isHomePage()">
              Simulateur
            </a>
            <a routerLink="/agence" routerLinkActive="active" class="nav-link"
               [class.text-white]="isTransparent() && isHomePage()"
               [class.text-primary]="!isTransparent() || !isHomePage()">
              L'agence
            </a>
            <a routerLink="/contact" class="btn-accent text-sm px-5 py-2.5 rounded-lg">
              Contact
            </a>
          </nav>

          <!-- Mobile Menu Toggle -->
          <button
            class="lg:hidden flex flex-col gap-1.5 p-2 group"
            (click)="toggleMobileMenu()"
            aria-label="Menu">
            <span class="block w-6 h-0.5 transition-all duration-300"
                  [class.bg-white]="isTransparent() && isHomePage()"
                  [class.bg-primary]="!isTransparent() || !isHomePage()"
                  [class.rotate-45]="mobileMenuOpen()"
                  [class.translate-y-2]="mobileMenuOpen()"></span>
            <span class="block w-6 h-0.5 transition-all duration-300"
                  [class.bg-white]="isTransparent() && isHomePage()"
                  [class.bg-primary]="!isTransparent() || !isHomePage()"
                  [class.opacity-0]="mobileMenuOpen()"></span>
            <span class="block w-6 h-0.5 transition-all duration-300"
                  [class.bg-white]="isTransparent() && isHomePage()"
                  [class.bg-primary]="!isTransparent() || !isHomePage()"
                  [class.-rotate-45]="mobileMenuOpen()"
                  [class.-translate-y-2]="mobileMenuOpen()"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.is-open]="mobileMenuOpen()">
        <div class="flex items-center justify-between px-6 h-20 border-b border-white/10">
          <a routerLink="/" class="flex items-center gap-3" (click)="closeMobileMenu()">
            <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span class="font-heading font-bold text-2xl text-white">Imoblex</span>
          </a>
          <button class="text-white p-2" (click)="closeMobileMenu()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav class="flex flex-col px-6 pt-8 gap-1">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="text-accent"
               class="text-white/80 hover:text-white text-xl font-medium py-4 border-b border-white/10 transition-colors"
               (click)="closeMobileMenu()">
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="px-6 mt-8">
          <a routerLink="/contact" class="btn-accent w-full text-center text-lg py-4 rounded-xl" (click)="closeMobileMenu()">
            Nous contacter
          </a>
        </div>

        <div class="px-6 mt-auto mb-8 pt-8">
          <p class="text-white/50 text-sm">📞 05 61 00 00 00</p>
          <p class="text-white/50 text-sm mt-1">✉️ contact&#64;imoblex.fr</p>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private sub?: Subscription;

  isTransparent = signal(true);
  isHomePage = signal(true);
  mobileMenuOpen = signal(false);

  navItems = [
    { path: '/vente', label: 'Vente' },
    { path: '/location', label: 'Location' },
    { path: '/estimation', label: 'Estimation gratuite' },
    { path: '/simulateur-pret', label: 'Simulateur de prêt' },
    { path: '/agence', label: "L'agence" },
    { path: '/contact', label: 'Contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isTransparent.set(window.scrollY < 80);
  }

  ngOnInit(): void {
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isHomePage.set(e.urlAfterRedirects === '/');
      this.closeMobileMenu();
    });
    this.isHomePage.set(this.router.url === '/');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
    document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }
}
