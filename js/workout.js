window.TF = window.TF || {};

TF.workout = {
  _session: null,          // current active session object
  _timerWorker: null,
  _timerRunning: false,
  _timerExerciseIdx: null,
  _sessionStartTime: null,
  _elapsedInterval: null,
  _warmupChecked: [false, false, false],
  _isTest: false,          // test mode: no data saved

  // --- Init ---
  init() {
    this._timerWorker = new Worker('./timer-worker.js');
    this._timerWorker.onmessage = (e) => this._onTimerMessage(e.data);

    // Restore timer if app regains focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this._timerRunning) {
        this._timerWorker.postMessage({ type: 'SYNC' });
      }
    });

    // Init picker modal listeners
    document.getElementById('pickerCancel').addEventListener('click', () => this._closePicker());
    document.getElementById('pickerDone').addEventListener('click', () => this._confirmPicker());

    // Timer sheet controls
    document.getElementById('timerSkip').addEventListener('click', () => this.skipTimer());
    document.getElementById('timerAdd').addEventListener('click', () => {
      this._timerWorker.postMessage({ type: 'ADD', seconds: 15 });
      TF.utils.vibrate([30]);
    });
    document.getElementById('timerSubtract').addEventListener('click', () => {
      this._timerWorker.postMessage({ type: 'SUBTRACT', seconds: 15 });
      TF.utils.vibrate([30]);
    });
    document.getElementById('miniTimerBar').addEventListener('click', () => this._showTimerSheet());

    // Exercise modal close
    document.getElementById('exerciseModalClose').addEventListener('click', () => {
      document.getElementById('exerciseModal').classList.add('hidden');
    });
  },

  // --- Start Session ---
  startSession(sessionType) {
    TF.notifications.unlockAudio();
    const session = TF.program.getSession(sessionType);
    if (!session || session.exercises.length === 0) return;

    const id = TF.utils.generateId();
    const now = Date.now();

    this._session = {
      id,
      date: TF.utils.todayStr(),
      sessionType,
      startTime: now,
      endTime: null,
      completed: false,
      exerciseLogs: session.exercises.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: this._getLastWeightForExercise(ex.id, i, ex.startingWeight),
          reps: this._getLastRepsForExercise(ex.id, i, ex.repsMin),
          completed: false,
          completedAt: null,
          isPR: false
        })),
        notes: ''
      })),
      totalVolume: 0,
      duration: 0,
      prs: []
    };

    // Persist immediately (skip in test mode)
    if (!this._isTest) TF.data.saveActiveSession(this._session);
    this._sessionStartTime = now;
    this._warmupChecked = [false, false, false];

    this._renderSessionScreen();
    document.getElementById('activeWorkout').classList.remove('hidden');

    // Start elapsed timer
    this._startElapsedTimer();
  },

  startTestSession() {
    this._isTest = true;
    this.startSession('Push A');
    // Override title to show TEST indicator
    const titleEl = document.getElementById('workoutTitle');
    if (titleEl) titleEl.textContent = '[TEST] ' + titleEl.textContent;
  },

  // --- Resume Session ---
  resumeSession() {
    const active = TF.data.getActiveSession();
    if (!active) return;
    this._session = active;
    this._sessionStartTime = active.startTime;

    this._renderSessionScreen();
    document.getElementById('activeWorkout').classList.remove('hidden');
    this._startElapsedTimer();
    TF.app.hidePrimaryResumeBanner();
  },

  minimizeWorkout() {
    document.getElementById('activeWorkout').classList.add('hidden');
    TF.router.navigate('dashboard');
  },

  discardSession() {
    this._stopTimers();
    if (!this._isTest) TF.data.clearActiveSession();
    this._isTest = false;
    this._session = null;
    document.getElementById('activeWorkout').classList.add('hidden');
    TF.app.renderDashboard();
  },

  _getLastWeightForExercise(exerciseId, setIndex, fallback) {
    const log = TF.data.getLastLogForExercise(exerciseId);
    if (!log || !log.sets[setIndex]) return fallback;
    return log.sets[setIndex].weight || fallback;
  },

  _getLastRepsForExercise(exerciseId, setIndex, fallback) {
    const log = TF.data.getLastLogForExercise(exerciseId);
    if (!log || !log.sets[setIndex]) return fallback;
    return log.sets[setIndex].reps || fallback;
  },

  _expandedExIdx: 0,

  // --- Render Session Screen ---
  _renderSessionScreen() {
    const session = TF.program.getSession(this._session.sessionType);
    const programExercises = session.exercises;

    document.getElementById('workoutTitle').textContent =
      `${TF.i18n.t(TF.SESSION_KEY_MAP[this._session.sessionType])} — ${TF.i18n.t(session.dayKey)}`;

    const body = document.getElementById('workoutBody');
    body.innerHTML = '';

    // Warmup (Legs only)
    if (session.warmup) {
      body.appendChild(this._buildWarmupCard());
    }

    // Exercise cards — iterate exerciseLogs order, look up program data by ID
    this._session.exerciseLogs.forEach((log, exIdx) => {
      const ex = programExercises.find(e => e.id === log.exerciseId) || programExercises[exIdx];
      body.appendChild(this._buildExerciseCard(ex, exIdx));
    });

    // Finish button (at bottom)
    const finishBtn = document.createElement('button');
    finishBtn.className = 'btn btn-primary btn-full';
    finishBtn.id = 'finishWorkoutBtn';
    finishBtn.style.margin = '20px 0 40px';
    finishBtn.textContent = TF.i18n.t('session.finish');
    finishBtn.addEventListener('click', () => this._finishSession());
    body.appendChild(finishBtn);
  },

  _buildWarmupCard() {
    const card = document.createElement('div');
    card.className = 'warmup-card';
    card.innerHTML = `
      <div class="warmup-title">${TF.i18n.t('session.warmup.title')}</div>
      <div class="warmup-subtitle">${TF.i18n.t('session.warmup.subtitle')}</div>
      ${TF.APT_WARMUP.map((w, i) => `
        <div class="warmup-item">
          <div class="warmup-cb" data-warmup="${i}" onclick="TF.workout._toggleWarmup(${i}, this)">
          </div>
          <span class="warmup-label">${TF.i18n.t(w.key)}</span>
        </div>
      `).join('')}
      <button class="btn btn-sm" id="beginWorkoutBtn" style="margin-top:12px;background:white;color:#FF9500;opacity:0.5;pointer-events:none;"
        onclick="TF.workout._onBeginWorkout()">
        ${TF.i18n.t('session.warmup.begin')}
      </button>
    `;
    return card;
  },

  _toggleWarmup(idx, el) {
    this._warmupChecked[idx] = !this._warmupChecked[idx];
    el.classList.toggle('checked', this._warmupChecked[idx]);
    el.textContent = this._warmupChecked[idx] ? '✓' : '';
    TF.utils.vibrate([30]);

    const allChecked = this._warmupChecked.every(Boolean);
    const btn = document.getElementById('beginWorkoutBtn');
    if (btn) {
      btn.style.opacity = allChecked ? '1' : '0.5';
      btn.style.pointerEvents = allChecked ? 'auto' : 'none';
    }
  },

  _onBeginWorkout() {
    TF.utils.vibrate([50, 30, 50]);
    document.querySelector('.warmup-card').style.opacity = '0.5';
  },

  _buildExerciseCard(ex, exIdx) {
    const log = this._session.exerciseLogs[exIdx];
    const lang = TF.i18n.getLang();
    const cues = lang === 'ru' ? ex.cuesRu : ex.cuesEn;
    const lastLog = TF.data.getLastLogForExercise(ex.id);
    const showOverloadBadge = this._checkOverloadReady(lastLog, ex);
    const allDone = log.sets.every(s => s.completed);
    const isExpanded = exIdx === this._expandedExIdx;
    const completedCount = log.sets.filter(s => s.completed).length;

    const card = document.createElement('div');
    card.className = 'exercise-card' + (isExpanded ? '' : ' ex-collapsed');
    card.id = `ex-card-${exIdx}`;

    // Header — tapping toggles collapse
    const header = document.createElement('div');
    header.className = 'exercise-card-header';
    header.style.cursor = 'pointer';
    header.addEventListener('click', (e) => {
      if (e.target.closest('.ex-gif-thumb')) return; // gif tap opens modal
      this._toggleExerciseCollapse(exIdx);
    });

    // GIF thumb
    const gifThumb = document.createElement('div');
    gifThumb.className = 'ex-gif-thumb';
    gifThumb.innerHTML = `
      <img src="${ex.gif}" alt="${ex.name}"
           onerror="this.parentNode.innerHTML='${this._getExerciseEmoji(ex)}';"
           loading="lazy">
    `;
    gifThumb.addEventListener('click', (e) => { e.stopPropagation(); this._showExerciseModal(ex); });

    // Info
    const info = document.createElement('div');
    info.className = 'ex-info';
    const muscleKeys = (ex.muscleKeys || []).slice(0, 3);
    info.innerHTML = `
      <div class="ex-number">${TF.i18n.t('ex.set')} ${exIdx + 1}${allDone ? ' ✓' : completedCount > 0 ? ` (${completedCount}/${log.sets.length})` : ''}</div>
      <div class="ex-name">${ex.name}${ex.altTag ? ` <span class="alt-tag">${ex.altTag}</span>` : ''}</div>
      <div class="ex-muscles">${muscleKeys.map(k =>
        `<span class="pill pill-blue">${TF.i18n.t(k)}</span>`
      ).join('')}</div>
      ${isExpanded ? `<div class="ex-meta">
        <span>${ex.sets} ${TF.i18n.t('ex.sets')} · ${ex.repsMin}–${ex.repsMax} ${TF.i18n.t('ex.reps')}</span>
        <span>${TF.i18n.t('ex.rest')} ${ex.rest}s</span>
        <span>RPE ${ex.rpe}</span>
      </div>` : ''}
    `;

    header.appendChild(gifThumb);
    header.appendChild(info);
    card.appendChild(header);

    if (!isExpanded) return card; // collapsed — only show header

    // Overload badge
    if (showOverloadBadge) {
      const badge = document.createElement('div');
      badge.className = 'ex-overload-badge';
      badge.innerHTML = `<span>↑</span> ${TF.i18n.t('ex.ready.add')}`;
      card.appendChild(badge);
    }

    // Cues toggle
    const cuesToggle = document.createElement('div');
    cuesToggle.className = 'cues-toggle';
    cuesToggle.innerHTML = `<span>${TF.i18n.t('ex.cues')}</span><span class="cues-arrow">▼</span>`;
    const cuesBody = document.createElement('div');
    cuesBody.className = 'cues-body';
    let equipInfo = '';
    if (ex.equipment) equipInfo += `Equipment: ${ex.equipment}`;
    if (ex.grip) equipInfo += `\nGrip: ${ex.grip}`;
    if (ex.handle) equipInfo += `\nHandle: ${ex.handle}`;
    if (ex.pulley) equipInfo += `\nPulley: ${ex.pulley}`;
    if (ex.note) equipInfo += `\nNote: ${ex.note}`;
    if (ex.equipment && ex.equipment.toLowerCase().includes('dumbbell')) {
      equipInfo += `\n${TF.i18n.t('ex.per.db.detail')}`;
    }
    cuesBody.innerHTML = `
      <div class="cues-text">${cues}</div>
      ${equipInfo ? `<div class="cues-equipment">${equipInfo}</div>` : ''}
    `;
    cuesToggle.addEventListener('click', () => {
      const arrow = cuesToggle.querySelector('.cues-arrow');
      cuesBody.classList.toggle('open');
      arrow.classList.toggle('open');
    });
    card.appendChild(cuesToggle);
    card.appendChild(cuesBody);

    // Sets
    const setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    setsContainer.id = `sets-${exIdx}`;

    log.sets.forEach((set, setIdx) => {
      setsContainer.appendChild(this._buildSetRow(ex, exIdx, setIdx, set));
    });
    card.appendChild(setsContainer);

    return card;
  },

  _toggleExerciseCollapse(exIdx) {
    this._expandedExIdx = this._expandedExIdx === exIdx ? -1 : exIdx;
    this._renderSessionScreen();
  },

  _buildSetRow(ex, exIdx, setIdx, set) {
    const row = document.createElement('div');
    row.className = 'set-row' + (set.completed ? ' completed' : '');
    row.id = `set-row-${exIdx}-${setIdx}`;

    const weightLabel = ex.id.includes('pullup') ? '+' : '';
    const isDumbbell = ex.equipment && ex.equipment.toLowerCase().includes('dumbbell');
    const perDbLabel = isDumbbell ? `<span class="per-db-label">${TF.i18n.t('ex.per.db')}</span>` : '';
    row.innerHTML = `
      <div class="set-num">${setIdx + 1}</div>
      <div class="set-input-group">
        <div class="set-input-btn" id="weight-${exIdx}-${setIdx}"
             onclick="TF.workout._openPicker('weight', ${exIdx}, ${setIdx})">
          ${set.weight}
        </div>
        <span class="set-x">${weightLabel}${TF.i18n.t('ex.weight')}${perDbLabel} ×</span>
        <div class="set-input-btn" id="reps-${exIdx}-${setIdx}"
             onclick="TF.workout._openPicker('reps', ${exIdx}, ${setIdx})">
          ${set.reps}
        </div>
        <span class="set-x">${TF.i18n.t('ex.reps').slice(0,3)}</span>
        ${set.isPR ? `<span class="pr-badge">🏆 PR</span>` : ''}
      </div>
      <button class="set-check-btn ${set.completed ? 'done' : ''}" id="check-${exIdx}-${setIdx}"
              onclick="TF.workout._completeSet(${exIdx}, ${setIdx})">
        ${set.completed ? '✓' : ''}
      </button>
    `;
    return row;
  },

  _getExerciseEmoji(ex) {
    const name = ex.name.toLowerCase();
    if (name.includes('press') || name.includes('bench')) return '🏋️';
    if (name.includes('pull') || name.includes('row')) return '💪';
    if (name.includes('squat') || name.includes('leg')) return '🦵';
    if (name.includes('curl')) return '💪';
    if (name.includes('calf') || name.includes('hip')) return '🦵';
    if (name.includes('ab') || name.includes('crunch')) return '🔥';
    return '⚡';
  },

  // --- Set completion ---
  _completeSet(exIdx, setIdx) {
    const set = this._session.exerciseLogs[exIdx].sets[setIdx];
    if (set.completed) return; // Already done

    set.completed = true;
    set.completedAt = Date.now();

    // Check PR
    const log = this._session.exerciseLogs[exIdx];
    const isPR = TF.data.checkAndSavePR(log.exerciseId, log.exerciseName, set.weight, set.reps, TF.utils.todayStr());
    set.isPR = isPR;
    if (isPR) {
      this._session.prs.push({ exerciseName: log.exerciseName, weight: set.weight, reps: set.reps });
    }

    // Update row UI
    const row = document.getElementById(`set-row-${exIdx}-${setIdx}`);
    if (row) {
      row.className = 'set-row completed';
      const checkBtn = document.getElementById(`check-${exIdx}-${setIdx}`);
      if (checkBtn) { checkBtn.classList.add('done'); checkBtn.textContent = '✓'; }
      if (isPR) {
        const inputGroup = row.querySelector('.set-input-group');
        if (inputGroup && !inputGroup.querySelector('.pr-badge')) {
          const badge = document.createElement('span');
          badge.className = 'pr-badge pr-burst';
          badge.textContent = '🏆 PR';
          inputGroup.appendChild(badge);
        }
      }
    }

    // Haptics + audio
    TF.utils.vibrateSuccess();
    TF.notifications.playSetComplete();
    if (isPR) {
      TF.utils.vibratePR();
      TF.notifications.playPR();
      this._showPRCelebration(log.exerciseName);
    }

    // Save crash-recovery state
    TF.data.saveActiveSession(this._session);

    // Reorder exercises if we skipped one — returns updated index of this exercise
    const newExIdx = this._reorderIfSkipped(exIdx);

    // Auto-advance expand: if all sets done, collapse this and expand next
    const thisLog = this._session.exerciseLogs[newExIdx];
    if (thisLog.sets.every(s => s.completed)) {
      const nextIdx = this._session.exerciseLogs.findIndex((l, i) => i > newExIdx && !l.sets.every(s => s.completed));
      this._expandedExIdx = nextIdx >= 0 ? nextIdx : newExIdx;
      this._renderSessionScreen();
    } else if (newExIdx !== exIdx) {
      // Reorder happened but exercise not fully done — re-render to fix stale DOM exIdx refs
      this._renderSessionScreen();
    }

    // Start rest timer — look up exercise by ID from current logs order
    const session = TF.program.getSession(this._session.sessionType);
    const currentLog = this._session.exerciseLogs[exIdx];
    const ex = session.exercises.find(e => e.id === currentLog.exerciseId) || session.exercises[exIdx];
    this._startRestTimer(ex.rest, ex.name, exIdx, setIdx);

    TF.auth.resetTimer();
  },

  // --- Copy to all sets ---
  _copySetToAll(exIdx) {
    const log = this._session.exerciseLogs[exIdx];
    const firstSet = log.sets[0];
    log.sets.forEach((set, i) => {
      if (!set.completed) {
        set.weight = firstSet.weight;
        set.reps = firstSet.reps;
        const wEl = document.getElementById(`weight-${exIdx}-${i}`);
        const rEl = document.getElementById(`reps-${exIdx}-${i}`);
        if (wEl) wEl.textContent = set.weight;
        if (rEl) rEl.textContent = set.reps;
      }
    });
    TF.data.saveActiveSession(this._session);
    TF.utils.vibrate([30, 20, 30]);
    TF.app.showToast(TF.i18n.t('ex.copy.all'));
  },

  // --- Picker ---
  _pickerContext: null,
  _pickerValues: [],

  _openPicker(type, exIdx, setIdx) {
    TF.notifications.unlockAudio();
    const set = this._session.exerciseLogs[exIdx].sets[setIdx];
    this._pickerContext = { type, exIdx, setIdx };

    let values, current;
    if (type === 'weight') {
      // 0 to 200 in 0.5 increments + common weights
      values = [];
      for (let i = 0; i <= 400; i++) values.push(i * 0.5); // 0 to 200 kg in 0.5 steps
      current = set.weight;
      document.getElementById('pickerTitle').textContent = TF.i18n.t('ex.weight');
    } else {
      values = Array.from({ length: 50 }, (_, i) => i + 1); // 1–50 reps
      current = set.reps;
      document.getElementById('pickerTitle').textContent = TF.i18n.t('ex.reps');
    }

    this._pickerValues = values;
    const scroll = document.getElementById('pickerScrollList');
    scroll.innerHTML = values.map((v, i) =>
      `<div class="picker-item" data-idx="${i}">${v}</div>`
    ).join('');

    // Scroll to current value after DOM paint
    const currentIdx = values.findIndex(v => v === current);
    const itemH = 44;
    requestAnimationFrame(() => {
      scroll.scrollTop = currentIdx * itemH;
      this._updatePickerHighlight();
    });

    // Track scroll
    scroll.onscroll = TF.utils.debounce(() => this._updatePickerHighlight(), 50);

    document.getElementById('pickerModal').classList.remove('hidden');
    TF.auth.resetTimer();
  },

  _updatePickerHighlight() {
    const scroll = document.getElementById('pickerScrollList');
    const scrollTop = scroll.scrollTop + scroll.clientHeight / 2;
    const idx = Math.round((scrollTop - 44 * 2 - 22) / 44);
    scroll.querySelectorAll('.picker-item').forEach((item, i) => {
      item.classList.toggle('selected', i === idx);
    });
  },

  _confirmPicker() {
    const scroll = document.getElementById('pickerScrollList');
    const selected = scroll.querySelector('.picker-item.selected');
    if (!selected || !this._pickerContext) { this._closePicker(); return; }

    const { type, exIdx, setIdx } = this._pickerContext;
    const value = this._pickerValues[parseInt(selected.dataset.idx)];
    const set = this._session.exerciseLogs[exIdx].sets[setIdx];

    if (type === 'weight') {
      set.weight = value;
      const el = document.getElementById(`weight-${exIdx}-${setIdx}`);
      if (el) el.textContent = value;
    } else {
      set.reps = value;
      const el = document.getElementById(`reps-${exIdx}-${setIdx}`);
      if (el) el.textContent = value;
    }

    // Auto-fill all following uncompleted sets when any set is edited
    const log2 = this._session.exerciseLogs[exIdx];
    log2.sets.forEach((s, i) => {
      if (i <= setIdx || s.completed) return;
      if (type === 'weight') {
        s.weight = value;
        const el = document.getElementById(`weight-${exIdx}-${i}`);
        if (el) el.textContent = value;
      } else {
        s.reps = value;
        const el = document.getElementById(`reps-${exIdx}-${i}`);
        if (el) el.textContent = value;
      }
    });

    TF.data.saveActiveSession(this._session);
    this._closePicker();
    TF.utils.vibrate([30]);
  },

  _closePicker() {
    document.getElementById('pickerModal').classList.add('hidden');
    this._pickerContext = null;
  },

  // --- Exercise reorder when skipping ---
  _reorderIfSkipped(completedExIdx) {
    const logs = this._session.exerciseLogs;

    // Check if any exercise before completedExIdx has zero completed sets
    const hasSkipped = logs.slice(0, completedExIdx).some(log =>
      log.sets.every(s => !s.completed)
    );
    if (!hasSkipped) return completedExIdx;

    // Insert right after the last exercise that has at least 1 completed set
    let insertAfter = -1;
    for (let i = 0; i < completedExIdx; i++) {
      if (logs[i].sets.some(s => s.completed)) insertAfter = i;
    }
    const insertAt = insertAfter + 1;
    if (insertAt === completedExIdx) return completedExIdx;

    const [moved] = logs.splice(completedExIdx, 1);
    logs.splice(insertAt, 0, moved);

    // Keep expanded index pointing at the moved exercise
    this._expandedExIdx = insertAt;
    TF.data.saveActiveSession(this._session);
    return insertAt;
  },

  // --- Rest Timer ---
  _startRestTimer(seconds, exerciseName, exIdx, setIdx) {
    this._timerRunning = true;

    // Schedule SW notification for when timer ends (background)
    TF.notifications.cancelRestNotif();
    TF.notifications.scheduleRestComplete(seconds * 1000, exerciseName);

    this._timerWorker.postMessage({ type: 'START', duration: seconds });

    // Find next uncompleted set button and animate arc
    this._startArcTimer(seconds, exIdx, setIdx);
  },

  _arcTimerRAF: null,
  _startArcTimer(seconds, completedExIdx, completedSetIdx) {
    // Cancel any existing arc timer
    if (this._arcTimerRAF) {
      cancelAnimationFrame(this._arcTimerRAF);
      this._arcTimerRAF = null;
    }
    // Remove timing class from all buttons
    document.querySelectorAll('.set-check-btn.timing').forEach(b => {
      b.classList.remove('timing');
      b.style.removeProperty('--arc');
    });

    // Find next uncompleted set button
    let nextBtn = null;
    const logs = this._session.exerciseLogs;
    for (let ei = completedExIdx; ei < logs.length; ei++) {
      const startSi = ei === completedExIdx ? completedSetIdx + 1 : 0;
      for (let si = startSi; si < logs[ei].sets.length; si++) {
        if (!logs[ei].sets[si].completed) {
          nextBtn = document.getElementById(`check-${ei}-${si}`);
          break;
        }
      }
      if (nextBtn) break;
    }
    if (!nextBtn) return;

    nextBtn.classList.add('timing');
    const start = Date.now();
    const duration = seconds * 1000;

    const tick = () => {
      const pct = Math.min((Date.now() - start) / duration * 100, 100);
      nextBtn.style.setProperty('--arc', `${pct}%`);
      if (pct < 100 && this._timerRunning) {
        this._arcTimerRAF = requestAnimationFrame(tick);
      } else {
        nextBtn.classList.remove('timing');
        nextBtn.style.removeProperty('--arc');
        this._arcTimerRAF = null;
      }
    };
    this._arcTimerRAF = requestAnimationFrame(tick);
  },

  _showTimerSheet() {
    document.getElementById('restTimerSheet').classList.add('visible');
  },

  _hideTimerSheet() {
    document.getElementById('restTimerSheet').classList.remove('visible');
  },

  _showMiniTimer() {
    document.getElementById('miniTimerBar').classList.add('visible');
  },

  _hideMiniTimer() {
    document.getElementById('miniTimerBar').classList.remove('visible');
  },

  skipTimer() {
    this._timerWorker.postMessage({ type: 'STOP' });
    this._timerRunning = false;
    this._hideTimerSheet();
    this._hideMiniTimer();
    TF.notifications.cancelRestNotif();
    if (this._arcTimerRAF) {
      cancelAnimationFrame(this._arcTimerRAF);
      this._arcTimerRAF = null;
    }
    document.querySelectorAll('.set-check-btn.timing').forEach(b => {
      b.classList.remove('timing');
      b.style.removeProperty('--arc');
    });
    TF.utils.vibrate([30]);
  },

  _onTimerMessage(data) {
    if (data.type === 'TICK') {
      const timeStr = TF.utils.formatTimer(data.remaining);
      const countdown = document.getElementById('timerCountdown');
      const mini = document.getElementById('miniTimerTime');
      if (countdown) {
        countdown.textContent = timeStr;
        countdown.classList.toggle('urgent', data.remaining <= 5);
      }
      if (mini) mini.textContent = timeStr;
    } else if (data.type === 'COMPLETE') {
      this._timerRunning = false;
      this._onTimerComplete();
    }
  },

  _onTimerComplete() {
    // Haptics + sound
    TF.utils.vibrateTimerEnd();
    TF.notifications.playTimerEnd();

    // Flash red then dismiss
    const countdown = document.getElementById('timerCountdown');
    if (countdown) {
      countdown.textContent = '0:00';
      countdown.classList.add('urgent');
    }

    // Push notification if app in background
    TF.notifications.show('TimFit', TF.i18n.t('timer.complete'), 'rest-complete');

    setTimeout(() => {
      this._hideTimerSheet();
      this._hideMiniTimer();
      if (countdown) countdown.classList.remove('urgent');
    }, 1500);
  },

  // --- Session completion check ---
  _checkOverloadReady(lastLog, ex) {
    if (!lastLog) return false;
    return lastLog.sets.every(s => s.completed && s.reps >= ex.repsMax);
  },

  // --- Exercise GIF Modal ---
  _showExerciseModal(ex) {
    const modal = document.getElementById('exerciseModal');
    const lang = TF.i18n.getLang();
    const cues = lang === 'ru' ? ex.cuesRu : ex.cuesEn;

    document.getElementById('modalExName').textContent = ex.name;
    document.getElementById('modalExCues').textContent = cues;

    let equipInfo = '';
    if (ex.equipment) equipInfo += `Equipment: ${ex.equipment}`;
    if (ex.grip) equipInfo += `\nGrip: ${ex.grip}`;
    if (ex.handle) equipInfo += `\nHandle: ${ex.handle}`;
    if (ex.pulley) equipInfo += `\nPulley: ${ex.pulley}`;
    if (ex.equipment && ex.equipment.toLowerCase().includes('dumbbell')) {
      equipInfo += `\n${TF.i18n.t('ex.per.db.detail')}`;
    }
    document.getElementById('modalEquipment').textContent = equipInfo;

    const gifEl = document.getElementById('modalGif');
    gifEl.src = ex.gif;
    gifEl.onerror = () => { gifEl.style.display = 'none'; };

    modal.classList.remove('hidden');
  },

  // --- PR Celebration ---
  _showPRCelebration(exerciseName) {
    TF.app.showToast(`🏆 ${exerciseName} — ${TF.i18n.t('ex.pr')}`);
    TF.confetti && TF.confetti.burst();
  },

  // --- Session Finish ---
  _finishSession() {
    // Check if all sets are done
    const allDone = this._session.exerciseLogs.every(log =>
      log.sets.every(s => s.completed)
    );

    if (!allDone) {
      if (!confirm('Some sets are not completed. Finish anyway?')) return;
    }

    this._stopTimers();

    const now = Date.now();
    this._session.endTime = now;
    this._session.completed = true;
    this._session.duration = Math.round((now - this._session.startTime) / 1000);
    this._session.totalVolume = this._calculateVolume();

    if (!this._isTest) {
      TF.data.saveSession(this._session);
      TF.data.clearActiveSession();
    }
    const wasTest = this._isTest;
    this._isTest = false;

    if (wasTest) {
      this._stopTimers();
      this._session = null;
      document.getElementById('activeWorkout').classList.add('hidden');
      TF.app.renderDashboard();
      TF.app.showToast('Test session discarded — no data saved');
      return;
    }
    this._showSummary();
  },

  _calculateVolume() {
    let vol = 0;
    this._session.exerciseLogs.forEach(log => {
      log.sets.forEach(set => {
        if (set.completed && set.weight > 0) {
          vol += set.weight * set.reps;
        }
      });
    });
    return Math.round(vol);
  },

  _showSummary() {
    const s = this._session;
    const motivations = [0, 1, 2, 3, 4];
    const motIdx = Math.floor(Math.random() * motivations.length);

    document.getElementById('summaryDuration').textContent = TF.utils.formatDuration(s.duration);
    document.getElementById('summaryVolume').textContent = TF.utils.formatVolume(s.totalVolume);
    document.getElementById('summaryExCount').textContent = s.exerciseLogs.length;
    document.getElementById('summaryPRCount').textContent = s.prs.length;
    document.getElementById('summaryMotivation').textContent = TF.i18n.t(`summary.motivation.${motIdx}`);

    // PRs list
    const prsList = document.getElementById('summaryPRList');
    prsList.innerHTML = s.prs.length ? s.prs.map(pr =>
      `<div class="summary-pr-item">🏆 <strong>${pr.exerciseName}</strong> — ${pr.weight} kg × ${pr.reps}</div>`
    ).join('') : '';
    document.getElementById('summaryPRsSection').style.display = s.prs.length ? 'block' : 'none';

    document.getElementById('sessionSummaryModal').classList.remove('hidden');

    if (s.prs.length > 0) TF.confetti && TF.confetti.burst();
    TF.utils.vibrateSuccess();
  },

  closeSummary() {
    document.getElementById('sessionSummaryModal').classList.add('hidden');
    document.getElementById('activeWorkout').classList.add('hidden');
    this._session = null;
    TF.app.renderDashboard();
    TF.app.showToast(TF.i18n.t('session.saved'));
    TF.notifications.show('TimFit', TF.i18n.t('session.saved'), 'session-saved');
  },

  // --- Elapsed Timer ---
  _startElapsedTimer() {
    clearInterval(this._elapsedInterval);
    this._elapsedInterval = setInterval(() => {
      if (!this._sessionStartTime) return;
      const elapsed = Math.round((Date.now() - this._sessionStartTime) / 1000);
      const el = document.getElementById('workoutElapsed');
      if (el) el.textContent = TF.utils.formatTimer(elapsed);
    }, 1000);
  },

  _stopTimers() {
    clearInterval(this._elapsedInterval);
    this._timerWorker.postMessage({ type: 'STOP' });
    this._timerRunning = false;
    this._hideTimerSheet();
    this._hideMiniTimer();
    TF.notifications.cancelRestNotif();
    if (this._arcTimerRAF) {
      cancelAnimationFrame(this._arcTimerRAF);
      this._arcTimerRAF = null;
    }
    document.querySelectorAll('.set-check-btn.timing').forEach(b => {
      b.classList.remove('timing');
      b.style.removeProperty('--arc');
    });
  }
};
