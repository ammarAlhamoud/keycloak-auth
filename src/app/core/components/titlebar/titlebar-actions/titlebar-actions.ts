import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-titlebar-actions',
  templateUrl: './titlebar-actions.html',
  styleUrl: './titlebar-actions.scss',
  imports: [HasRoleDirective],
})
export class TitlebarActions {
  authService = inject(AuthService);

  onSignWrite() {
    // Logic for creating a new sign
  }
}
