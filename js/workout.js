window.TF = window.TF || {};

TF.workout = {
  _session: null,          // current active session object
  _timerWorker: null,
  _timerRunning: false,
  _timerExerciseIdx: null,
  _sessionStartTime: null,
  _elapsedInterval: null,
  _warmupChecked: [false, false, false],

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

    const lastSession = TF.data.getLastSessionOfType(sessionType);
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
          weight: this._getLastWeight(lastSession, ex.id, i) || ex.startingWeight,
          reps: this._getLastReps(lastSession, ex.id, i) || ex.repsMin,
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

    // Persist immediately
    TF.data.saveActiveSession(this._session);
    this._sessionStartTime = now;
    this._warmupChecked = [false, false, false];

    this._renderSessionScreen();
    document.getElementById('activeWorkout').classList.remove('hidden');

    // Start elapsed timer
    this._startElapsedTimer();
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

  discardSession() {
    this._stopTimers();
    TF.data.clearActiveSession();
    this._session = null;
    document.getElementById('activeWorkout').classList.add('hidden');
    TF.app.renderDashboard();
  },

  _getLastWeight(lastSession, exerciseId, setIndex) {
    if (!lastSession) return null;
    const exLog = lastSession.exerciseLogs.find(e => e.exerciseId === exerciseId);
    if (!exLog || !exLog.sets[setIndex]) return null;
    return exLog.sets[setIndex].weight || null;
  },

  _getLastReps(lastSession, exerciseId, setIndex) {
    if (!lastSession) return null;
    const exLog = lastSession.exerciseLogs.find(e => e.exerciseId === exerciseId);
    if (!exLog || !exLog.sets[setIndex]) return null;
    return exLog.sets[setIndex].reps || null;
  },

  // --- Render Session Screen ---
  _renderSessionScreen() {
    const session = TF.program.getSession(this._session.sessionType);
    const lang = TF.i18n.getLang();

    document.getElementById('workoutTitle').textContent =
      `${TF.i18n.t(TF.SESSION_KEY_MAP[this._session.sessionType])} — ${TF.i18n.t(session.dayKey)}`;

    const body = document.getElementById('workoutBody');
    body.innerHTML = '';

    // Warmup (Legs only)
    if (session.warmup) {
      body.appendChild(this._buildWarmupCard());
    }

    // Exercise cards
    session.exercises.forEach((ex, exIdx) => {
      body.appendChild(this._buildExerciseCard(ex, exIdx, session.warmup));
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

  _buildExerciseCard(ex, exIdx, hasWarmup) {
    const log = this._session.exerciseLogs[exIdx];
    const lang = TF.i18n.getLang();
    const cues = lang === 'ru' ? ex.cuesRu : ex.cuesEn;
    const lastSession = TF.data.getLastSessionOfType(this._session.sessionType);
    const showOverloadBadge = this._checkOverloadReady(lastSession, ex);

    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = `ex-card-${exIdx}`;

    // Header
    const header = document.createElement('div');
    header.className = 'exercise-card-header';

    // GIF thumb
    const gifThumb = document.createElement('div');
    gifThumb.className = 'ex-gif-thumb';
    gifThumb.innerHTML = `
      <img src="${ex.gif}" alt="${ex.name}"
           onerror="this.parentNode.innerHTML='${this._getExerciseEmoji(ex)}';"
           loading="lazy">
    `;
    gifThumb.addEventListener('click', () => this._showExerciseModal(ex));

    // Info
    const info = document.createElement('div');
    info.className = 'ex-info';
    const muscleKeys = (ex.muscleKeys || []).slice(0, 3);
    info.innerHTML = `
      <div class="ex-number">${TF.i18n.t('ex.set')} ${exIdx + 1}</div>
      <div class="ex-name">${ex.name}</div>
      <div class="ex-muscles">${muscleKeys.map(k =>
        `<span class="pill pill-blue">${TF.i18n.t(k)}</span>`
      ).join('')}</div>
      <div class="ex-meta">
        <span>${ex.sets} ${TF.i18n.t('ex.sets')} · ${ex.repsMin}–${ex.repsMax} ${TF.i18n.t('ex.reps')}</span>
        <span>${TF.i18n.t('ex.rest')} ${ex.rest}s</span>
        <span>RPE ${ex.rpe}</span>
      </div>
    `;

    header.appendChild(gifThumb);
    header.appendChild(info);
    card.appendChild(header);

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

    // Copy to all sets button
    if (ex.sets > 1) {
      const copyBtn = document.createElement('div');
      copyBtn.className = 'copy-all-btn';
      copyBtn.innerHTML = `<span>⊞</span> ${TF.i18n.t('ex.copy.all')}`;
      copyBtn.addEventListener('click', () => this._copySetToAll(exIdx));
      card.appendChild(copyBtn);
    }

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

  _buildSetRow(ex, exIdx, setIdx, set) {
    const row = document.createElement('div');
    row.className = 'set-row' + (set.completed ? ' completed' : '');
    row.id = `set-row-${exIdx}-${setIdx}`;

    const weightLabel = ex.id.includes('pullup') ? '+' : '';
    row.innerHTML = `
      <div class="set-num">${setIdx + 1}</div>
      <div class="set-input-group">
        <div class="set-input-btn" id="weight-${exIdx}-${setIdx}"
             onclick="TF.workout._openPicker('weight', ${exIdx}, ${setIdx})">
          ${set.weight}
        </div>
        <span class="set-x">${weightLabel}${TF.i18n.t('ex.weight')} ×</span>
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

    // Start rest timer
    const session = TF.program.getSession(this._session.sessionType);
    const ex = session.exercises[exIdx];
    this._startRestTimer(ex.rest, ex.name);

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

    // Scroll to current value
    const currentIdx = values.findIndex(v => v === current);
    const itemH = 44;
    scroll.scrollTop = currentIdx * itemH;

    // Highlight current
    this._updatePickerHighlight();

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

    TF.data.saveActiveSession(this._session);
    this._closePicker();
    TF.utils.vibrate([30]);
  },

  _closePicker() {
    document.getElementById('pickerModal').classList.add('hidden');
    this._pickerContext = null;
  },

  // --- Rest Timer ---
  _startRestTimer(seconds, exerciseName) {
    this._timerRunning = true;

    // Schedule SW notification for when timer ends (background)
    TF.notifications.cancelRestNotif();
    TF.notifications.scheduleRestComplete(seconds * 1000, exerciseName);

    this._timerWorker.postMessage({ type: 'START', duration: seconds });
    document.getElementById('timerExerciseName').textContent = exerciseName;
    this._showTimerSheet();
    this._showMiniTimer();
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
  _checkOverloadReady(lastSession, ex) {
    if (!lastSession) return false;
    const lastLog = lastSession.exerciseLogs.find(e => e.exerciseId === ex.id);
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

    TF.data.saveSession(this._session);
    TF.data.clearActiveSession();

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
  }
};
