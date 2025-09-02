import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface RoleData {
  requiredClientRoles?: string[];
  anyClientRole?: string[]; // optional: reicht eine der Rollen
}

export const clientRoleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const data = route.data as RoleData;
  const requiredAll = data?.requiredClientRoles ?? [];
  const requiredAny = data?.anyClientRole ?? [];

  const okAll = requiredAll.length === 0 || auth.hasClientRole(requiredAll);
  const okAny = requiredAny.length === 0 || auth.hasAnyClientRole(requiredAny);

  if (okAll && okAny) return true;

  // Optional: auf eigene 403-Seite schicken
  return router.parseUrl('/forbidden') as UrlTree;
};
