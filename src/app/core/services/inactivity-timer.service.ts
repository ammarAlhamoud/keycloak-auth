import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, interval, merge } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { TOKEN_TIMEOUT_MS } from '../../shared/constants/token-timeout';

const INACTIVITY_TIMEOUT_MS = new InjectionToken<number>('INACTIVITY_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => TOKEN_TIMEOUT_MS, // 10 Minuten – gleich wie in provideKeycloak(...)
});

@Injectable({ providedIn: 'root' })
export class InactivityTimerService {
  private lastActivityAt = Date.now();
  private remainingMsSubject = new BehaviorSubject<number>(0);
  readonly remainingMs$ = this.remainingMsSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private zone: NgZone,
    @Inject(INACTIVITY_TIMEOUT_MS) private timeoutMs: number
  ) {
    this.remainingMsSubject.next(this.timeoutMs);
    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(this.doc, 'mousemove'),
        fromEvent(this.doc, 'mousedown'),
        fromEvent(this.doc, 'keydown'),
        fromEvent(this.doc, 'touchstart'),
        fromEvent(this.doc, 'scroll'),
        fromEvent(this.doc, 'visibilitychange')
      ).pipe(tap(() => (this.lastActivityAt = Date.now())));

      // jede Sekunde Restzeit neu berechnen
      const tick$ = interval(1000).pipe(startWith(0));

      merge(activity$, tick$).subscribe(() => {
        const elapsed = Date.now() - this.lastActivityAt;
        const remaining = Math.max(this.timeoutMs - elapsed, 0);
        this.remainingMsSubject.next(remaining);
      });
    });
  }

  /** Manuell „Aktivität“ setzen, z. B. über einen Button „Ich bin noch da“ */
  ping(): void {
    this.lastActivityAt = Date.now();
  }
}
