window.TF = window.TF || {};

TF.app = {
  init() {
    // Capture health URL params immediately before anything else
    // (PIN screen will show next, so we store params to import after unlock)
    const params = new URLSearchParams(window.location.search);
    if (params.get('steps') || params.get('distance') || params.get('calories')) {
      localStorage.setItem('_pendingHealth', JSON.stringify({
        steps: params.get('steps'),
        distance: params.get('distance'),
        calories: params.get('calories'),
        date: params.get('date')
      }));
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Lock to portrait orientation
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {});
    }

    // Apply theme early to prevent flash
    TF.settings.applyThemeFromProfile();

    // Set language
    const profile = TF.data.getProfile();
    TF.i18n.setLang(profile.language || this._detectLang());

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(reg => reg.update())
        .catch(e => console.warn('SW:', e));
    }

    // Init notifications
    TF.notifications.init();

    // Init router
    TF.router.init();

    // Init workout module
    TF.workout.init();

    // Touch on app body resets auto-lock timer
    document.getElementById('app').addEventListener('touchstart', () => TF.auth.resetTimer(), { passive: true });
    document.getElementById('app').addEventListener('click', () => TF.auth.resetTimer(), { passive: true });

    // Summary done button
    document.getElementById('summaryDoneBtn').addEventListener('click', () => TF.workout.closeSummary());

    // Init auth (shows lock or setup screen)
    TF.auth.init(() => this._onUnlock());

    // Install prompt for non-standalone
    this._checkInstallPrompt();
  },

  _detectLang() {
    const nav = navigator.language || navigator.userLanguage || 'en';
    return nav.startsWith('ru') ? 'ru' : 'en';
  },

  _onUnlock() {
    // Check for health data in URL params (from Shortcuts widget)
    this._importHealthFromURL();

    // Auto-check clipboard for health data on unlock and every time app comes to foreground
    this._checkClipboardHealth();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this._checkClipboardHealth();
    });

    // Check for crash-recovered session
    const active = TF.data.getActiveSession();
    if (active && !active.completed) {
      this._showResumeBanner(active);
    }

    // Request notification permission on first use, then check reminders
    TF.notifications.requestPermission().then(() => {
      TF.notifications.checkReminders();
    });

    // Check reminders each time app comes to foreground
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) TF.notifications.checkReminders();
    });

    // Render initial view
    this.renderDashboard();
    TF.router.navigate('dashboard');
  },

  async _checkClipboardHealth(manual = false) {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.includes('"steps"')) {
        if (manual) this.showToast('No health data in clipboard');
        return;
      }
      // Fix invalid JSON from Shortcuts when a health value is empty (e.g. "calories": ,)
      const sanitized = text.replace(/:\s*,/g, ': 0,').replace(/:\s*}/g, ': 0}');
      const data = JSON.parse(sanitized);
      if (!data.steps && !data.distance && !data.calories) return;

      // Clear clipboard so it doesn't re-import next time
      navigator.clipboard.writeText('').catch(() => {});

      const date = data.date || TF.utils.todayStr();
      const log = {
        date,
        source: 'shortcut',
        steps: parseInt(data.steps) || 0,
        distanceKm: parseFloat(data.distance) || 0,
        calories: parseFloat(data.calories) || 0
      };
      TF.data.saveCardioLog(log);
      TF.data.saveHealthData({ ...log });

      // Auto-save weight and body fat if present
      const weight = parseFloat(data.weight) || 0;
      const bodyFat = parseFloat(data.bodyFat) || 0;
      if (weight > 0 || bodyFat > 0) {
        const m = { date };
        if (weight > 0) m.weight = weight;
        if (bodyFat > 0) m.bodyFat = bodyFat;
        TF.data.saveMeasurement(m);
      }

      this.renderDashboard();

      const lang = TF.i18n.getLang();
      const parts = [`${log.steps} ${lang === 'ru' ? 'шаг' : 'steps'}`];
      if (log.distanceKm > 0) parts.push(`${log.distanceKm.toFixed(1)} km`);
      if (log.calories > 0) parts.push(`${Math.round(log.calories)} kcal`);
      if (weight > 0) parts.push(`${weight.toFixed(1)} kg`);
      if (bodyFat > 0) parts.push(`${bodyFat.toFixed(1)}% BF`);
      setTimeout(() => {
        this.showToast(`${lang === 'ru' ? 'Здоровье: ' : 'Health synced: '}${parts.join(' · ')}`);
      }, 400);
    } catch(e) {
      // Clipboard not accessible or no permission — silent fail
    }
  },

  _importHealthFromURL() {
    const raw = localStorage.getItem('_pendingHealth');
    if (!raw) return;
    localStorage.removeItem('_pendingHealth');

    try {
      const p = JSON.parse(raw);
      if (!p.steps && !p.distance && !p.calories) return;
      const log = {
        date: p.date || TF.utils.todayStr(),
        source: 'shortcut',
        steps: parseInt(p.steps) || 0,
        distanceKm: parseFloat(p.distance) || 0,
        calories: parseFloat(p.calories) || 0
      };
      TF.data.saveCardioLog(log);
      TF.data.saveHealthData({ ...log });
      const lang = TF.i18n.getLang();
      setTimeout(() => {
        this.showToast(lang === 'ru'
          ? `Здоровье: ${log.steps} шаг · ${log.distanceKm.toFixed(1)} км · ${Math.round(log.calories)} ккал`
          : `Health synced: ${log.steps} steps · ${log.distanceKm.toFixed(1)} km · ${Math.round(log.calories)} kcal`
        );
      }, 600);
    } catch(e) {}
  },

  // --- Dashboard ---
  renderDashboard() {
    const profile = TF.data.getProfile();
    const { type: sessionType, session } = TF.program.getTodaySession();
    const todayLogged = TF.data.getTodaySession();
    const activeSession = TF.data.getActiveSession();

    // Update language
    TF.i18n.setLang(profile.language || 'en');

    const container = document.getElementById('tab-dashboard');
    container.innerHTML = '';

    // Profile row
    const profileRow = document.createElement('div');
    profileRow.className = 'profile-row';
    profileRow.innerHTML = `
      <div id="dashAvatar" class="dash-avatar ${profile.avatar ? 'has-image' : ''}"
           style="${profile.avatar ? `background-image:url(${profile.avatar})` : ''}"
           onclick="TF.router.navigate('settings')">
        ${profile.avatar ? '' : (profile.name || 'T').charAt(0).toUpperCase()}
      </div>
      <div style="flex:1">
        <div class="dash-greeting">${TF.i18n.t(TF.utils.greetingKey())}, ${profile.name || 'Tim'}</div>
        <div class="dash-date">${TF.utils.formatDate(null, profile.language)}</div>
      </div>
      <button onclick="TF.app._checkClipboardHealth(true)" style="background:var(--bg-card2);border:none;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer">↓ Health</button>
    `;
    container.appendChild(profileRow);

    // Resume banner (if incomplete session)
    if (activeSession && !activeSession.completed) {
      const banner = document.createElement('div');
      banner.className = 'resume-banner';
      banner.id = 'primaryResumeBanner';
      banner.innerHTML = `
        <div>
          <div class="resume-banner-text">${TF.i18n.t('session.resume.prompt')}</div>
          <div class="resume-banner-sub">${activeSession.sessionType} · ${TF.i18n.t('session.resume.desc')}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button onclick="TF.workout.discardSession()" style="background:rgba(255,255,255,0.2);color:white;border-radius:6px;padding:6px 10px;font-size:13px">${TF.i18n.t('session.discard')}</button>
          <button onclick="TF.workout.resumeSession()" style="background:white;color:var(--orange);border-radius:6px;padding:6px 12px;font-size:13px;font-weight:700">${TF.i18n.t('session.resume')}</button>
        </div>
      `;
      container.appendChild(banner);
    }

    // Stats cards
    const latest = TF.data.getLatestMeasurement();
    const prevMeasurements = TF.data.getMeasurements();
    const prev = prevMeasurements.length > 1 ? prevMeasurements[prevMeasurements.length - 2] : null;
    const streak = TF.data.getStreak();
    const totalWorkouts = TF.data.getWorkoutSessions().filter(s => s.completed).length;

    const statsScroll = document.createElement('div');
    statsScroll.className = 'stats-scroll';
    statsScroll.innerHTML = `
      ${this._statCard(TF.i18n.t('dash.weight'), latest ? latest.weight : '—', 'kg',
        latest && prev && prev.weight ? latest.weight - prev.weight : null)}
      ${this._statCard(TF.i18n.t('dash.bodyfat'), latest ? latest.bodyFat : '—', '%',
        latest && prev && prev.bodyFat ? latest.bodyFat - prev.bodyFat : null, true)}
      ${this._statCard(TF.i18n.t('dash.streak'), streak, TF.i18n.t('dash.days'))}
      ${this._statCard(TF.i18n.t('dash.total'), totalWorkouts, '')}
    `;
    container.appendChild(statsScroll);

    // Today's session card
    if (sessionType === 'Rest') {
      const tips = ['dash.rest.tip1','dash.rest.tip2','dash.rest.tip3','dash.rest.tip4'];
      const tip = TF.i18n.t(tips[new Date().getDay() % tips.length]);
      const restCard = document.createElement('div');
      restCard.className = 'rest-card';
      restCard.innerHTML = `
        <div class="rest-icon">🌿</div>
        <div class="rest-title">${TF.i18n.t('dash.rest.title')}</div>
        <div class="rest-tip">${tip}</div>
      `;
      container.appendChild(restCard);
    } else if (todayLogged && todayLogged.completed) {
      const completedCard = document.createElement('div');
      completedCard.className = 'today-card';
      completedCard.innerHTML = `
        <div class="today-card-header">
          <div class="today-session-type">${TF.i18n.t(TF.SESSION_KEY_MAP[sessionType])} — ${TF.i18n.t(session.dayKey)}</div>
          <div class="today-muscles">${session.muscles.map(m => TF.i18n.t(m)).join(' · ')}</div>
        </div>
        <div class="today-complete">
          <div class="complete-icon">✅</div>
          <div>
            <div class="complete-label">${TF.i18n.t('dash.completed')}</div>
            <div class="complete-stats">
              ${TF.utils.formatDuration(todayLogged.duration || 0)} · ${(todayLogged.totalVolume || 0).toLocaleString()} kg
              ${todayLogged.prs && todayLogged.prs.length > 0 ? ` · 🏆 ${todayLogged.prs.length} PR` : ''}
            </div>
          </div>
        </div>
      `;
      container.appendChild(completedCard);
    } else {
      const exList = (session.exercises || []).slice(0, 5);
      const more = (session.exercises || []).length - 5;
      const todayCard = document.createElement('div');
      todayCard.className = 'today-card';
      todayCard.innerHTML = `
        <div class="today-card-header">
          <div class="today-session-type">${TF.i18n.t(TF.SESSION_KEY_MAP[sessionType])} — ${TF.i18n.t(session.dayKey)}</div>
          <div class="today-muscles">${session.muscles.map(m => TF.i18n.t(m)).join(' · ')}</div>
        </div>
        <div class="today-card-body">
          <ul class="today-exercises">
            ${exList.map(e => `<li>${e.name}</li>`).join('')}
            ${more > 0 ? `<li class="more">+${more} more</li>` : ''}
          </ul>
          <button class="btn btn-primary btn-full" onclick="TF.workout.startSession('${sessionType}')">
            ${TF.i18n.t('dash.start')}
          </button>
        </div>
      `;
      container.appendChild(todayCard);
    }

    // Week strip
    const weekDates = TF.utils.getWeekDates(); // Mon–Sun
    const today = TF.utils.todayStr();
    const weekSection = document.createElement('div');
    weekSection.innerHTML = `<div class="section-header" style="padding-bottom:4px"><span class="section-title" style="font-size:17px">This Week</span></div>`;
    const strip = document.createElement('div');
    strip.className = 'week-strip';
    const dayKeys = ['day.mon','day.tue','day.wed','day.thu','day.fri','day.sat','day.sun'];
    weekDates.forEach((dateStr, i) => {
      const logged = TF.data.getSessionByDate(dateStr);
      const isToday = dateStr === today;
      const d = TF.utils.localDate(dateStr);
      const isRest = d.getDay() === 0;
      let cls = 'week-day';
      let icon = '';
      if (isRest) { cls += ' rest'; icon = '💤'; }
      else if (logged && logged.completed) { cls += ' completed'; icon = '✓'; }
      else if (isToday) { cls += ' today'; icon = '▸'; }
      else { icon = '–'; }
      const pill = document.createElement('div');
      pill.className = cls;
      pill.innerHTML = `<div class="wd-label">${TF.i18n.t(dayKeys[i])}</div><div class="wd-icon">${icon}</div>`;
      pill.onclick = () => this._showDayDetail(dateStr);
      strip.appendChild(pill);
    });
    weekSection.appendChild(strip);
    container.appendChild(weekSection);

    // Weekly stats
    const weekVol = TF.data.getWeeklyVolume();
    const weekTime = TF.data.getWeeklyTime();
    const weekSteps = TF.data.getWeeklySteps();
    const weekDist = TF.data.getWeeklyDistance();
    const statsGrid = document.createElement('div');
    statsGrid.className = 'weekly-stats';
    statsGrid.style.padding = '0 16px 16px';
    statsGrid.innerHTML = `
      <div class="weekly-stat">
        <div class="ws-label">${TF.i18n.t('dash.week.volume')}</div>
        <div class="ws-value">${Math.round(weekVol / 1000 * 10) / 10}t</div>
      </div>
      <div class="weekly-stat">
        <div class="ws-label">${TF.i18n.t('dash.week.time')}</div>
        <div class="ws-value">${TF.utils.formatDuration(weekTime)}</div>
      </div>
      <div class="weekly-stat">
        <div class="ws-label">${TF.i18n.t('dash.week.steps')}</div>
        <div class="ws-value">${Math.round(weekSteps / 1000 * 10) / 10}k</div>
      </div>
      <div class="weekly-stat">
        <div class="ws-label">${TF.i18n.t('dash.week.distance')}</div>
        <div class="ws-value">${weekDist.toFixed(1)} <span class="ws-unit">km</span></div>
      </div>
    `;
    container.appendChild(statsGrid);
  },

  _statCard(label, value, unit, delta, lowerIsBetter) {
    let deltaHtml = '';
    if (delta !== null && delta !== undefined && !isNaN(delta)) {
      const d = +delta.toFixed(1);
      const isGood = lowerIsBetter ? d < 0 : d > 0;
      const color = d === 0 ? 'var(--text3)' : (isGood ? 'var(--green)' : 'var(--red)');
      const arrow = d > 0 ? '▲' : (d < 0 ? '▼' : '');
      deltaHtml = `<div class="stat-delta" style="color:${color}">${arrow} ${Math.abs(d)} ${unit}</div>`;
    }
    return `
      <div class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value !== null && value !== undefined ? value : '—'}<span class="stat-unit" style="font-size:13px"> ${unit}</span></div>
        ${deltaHtml}
      </div>
    `;
  },

  // --- Workout Tab ---
  renderWorkoutTab() {
    const container = document.getElementById('tab-workout');
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between';
    const lang = TF.i18n.getLang();
    header.innerHTML = `
      <h2 class="section-title">${TF.i18n.t('workout.week')}</h2>
      <button onclick="TF.library.open()"
              style="color:var(--accent);font-size:14px;font-weight:600;padding:4px 8px;background:rgba(0,122,255,0.1);border-radius:8px">
        ${lang === 'ru' ? 'Упражнения' : 'Exercises'}
      </button>
    `;
    container.appendChild(header);

    const weekDates = TF.utils.getWeekDates();
    const today = TF.utils.todayStr();
    const dayKeys = ['day.monday','day.tuesday','day.wednesday','day.thursday','day.friday','day.saturday','day.sunday'];
    const schedule = TF.program.getWeekSchedule();

    const grid = document.createElement('div');
    grid.className = 'workout-week';
    schedule.forEach((item, i) => {
      const dateStr = weekDates[i];
      const logged = TF.data.getSessionByDate(dateStr);
      const isToday = dateStr === today;
      const isRest = item.type === 'Rest';
      const session = TF.program.getSession(item.type);

      let statusKey = 'workout.status.upcoming';
      if (logged && logged.completed) statusKey = 'workout.status.completed';
      else if (isToday) statusKey = 'workout.status.today';
      else if (isRest) statusKey = 'workout.status.rest';

      const statusColors = {
        'workout.status.completed': 'var(--green)',
        'workout.status.today': 'var(--accent)',
        'workout.status.upcoming': 'var(--text3)',
        'workout.status.rest': 'var(--text3)'
      };

      const card = document.createElement('div');
      card.className = 'workout-day-card';
      const muscles = !isRest && session ? session.muscles.slice(0, 3).map(m => TF.i18n.t(m)).join(' · ') : '';
      card.innerHTML = `
        <div class="wdc-left">
          <div class="wdc-day">${TF.i18n.t(dayKeys[i])}</div>
          <div class="wdc-session">${TF.i18n.t(TF.SESSION_KEY_MAP[item.type])}</div>
          ${muscles ? `<div class="wdc-muscles">${muscles}</div>` : ''}
        </div>
        <div class="wdc-right">
          <span class="pill" style="background:${statusColors[statusKey]}22;color:${statusColors[statusKey]}">${TF.i18n.t(statusKey)}</span>
          <span class="wdc-arrow">›</span>
        </div>
      `;
      card.onclick = () => this._showDayDetail(dateStr);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  },

  _showDayDetail(dateStr) {
    const { type, session } = TF.program.getSessionForDate(dateStr);
    const today = TF.utils.todayStr();
    const logged = TF.data.getSessionByDate(dateStr);

    const modal = document.getElementById('sessionDetailModal');
    modal.innerHTML = '';
    modal.classList.remove('hidden');

    const header = document.createElement('div');
    header.className = 'session-detail-header';
    header.innerHTML = `
      <div class="session-detail-back" onclick="document.getElementById('sessionDetailModal').classList.add('hidden')">‹ Back</div>
      <div class="session-detail-type">${TF.i18n.t(TF.SESSION_KEY_MAP[type])}</div>
      <div class="session-detail-day">${TF.i18n.t(session.dayKey)} · ${TF.utils.formatDate(dateStr, TF.i18n.getLang())}</div>
      ${session.theme ? `<div class="session-detail-theme">${session.theme}</div>` : ''}
    `;
    modal.appendChild(header);

    if (logged && logged.completed) {
      // Show logged data
      const summary = document.createElement('div');
      summary.style.cssText = 'padding:12px 20px;background:rgba(52,199,89,0.08);border-bottom:1px solid var(--border2)';
      summary.innerHTML = `<span style="color:var(--green);font-weight:700">✓ ${TF.i18n.t('workout.status.completed')}</span> · ${TF.utils.formatDuration(logged.duration || 0)} · ${(logged.totalVolume || 0).toLocaleString()} kg`;
      modal.appendChild(summary);
    }

    if (type === 'Rest') {
      const rest = document.createElement('div');
      rest.style.cssText = 'text-align:center;padding:60px 20px';
      rest.innerHTML = `<div style="font-size:48px">🌿</div><div style="font-size:20px;font-weight:700;margin-top:12px">${TF.i18n.t('dash.rest.title')}</div>`;
      modal.appendChild(rest);
    } else {
      if (session.warmup) {
        const warmupInfo = document.createElement('div');
        warmupInfo.style.cssText = 'padding:12px 20px;background:rgba(255,149,0,0.08);border-bottom:1px solid var(--border2);font-size:14px;color:var(--orange)';
        warmupInfo.textContent = '⚡ ' + TF.i18n.t('session.warmup.title');
        modal.appendChild(warmupInfo);
      }

      session.exercises.forEach((ex, i) => {
        const loggedEx = logged ? logged.exerciseLogs.find(l => l.exerciseId === ex.id) : null;
        const row = document.createElement('div');
        row.className = 'session-ex-row';
        let detail = `${ex.sets}×${ex.repsMin}–${ex.repsMax}`;
        if (loggedEx) {
          const completedSets = loggedEx.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            const max = Math.max(...completedSets.map(s => s.weight));
            detail = completedSets.map(s => `${s.weight}×${s.reps}`).join(', ');
          }
        }
        row.innerHTML = `
          <div class="session-ex-num">${i + 1}</div>
          <div class="session-ex-info">
            <div class="session-ex-name">${ex.name}</div>
            <div class="session-ex-detail">${detail}</div>
          </div>
        `;
        modal.appendChild(row);
      });

      if (dateStr === today && !(logged && logged.completed)) {
        const startBtn = document.createElement('div');
        startBtn.style.cssText = 'padding:20px 20px';
        startBtn.innerHTML = `<button class="btn btn-primary btn-full" onclick="document.getElementById('sessionDetailModal').classList.add('hidden'); TF.workout.startSession('${type}')">
          ${TF.i18n.t('dash.start')}
        </button>`;
        modal.appendChild(startBtn);
      }
    }
  },

  _showResumeBanner(active) {
    // Shown in renderDashboard already
  },

  hidePrimaryResumeBanner() {
    const b = document.getElementById('primaryResumeBanner');
    if (b) b.remove();
  },

  // --- Toast ---
  showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  },

  // --- Install prompt ---
  _checkInstallPrompt() {
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && !localStorage.getItem('tf_install_dismissed')) {
      setTimeout(() => {
        const prompt = document.getElementById('installPrompt');
        if (prompt) prompt.classList.remove('hidden');
      }, 3000);
    }
  },

  dismissInstall() {
    localStorage.setItem('tf_install_dismissed', '1');
    const p = document.getElementById('installPrompt');
    if (p) p.classList.add('hidden');
  }
};

// Confetti utility
TF.confetti = {
  burst() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      r: Math.random() * 6 + 4,
      color: ['#007AFF','#34C759','#FF9500','#FFD60A','#FF453A','#BF5AF2'][Math.floor(Math.random() * 6)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8
    }));

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.05;
      });
      frame++;
      if (frame < 120) requestAnimationFrame(animate);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
    };
    requestAnimationFrame(animate);
  }
};

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  TF.app.init();
});
