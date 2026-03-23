window.TF = window.TF || {};

TF.utils = {
  async hashPIN(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'timfit-salt-2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  formatDate(dateStr, lang) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', opts);
  },

  formatShortDate(dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  },

  todayStr() {
    return this.formatShortDate(null);
  },

  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  },

  formatDurationMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  },

  formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  formatVolume(kg) {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
    return `${kg.toLocaleString()} kg`;
  },

  greetingKey() {
    const h = new Date().getHours();
    if (h < 12) return 'greeting.morning';
    if (h < 17) return 'greeting.afternoon';
    return 'greeting.evening';
  },

  getDayOfWeek() {
    return new Date().getDay(); // 0 = Sunday
  },

  getWeekDates() {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return this.formatShortDate(d);
    });
  },

  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern || [50]);
    }
  },

  vibrateSuccess() {
    this.vibrate([50, 30, 50]);
  },

  vibratePR() {
    this.vibrate([100, 50, 100, 50, 200]);
  },

  vibrateTimerEnd() {
    this.vibrate([200, 100, 200]);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  },

  compressImage(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const max = maxDim || 800;
          if (width > max || height > max) {
            if (width > height) { height = Math.round(height * max / width); width = max; }
            else { width = Math.round(width * max / height); height = max; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality || 0.75));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  sign(val) {
    if (val > 0) return `+${val}`;
    return String(val);
  },

  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  localDate(dateStr) {
    // Parse YYYY-MM-DD without timezone shift
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
};
