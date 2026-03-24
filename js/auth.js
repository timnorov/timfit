window.TF = window.TF || {};

TF.auth = {
  init(onUnlock) {
    if (onUnlock) onUnlock();
  },
  resetTimer() {},
  lock() {},

  _showLock() {
    const profile = TF.data.getProfile();
    const lockEl = document.getElementById('lockScreen');
    const appEl = document.getElementById('app');
    const setupEl = document.getElementById('setupScreen');

    if (setupEl) setupEl.classList.add('hidden');
    if (appEl) appEl.classList.add('hidden');
    lockEl.classList.remove('hidden');

    document.getElementById('lockTitle').textContent = TF.i18n.t('lock.title');
    document.getElementById('lockSubtitle').textContent = TF.i18n.t('lock.subtitle');

    const avatarEl = document.getElementById('lockAvatar');
    if (profile.avatar) {
      avatarEl.style.backgroundImage = `url(${profile.avatar})`;
      avatarEl.classList.add('has-image');
    } else {
      avatarEl.style.backgroundImage = '';
      avatarEl.classList.remove('has-image');
      avatarEl.textContent = (profile.name || 'T').charAt(0).toUpperCase();
    }

    this._pinBuffer = [];
    this._setupMode = false;
    this._updateDots([]);
    document.getElementById('lockError').textContent = '';
    document.getElementById('lockError').classList.add('hidden');
  },

  _showSetup() {
    const lockEl = document.getElementById('lockScreen');
    const appEl = document.getElementById('app');
    lockEl.classList.add('hidden');
    if (appEl) appEl.classList.add('hidden');

    const setupEl = document.getElementById('setupScreen');
    setupEl.classList.remove('hidden');

    this._setupMode = 'set';
    document.getElementById('setupTitle').textContent = TF.i18n.t('lock.setup.title');
    document.getElementById('setupSubtitle').textContent = TF.i18n.t('lock.setup.subtitle');
  },

  async handleKeyPress(key) {
    if (this._setupMode) {
      await this._handleSetupKey(key);
    } else {
      await this._handleLockKey(key);
    }
  },

  async _handleLockKey(key) {
    if (key === 'del') {
      this._pinBuffer.pop();
    } else if (this._pinBuffer.length < 6) {
      this._pinBuffer.push(key);
    }
    this._updateDots(this._pinBuffer);

    if (this._pinBuffer.length === 6) {
      const entered = this._pinBuffer.join('');
      const hash = await TF.utils.hashPIN(entered);
      const stored = TF.data.getPINHash();
      if (hash === stored) {
        TF.utils.vibrate([50, 30, 50]);
        this._pinBuffer = [];
        document.getElementById('lockScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        TF.data.updateLastActive();
        this._startAutoLockTimer();
        if (this._onUnlock) this._onUnlock();
      } else {
        TF.utils.vibrate([100, 50, 100, 50, 100]);
        document.getElementById('lockError').textContent = TF.i18n.t('lock.wrong');
        document.getElementById('lockError').classList.remove('hidden');
        const dotsEl = document.querySelector('.pin-dots');
        dotsEl.classList.add('shake');
        setTimeout(() => {
          dotsEl.classList.remove('shake');
          this._pinBuffer = [];
          this._updateDots([]);
          document.getElementById('lockError').classList.add('hidden');
        }, 600);
      }
    }
  },

  async _handleSetupKey(key) {
    const setupBuffer = document.getElementById('setupPinBuffer');
    const currentBuffer = JSON.parse(setupBuffer.dataset.buffer || '[]');

    if (key === 'del') {
      currentBuffer.pop();
    } else if (currentBuffer.length < 6) {
      currentBuffer.push(key);
    }
    setupBuffer.dataset.buffer = JSON.stringify(currentBuffer);
    this._updateDots(currentBuffer, 'setup');

    if (currentBuffer.length === 6) {
      if (this._setupMode === 'set') {
        this._pendingHash = await TF.utils.hashPIN(currentBuffer.join(''));
        this._setupMode = 'confirm';
        document.getElementById('setupSubtitle').textContent = TF.i18n.t('lock.setup.confirm');
        setupBuffer.dataset.buffer = '[]';
        this._updateDots([], 'setup');
      } else if (this._setupMode === 'confirm') {
        const confirmHash = await TF.utils.hashPIN(currentBuffer.join(''));
        if (confirmHash === this._pendingHash) {
          TF.data.setPINHash(this._pendingHash);
          TF.utils.vibrate([50, 30, 50]);
          document.getElementById('setupScreen').classList.add('hidden');
          document.getElementById('app').classList.remove('hidden');
          TF.data.updateLastActive();
          this._startAutoLockTimer();
          if (this._onUnlock) this._onUnlock();
        } else {
          TF.utils.vibrate([100, 50, 100]);
          document.getElementById('setupError').textContent = TF.i18n.t('lock.setup.mismatch');
          document.getElementById('setupError').classList.remove('hidden');
          this._setupMode = 'set';
          this._pendingHash = null;
          document.getElementById('setupSubtitle').textContent = TF.i18n.t('lock.setup.subtitle');
          setupBuffer.dataset.buffer = '[]';
          this._updateDots([], 'setup');
          setTimeout(() => {
            document.getElementById('setupError').classList.add('hidden');
          }, 2000);
        }
      }
    }
  },

  _updateDots(buffer, context) {
    const dotsSelector = context === 'setup' ? '#setupDots .dot' : '#lockDots .dot';
    const dots = document.querySelectorAll(dotsSelector);
    dots.forEach((dot, i) => {
      dot.classList.toggle('filled', i < buffer.length);
    });
  },

  _startAutoLockTimer() {
    clearTimeout(this._lockTimer);
    const profile = TF.data.getProfile();
    const minutes = parseInt(profile.autoLockMinutes || 5);
    if (minutes === 0) return; // Never
    this._lockTimer = setTimeout(() => {
      this.lock();
    }, minutes * 60 * 1000);
  },

  resetTimer() {
    TF.data.updateLastActive();
    this._startAutoLockTimer();
  },

  lock() {
    clearTimeout(this._lockTimer);
    document.getElementById('app').classList.add('hidden');
    this._showLock();
  },

  _checkAutoLock() {
    const profile = TF.data.getProfile();
    const minutes = parseInt(profile.autoLockMinutes || 5);
    if (minutes === 0) return;
    const lastActive = TF.data.getLastActive();
    const elapsed = (Date.now() - lastActive) / 60000;
    if (elapsed >= minutes) {
      this._showLock();
    }
  },

  async changePIN(oldPIN, newPIN) {
    const oldHash = await TF.utils.hashPIN(oldPIN);
    if (oldHash !== TF.data.getPINHash()) return false;
    const newHash = await TF.utils.hashPIN(newPIN);
    TF.data.setPINHash(newHash);
    return true;
  }
};
