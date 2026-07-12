import { Injectable, OnInit, OnDestroy, signal } from '@angular/core';

@Injectable()
export class LandingViewModel implements OnDestroy {
  readonly year = new Date().getFullYear();

  animatedEff = signal(0);
  animatedOrders = signal(0);
  animatedDelay = signal(0);

  private animInterval: any;

  startAnimations(): void {
    this.animInterval = setInterval(() => {
      if (this.animatedEff() < 94)       this.animatedEff.update(v => v + 2);
      if (this.animatedOrders() < 10482) this.animatedOrders.update(v => v + 250);
      if (this.animatedDelay() < 28)     this.animatedDelay.update(v => v + 1);
    }, 30);
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    clearInterval(this.animInterval);
  }
}
