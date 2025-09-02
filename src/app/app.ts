import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { InactivityBanner } from './core/components/inactivity-banner/inactivity-banner';
import { Titlebar } from './core/components/titlebar/titlebar';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InactivityBanner, Titlebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly keycloak = inject(Keycloak);
  protected readonly themeService = inject(ThemeService);

  protected readonly title = signal('jwt-app');

  protected readonly logout = () => {
    this.keycloak.logout();
  };

  protected readonly toggleTheme = () => {
    this.themeService.toggle();
  };
}
