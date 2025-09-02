import { Component } from '@angular/core';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-signs',
  imports: [HasRoleDirective],
  templateUrl: './signs.html',
  styleUrl: './signs.scss',
})
export class SignsPage {}
