window.TF = window.TF || {};

TF.library = {

  // Build deduplicated exercise list from all sessions
  _getAllExercises() {
    const seen = new Set();
    const all = [];
    const sessions = ['Push A', 'Push B', 'Pull A', 'Pull B', 'Legs A', 'Legs B'];
    sessions.forEach(type => {
      const session = TF.program.getSession(type);
      if (!session) return;
      session.exercises.forEach(ex => {
        if (!seen.has(ex.id)) {
          seen.add(ex.id);
          all.push({ ...ex, sessions: [type] });
        } else {
          const existing = all.find(e => e.id === ex.id);
          if (existing) existing.sessions.push(type);
        }
      });
    });
    return all;
  },

  _getSessionGroup(sessions) {
    const hasPush = sessions.some(s => s.startsWith('Push'));
    const hasPull = sessions.some(s => s.startsWith('Pull'));
    const hasLegs = sessions.some(s => s.startsWith('Legs'));
    if (hasPush && !hasPull && !hasLegs) return 'push';
    if (hasPull && !hasPush && !hasLegs) return 'pull';
    if (hasLegs && !hasPush && !hasPull) return 'legs';
    return 'all';
  },

  _getMuscleEmoji(muscleKeys) {
    if (!muscleKeys || !muscleKeys.length) return '💪';
    const k = muscleKeys[0];
    if (k.includes('chest')) return '🫁';
    if (k.includes('back') || k.includes('lats')) return '🔙';
    if (k.includes('delt') || k.includes('shoulder')) return '🎯';
    if (k.includes('tricep')) return '💪';
    if (k.includes('bicep')) return '💪';
    if (k.includes('quad') || k.includes('leg')) return '🦵';
    if (k.includes('glute')) return '🍑';
    if (k.includes('hamstring')) return '🦵';
    if (k.includes('calf')) return '🦵';
    if (k.includes('core') || k.includes('ab')) return '⚡';
    return '💪';
  },

  _getSessionBadge(sessions) {
    const groups = [...new Set(sessions.map(s => s.split(' ')[0]))];
    return groups.join(' · ');
  },

  render(container) {
    const lang = TF.i18n.getLang();
    const exercises = this._getAllExercises();

    const filters = [
      { key: 'all',  labelEn: 'All',  labelRu: 'Все' },
      { key: 'push', labelEn: 'Push', labelRu: 'Жим' },
      { key: 'pull', labelEn: 'Pull', labelRu: 'Тяга' },
      { key: 'legs', labelEn: 'Legs', labelRu: 'Ноги' }
    ];

    container.innerHTML = `
      <div class="lib-header">
        <button class="lib-back" onclick="TF.library.close()">‹ ${lang === 'ru' ? 'Назад' : 'Back'}</button>
        <h2 class="lib-title">${lang === 'ru' ? 'Упражнения' : 'Exercise Library'}</h2>
        <div style="width:60px"></div>
      </div>
      <div class="lib-filters" id="libFilters">
        ${filters.map(f => `
          <button class="lib-filter-btn ${f.key === 'all' ? 'active' : ''}"
                  data-filter="${f.key}"
                  onclick="TF.library._setFilter('${f.key}')">
            ${lang === 'ru' ? f.labelRu : f.labelEn}
          </button>
        `).join('')}
      </div>
      <div class="lib-list" id="libList"></div>
    `;

    this._renderList(exercises, 'all', lang);
  },

  _setFilter(filter) {
    document.querySelectorAll('.lib-filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filter);
    });
    const exercises = this._getAllExercises();
    const lang = TF.i18n.getLang();
    this._renderList(exercises, filter, lang);
  },

  _renderList(exercises, filter, lang) {
    const list = document.getElementById('libList');
    if (!list) return;

    const filtered = filter === 'all'
      ? exercises
      : exercises.filter(ex => this._getSessionGroup(ex.sessions) === filter);

    if (!filtered.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3)">No exercises</div>';
      return;
    }

    list.innerHTML = filtered.map(ex => {
      const muscles = ex.muscleKeys
        ? ex.muscleKeys.slice(0, 2).map(k => TF.i18n.t(k)).join(', ')
        : ex.muscles.slice(0, 2).join(', ');
      const badge = this._getSessionBadge(ex.sessions);
      const emoji = this._getMuscleEmoji(ex.muscleKeys);
      return `
        <div class="lib-card" onclick="TF.library._openExercise('${ex.id}')">
          <div class="lib-card-thumb" id="libThumb_${ex.id}">
            <img src="${ex.gif}" alt="${ex.name}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:10px"
                 onerror="this.parentNode.innerHTML='<span class=lib-card-emoji>${emoji}</span>'">
          </div>
          <div class="lib-card-info">
            <div class="lib-card-name">${ex.name}</div>
            <div class="lib-card-muscles">${muscles}</div>
            <div class="lib-card-meta">
              <span class="lib-badge">${badge}</span>
              <span class="lib-card-sets">${ex.sets}×${ex.repsMin}–${ex.repsMax}</span>
            </div>
          </div>
          <div class="lib-card-arrow">›</div>
        </div>
      `;
    }).join('');
  },

  _openExercise(exerciseId) {
    const exercises = this._getAllExercises();
    const ex = exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const modal = document.getElementById('exerciseModal');
    const lang = TF.i18n.getLang();
    const cues = lang === 'ru' ? ex.cuesRu : ex.cuesEn;

    document.getElementById('modalGif').src = ex.gif;
    document.getElementById('modalGif').onerror = function() {
      this.parentNode.innerHTML = `<div style="font-size:80px;display:flex;align-items:center;justify-content:center;height:100%">💪</div>`;
    };

    document.getElementById('modalExName').textContent = ex.name;
    document.getElementById('modalExCues').textContent = cues || '';

    const equipParts = [];
    if (ex.equipment) equipParts.push(ex.equipment);
    if (ex.grip) equipParts.push((lang === 'ru' ? 'Хват: ' : 'Grip: ') + ex.grip);
    if (ex.note) equipParts.push(ex.note);
    document.getElementById('modalEquipment').textContent = equipParts.join(' · ');

    modal.classList.remove('hidden');
  },

  open() {
    const panel = document.getElementById('libraryPanel');
    panel.classList.remove('hidden');
    panel.classList.add('lib-visible');
    this.render(panel);
  },

  close() {
    const panel = document.getElementById('libraryPanel');
    panel.classList.add('hidden');
    panel.classList.remove('lib-visible');
  }
};
