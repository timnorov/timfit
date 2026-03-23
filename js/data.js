window.TF = window.TF || {};

TF.data = {
  KEYS: {
    PROFILE: 'tf_profile',
    SESSIONS: 'tf_sessions',
    ACTIVE: 'tf_active_session',
    MEASUREMENTS: 'tf_measurements',
    PHOTOS: 'tf_photos',
    CARDIO: 'tf_cardio',
    HEALTH: 'tf_health_data',
    PRS: 'tf_prs',
    PIN: 'tf_pin_hash',
    LAST_ACTIVE: 'tf_last_active'
  },

  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },

  _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e) { console.error('localStorage error:', e); return false; }
  },

  // --- Profile ---
  getProfile() {
    return this._get(this.KEYS.PROFILE) || {
      name: 'Tim',
      age: 44,
      height: 182,
      startingWeight: 83,
      startingBodyFat: 23,
      targetBodyFat: 14,
      programStart: '2026-03-01',
      language: 'en',
      theme: 'system',
      autoLockMinutes: 5,
      notifRest: true,
      notifOverload: true,
      notifWeekly: false,
      notifWeeklyDay: '0',
      notifWeeklyTime: '09:00',
      restHeavy: 180,
      restModerate: 120,
      restIsolation: 60,
      avatar: null
    };
  },

  saveProfile(profile) {
    this._set(this.KEYS.PROFILE, profile);
  },

  // --- PIN ---
  getPINHash() { return localStorage.getItem(this.KEYS.PIN); },
  setPINHash(hash) { localStorage.setItem(this.KEYS.PIN, hash); },
  hasPIN() { return !!localStorage.getItem(this.KEYS.PIN); },

  // --- Last active (for auto-lock) ---
  updateLastActive() { localStorage.setItem(this.KEYS.LAST_ACTIVE, Date.now()); },
  getLastActive() { return parseInt(localStorage.getItem(this.KEYS.LAST_ACTIVE) || '0'); },

  // --- Workout Sessions ---
  getWorkoutSessions() { return this._get(this.KEYS.SESSIONS) || []; },

  saveSession(session) {
    const sessions = this.getWorkoutSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.push(session);
    this._set(this.KEYS.SESSIONS, sessions);
  },

  getSessionsForWeek(mondayDateStr) {
    const sessions = this.getWorkoutSessions();
    const week = TF.utils.getWeekDates();
    return sessions.filter(s => week.includes(s.date));
  },

  getLastSessionOfType(type) {
    const sessions = this.getWorkoutSessions();
    return sessions
      .filter(s => s.sessionType === type && s.completed)
      .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  },

  getTodaySession() {
    const today = TF.utils.todayStr();
    const sessions = this.getWorkoutSessions();
    return sessions.find(s => s.date === today) || null;
  },

  getSessionByDate(dateStr) {
    const sessions = this.getWorkoutSessions();
    return sessions.find(s => s.date === dateStr) || null;
  },

  // --- Active Session (crash recovery) ---
  getActiveSession() { return this._get(this.KEYS.ACTIVE); },
  saveActiveSession(session) { this._set(this.KEYS.ACTIVE, session); },
  clearActiveSession() { localStorage.removeItem(this.KEYS.ACTIVE); },

  // --- Body Measurements ---
  getMeasurements() { return this._get(this.KEYS.MEASUREMENTS) || []; },

  saveMeasurement(measurement) {
    const list = this.getMeasurements();
    const idx = list.findIndex(m => m.date === measurement.date);
    if (idx >= 0) list[idx] = { ...list[idx], ...measurement };
    else list.push(measurement);
    list.sort((a, b) => a.date.localeCompare(b.date));
    this._set(this.KEYS.MEASUREMENTS, list);
  },

  getLatestMeasurement() {
    const list = this.getMeasurements();
    return list[list.length - 1] || null;
  },

  // --- Progress Photos ---
  getPhotos() { return this._get(this.KEYS.PHOTOS) || []; },

  savePhoto(photo) {
    const photos = this.getPhotos();
    const idx = photos.findIndex(p => p.id === photo.id);
    if (idx >= 0) photos[idx] = photo;
    else photos.push(photo);
    this._set(this.KEYS.PHOTOS, photos);
  },

  deletePhoto(id) {
    const photos = this.getPhotos().filter(p => p.id !== id);
    this._set(this.KEYS.PHOTOS, photos);
  },

  // --- Cardio Logs ---
  getCardioLogs() { return this._get(this.KEYS.CARDIO) || []; },

  saveCardioLog(log) {
    const logs = this.getCardioLogs();
    const idx = logs.findIndex(l => l.date === log.date && l.source === log.source);
    if (idx >= 0) logs[idx] = { ...logs[idx], ...log };
    else logs.push(log);
    this._set(this.KEYS.CARDIO, logs);
  },

  getTodayCardio() {
    const today = TF.utils.todayStr();
    const logs = this.getCardioLogs();
    return logs.find(l => l.date === today) || null;
  },

  // --- Health Data (from Shortcuts) ---
  getHealthData() { return this._get(this.KEYS.HEALTH) || null; },
  saveHealthData(data) { this._set(this.KEYS.HEALTH, data); },

  // --- Personal Records ---
  getPRs() { return this._get(this.KEYS.PRS) || []; },

  checkAndSavePR(exerciseId, exerciseName, weight, reps, date) {
    if (!weight || weight <= 0) return false;
    const prs = this.getPRs();
    const existing = prs.find(pr => pr.exerciseId === exerciseId);
    if (!existing || weight > existing.weight) {
      const idx = prs.findIndex(pr => pr.exerciseId === exerciseId);
      const newPR = { exerciseId, exerciseName, weight, reps, date };
      if (idx >= 0) prs[idx] = newPR;
      else prs.push(newPR);
      this._set(this.KEYS.PRS, prs);
      return true;
    }
    return false;
  },

  // --- Stats ---
  getStreak() {
    const sessions = this.getWorkoutSessions()
      .filter(s => s.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (!sessions.length) return 0;

    let streak = 0;
    const today = TF.utils.todayStr();
    let check = new Date();

    // Allow today or yesterday as the most recent
    const lastDate = sessions[0].date;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate !== TF.utils.formatShortDate(yesterday)) return 0;
      check = yesterday;
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = TF.utils.formatShortDate(check);
      const dayOfWeek = check.getDay();
      if (dayOfWeek === 0) {
        // Sunday = rest day, doesn't break streak
        check.setDate(check.getDate() - 1);
        continue;
      }
      const found = sessions.find(s => s.date === dateStr);
      if (found) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  getWeeklyVolume() {
    const week = TF.utils.getWeekDates();
    const sessions = this.getWorkoutSessions()
      .filter(s => s.completed && week.includes(s.date));
    return sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  },

  getWeeklyTime() {
    const week = TF.utils.getWeekDates();
    const sessions = this.getWorkoutSessions()
      .filter(s => s.completed && week.includes(s.date));
    return sessions.reduce((sum, s) => sum + (s.duration || 0), 0); // in seconds
  },

  getWeeklySteps() {
    const week = TF.utils.getWeekDates();
    const logs = this.getCardioLogs().filter(l => week.includes(l.date));
    return logs.reduce((sum, l) => sum + (l.steps || 0), 0);
  },

  getWeeklyDistance() {
    const week = TF.utils.getWeekDates();
    const logs = this.getCardioLogs().filter(l => week.includes(l.date));
    return logs.reduce((sum, l) => sum + (l.distanceKm || 0), 0);
  },

  // --- Export / Import ---
  exportAll() {
    return {
      version: 1,
      exportDate: new Date().toISOString(),
      profile: this.getProfile(),
      sessions: this.getWorkoutSessions(),
      measurements: this.getMeasurements(),
      photos: this.getPhotos(),
      cardio: this.getCardioLogs(),
      prs: this.getPRs()
    };
  },

  importAll(data) {
    if (!data || data.version !== 1) throw new Error('Invalid backup file');
    if (data.profile) this.saveProfile(data.profile);
    if (data.sessions) this._set(this.KEYS.SESSIONS, data.sessions);
    if (data.measurements) this._set(this.KEYS.MEASUREMENTS, data.measurements);
    if (data.photos) this._set(this.KEYS.PHOTOS, data.photos);
    if (data.cardio) this._set(this.KEYS.CARDIO, data.cardio);
    if (data.prs) this._set(this.KEYS.PRS, data.prs);
  },

  resetAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  }
};
