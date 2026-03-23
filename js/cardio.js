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
              <div class="form-label">${TF.i18n.t('cardio.duration')}</div>
              <input type="number" id="cardioDur" class="form-input" placeholder="0">
            </div>
          </div>
          <button class="btn btn-primary btn-full" onclick="TF.cardio.saveManual()">${TF.i18n.t('cardio.save')}</button>
        </div>
      </div>
    `;
  },

  pasteHealth() {
    const lang = TF.i18n.getLang();
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:900;display:flex;align-items:flex-end';
    overlay.innerHTML = `
      <div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom) + 20px)">
        <div style="font-size:17px;font-weight:700;margin-bottom:8px">${lang === 'ru' ? 'Вставить данные здоровья' : 'Paste Health Data'}</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:12px">${lang === 'ru' ? 'Запустите Shortcut, затем вставьте сюда:' : 'Run your Shortcut, then long-press below and tap Paste:'}</div>
        <textarea id="healthPasteArea"
          style="width:100%;height:100px;background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:14px;color:var(--text);font-family:monospace;resize:none"
          placeholder='{"steps":8000,"distance":6.2,"calories":450,"date":"2026-03-23"}'></textarea>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button onclick="this.closest('div[style*=fixed]').remove()"
            style="flex:1;padding:14px;border-radius:12px;background:var(--bg-card2);font-size:16px;font-weight:600">
            ${lang === 'ru' ? 'Отмена' : 'Cancel'}
          </button>
          <button id="healthPasteBtn"
            style="flex:1;padding:14px;border-radius:12px;background:var(--accent);color:white;font-size:16px;font-weight:600">
            ${lang === 'ru' ? 'Сохранить' : 'Save'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('healthPasteArea').focus(), 100);

    document.getElementById('healthPasteBtn').onclick = () => {
      try {
        const text = document.getElementById('healthPasteArea').value.trim();
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
          overlay.remove();
          TF.app.showToast(TF.i18n.t('cardio.pasted'));
          this.render(document.querySelector('#tab-progress .cardio-section'));
          TF.app.renderDashboard();
        } else {
          TF.app.showToast(lang === 'ru' ? 'Неверный формат' : 'Invalid format');
        }
      } catch(e) {
        TF.app.showToast(lang === 'ru' ? 'Неверный JSON' : 'Invalid JSON — check the text');
      }
    };
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
