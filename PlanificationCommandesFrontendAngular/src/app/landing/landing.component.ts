import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/components/navbar.component';
import { LanguageService } from '../shared/services/language.service';
import { LandingViewModel } from './landing.viewmodel';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent],
  providers: [LandingViewModel],
  template: `
    <app-navbar></app-navbar>

    <main class="landing-main">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-grid"></div>
        <div class="hero-bg-glow"></div>
        <div class="hero-content">
          <div class="company-header">
            <div class="wicmic-logo">
              <img src="/logomic.jpg" alt="WIC MIC GROUP" width="60" height="60">
            </div>
            <div class="company-badge">
              <span class="badge-dot"></span>
              <span>{{ t().companyBadge }}</span>
            </div>
          </div>

          <h1 class="hero-title">
            <span class="title-line-1">{{ t().heroTitleLine1 }}</span>
            <span class="title-line-2">{{ t().heroTitleLine2 }}</span>
          </h1>
          <p class="hero-desc">{{ t().heroDescLanding }}</p>
          <div class="hero-actions">
            <a routerLink="/auth/signup" class="cta-btn-primary">
              {{ t().getStarted }}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <button class="cta-btn-secondary" (click)="vm.scrollToFeatures()">{{ t().learnMore }}</button>
          </div>

          <div class="company-stats">
            <div class="company-stat">
              <div class="stat-number">1,900+</div>
              <div class="stat-label">{{ t().employeesLabel }}</div>
            </div>
            <div class="company-stat">
              <div class="stat-number">1990</div>
              <div class="stat-label">{{ t().establishedLabel }}</div>
            </div>
            <div class="company-stat">
              <div class="stat-number">30+</div>
              <div class="stat-label">{{ t().experienceLabel }}</div>
            </div>
          </div>
        </div>

        <!-- Production visualization -->
        <div class="hero-visual">
          <div class="visual-card main-card">
            <div class="card-header">
              <div class="card-dots"><span></span><span></span><span></span></div>
              <span class="card-title-sm">{{ t().denimFlow }}</span>
            </div>
            <div class="production-flow">
              <div class="flow-step">
                <div class="step-icon design">D</div>
                <div class="step-label">{{ t().designLabel }}</div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-icon preparation">P</div>
                <div class="step-label">{{ t().preparationLabel }}</div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-icon production">M</div>
                <div class="step-label">{{ t().manufacturingLabel }}</div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-icon finishing">F</div>
                <div class="step-label">{{ t().finishingLabel }}</div>
              </div>
            </div>
            <div class="card-footer-metrics">
              <div class="metric-pill green">
                <span class="metric-dot green-dot"></span>
                {{ t().sustainableProduction }}
              </div>
              <div class="metric-val">{{ vm.animatedEff() }}% {{ t().efficiencyLabel }}</div>
            </div>
          </div>

          <div class="visual-card side-card side-card-top">
            <div class="side-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div class="side-num">{{ vm.animatedOrders() | number }}</div>
              <div class="side-lbl">{{ t().jeansProduced }}</div>
            </div>
          </div>

          <div class="visual-card side-card side-card-bottom">
            <div class="side-icon orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <div class="side-num accent-orange">-{{ vm.animatedDelay() }}%</div>
              <div class="side-lbl">{{ t().productionDelay }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Company Heritage Section -->
      <section class="heritage-section">
        <div class="section-inner">
          <div class="heritage-grid">
            <div class="heritage-content">
              <div class="section-label">{{ t().heritageTitle }}</div>
              <h2 class="section-title">{{ t().heritageSubtitle }}</h2>
              <p class="heritage-desc">{{ t().heritageDesc }}</p>
              <div class="heritage-features">
                <div class="heritage-feature">
                  <div class="feature-icon-circle icon-green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 11 3 3L22 4"/>
                    </svg>
                  </div>
                  <div>
                    <h4>{{ t().sustainableManufacturing }}</h4>
                    <p>{{ t().sustainableManufacturingDesc }}</p>
                  </div>
                </div>
                <div class="heritage-feature">
                  <div class="feature-icon-circle icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <div>
                    <h4>{{ t().globalExport }}</h4>
                    <p>{{ t().globalExportDesc }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="heritage-visual">
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-year">1990</div>
                  <div class="timeline-content">{{ t().companyFounded }}</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2005</div>
                  <div class="timeline-content">{{ t().majorExpansion }}</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2015</div>
                  <div class="timeline-content">{{ t().sustainabilityInitiative }}</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-year">2024</div>
                  <div class="timeline-content">{{ t().digitalTransformation }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Digital Transformation Features -->
      <section class="features-section" id="features">
        <div class="section-inner">
          <div class="section-label">{{ t().digitalTransformationTitle }}</div>
          <h2 class="section-title">{{ t().digitalTransformationSubtitle }}</h2>
          <p class="section-subtitle">{{ t().featuresSubtitle }}</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ t().smartSchedulingTitle }}</h3>
              <p class="feature-desc">{{ t().smartSchedulingDesc }}</p>
              <div class="feature-line"></div>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ t().resourceOptimizationTitle }}</h3>
              <p class="feature-desc">{{ t().resourceOptimizationDesc }}</p>
              <div class="feature-line"></div>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap icon-sky">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ t().realtimeMonitoringTitle }}</h3>
              <p class="feature-desc">{{ t().realtimeMonitoringDesc }}</p>
              <div class="feature-line"></div>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3 class="feature-title">{{ t().sustainableAnalyticsTitle }}</h3>
              <p class="feature-desc">{{ t().sustainableAnalyticsDesc }}</p>
              <div class="feature-line"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-inner">
          <div class="wicmic-logo-large">
            <img src="/logomic.jpg" alt="WIC MIC GROUP" width="80" height="80">
          </div>
          <h2 class="cta-title">{{ t().joinWicMic }}</h2>
          <p class="cta-sub">{{ t().joinWicMicDesc }}</p>
          <a routerLink="/auth/signup" class="cta-btn-primary cta-final-btn">
            {{ t().getStarted }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <div class="cta-deco-circle cta-c1"></div>
          <div class="cta-deco-circle cta-c2"></div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="/logomic.jpg" alt="WIC MIC GROUP" width="48" height="48" style="border-radius: 8px;">
            <div>
              <div class="footer-logo-text">WIC MIC GROUP</div>
              <div class="footer-tagline">{{ t().tagline }}</div>
            </div>
          </div>
          <div class="footer-info">
            <div class="footer-address">
              {{ t().footerAddress }}<br>
              {{ t().establishedLabel }}: 1990 | 1,900+ {{ t().employeesLabel }}
            </div>
            <div class="footer-links">
              <a href="#">About Us</a>
              <a href="#">Sustainability</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div class="footer-copy">
            &copy; {{ vm.year }} WIC MIC GROUP. {{ t().footerRights }}
          </div>
        </div>
      </footer>
    </main>
  `,
  styles: [`
    .landing-main { padding-top: 64px; overflow-x: hidden; }
    .hero-section {
      position: relative; min-height: calc(100vh - 64px);
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 3rem; align-items: center;
      padding: 4rem 2rem; max-width: 1280px; margin: 0 auto;
    }
    .hero-bg-grid {
      position: absolute; inset: 0;
      background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
      background-size: 50px 50px; opacity: 0.4; pointer-events: none;
    }
    .hero-bg-glow {
      position: absolute; top: 0; right: 20%; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(1,63,130,0.08) 0%, transparent 70%);
      filter: blur(60px); pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .company-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .wicmic-logo img, .wicmic-logo-large img { display: block; border-radius: 12px; box-shadow: var(--shadow-md); }
    .company-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.4rem 0.9rem; background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted);
    }
    .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .hero-title { font-family: 'Barlow Condensed', sans-serif; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .title-line-1 { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: var(--color-primary); letter-spacing: -0.02em; line-height: 1.1; }
    .title-line-2 { font-size: clamp(1.3rem, 2.5vw, 2rem); font-weight: 600; color: var(--text); letter-spacing: -0.01em; line-height: 1.2; }
    .hero-desc { font-size: 1rem; line-height: 1.7; color: var(--text-muted); margin-bottom: 2.5rem; max-width: 540px; }
    .hero-actions { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
    .cta-btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.85rem 1.75rem; background: var(--color-primary); color: #fff;
      font-size: 0.95rem; font-weight: 700; border: none; border-radius: 10px;
      cursor: pointer; text-decoration: none; transition: all 0.25s;
      box-shadow: 0 4px 16px rgba(1,63,130,0.25);
    }
    .cta-btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(1,63,130,0.35); }
    .cta-btn-secondary {
      padding: 0.85rem 1.75rem; background: transparent; color: var(--text);
      font-size: 0.95rem; font-weight: 600; border: 1.5px solid var(--border);
      border-radius: 10px; cursor: pointer; transition: all 0.2s;
    }
    .cta-btn-secondary:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .company-stats { display: flex; gap: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
    .company-stat { display: flex; flex-direction: column; }
    .stat-number { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 800; color: var(--color-primary); line-height: 1; margin-bottom: 0.35rem; }
    .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .hero-visual { position: relative; display: flex; align-items: center; justify-content: center; }
    .visual-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-md); }
    .main-card { width: 100%; max-width: 500px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .card-dots { display: flex; gap: 6px; }
    .card-dots span { width: 10px; height: 10px; border-radius: 50%; background: var(--border); }
    .card-title-sm { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .production-flow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding: 1rem 0; }
    .flow-step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .step-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #fff; }
    .step-icon.design { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
    .step-icon.preparation { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
    .step-icon.production { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
    .step-icon.finishing { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
    .step-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .flow-arrow { color: var(--border); font-size: 1.5rem; }
    .card-footer-metrics { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); }
    .metric-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .metric-pill.green { background: rgba(151,192,9,0.1); color: #97C009; }
    .metric-dot { width: 6px; height: 6px; border-radius: 50%; }
    .green-dot { background: #97C009; }
    .metric-val { font-size: 1.1rem; font-weight: 800; color: var(--color-primary); }
    .side-card { position: absolute; right: -20px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 1rem; }
    .side-card-top { top: 20px; }
    .side-card-bottom { bottom: 20px; }
    .side-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .side-icon.blue { background: rgba(59,130,246,0.1); color: #3B82F6; }
    .side-icon.orange { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .side-num { font-size: 1.5rem; font-weight: 800; color: var(--color-primary); line-height: 1; }
    .side-num.accent-orange { color: #F59E0B; }
    .side-lbl { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top: 0.25rem; }
    .heritage-section { background: var(--surface-alt); padding: 6rem 2rem; }
    .section-inner { max-width: 1280px; margin: 0 auto; }
    .section-label { font-size: 0.75rem; font-weight: 800; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1rem; }
    .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: var(--text); margin-bottom: 1rem; letter-spacing: -0.02em; line-height: 1.2; }
    .section-subtitle { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 3rem; line-height: 1.6; }
    .heritage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .heritage-desc { font-size: 1rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 2.5rem; }
    .heritage-features { display: grid; gap: 2rem; }
    .heritage-feature { display: flex; gap: 1rem; }
    .feature-icon-circle { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .feature-icon-circle.icon-green { background: rgba(151,192,9,0.1); color: #97C009; }
    .feature-icon-circle.icon-blue { background: rgba(59,130,246,0.1); color: #3B82F6; }
    .heritage-feature h4 { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
    .heritage-feature p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }
    .timeline { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; box-shadow: var(--shadow-md); }
    .timeline-item { display: flex; gap: 1.5rem; padding: 1.25rem 0; border-bottom: 1px solid var(--border); }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-year { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--color-primary); flex-shrink: 0; width: 70px; }
    .timeline-content { font-size: 0.95rem; font-weight: 600; color: var(--text); padding-top: 0.25rem; }
    .features-section { padding: 6rem 2rem; background: var(--bg); }
    .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
    .feature-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; transition: all 0.3s; position: relative; overflow: hidden; }
    .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .feature-icon-wrap { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
    .feature-icon-wrap.icon-blue { background: rgba(59,130,246,0.1); color: #3B82F6; }
    .feature-icon-wrap.icon-green { background: rgba(16,185,129,0.1); color: #10B981; }
    .feature-icon-wrap.icon-sky { background: rgba(14,165,233,0.1); color: #0EA5E9; }
    .feature-icon-wrap.icon-orange { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .feature-title { font-size: 1.3rem; font-weight: 700; color: var(--text); margin-bottom: 0.75rem; }
    .feature-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; }
    .feature-line { width: 60px; height: 3px; background: var(--color-accent); border-radius: 2px; }
    .cta-section { position: relative; overflow: hidden; background: var(--surface-alt); padding: 6rem 2rem; text-align: center; }
    .cta-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
    .wicmic-logo-large { margin-bottom: 1.5rem; display: flex; justify-content: center; }
    .wicmic-logo-large img { box-shadow: var(--shadow-lg); }
    .cta-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: var(--text); margin-bottom: 1rem; letter-spacing: -0.01em; }
    .cta-sub { color: var(--text-muted); font-size: 1rem; margin-bottom: 2.5rem; line-height: 1.6; }
    .cta-final-btn { margin: 0 auto; }
    .cta-deco-circle { position: absolute; border-radius: 50%; border: 1px solid var(--border); }
    .cta-c1 { width: 400px; height: 400px; top: -100px; left: -100px; }
    .cta-c2 { width: 300px; height: 300px; bottom: -80px; right: -60px; }
    .footer { background: var(--footer-bg); border-top: 1px solid var(--border); padding: 2rem 0; }
    .footer-inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .footer-brand { display: flex; align-items: center; gap: 1rem; }
    .footer-logo-text { font-weight: 800; color: var(--text); font-size: 1.1rem; }
    .footer-tagline { font-size: 0.85rem; color: var(--text-muted); }
    .footer-info { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem; }
    .footer-address { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
    .footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .footer-links a { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: var(--color-primary); }
    .footer-copy { font-size: 0.78rem; color: var(--text-muted); text-align: center; padding-top: 1rem; border-top: 1px solid var(--border); }
    @media (max-width: 900px) {
      .hero-section, .heritage-grid { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: 1fr; }
      .hero-visual { margin-top: 3rem; }
      .footer-info { flex-direction: column; gap: 1rem; }
      .company-stats { justify-content: space-between; }
      .side-card { position: relative; right: auto; margin: 0.5rem 0; }
      .side-card-top, .side-card-bottom { position: relative; top: auto; bottom: auto; }
    }
    @media (max-width: 600px) {
      .company-stats { flex-direction: column; gap: 1rem; }
      .hero-actions { flex-direction: column; }
      .hero-actions .cta-btn-primary, .hero-actions .cta-btn-secondary { width: 100%; text-align: center; justify-content: center; }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  vm = inject(LandingViewModel);
  t = inject(LanguageService).t;

  ngOnInit(): void {
    this.vm.startAnimations();
  }

  ngOnDestroy(): void {
    this.vm.ngOnDestroy();
  }
}
