import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private current: ThemeName = 'light';
  private storageKey = 'app-theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    const saved = (localStorage.getItem(this.storageKey) as ThemeName) || this.detectPreferred();
    this.apply(saved, false);
  }

  get theme(): ThemeName {
    return this.current;
  }

  toggle(): ThemeName {
    const next: ThemeName = this.current === 'light' ? 'dark' : 'light';
    this.apply(next);
    return next;
  }

  set(theme: ThemeName) {
    if (theme !== this.current) this.apply(theme);
  }

  private apply(theme: ThemeName, persist = true) {
    const root = document.documentElement;
    this.renderer.setAttribute(root, 'data-theme', theme);
    root.setAttribute('data-theme-transition', '');
    this.current = theme;
    if (persist) localStorage.setItem(this.storageKey, theme);
    setTimeout(() => root.removeAttribute('data-theme-transition'), 300);
  }

  private detectPreferred(): ThemeName {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
