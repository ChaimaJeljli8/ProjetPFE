export const SIDEBAR_STYLES = `
  :host { display: contents; }

  .shell {
    display: flex;
    min-height: 100vh;
    background: var(--bg);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 240px;
    min-height: 100vh;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
    z-index: 40;
    transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
    /* light */
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  }
  .sidebar.collapsed { width: 64px; }

  /* dark */
  .sidebar.dark {
    background: #0F1C2E;
    border-right-color: rgba(255,255,255,0.06);
    box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  }

  /* ── Logo ── */
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 1rem;
    min-height: 60px;
    flex-shrink: 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .sidebar.dark .sidebar-logo {
    border-bottom-color: rgba(255,255,255,0.06);
  }

  .logo-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, #013F82, #97C009);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(1,63,130,0.25);
  }

  .sidebar-app-name {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    white-space: nowrap;
    flex: 1;
    color: #0f172a;
  }
  .sidebar.dark .sidebar-app-name { color: #ffffff; }

  .collapse-btn {
    margin-left: auto;
    border: none;
    cursor: pointer;
    padding: 5px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
    background: #f1f5f9;
    color: #94a3b8;
  }
  .collapse-btn:hover { background: #e2e8f0; color: #0f172a; }
  .sidebar.dark .collapse-btn { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.35); }
  .sidebar.dark .collapse-btn:hover { background: rgba(255,255,255,0.13); color: #fff; }

  /* ── Role pill ── */
  .role-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    font-size: 0.64rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
    overflow: hidden;
    flex-shrink: 0;
    color: #94a3b8;
  }
  .sidebar.dark .role-pill { color: rgba(255,255,255,0.25); }

  .role-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .role-dot.admin   { background: #ef4444; }
  .role-dot.planner { background: #3b82f6; }
  .role-dot.worker  { background: #22c55e; }

  /* ── Nav section label ── */
  .nav-section-label {
    padding: 0.65rem 0.85rem 0.25rem;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
    color: #cbd5e1;
  }
  .sidebar.dark .nav-section-label { color: rgba(255,255,255,0.2); }

  /* ── Nav ── */
  .sidebar-nav {
    flex: 1;
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    min-height: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    font-size: 0.855rem;
    font-weight: 500;
    text-decoration: none;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    white-space: nowrap;
    transition: background 0.13s, color 0.13s;
    flex-shrink: 0;
    /* light */
    color: #64748b;
  }
  .nav-link svg { flex-shrink: 0; }

  /* light states */
  .nav-link:hover { background: #f1f5f9; color: #0f172a; }
  .nav-link.active {
    background: rgba(1,63,130,0.07);
    color: #013F82;
    font-weight: 600;
    box-shadow: inset 3px 0 0 #97C009;
  }
  .nav-link.active svg { color: #013F82; }

  /* dark states */
  .sidebar.dark .nav-link { color: rgba(255,255,255,0.45); }
  .sidebar.dark .nav-link:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
  .sidebar.dark .nav-link.active {
    background: rgba(1,63,130,0.4);
    color: #ffffff;
    box-shadow: inset 3px 0 0 #97C009;
  }
  .sidebar.dark .nav-link.active svg { color: #97C009; }

  /* logout */
  .nav-logout:hover { background: rgba(239,68,68,0.08) !important; color: #dc2626 !important; }
  .sidebar.dark .nav-logout:hover { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; }

  /* ── Bottom ── */
  .sidebar-bottom {
    padding: 0.6rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }
  .sidebar.dark .sidebar-bottom { border-top-color: rgba(255,255,255,0.06); }

  /* ── User card ── */
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.75rem;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  .sidebar.dark .user-info {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.07);
  }

  .user-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #013F82, #3B72A1);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    text-transform: uppercase;
    overflow: hidden;
    border: 2px solid #e2e8f0;
  }
  .sidebar.dark .user-avatar { border-color: rgba(255,255,255,0.12); }
  .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .user-details { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .user-name {
    font-size: 0.8rem; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3;
    color: #0f172a;
  }
  .sidebar.dark .user-name { color: rgba(255,255,255,0.9); }

  .user-email {
    font-size: 0.68rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: #64748b;
  }
  .sidebar.dark .user-email { color: rgba(255,255,255,0.3); }

  /* ── Main ── */
  .shell-main { flex: 1; overflow-y: auto; min-width: 0; }
`;
