window.TF = window.TF || {};

TF.notifications = {
  _audioCtx: null,
  _swReg: null,

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this._swReg = await navigator.serviceWorker.ready;
      } catch(e) {}
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  show(title, body, tag) {
    const profile = TF.data.getProfile();
    if (!profile.notifRest) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (this._swReg) {
      this._swReg.showNotification(title, {
        body, tag,
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png',
        vibrate: [200, 100, 200]
      });
    } else {
      new Notification(title, { body, icon: './assets/icons/icon-192.png' });
    }
  },

  scheduleRestComplete(delayMs, exerciseName) {
    const profile = TF.data.getProfile();
    if (!profile.notifRest) return;
    if (this._swReg && this._swReg.active) {
      const lang = TF.i18n.getLang();
      this._swReg.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        delay: delayMs,
        title: 'TimFit',
        body: lang === 'ru' ? TF.i18n.t('timer.complete') : TF.i18n.t('timer.complete'),
        tag: 'rest-complete'
      });
    }
  },

  cancelRestNotif() {
    if (this._swReg && this._swReg.active) {
      this._swReg.active.postMessage({ type: 'CANCEL_NOTIFICATION', tag: 'rest-complete' });
    }
  },

  // Web Audio API — works even with screen locked on most platforms
  playTimerEnd() {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const beep = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      beep(880, 0, 0.18);
      beep(880, 0.25, 0.12);
      beep(1100, 0.45, 0.4);
    } catch(e) {
      console.warn('Audio error:', e);
    }
  },

  playSetComplete() {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  },

  playPR() {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } catch(e) {}
  },

  // --- Recurring reminder notifications ---
  // Called on app open after unlock. Fires any overdue reminders and schedules next.
  checkReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const lang = TF.i18n.getLang();
    const now = Date.now();

    const reminders = [
      {
        key: 'tf_remind_measurement',
        intervalDays: 28,
        firstDate: '2026-04-27',
        titleEn: 'TimFit',
        bodyEn: '📏 Time for your monthly measurements! Log chest, waist, hips, arms, thighs, and calves.',
        bodyRu: '📏 Время ежемесячных замеров! Запишите грудь, талию, бёдра, руки, бёдра и икры.'
      },
      {
        key: 'tf_remind_photos',
        intervalDays: 56,
        firstDate: '2026-05-25',
        titleEn: 'TimFit',
        bodyEn: '📸 8-week checkpoint! Time to take your progress photos. Front, back, and side.',
        bodyRu: '📸 Контрольная точка 8 недель! Время сделать фото прогресса. Спереди, сзади и сбоку.'
      }
    ];

    reminders.forEach(r => {
      let nextMs = parseInt(localStorage.getItem(r.key + '_next') || '0');

      // First time: set next to the configured first date at 8:00 AM
      if (!nextMs) {
        const d = new Date(r.firstDate + 'T08:00:00');
        nextMs = d.getTime();
        localStorage.setItem(r.key + '_next', nextMs);
      }

      if (now >= nextMs) {
        // Fire the notification
        const body = lang === 'ru' ? r.bodyRu : r.bodyEn;
        try {
          if (this._swReg) {
            this._swReg.showNotification(r.titleEn, {
              body,
              icon: './assets/icons/icon-192.png',
              badge: './assets/icons/icon-192.png',
              tag: r.key
            });
          } else {
            new Notification(r.titleEn, { body, icon: './assets/icons/icon-192.png' });
          }
        } catch(e) {}

        // Advance to next occurrence (from the nextMs date, add interval days)
        let nextDate = new Date(nextMs);
        nextDate.setDate(nextDate.getDate() + r.intervalDays);
        // Ensure we skip past any already-missed intervals
        while (nextDate.getTime() <= now) {
          nextDate.setDate(nextDate.getDate() + r.intervalDays);
        }
        nextDate.setHours(8, 0, 0, 0);
        localStorage.setItem(r.key + '_next', nextDate.getTime());
      }
    });
  },

  // Initialize audio context on first user interaction (iOS requirement)
  unlockAudio() {
    if (!this._audioCtx) {
      try {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {}
    }
  }
};
