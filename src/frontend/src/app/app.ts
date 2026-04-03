import {MediaMatcher} from '@angular/cdk/layout';
import {Component, OnDestroy, inject, signal} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatToolbarModule, MatListModule, MatSidenavModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly title = signal('frontend');

  protected readonly isMobile = signal(true);
  protected readonly snavOpen = signal(false);
  protected readonly darkMode = signal(false);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    const stored = localStorage.getItem('darkMode');
    const prefersDark = stored !== null ? stored === 'true' : media.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode.set(prefersDark);
    document.documentElement.classList.toggle('dark-mode', prefersDark);
    document.documentElement.classList.toggle('light-mode', !prefersDark);
  }

  protected toggleDarkMode(): void {
    const isDark = !this.darkMode();
    this.darkMode.set(isDark);
    localStorage.setItem('darkMode', String(isDark));
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('light-mode', !isDark);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
