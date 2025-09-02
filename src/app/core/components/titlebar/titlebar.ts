import { Component, inject, signal } from '@angular/core';
import { TitlebarActions } from './titlebar-actions/titlebar-actions';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-titlebar',
  imports: [TitlebarActions],
  templateUrl: './titlebar.html',
  styleUrl: './titlebar.scss',
})
export class Titlebar {
  authService = inject(AuthService);

  protected readonly title = signal('Verkehrsordnung');
}
