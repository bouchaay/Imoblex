import { Component, OnInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
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
