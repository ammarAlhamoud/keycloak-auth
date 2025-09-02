import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TOKEN_TIMEOUT_MS } from './shared/constants/token-timeout';

const apiCondition = createInterceptorCondition({
  urlPattern: /^http:\/\/localhost:7217(\/.*)?$/i, // deine API
  bearerPrefix: 'Bearer',
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideKeycloak({
      config: { url: 'http://localhost:8080', realm: 'demo', clientId: 'traffic-web' },
      initOptions: {
        pkceMethod: 'S256',
        onLoad: 'login-required',
        silentCheckSsoRedirectUri:
          typeof window !== 'undefined'
            ? window.location.origin + '/silent-check-sso.html'
            : undefined,
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout', // oder 'keep-alive'
          sessionTimeout: TOKEN_TIMEOUT_MS, // 10 Minuten Demo
        }),
      ],
      // WICHTIG: diese beiden Provider hinzufügen!
      providers: [AutoRefreshTokenService, UserActivityService],
    }),
    // Bearer-Token-Interceptor aktivieren
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
  ],
};
