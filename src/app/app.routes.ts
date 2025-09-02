import { Routes } from '@angular/router';
import { clientRoleGuard } from './core/guards/client-role.guard';

export const routes: Routes = [
  {
    path: 'signs',
    loadComponent: () => import('./features/signs/signs-page/signs').then((m) => m.SignsPage),
    canActivate: [clientRoleGuard],

    data: { anyClientRole: ['signs.read', 'signs.write'] }, // jeder, der lesen oder schreiben darf
  },
  {
    path: 'signs/new',
    loadComponent: () => import('./features/signs/signs-edit/signs-edit').then((m) => m.SignsEdit),
    canActivate: [clientRoleGuard],
    data: { requiredClientRoles: ['signs.write'] }, // nur Schreiber (z. B. User/Manager/Admin)
  },
  {
    path: 'violations/review',
    loadComponent: () => import('./features/violations/review/review').then((m) => m.Review),
    canActivate: [clientRoleGuard],
    data: { requiredClientRoles: ['violations.review'] }, // Manager/Admin
  },
];
