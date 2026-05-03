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
        <h2 class="section-title">${lang === 'ru' ? 'Заметки тренера' : 'Coaching Notes'}</h2>
      </div>
      <div style="margin:0 16px 12px">
        <button class="btn btn-secondary btn-full" onclick="TF.settings._openBulkImport()">
          ${lang === 'ru' ? '📋 Импортировать заметки из текста' : '📋 Import Notes from Text'}
        </button>
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
        ${this._settingsRow('settings.version', '<span class="settings-row-value">1.5.0 (3 May)</span>')}
        ${this._settingsRow('settings.program.start', `<span class="settings-row-value">${programStart}</span>`)}
        ${this._settingsRow('settings.days.training', `<span class="settings-row-value">${daysTraining}</span>`)}
      </div>
      <button class="btn btn-primary" style="margin:0 16px 12px;width:calc(100% - 32px)"
              onclick="TF.settings.checkForUpdates()">
        ${lang === 'ru' ? 'Проверить обновления' : 'Check for Updates'}
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

  _buildCoachingNotesList(lang) {
    const allExercises = Object.values(TF.PROGRAM)
      .flatMap(s => s.exercises || [])
      .flatMap(e => e._alternating ? e._alternating : [e])
      .filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name));
    const notes = TF.data.getCoachingNotes();
    return allExercises.map(ex => {
      const note = notes[ex.id] || '';
      return `
        <div class="settings-row" onclick="TF.settings._editCoachingNote('${ex.id}', '${ex.name.replace(/'/g, "\\'")}')">
          <span class="settings-row-label" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ex.name}</span>
          <span class="settings-row-value" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:${note ? 'var(--accent)' : 'var(--text3)'}">${note || (lang === 'ru' ? 'Нет заметки' : 'No note')}</span>
          <span class="settings-row-arrow">›</span>
        </div>`;
    }).join('');
  },

  _editCoachingNote(exerciseId, exerciseName) {
    const lang = TF.i18n.getLang();
    const current = TF.data.getCoachingNote(exerciseId);
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:700;display:flex;align-items:flex-end';
    modal.innerHTML = `
      <div style="background:var(--bg-modal);border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom)+20px);width:100%;box-sizing:border-box">
        <h3 style="font-size:17px;font-weight:700;margin-bottom:4px">${exerciseName}</h3>
        <p style="font-size:13px;color:var(--text3);margin-bottom:12px">${lang === 'ru' ? 'Персональная заметка для этого упражнения' : 'Personal note for this exercise'}</p>
        <textarea id="coachingNoteInput" class="form-input" maxlength="500"
          style="width:100%;min-height:100px;resize:vertical;font-size:15px;box-sizing:border-box"
          placeholder="${lang === 'ru' ? 'Введите заметку...' : 'Enter note...'}">${current}</textarea>
        <div style="font-size:12px;color:var(--text3);text-align:right;margin-bottom:12px" id="noteCharCount">${current.length}/500</div>
        <button class="btn btn-primary btn-full" onclick="TF.settings._saveCoachingNote('${exerciseId}', this.closest('[style]'))">${lang === 'ru' ? 'Сохранить' : 'Save'}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px;color:var(--red)" onclick="TF.settings._clearCoachingNote('${exerciseId}', this.closest('[style]'))">${lang === 'ru' ? 'Очистить заметку' : 'Clear note'}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:4px" onclick="this.closest('[style]').remove()">Cancel</button>
      </div>
    `;
    // Char count update
    modal.querySelector('#coachingNoteInput').addEventListener('input', function() {
      modal.querySelector('#noteCharCount').textContent = this.value.length + '/500';
    });
    document.body.appendChild(modal);
  },

  _saveCoachingNote(exerciseId, modal) {
    const val = document.getElementById('coachingNoteInput').value.trim();
    TF.data.saveCoachingNote(exerciseId, val);
    modal.remove();
    const lang = TF.i18n.getLang();
    TF.app.showToast(lang === 'ru' ? 'Заметка сохранена' : 'Note saved');
  },

  _clearCoachingNote(exerciseId, modal) {
    TF.data.saveCoachingNote(exerciseId, '');
    modal.remove();
  },

  // ---------------------------------------------------------------
  // Bulk coaching notes import
  // ---------------------------------------------------------------

  _openBulkImport() {
    const lang = TF.i18n.getLang();
    const ph = lang === 'ru'
      ? 'Вставьте заметки тренера. Используйте название упражнения как заголовок, затем заметку на следующей строке.'
      : 'Paste your coaching notes here. Use exercise name as header followed by the note on the next line.';

    const modal = document.createElement('div');
    modal.id = 'bulkImportModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:800;display:flex;align-items:flex-end';
    modal.innerHTML = `
      <div style="background:var(--bg-modal);border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom)+20px);width:100%;box-sizing:border-box;max-height:90vh;overflow-y:auto">
        <h3 style="font-size:17px;font-weight:700;margin-bottom:12px">
          ${lang === 'ru' ? '📋 Импортировать заметки' : '📋 Import Notes from Text'}
        </h3>
        <textarea id="bulkImportText" class="form-input"
          style="width:100%;min-height:180px;resize:vertical;font-size:14px;font-family:monospace;box-sizing:border-box;margin-bottom:12px"
          placeholder="${ph}"></textarea>
        <div id="bulkPreviewArea" style="margin-bottom:12px"></div>
        <button class="btn btn-secondary btn-full" style="margin-bottom:8px"
                onclick="TF.settings._previewBulkImport()">
          ${lang === 'ru' ? 'Предпросмотр' : 'Preview'}
        </button>
        <button class="btn btn-primary btn-full" id="bulkImportConfirmBtn" style="margin-bottom:8px;display:none"
                onclick="TF.settings._confirmBulkImport()">
          ${lang === 'ru' ? 'Импортировать' : 'Import'}
        </button>
        <button class="btn btn-ghost btn-full" onclick="document.getElementById('bulkImportModal').remove()">
          Cancel
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // --- Parse raw text into {name, note} pairs ---
  // Uses the fuzzy matcher to identify exercise name lines vs note lines.
  // A line is an exercise name if it matches (or is ambiguous against) a known
  // exercise — otherwise it's a note line for the previous exercise.
  // Works with or without blank lines between entries.
  _parseBulkText(text) {
    const SESSION_HEADERS = new Set(['push a','pull a','legs a','push b','pull b','legs b','rest']);
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const entries = [];
    let currentName = null;
    let currentNoteLines = [];

    for (const line of lines) {
      if (SESSION_HEADERS.has(line.toLowerCase())) continue;

      const { matched, ambiguous } = this._fuzzyMatch(line);
      const isExerciseName = (matched && matched.length > 0) || ambiguous;

      if (isExerciseName) {
        // Save previous entry
        if (currentName && currentNoteLines.length > 0) {
          entries.push({ name: currentName, note: currentNoteLines.join('\n').trim() });
        }
        currentName = line;
        currentNoteLines = [];
      } else {
        // Note line for current exercise
        if (currentName) currentNoteLines.push(line);
      }
    }

    // Save last entry
    if (currentName && currentNoteLines.length > 0) {
      entries.push({ name: currentName, note: currentNoteLines.join('\n').trim() });
    }

    return entries;
  },

  // --- Fuzzy match a pasted name against all known exercises ---
  // Returns { matched: Exercise[]|null, ambiguous: boolean, candidates: Exercise[] }
  // matched is an array to support same-name exercises (e.g. Cable Face Pull ×3 sessions).
  _fuzzyMatch(pastedName) {
    const allExercises = Object.values(TF.PROGRAM)
      .flatMap(s => s.exercises || [])
      .flatMap(e => e._alternating ? e._alternating : [e])
      .filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);

    const q = pastedName.toLowerCase().trim();

    // Helper: check if a set of matches share the same display name.
    // Same-name duplicates (same exercise in different sessions) are treated as one match.
    const groupByName = (list) => {
      const names = [...new Set(list.map(e => e.name.toLowerCase()))];
      return names.length; // 1 = all same name, >1 = genuinely ambiguous
    };

    // 1. Exact match
    const exact = allExercises.filter(e => e.name.toLowerCase() === q);
    if (exact.length >= 1) return { matched: exact, ambiguous: false, candidates: exact };

    // 2. Contains match — q is contained within exercise name
    const contains = allExercises.filter(e => e.name.toLowerCase().includes(q));
    if (contains.length >= 1) {
      if (groupByName(contains) === 1) return { matched: contains, ambiguous: false, candidates: contains };
      return { matched: null, ambiguous: true, candidates: contains };
    }

    // 3. Partial word match — check how many words of q appear in the exercise name
    const qWords = q.split(/\s+/).filter(w => w.length > 1);
    if (qWords.length === 0) return { matched: null, ambiguous: false, candidates: [] };

    const scored = allExercises.map(e => {
      const eName = e.name.toLowerCase();
      const matchCount = qWords.filter(w => eName.includes(w)).length;
      return { ex: e, score: matchCount / qWords.length };
    }).filter(s => s.score >= 0.5).sort((a, b) => b.score - a.score);

    if (scored.length === 0) return { matched: null, ambiguous: false, candidates: [] };

    const best = scored[0].score;
    const topTier = scored.filter(s => s.score === best).map(s => s.ex);
    if (groupByName(topTier) === 1) return { matched: topTier, ambiguous: false, candidates: topTier };
    return { matched: null, ambiguous: true, candidates: topTier };
  },

  // --- Build matched results array from parsed entries ---
  _buildMatchResults(entries) {
    return entries.map(({ name, note }) => {
      const { matched, ambiguous, candidates } = this._fuzzyMatch(name);
      // matched is an array of exercises (same-name group) or null
      if (matched && matched.length > 0) {
        return { status: 'ok', pastedName: name, note, exercises: matched };
      }
      // Ambiguous = multiple different exercises matched — apply to ALL of them
      if (ambiguous && candidates.length > 0) {
        return { status: 'ok', pastedName: name, note, exercises: candidates, multiMatch: true };
      }
      return { status: 'none', pastedName: name, note };
    });
  },

  _previewBulkImport() {
    const lang = TF.i18n.getLang();
    const text = document.getElementById('bulkImportText').value;
    const entries = this._parseBulkText(text);
    const area = document.getElementById('bulkPreviewArea');

    if (entries.length === 0) {
      area.innerHTML = `<p style="font-size:14px;color:var(--text3);margin:0">${lang === 'ru' ? 'Ничего не найдено для разбора.' : 'Nothing found to parse.'}</p>`;
      document.getElementById('bulkImportConfirmBtn').style.display = 'none';
      return;
    }

    const results = this._buildMatchResults(entries);
    // Store on the modal element for confirm step
    document.getElementById('bulkImportModal')._matchResults = results;

    const okCount = results.filter(r => r.status === 'ok').length;

    let html = `<div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px">${
      lang === 'ru'
        ? `Найдено совпадений: ${okCount} из ${entries.length}`
        : `Matched ${okCount} of ${entries.length} entries`
    }</div>`;

    html += `<div style="background:var(--bg-card);border-radius:10px;overflow:hidden">`;
    results.forEach((r, i) => {
      const border = i < results.length - 1 ? 'border-bottom:1px solid var(--border)' : '';
      if (r.status === 'ok') {
        const exLabel = r.multiMatch
          ? r.exercises.map(e => e.name).join(' + ')
          : r.exercises[0].name;
        html += `<div style="padding:10px 12px;${border}">
          <span style="color:var(--green);font-weight:700">✅</span>
          <span style="font-size:13px;color:var(--text1);margin-left:6px"><strong>${this._escHtml(exLabel)}</strong></span>
          <div style="font-size:12px;color:var(--text3);margin-left:22px;margin-top:2px">${this._escHtml(r.note.slice(0, 80))}${r.note.length > 80 ? '…' : ''}</div>
        </div>`;
      } else if (r.status === 'ambiguous') {
        const names = r.candidates.map(c => c.name).join(', ');
        html += `<div style="padding:10px 12px;${border}">
          <span style="color:#FF9500;font-weight:700">⚠️</span>
          <span style="font-size:13px;color:var(--text2);margin-left:6px">"${this._escHtml(r.pastedName)}"</span>
          <div style="font-size:12px;color:var(--text3);margin-left:22px;margin-top:2px">${lang === 'ru' ? 'Несколько совпадений, пропущено' : 'Multiple matches, skipped'}: ${this._escHtml(names)}</div>
        </div>`;
      } else {
        html += `<div style="padding:10px 12px;${border}">
          <span style="color:var(--red);font-weight:700">❌</span>
          <span style="font-size:13px;color:var(--text2);margin-left:6px">"${this._escHtml(r.pastedName)}"</span>
          <div style="font-size:12px;color:var(--text3);margin-left:22px;margin-top:2px">${lang === 'ru' ? 'Совпадений не найдено, пропущено' : 'No match found, skipped'}</div>
        </div>`;
      }
    });
    html += `</div>`;

    area.innerHTML = html;
    document.getElementById('bulkImportConfirmBtn').style.display = okCount > 0 ? 'block' : 'none';
  },

  _confirmBulkImport() {
    const lang = TF.i18n.getLang();
    const modal = document.getElementById('bulkImportModal');
    const results = modal._matchResults;
    if (!results) return;

    const toImport = results.filter(r => r.status === 'ok');
    toImport.forEach(r => {
      // Save note to all matched exercises (handles same-name duplicates like Cable Face Pull)
      r.exercises.forEach(ex => TF.data.saveCoachingNote(ex.id, r.note));
    });

    modal.remove();

    const msg = lang === 'ru'
      ? `✅ ${toImport.length} заметок успешно импортированы.`
      : `✅ ${toImport.length} note${toImport.length !== 1 ? 's' : ''} imported successfully.`;
    TF.app.showToast(msg);
  },

  _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

};
