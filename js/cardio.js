window.TF = window.TF || {};

TF.cardio = {
  render(container) {
    // Called from progress tab as a sub-section or standalone
    if (!container) return;

    const today = TF.utils.todayStr();
    const health = TF.data.getHealthData();
    const todayLog = TF.data.getTodayCardio();
    const steps = (todayLog && todayLog.steps) || (health && health.date === today ? health.steps : 0) || 0;
    const dist = (todayLog && todayLog.distanceKm) || (health && health.date === today ? health.distanceKm : 0) || 0;
    const calories = (todayLog && todayLog.calories) || (health && health.date === today ? health.calories : 0) || 0;
    const stepGoal = 10000;
    const stepPct = Math.min(steps / stepGoal, 1);
    const r = 45; const circ = 2 * Math.PI * r;

    const weekDates = TF.utils.getWeekDates();
    const weekLogs = TF.data.getCardioLogs().filter(l => weekDates.includes(l.date));
    const weekSteps = weekLogs.reduce((s, l) => s + (l.steps || 0), 0);
    const weekDist = weekLogs.reduce((s, l) => s + (l.distanceKm || 0), 0);

    container.innerHTML = `
      <div class="section-header" style="padding-top:8px">
        <h2 class="section-title">${TF.i18n.t('cardio.today')}</h2>
        <button class="section-action" onclick="TF.cardio.pasteHealth()">${TF.i18n.t('cardio.paste')}</button>
      </div>
      <div class="card" style="margin:0 16px 12px">
        <div class="card-body" style="display:flex;align-items:center;gap:20px">
          <div class="steps-ring">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--border)" stroke-width="10"/>
              <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--accent)" stroke-width="10"
                stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - stepPct)}"
                stroke-linecap="round" style="transition:stroke-dashoffset 0.5s ease"/>
            </svg>
            <div class="steps-ring-text">
              <div class="steps-ring-value">${Math.round(steps / 1000 * 10) / 10}k</div>
              <div class="steps-ring-label">${TF.i18n.t('cardio.steps')}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="margin-bottom:8px">
              <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase">${TF.i18n.t('cardio.distance')}</div>
              <div style="font-size:22px;font-weight:700">${dist.toFixed(1)} km</div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase">${TF.i18n.t('cardio.calories')}</div>
              <div style="font-size:22px;font-weight:700">${Math.round(calories)} kcal</div>
            </div>
          </div>
        </div>
      </div>
      <div class="weekly-stats" style="padding:0 16px 8px">
        <div class="weekly-stat">
          <div class="ws-label">${TF.i18n.t('cardio.week')} ${TF.i18n.t('cardio.steps')}</div>
          <div class="ws-value">${Math.round(weekSteps / 1000 * 10) / 10}k</div>
        </div>
        <div class="weekly-stat">
          <div class="ws-label">${TF.i18n.t('cardio.week')} ${TF.i18n.t('cardio.distance')}</div>
          <div class="ws-value">${weekDist.toFixed(1)} <span class="ws-unit">km</span></div>
        </div>
      </div>
      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('cardio.manual.log')}</h2>
      </div>
      <div class="card" style="margin:0 16px 12px">
        <div class="card-body">
          <div class="form-grid" style="margin-bottom:12px">
            <div class="form-field">
              <div class="form-label">Date</div>
              <input type="date" id="cardioDate" class="form-input" value="${TF.utils.todayStr()}">
            </div>
            <div class="form-field">
              <div class="form-label">${TF.i18n.t('cardio.steps')}</div>
              <input type="number" id="cardioSteps" class="form-input" placeholder="0">
            </div>
            <div class="form-field">
              <div class="form-label">${TF.i18n.t('cardio.distance')} (km)</div>
              <input type="number" step="0.1" id="cardioDist" class="form-input" placeholder="0.0">
            </div>
            <div class="form-field">
              <div class="form-label">${TF.i18n.t('cardio.duration')} (min)</div>
              <input type="number" id="cardioDur" class="form-input" placeholder="0">
            </div>
          </div>
          <button class="btn btn-primary btn-full" onclick="TF.cardio.saveManual()">${TF.i18n.t('cardio.save')}</button>
        </div>
      </div>
    `;
  },

  async pasteHealth() {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (data.steps || data.distance || data.calories) {
        const log = {
          date: data.date || TF.utils.todayStr(),
          source: 'shortcut',
          steps: parseInt(data.steps) || 0,
          distanceKm: parseFloat(data.distance) || 0,
          calories: parseFloat(data.calories) || 0
        };
        TF.data.saveCardioLog(log);
        TF.data.saveHealthData({ ...log, date: log.date });
        TF.app.showToast(TF.i18n.t('cardio.pasted'));
        this.render(document.querySelector('#tab-progress .cardio-section'));
        TF.app.renderDashboard();
      } else {
        TF.app.showToast('Invalid health data format');
      }
    } catch(e) {
      TF.app.showToast('Could not read clipboard. Run the Shortcuts app first.');
    }
  },

  saveManual() {
    const log = {
      date: document.getElementById('cardioDate').value || TF.utils.todayStr(),
      source: 'manual',
      steps: parseInt(document.getElementById('cardioSteps').value) || 0,
      distanceKm: parseFloat(document.getElementById('cardioDist').value) || 0,
      durationMinutes: parseInt(document.getElementById('cardioDur').value) || 0
    };
    TF.data.saveCardioLog(log);
    TF.app.showToast(TF.i18n.t('settings.saved'));
    TF.app.renderDashboard();
  }
};
