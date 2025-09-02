import { Component, effect, inject, signal } from '@angular/core';
import { MmssPipe } from '../../../shared/pipes/mmss.pipe';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { InactivityTimerService } from '../../services/inactivity-timer.service';
import { TOKEN_TIMEOUT_MS } from '../../../shared/constants/token-timeout';

@Component({
  selector: 'app-inactivity-banner',
  imports: [CommonModule, MmssPipe],
  templateUrl: './inactivity-banner.html',
  styleUrl: './inactivity-banner.scss',
})
export class InactivityBanner {
  private svc = inject(InactivityTimerService);

  TOKEN_TIMEOUT_MS = TOKEN_TIMEOUT_MS;

  remaining = toSignal(this.svc.remainingMs$, { initialValue: Infinity });
  show = signal(false);

  constructor() {
    effect(() => {
      const ms = this.remaining();
      // Warnung  anzeigen
      this.show.set(ms <= TOKEN_TIMEOUT_MS && ms > 0);
    });
  }
}
