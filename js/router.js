window.TF = window.TF || {};

TF.router = {
  _currentTab: 'dashboard',
  _tabs: ['dashboard', 'workout', 'progress', 'photos', 'settings'],

  init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.navigate(tab);
      });
    });
  },

  navigate(tab) {
    if (!this._tabs.includes(tab)) return;
    const prev = this._currentTab;
    this._currentTab = tab;

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const newPane = document.getElementById('tab-' + tab);
    if (newPane) {
      newPane.classList.add('active');
      newPane.classList.add('animate-fade-in');
      setTimeout(() => newPane.classList.remove('animate-fade-in'), 300);
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Trigger tab-specific refresh
    TF.auth.resetTimer();
    switch (tab) {
      case 'dashboard': TF.app && TF.app.renderDashboard(); break;
      case 'workout': TF.app && TF.app.renderWorkoutTab(); break;
      case 'progress': TF.progress && TF.progress.render(); break;
      case 'photos': TF.photos && TF.photos.render(); break;
      case 'settings': TF.settings && TF.settings.render(); break;
    }
  },

  getCurrentTab() { return this._currentTab; }
};
