// this directive can be applied to any element
// it should show the element only if the user has the required role

import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private element = inject(ElementRef);

  hasRole = input<string[]>([]);

  constructor() {
    effect(() => {
      const roles = this.hasRole();
      console.log('roles:', roles);

      const hasAnyRole = this.authService.hasAnyRealmRole(roles);

      if (hasAnyRole) {
        // Show the element
        this.element.nativeElement.style.display = 'block';
      } else {
        // Hide the element
        this.element.nativeElement.style.display = 'none';
      }
    });
  }
}
