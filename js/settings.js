window.TF = window.TF || {};

TF.settings = {
  render() {
    const container = document.getElementById('tab-settings');
    const profile = TF.data.getProfile();
    const lang = TF.i18n.getLang();
    const programStart = profile.programStart || '2026-03-01';
    const startDate = TF.utils.localDate(programStart);
    const daysTraining = Math.floor((Date.now() - startDate.getTime()) / 864e5);

    container.innerHTML = `
      <div style="display:flex;align-items:center;padding:12px 16px 4px;gap:8px">
        <button onclick="TF.router.navigate('dashboard')"
                style="color:var(--accent);font-size:17px;font-weight:500;display:flex;align-items:center;gap:2px;padding:4px 0">
          ‹ Back
        </button>
        <h2 class="section-title" style="flex:1;text-align:center;font-size:17px">${TF.i18n.t('settings.profile')}</h2>
        <div style="width:60px"></div>
      </div>

      <!-- Avatar + Name -->
      <div class="card" style="margin:0 16px 12px">
        <div class="card-body" style="display:flex;align-items:center;gap:16px">
          <div id="settingsAvatar" class="dash-avatar ${profile.avatar ? 'has-image' : ''}"
               style="${profile.avatar ? `background-image:url(${profile.avatar})` : `background:var(--accent)`};width:64px;height:64px;font-size:24px;cursor:pointer"
               onclick="TF.settings._changeAvatar()">
            ${profile.avatar ? '' : (profile.name || 'T').charAt(0).toUpperCase()}
          </div>
          <div style="flex:1">
            <input type="text" id="settingsName" class="form-input" value="${profile.name || 'Tim'}"
                   style="font-size:20px;font-weight:700;background:transparent;border:none;padding:0;border-bottom:1px solid var(--border)">
            <div style="font-size:13px;color:var(--text3);margin-top:4px">
              ${profile.age} y.o. · ${profile.height} cm · Started ${programStart}
            </div>
          </div>
        </div>
        <input type="file" id="avatarFileInput" accept="image/*" style="display:none">
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._settingsRow('settings.dob', `<input type="date" id="settingsDOB" class="settings-select" value="${profile.dob || ''}">`)}
        ${this._settingsRow('settings.age', `<input type="number" id="settingsAge" class="settings-select" value="${profile.age || 44}">`)}
        ${this._settingsRow('settings.height', `<input type="number" id="settingsHeight" class="settings-select" value="${profile.height || 182}">`)}
        ${this._settingsRow('settings.start.weight', `<input type="number" step="0.1" id="settingsStartWeight" class="settings-select" value="${profile.startingWeight || 83}">`)}
        ${this._settingsRow('settings.start.bf', `<input type="number" step="0.1" id="settingsStartBF" class="settings-select" value="${profile.startingBodyFat || 23}">`)}
        ${this._settingsRow('settings.target.bf', `<input type="number" step="0.1" id="settingsTargetBF" class="settings-select" value="${profile.targetBodyFat || 14}">`)}
        ${this._settingsRow('settings.program.start', `<input type="date" id="settingsProgramStart" class="settings-select" value="${programStart}">`)}
      </div>

      <button class="btn btn-primary" style="margin:0 16px 16px;width:calc(100%-32px)"
              onclick="TF.settings._saveProfile()">${TF.i18n.t('settings.save')}</button>

      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('settings.app')}</h2>
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._settingsRow('settings.language', `
          <select class="settings-select" id="settingsLang" onchange="TF.settings._changeLang(this.value)">
            <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
            <option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option>
          </select>`)}
        ${this._settingsRow('settings.theme', `
          <select class="settings-select" id="settingsTheme" onchange="TF.settings._changeTheme(this.value)">
            <option value="system" ${profile.theme === 'system' ? 'selected' : ''}>${TF.i18n.t('settings.theme.system')}</option>
            <option value="light" ${profile.theme === 'light' ? 'selected' : ''}>${TF.i18n.t('settings.theme.light')}</option>
            <option value="dark" ${profile.theme === 'dark' ? 'selected' : ''}>${TF.i18n.t('settings.theme.dark')}</option>
          </select>`)}
        ${this._settingsRow('settings.pin', `<span class="settings-row-arrow">›</span>`, `onclick="TF.settings._changePIN()"`)}
        ${this._settingsRow('settings.autolock', `
          <select class="settings-select" id="settingsAutolock" onchange="TF.settings._saveField('autoLockMinutes', this.value)">
            <option value="5" ${profile.autoLockMinutes == 5 ? 'selected' : ''}>${TF.i18n.t('settings.autolock.5')}</option>
            <option value="10" ${profile.autoLockMinutes == 10 ? 'selected' : ''}>${TF.i18n.t('settings.autolock.10')}</option>
            <option value="30" ${profile.autoLockMinutes == 30 ? 'selected' : ''}>${TF.i18n.t('settings.autolock.30')}</option>
            <option value="0" ${profile.autoLockMinutes == 0 ? 'selected' : ''}>${TF.i18n.t('settings.autolock.never')}</option>
          </select>`)}
      </div>

      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('settings.notifications')}</h2>
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._toggleRow('settings.notif.rest', 'notifRest', profile.notifRest)}
        ${this._toggleRow('settings.notif.overload', 'notifOverload', profile.notifOverload)}
        ${this._toggleRow('settings.notif.weekly', 'notifWeekly', profile.notifWeekly)}
      </div>

      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('settings.rest.defaults')}</h2>
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._settingsRow('settings.rest.heavy', `<input type="number" id="restHeavy" class="settings-select" value="${profile.restHeavy || 180}">`)}
        ${this._settingsRow('settings.rest.moderate', `<input type="number" id="restModerate" class="settings-select" value="${profile.restModerate || 120}">`)}
        ${this._settingsRow('settings.rest.isolation', `<input type="number" id="restIsolation" class="settings-select" value="${profile.restIsolation || 60}">`)}
      </div>

      <button class="btn btn-secondary" style="margin:0 16px 16px"
              onclick="TF.settings._saveRestDefaults()">${TF.i18n.t('settings.save')}</button>

      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('settings.data')}</h2>
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._settingsRow('settings.export', `<span class="settings-row-arrow">›</span>`, 'onclick="TF.settings._exportData()"')}
        ${this._settingsRow('settings.export.copy', `<span class="settings-row-arrow">›</span>`, 'onclick="TF.settings._copyDataToClipboard()"')}
        ${this._settingsRow('settings.import', `<span class="settings-row-arrow">›</span>`, 'onclick="TF.settings._importData()"')}
        <div class="settings-row" onclick="TF.settings._clearCardioData()">
          <span class="settings-row-label" style="color:var(--red)">Clear Cardio &amp; Health Data</span>
        </div>
        <div class="settings-row" onclick="TF.settings._resetData()">
          <span class="settings-row-label" style="color:var(--red)">${TF.i18n.t('settings.reset')}</span>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">${TF.i18n.t('settings.about')}</h2>
      </div>

      <div class="settings-group" style="margin:0 16px 12px">
        ${this._settingsRow('settings.version', '<span class="settings-row-value">1.3.3 (29 Mar)</span>')}
        ${this._settingsRow('settings.program.start', `<span class="settings-row-value">${programStart}</span>`)}
        ${this._settingsRow('settings.days.training', `<span class="settings-row-value">${daysTraining}</span>`)}
      </div>
      <button class="btn btn-primary" style="margin:0 16px 12px;width:calc(100% - 32px)"
              onclick="TF.settings.checkForUpdates()">
        ${lang === 'ru' ? 'Проверить обновления' : 'Check for Updates'}
      </button>
      <button class="btn btn-secondary" style="margin:0 16px 4px;width:calc(100% - 32px)"
              onclick="TF.settings._loadTestData()">
        Load Test Data
      </button>
      <div class="spacer"></div>
    `;

    // Avatar file input
    document.getElementById('avatarFileInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const compressed = await TF.utils.compressImage(file, 400, 0.8);
      const profile = TF.data.getProfile();
      profile.avatar = compressed;
      TF.data.saveProfile(profile);
      this.render();
      TF.app.renderDashboard();
    });
  },

  _settingsRow(labelKey, valueHtml, extra = '') {
    return `
      <div class="settings-row" ${extra}>
        <span class="settings-row-label">${TF.i18n.t(labelKey)}</span>
        ${valueHtml}
      </div>`;
  },

  _toggleRow(labelKey, field, value) {
    return `
      <div class="settings-row">
        <span class="settings-row-label">${TF.i18n.t(labelKey)}</span>
        <label class="toggle-switch">
          <input type="checkbox" ${value ? 'checked' : ''} onchange="TF.settings._saveField('${field}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  },

  _changeAvatar() {
    document.getElementById('avatarFileInput').click();
  },

  _changeLang(lang) {
    const profile = TF.data.getProfile();
    profile.language = lang;
    TF.data.saveProfile(profile);
    TF.i18n.setLang(lang);
    TF.app.renderDashboard();
    this.render();
  },

  _changeTheme(theme) {
    const profile = TF.data.getProfile();
    profile.theme = theme;
    TF.data.saveProfile(profile);
    this._applyTheme(theme);
  },

  _applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
  },

  _saveField(field, value) {
    const profile = TF.data.getProfile();
    profile[field] = value;
    TF.data.saveProfile(profile);
  },

  _saveProfile() {
    const profile = TF.data.getProfile();
    profile.name = document.getElementById('settingsName').value || 'Tim';
    profile.dob = document.getElementById('settingsDOB').value || '';
    if (profile.dob) {
      const today = new Date();
      const birth = new Date(profile.dob);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      profile.age = age;
    } else {
      profile.age = parseInt(document.getElementById('settingsAge').value) || 44;
    }
    profile.height = parseInt(document.getElementById('settingsHeight').value) || 182;
    profile.startingWeight = parseFloat(document.getElementById('settingsStartWeight').value) || 83;
    profile.startingBodyFat = parseFloat(document.getElementById('settingsStartBF').value) || 23;
    profile.targetBodyFat = parseFloat(document.getElementById('settingsTargetBF').value) || 14;
    profile.programStart = document.getElementById('settingsProgramStart').value || '2026-03-01';
    TF.data.saveProfile(profile);
    TF.app.showToast(TF.i18n.t('settings.saved'));
    TF.app.renderDashboard();
    this.render();
  },

  _saveRestDefaults() {
    const profile = TF.data.getProfile();
    profile.restHeavy = parseInt(document.getElementById('restHeavy').value) || 180;
    profile.restModerate = parseInt(document.getElementById('restModerate').value) || 120;
    profile.restIsolation = parseInt(document.getElementById('restIsolation').value) || 60;
    TF.data.saveProfile(profile);
    TF.app.showToast(TF.i18n.t('settings.saved'));
  },

  _changePIN() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:700;display:flex;align-items:flex-end';
    modal.innerHTML = `
      <div style="background:var(--bg-modal);border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom)+20px);width:100%">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:16px">${TF.i18n.t('settings.pin')}</h3>
        <div class="form-field" style="margin-bottom:12px">
          <div class="form-label">Current PIN</div>
          <input type="password" inputmode="numeric" maxlength="6" id="oldPIN" class="form-input" placeholder="••••••">
        </div>
        <div class="form-field" style="margin-bottom:12px">
          <div class="form-label">New PIN</div>
          <input type="password" inputmode="numeric" maxlength="6" id="newPIN" class="form-input" placeholder="••••••">
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <div class="form-label">Confirm New PIN</div>
          <input type="password" inputmode="numeric" maxlength="6" id="confirmPIN" class="form-input" placeholder="••••••">
        </div>
        <button class="btn btn-primary btn-full" onclick="TF.settings._confirmPINChange(this.closest('[style]'))">${TF.i18n.t('settings.save')}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="this.closest('[style]').remove()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async _confirmPINChange(modal) {
    const oldPIN = document.getElementById('oldPIN').value;
    const newPIN = document.getElementById('newPIN').value;
    const confirmPIN = document.getElementById('confirmPIN').value;

    if (newPIN.length !== 6) { alert('PIN must be 6 digits'); return; }
    if (newPIN !== confirmPIN) { alert(TF.i18n.t('lock.setup.mismatch')); return; }

    const success = await TF.auth.changePIN(oldPIN, newPIN);
    if (success) {
      modal.remove();
      TF.app.showToast(TF.i18n.t('settings.saved'));
    } else {
      alert(TF.i18n.t('lock.wrong'));
    }
  },

  _copyDataToClipboard() {
    const data = JSON.stringify(TF.data.exportAll(), null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data)
        .then(() => TF.app.showToast('Data copied to clipboard'))
        .catch(() => TF.app.showToast('Copy failed — try Export JSON instead'));
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = data;
    ta.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.setSelectionRange(0, data.length);
    try {
      document.execCommand('copy');
      TF.app.showToast('Data copied to clipboard');
    } catch(e) {
      TF.app.showToast('Copy failed — try Export JSON instead');
    }
    ta.remove();
  },

  _exportData() {
    const data = JSON.stringify(TF.data.exportAll(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timfit-backup-${TF.utils.todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  _importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        TF.data.importAll(data);
        TF.app.showToast(TF.i18n.t('settings.saved'));
        TF.app.renderDashboard();
        this.render();
      } catch(err) {
        alert('Invalid backup file: ' + err.message);
      }
    };
    input.click();
  },

  _clearCardioData() {
    if (!confirm('Clear all cardio & health data? This cannot be undone.')) return;
    localStorage.removeItem('tf_cardio');
    localStorage.removeItem('tf_health');
    TF.app.showToast('Cardio data cleared');
    TF.app.renderDashboard();
  },

  _resetData() {
    if (!confirm(TF.i18n.t('settings.reset.confirm'))) return;
    if (!confirm(TF.i18n.t('settings.reset.confirm2'))) return;
    TF.data.resetAll();
    location.reload();
  },

  applyThemeFromProfile() {
    const profile = TF.data.getProfile();
    this._applyTheme(profile.theme || 'system');
  },

  async checkForUpdates() {
    const lang = TF.i18n.getLang();
    const btn = event.target;
    btn.textContent = lang === 'ru' ? 'Проверяем...' : 'Checking...';
    btn.disabled = true;
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      }
      // Clear all caches so fresh files load
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      btn.textContent = lang === 'ru' ? 'Обновляем...' : 'Reloading...';
      setTimeout(() => location.reload(), 500);
    } catch(e) {
      btn.textContent = lang === 'ru' ? 'Проверить обновления' : 'Check for Updates';
      btn.disabled = false;
      TF.app.showToast('Update check failed');
    }
  },

  _loadTestData() {
    if (!confirm('This will add test workout sessions, measurements and cardio data. OK?')) return;

    const today = TF.utils.todayStr();
    const d = (offset) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().slice(0, 10);
    };

    const makeSet = (w, r, done = true) => ({
      setNumber: 1, weight: w, reps: r,
      completed: done, completedAt: done ? Date.now() : null, isPR: false
    });

    const makeSets = (pairs) => pairs.map((p, i) => ({
      setNumber: i + 1, weight: p[0], reps: p[1],
      completed: true, completedAt: Date.now(), isPR: false
    }));

    const sessions = [
      {
        id: 'test-pushA-1', date: d(-6), sessionType: 'Push A', completed: true,
        startTime: Date.now() - 6*86400000, endTime: Date.now() - 6*86400000 + 4500000,
        duration: 4500, totalVolume: 12840, prs: [],
        exerciseLogs: [
          { exerciseId: 'incline_barbell_press', exerciseName: 'Incline Barbell Press', sets: makeSets([[70,5],[70,5],[72.5,4],[72.5,4]]), notes: '' },
          { exerciseId: 'flat_bench_press', exerciseName: 'Barbell Flat Bench Press', sets: makeSets([[85,7],[85,7],[87.5,6],[87.5,6]]), notes: '' },
          { exerciseId: 'hdw_iso_lateral_incline_press', exerciseName: 'HDW Iso-Lateral Incline Press', sets: makeSets([[42,11],[42,11],[42,10]]), notes: '' },
          { exerciseId: 'cable_lateral_raise', exerciseName: 'Cable Lateral Raise', sets: makeSets([[9,18],[9,17],[9,16]]), notes: '' },
          { exerciseId: 'tricep_bar_pushdown', exerciseName: 'Revolving Short Bar Pushdown', sets: makeSets([[32,14],[32,13],[32,12]]), notes: '' },
          { exerciseId: 'overhead_tricep_extension', exerciseName: 'Overhead Extension', sets: makeSets([[22,12],[22,11],[22,10]]), notes: '' },
          { exerciseId: 'cable_face_pull', exerciseName: 'Cable Face Pull', sets: makeSets([[22,18],[22,17],[22,16]]), notes: '' }
        ]
      },
      {
        id: 'test-pullA-1', date: d(-5), sessionType: 'Pull A', completed: true,
        startTime: Date.now() - 5*86400000, endTime: Date.now() - 5*86400000 + 4200000,
        duration: 4200, totalVolume: 14200, prs: [{ exerciseName: 'Barbell Bent-Over Row', weight: 70, reps: 8 }],
        exerciseLogs: [
          { exerciseId: 'weighted_pullup', exerciseName: 'Weighted Pull-Up', sets: makeSets([[0,7],[0,7],[0,6],[0,6]]), notes: '' },
          { exerciseId: 'barbell_bent_over_row', exerciseName: 'Barbell Bent-Over Row', sets: makeSets([[70,8],[70,8],[70,7],[70,7]]), notes: '' },
          { exerciseId: 'seated_cable_row_neutral', exerciseName: 'Seated Cable Row', sets: makeSets([[62,10],[62,9],[62,9]]), notes: '' },
          { exerciseId: 'cable_face_pull_pull_a', exerciseName: 'Cable Face Pull', sets: makeSets([[22,18],[22,17],[22,16]]), notes: '' },
          { exerciseId: 'ez_bar_curl', exerciseName: 'EZ-Bar Curl', sets: makeSets([[32,9],[32,9],[32,8]]), notes: '' },
          { exerciseId: 'hammer_curl', exerciseName: 'Hammer Curl', sets: makeSets([[18,11],[18,10],[18,10]]), notes: '' }
        ]
      },
      {
        id: 'test-legsA-1', date: d(-4), sessionType: 'Legs A', completed: true,
        startTime: Date.now() - 4*86400000, endTime: Date.now() - 4*86400000 + 5400000,
        duration: 5400, totalVolume: 22600, prs: [],
        exerciseLogs: [
          { exerciseId: 'barbell_back_squat', exerciseName: 'Barbell Back Squat', sets: makeSets([[90,5],[90,5],[92.5,4],[92.5,4]]), notes: '' },
          { exerciseId: 'barbell_hip_thrust', exerciseName: 'Barbell Hip Thrust', sets: makeSets([[80,10],[80,10],[80,9],[80,9]]), notes: '' },
          { exerciseId: 'leg_press', exerciseName: 'Leg Press', sets: makeSets([[120,12],[120,11],[120,11]]), notes: '' },
          { exerciseId: 'seated_leg_curl', exerciseName: 'Seated Leg Curl', sets: makeSets([[38,11],[38,10],[38,10]]), notes: '' },
          { exerciseId: 'standing_calf_raise', exerciseName: 'Standing Calf Raise', sets: makeSets([[65,14],[65,13],[65,13],[65,12]]), notes: '' },
          { exerciseId: 'cable_crunch', exerciseName: 'Cable Crunch', sets: makeSets([[32,14],[32,13],[32,12]]), notes: '' }
        ]
      },
      {
        id: 'test-pushB-1', date: d(-3), sessionType: 'Push B', completed: true,
        startTime: Date.now() - 3*86400000, endTime: Date.now() - 3*86400000 + 4800000,
        duration: 4800, totalVolume: 10400, prs: [],
        exerciseLogs: [
          { exerciseId: 'incline_db_press', exerciseName: 'Incline Dumbbell Press', sets: makeSets([[26,11],[26,10],[26,10],[26,9]]), notes: '' },
          { exerciseId: 'cable_chest_fly', exerciseName: 'Cable Chest Fly', sets: makeSets([[13,14],[13,13],[13,13]]), notes: '' },
          { exerciseId: 'arnold_press', exerciseName: 'Arnold Press', sets: makeSets([[18,11],[18,10],[18,10]]), notes: '' },
          { exerciseId: 'cable_lateral_raise_leaning', exerciseName: 'Cable Lateral Raise Leaning', sets: makeSets([[11,18],[11,17],[11,16]]), notes: '' },
          { exerciseId: 'weighted_dips_chest', exerciseName: 'Weighted Dips', sets: makeSets([[0,11],[0,10],[0,10]]), notes: '' },
          { exerciseId: 'skull_crusher', exerciseName: 'Skull Crusher', sets: makeSets([[27,11],[27,11],[27,10]]), notes: '' },
          { exerciseId: 'cable_face_pull_push_b', exerciseName: 'Cable Face Pull', sets: makeSets([[22,17],[22,16],[22,16]]), notes: '' }
        ]
      },
      {
        id: 'test-pullB-1', date: d(-2), sessionType: 'Pull B', completed: true,
        startTime: Date.now() - 2*86400000, endTime: Date.now() - 2*86400000 + 4500000,
        duration: 4500, totalVolume: 11800, prs: [],
        exerciseLogs: [
          { exerciseId: 'weighted_pullup_b', exerciseName: 'Weighted Pull-Up', sets: makeSets([[0,9],[0,9],[0,8],[0,8]]), notes: '' },
          { exerciseId: 'chest_supported_db_row', exerciseName: 'Chest-Supported DB Row', sets: makeSets([[24,11],[24,11],[24,10],[24,10]]), notes: '' },
          { exerciseId: 'seated_cable_row_wide', exerciseName: 'Seated Cable Row Wide', sets: makeSets([[57,14],[57,13],[57,13]]), notes: '' },
          { exerciseId: 'pec_fly_rear_delt_machine', exerciseName: 'Rear Delt Machine', sets: makeSets([[13,18],[13,17],[13,16]]), notes: '' },
          { exerciseId: 'incline_db_curl', exerciseName: 'Incline Dumbbell Curl', sets: makeSets([[13,11],[13,10],[13,10]]), notes: '' },
          { exerciseId: 'cable_curl_single_arm', exerciseName: 'Cable Curl Single Arm', sets: makeSets([[11,13],[11,13],[11,12]]), notes: '' }
        ]
      },
      {
        id: 'test-legsB-1', date: d(-1), sessionType: 'Legs B', completed: true,
        startTime: Date.now() - 86400000, endTime: Date.now() - 86400000 + 5100000,
        duration: 5100, totalVolume: 18900, prs: [],
        exerciseLogs: [
          { exerciseId: 'db_reverse_lunge', exerciseName: 'Dumbbell Reverse Lunge', sets: makeSets([[18,11],[18,11],[18,10]]), notes: '' },
          { exerciseId: 'hack_squat', exerciseName: 'Hack Squat', sets: makeSets([[70,11],[70,11],[70,10],[70,10]]), notes: '' },
          { exerciseId: 'db_hip_thrust', exerciseName: 'Hip Thrust', sets: makeSets([[35,18],[35,17],[35,16]]), notes: '' },
          { exerciseId: 'back_extension', exerciseName: 'Back Extension', sets: makeSets([[0,14],[0,13],[0,13]]), notes: '' },
          { exerciseId: 'leg_extension', exerciseName: 'Leg Extension', sets: makeSets([[38,14],[38,13],[38,12]]), notes: '' },
          { exerciseId: 'seated_calf_raise', exerciseName: 'Seated Calf Raise', sets: makeSets([[42,18],[42,17],[42,16],[42,15]]), notes: '' },
          { exerciseId: 'ab_wheel_rollout', exerciseName: 'Ab Wheel Rollout', sets: makeSets([[0,10],[0,9],[0,9]]), notes: '' }
        ]
      },
      {
        id: 'test-pushA-2', date: today, sessionType: 'Push A', completed: true,
        startTime: Date.now() - 4200000, endTime: Date.now() - 300000,
        duration: 3900, totalVolume: 13200, prs: [{ exerciseName: 'Incline Barbell Press', weight: 75, reps: 5 }],
        exerciseLogs: [
          { exerciseId: 'incline_barbell_press', exerciseName: 'Incline Barbell Press', sets: [
            { setNumber:1, weight:75, reps:5, completed:true, completedAt:Date.now(), isPR:true },
            { setNumber:2, weight:75, reps:5, completed:true, completedAt:Date.now(), isPR:false },
            { setNumber:3, weight:75, reps:4, completed:true, completedAt:Date.now(), isPR:false },
            { setNumber:4, weight:72.5, reps:4, completed:true, completedAt:Date.now(), isPR:false }
          ], notes: '' },
          { exerciseId: 'flat_bench_press', exerciseName: 'Barbell Flat Bench Press', sets: makeSets([[87.5,7],[87.5,7],[87.5,6],[87.5,6]]), notes: '' },
          { exerciseId: 'hdw_iso_lateral_incline_press', exerciseName: 'HDW Iso-Lateral Incline Press', sets: makeSets([[42,12],[42,11],[42,11]]), notes: '' },
          { exerciseId: 'cable_lateral_raise', exerciseName: 'Cable Lateral Raise', sets: makeSets([[9,19],[9,18],[9,17]]), notes: '' },
          { exerciseId: 'tricep_bar_pushdown', exerciseName: 'Revolving Short Bar Pushdown', sets: makeSets([[32,15],[32,14],[32,13]]), notes: '' },
          { exerciseId: 'overhead_tricep_extension', exerciseName: 'Overhead Extension', sets: makeSets([[22,13],[22,12],[22,11]]), notes: '' },
          { exerciseId: 'cable_face_pull', exerciseName: 'Cable Face Pull', sets: makeSets([[22,19],[22,18],[22,17]]), notes: '' }
        ]
      }
    ];

    const measurements = [
      { date: d(-14), weight: 83.2, bodyFat: 23.1 },
      { date: d(-7), weight: 82.6, bodyFat: 22.8 },
      { date: d(-1), weight: 81.9, bodyFat: 22.4 },
      { date: today, weight: 81.7, bodyFat: 22.1 }
    ];

    const cardio = [
      { date: d(-6), steps: 9200, distanceKm: 6.8, calories: 420, source: 'shortcut' },
      { date: d(-5), steps: 11400, distanceKm: 8.4, calories: 510, source: 'shortcut' },
      { date: d(-4), steps: 8700, distanceKm: 6.4, calories: 390, source: 'shortcut' },
      { date: d(-3), steps: 10200, distanceKm: 7.5, calories: 460, source: 'shortcut' },
      { date: d(-2), steps: 9800, distanceKm: 7.2, calories: 440, source: 'shortcut' },
      { date: d(-1), steps: 12100, distanceKm: 8.9, calories: 540, source: 'shortcut' },
      { date: today, steps: 6400, distanceKm: 4.7, calories: 290, source: 'shortcut' }
    ];

    // Save all sessions
    const existing = TF.data.getWorkoutSessions();
    const testIds = sessions.map(s => s.id);
    const filtered = existing.filter(s => !testIds.includes(s.id));
    localStorage.setItem(TF.data.KEYS.SESSIONS, JSON.stringify([...filtered, ...sessions]));

    // Save measurements
    measurements.forEach(m => TF.data.saveMeasurement(m));

    // Save cardio
    cardio.forEach(c => TF.data.saveCardioLog(c));

    // Save a PR
    const prs = { weighted_pullup: { weight: 0, reps: 9, date: d(-2) }, incline_barbell_press: { weight: 75, reps: 5, date: today } };
    localStorage.setItem('tf_prs', JSON.stringify(prs));

    TF.app.renderDashboard();
    TF.router.navigate('dashboard');
    TF.app.showToast('Test data loaded!');
  }
};
