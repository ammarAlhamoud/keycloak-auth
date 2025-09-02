import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

type JwtPayload = {
  resource_access?: Record<string, { roles: string[] }>;
  realm_access?: { roles: string[] };
  preferred_username?: string;
  name?: string;
  exp?: number;
};

function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  const [, payload] = token.split('.');
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  kcSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  keycloak = inject(Keycloak);

  private _accessToken = signal<string | null>(null);

  /** Wird true gesetzt, sobald wir EINMAL versucht haben, ein Token zu setzen
      (Login fertig / Refresh gelaufen). Hilft gegen frühes Rendern. */
  authReady = signal(false);

  constructor() {
    effect(() => {
      const kcSig = this.kcSignal();

      const isAuthSuccess = kcSig.type === KeycloakEventType.AuthSuccess;
      const isAuthReady = kcSig.type === KeycloakEventType.Ready;
      const isRefreshSuccess = kcSig.type === KeycloakEventType.AuthRefreshSuccess;
      if (isAuthSuccess || isAuthReady || isRefreshSuccess) {
        this.setAccessToken(this.keycloak.token);
      }
    });
  }

  setAccessToken(t: string | undefined) {
    this._accessToken.set(t ?? null);
    this.authReady.set(true);
  }

  payload = computed(() => decodeJwt(this._accessToken()));
  clientRoles = computed<string[]>(
    () => this.payload()?.resource_access?.['traffic-api']?.roles ?? []
  );
  realmRoles = computed<string[]>(() => this.payload()?.realm_access?.roles ?? []);

  hasClientRole = (roles: string | string[]) => {
    const required = Array.isArray(roles) ? roles : [roles];
    const user = new Set(this.clientRoles());
    return required.every((r) => user.has(r));
  };
  hasRealmRole = (roles: string | string[]) => {
    const required = Array.isArray(roles) ? roles : [roles];
    const user = new Set(this.realmRoles());
    return required.every((r) => user.has(r));
  };
  hasAnyClientRole = (roles: string[]) => roles.some((r) => this.hasClientRole(r));
  hasAnyRealmRole = (roles: string[]) => roles.some((r) => this.hasRealmRole(r));

  isTokenExpired = () => (this.payload()?.exp ?? 0) * 1000 < Date.now();
  isAuthenticated = computed(() => !!this._accessToken() && !this.isTokenExpired());

  userPreferredName = computed(() => this.payload()?.preferred_username ?? null);
  userFullName = computed(() => {
    console.log('userFullName:', this.payload());

    const name = this.payload()?.name ?? '';
    return `${name}`.trim() || null;
  });
}
