window.TF = window.TF || {};

TF.auth = {
  init(onUnlock) {
    document.getElementById('lockScreen').classList.add('hidden');
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (onUnlock) onUnlock();
  },
  resetTimer() {},
  lock() {}
};
