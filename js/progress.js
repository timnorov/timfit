window.TF = window.TF || {};

TF.progress = {
  _range: '1m',
  _customStart: null,
  _customEnd: null,
  _charts: {},
  _exerciseFilter: '',

  render() {
    const container = document.getElementById('tab-progress');
    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title" data-i18n="progress.body.stats">${TF.i18n.t('progress.body.stats')}</h2>
        <button class="section-action" onclick="TF.progress._showLogForm()" data-i18n="progress.log">${TF.i18n.t('progress.log')}</button>
      </div>
      <div class="range-tabs" id="rangeTabsBody">
        ${['1w','1m','3m','all','custom'].map(r => `
          <div class="range-tab ${r === this._range ? 'active' : ''}" data-range="${r}"
               onclick="TF.progress._setRange('${r}')">
            ${TF.i18n.t('progress.range.' + r)}
          </div>`).join('')}
      </div>
      <div id="bodyChartsArea"></div>
      <div class="section-header">
        <h2 class="section-title" data-i18n="progress.workout.stats">${TF.i18n.t('progress.workout.stats')}</h2>
      </div>
      <div id="workoutStatsArea"></div>
      <div class="section-header">
        <h2 class="section-title" data-i18n="progress.export">${TF.i18n.t('progress.export')}</h2>
      </div>
      <div class="export-card" id="exportArea">
        <div class="export-summary" id="exportSummaryText"></div>
        <button class="btn btn-secondary btn-full" style="margin-top:12px"
                onclick="TF.progress._copyExport()" data-i18n="progress.copy">
          ${TF.i18n.t('progress.copy')}
        </button>
      </div>
      <div class="spacer"></div>
    `;

    this._renderBodyCharts();
    this._renderWorkoutStats();
    this._generateExportSummary();
  },

  _setRange(range) {
    if (range === 'custom') {
      const start = prompt('Start date (YYYY-MM-DD):');
      const end = prompt('End date (YYYY-MM-DD):');
      if (start && end) {
        this._customStart = start;
        this._customEnd = end;
        this._range = 'custom';
      } else return;
    } else {
      this._range = range;
    }
    this.render();
  },

  _getDateRange() {
    const now = new Date();
    let start, end = TF.utils.formatShortDate(now);
    switch (this._range) {
      case '1w': start = TF.utils.formatShortDate(new Date(now - 7 * 864e5)); break;
      case '1m': start = TF.utils.formatShortDate(new Date(now - 30 * 864e5)); break;
      case '3m': start = TF.utils.formatShortDate(new Date(now - 90 * 864e5)); break;
      case 'all': start = '2020-01-01'; break;
      case 'custom': start = this._customStart; end = this._customEnd; break;
      default: start = TF.utils.formatShortDate(new Date(now - 30 * 864e5));
    }
    return { start, end };
  },

  _filterMeasurements() {
    const { start, end } = this._getDateRange();
    return TF.data.getMeasurements().filter(m => m.date >= start && m.date <= end);
  },

  _renderBodyCharts() {
    const area = document.getElementById('bodyChartsArea');
    if (!area) return;
    const measurements = this._filterMeasurements();
    const all = TF.data.getMeasurements();

    const metrics = [
      { key: 'weight', label: TF.i18n.t('progress.weight'), unit: 'kg', targetMin: null, targetMax: null, improving: 'down' },
      { key: 'bodyFat', label: TF.i18n.t('progress.bodyfat'), unit: '%', targetMin: 13, targetMax: 15, improving: 'down' },
      { key: 'chest', label: TF.i18n.t('progress.chest'), unit: 'cm', improving: 'up' },
      { key: 'waist', label: TF.i18n.t('progress.waist'), unit: 'cm', improving: 'down' },
      { key: 'leftArm', label: TF.i18n.t('progress.left.arm'), unit: 'cm', improving: 'up' },
      { key: 'rightArm', label: TF.i18n.t('progress.right.arm'), unit: 'cm', improving: 'up' }
    ];

    area.innerHTML = '';
    metrics.forEach(m => {
      const data = measurements.filter(me => me[m.key] != null && me[m.key] !== '');
      if (data.length === 0 && all.filter(me => me[m.key]).length === 0) return;

      const card = document.createElement('div');
      card.className = 'chart-card';

      const first = data[0];
      const last = data[data.length - 1];
      let delta = '';
      if (first && last && data.length > 1) {
        const diff = +(last[m.key] - first[m.key]).toFixed(1);
        const color = (m.improving === 'down' && diff < 0) || (m.improving === 'up' && diff > 0) ? 'var(--green)' : (diff === 0 ? 'var(--text3)' : 'var(--red)');
        delta = `<span style="color:${color}">${TF.utils.sign(diff)} ${m.unit}</span> ${TF.i18n.t('progress.since.start')}`;
      }
      const current = last ? `${TF.i18n.t('progress.current')}: <b>${last[m.key]} ${m.unit}</b>` : TF.i18n.t('progress.no.data');

      card.innerHTML = `
        <div class="chart-title">${m.label}</div>
        <div class="chart-delta">${current}${delta ? ' · ' + delta : ''}</div>
        <div class="chart-container">
          <canvas id="chart-${m.key}"></canvas>
        </div>
      `;
      area.appendChild(card);

      // Render chart after DOM insert
      requestAnimationFrame(() => {
        this._renderLineChart(`chart-${m.key}`, data.map(d => d.date), data.map(d => +d[m.key]),
          m.unit, m.targetMin, m.targetMax);
      });
    });
  },

  _renderLineChart(canvasId, labels, values, unit, targetMin, targetMax) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const existing = this._charts[canvasId];
    if (existing) { existing.destroy(); }

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim();
    const grid = style.getPropertyValue('--border').trim();
    const text3 = style.getPropertyValue('--text3').trim();

    const datasets = [{
      data: values,
      borderColor: accent,
      backgroundColor: accent + '22',
      borderWidth: 2.5,
      pointRadius: values.length <= 12 ? 4 : 2,
      pointBackgroundColor: accent,
      fill: true,
      tension: 0.4
    }];

    if (targetMin != null && targetMax != null) {
      // Green target zone band
      datasets.push({
        data: Array(values.length).fill(targetMax),
        borderColor: 'rgba(52,199,89,0.5)',
        backgroundColor: 'rgba(52,199,89,0.08)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: '-1',
        tension: 0
      });
      datasets.push({
        data: Array(values.length).fill(targetMin),
        borderColor: 'rgba(52,199,89,0.5)',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0
      });
    }

    this._charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.map(l => l.slice(5)),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y} ${unit}`
            }
          }
        },
        scales: {
          x: { ticks: { color: text3, maxTicksLimit: 6, font: { size: 10 } }, grid: { color: grid } },
          y: { ticks: { color: text3, font: { size: 10 } }, grid: { color: grid } }
        }
      }
    });
  },

  _renderWorkoutStats() {
    const area = document.getElementById('workoutStatsArea');
    if (!area) return;
    const { start, end } = this._getDateRange();
    const sessions = TF.data.getWorkoutSessions().filter(s => s.completed && s.date >= start && s.date <= end);

    // Weekly volume bar chart
    const volumeCard = document.createElement('div');
    volumeCard.className = 'chart-card';
    volumeCard.innerHTML = `
      <div class="chart-title">${TF.i18n.t('progress.volume.week')}</div>
      <div class="chart-container"><canvas id="chart-volume"></canvas></div>
    `;
    area.appendChild(volumeCard);

    // Strength progress selector
    const strengthCard = document.createElement('div');
    strengthCard.className = 'chart-card';
    const allExercises = Object.values(TF.PROGRAM).flatMap(s => s.exercises || []);
    const uniqueEx = allExercises.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
    strengthCard.innerHTML = `
      <div class="chart-title">${TF.i18n.t('progress.strength')}</div>
      <select class="form-input" id="strengthExSelect" onchange="TF.progress._renderStrengthChart(this.value)"
              style="margin-bottom:10px;font-size:14px">
        ${uniqueEx.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
      </select>
      <div class="chart-container"><canvas id="chart-strength"></canvas></div>
    `;
    area.appendChild(strengthCard);

    // PRs table
    const prs = TF.data.getPRs();
    if (prs.length > 0) {
      const prCard = document.createElement('div');
      prCard.className = 'chart-card';
      prCard.innerHTML = `
        <div class="chart-title">${TF.i18n.t('progress.prs')}</div>
        <div class="pr-table">
          ${prs.map(pr => `
            <div class="pr-row">
              <div class="pr-ex">${pr.exerciseName}</div>
              <div class="pr-weight">${pr.weight} kg</div>
              <div class="pr-date">${pr.date}</div>
            </div>`).join('')}
        </div>
      `;
      area.appendChild(prCard);
    }

    // Render charts
    requestAnimationFrame(() => {
      // Weekly volume — group by week
      const weekMap = {};
      sessions.forEach(s => {
        const d = TF.utils.localDate(s.date);
        const monday = new Date(d);
        monday.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
        const key = TF.utils.formatShortDate(monday);
        weekMap[key] = (weekMap[key] || 0) + (s.totalVolume || 0);
      });
      const weekKeys = Object.keys(weekMap).sort();
      this._renderBarChart('chart-volume', weekKeys.map(k => k.slice(5)), weekKeys.map(k => weekMap[k]), 'kg');

      // Strength
      if (uniqueEx.length > 0) {
        const first = document.getElementById('strengthExSelect');
        this._renderStrengthChart(first ? first.value : uniqueEx[0].id);
      }
    });
  },

  _renderStrengthChart(exerciseId) {
    const { start, end } = this._getDateRange();
    const sessions = TF.data.getWorkoutSessions().filter(s => s.completed && s.date >= start && s.date <= end);
    const pts = [];
    sessions.forEach(s => {
      const log = s.exerciseLogs.find(e => e.exerciseId === exerciseId);
      if (log) {
        const maxW = Math.max(...log.sets.filter(set => set.completed).map(set => set.weight || 0));
        if (maxW > 0) pts.push({ date: s.date, weight: maxW });
      }
    });
    pts.sort((a, b) => a.date.localeCompare(b.date));
    this._renderLineChart('chart-strength', pts.map(p => p.date), pts.map(p => p.weight), 'kg', null, null);
  },

  _renderBarChart(canvasId, labels, values, unit) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (this._charts[canvasId]) this._charts[canvasId].destroy();

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim();
    const grid = style.getPropertyValue('--border').trim();
    const text3 = style.getPropertyValue('--text3').trim();

    this._charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: accent + 'BB', borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${Math.round(ctx.parsed.y)} ${unit}` } } },
        scales: {
          x: { ticks: { color: text3, font: { size: 10 } }, grid: { color: grid } },
          y: { ticks: { color: text3, font: { size: 10 } }, grid: { color: grid } }
        }
      }
    });
  },

  _showLogForm() {
    const latest = TF.data.getLatestMeasurement() || {};
    const modal = document.createElement('div');
    modal.id = 'measurementModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:700;display:flex;align-items:flex-end;';

    const fields = [
      ['weight', 'progress.weight'], ['bodyFat', 'progress.bodyfat'],
      ['chest', 'progress.chest'], ['waist', 'progress.waist'],
      ['hips', 'progress.hips'], ['leftArm', 'progress.left.arm'],
      ['rightArm', 'progress.right.arm'], ['leftThigh', 'progress.left.thigh'],
      ['rightThigh', 'progress.right.thigh'], ['leftCalf', 'progress.left.calf'],
      ['rightCalf', 'progress.right.calf']
    ];

    modal.innerHTML = `
      <div style="background:var(--bg-modal);border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom)+20px);width:100%;max-height:85vh;overflow-y:auto">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:16px">${TF.i18n.t('progress.log')}</h3>
        <div style="margin-bottom:12px">
          <div class="form-label">Date</div>
          <input type="date" id="measDate" class="form-input" value="${TF.utils.todayStr()}">
        </div>
        <div class="form-grid" style="margin-bottom:16px">
          ${fields.map(([key, label]) => `
            <div class="form-field">
              <div class="form-label">${TF.i18n.t(label)}</div>
              <input type="number" step="0.1" id="meas-${key}" class="form-input"
                     placeholder="—" value="${latest[key] || ''}">
            </div>`).join('')}
        </div>
        <button class="btn btn-primary btn-full" onclick="TF.progress._saveMeasurement()">${TF.i18n.t('progress.save')}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="document.getElementById('measurementModal').remove()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  _saveMeasurement() {
    const fields = ['weight','bodyFat','chest','waist','hips','leftArm','rightArm','leftThigh','rightThigh','leftCalf','rightCalf'];
    const m = { date: document.getElementById('measDate').value || TF.utils.todayStr() };
    fields.forEach(k => {
      const val = parseFloat(document.getElementById('meas-' + k).value);
      if (!isNaN(val)) m[k] = val;
    });
    TF.data.saveMeasurement(m);
    document.getElementById('measurementModal').remove();
    this.render();
    TF.app.showToast(TF.i18n.t('settings.saved'));
  },

  _generateExportSummary() {
    const el = document.getElementById('exportSummaryText');
    if (!el) return;

    const week = TF.utils.getWeekDates();
    const sessions = TF.data.getWorkoutSessions().filter(s => s.completed && week.includes(s.date));
    const measurements = TF.data.getMeasurements();
    const latest = measurements[measurements.length - 1];
    const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;

    const schedule = ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
    const sessionStatus = schedule.map(type => {
      const found = sessions.find(s => s.sessionType === type);
      return `${type} ${found ? '✓' : '○'}`;
    }).join(' | ');

    const totalVol = sessions.reduce((s, sess) => s + (sess.totalVolume || 0), 0);
    const totalTime = sessions.reduce((s, sess) => s + (sess.duration || 0), 0);

    // Strength highlights
    const prLines = [];
    sessions.forEach(sess => {
      sess.exerciseLogs.forEach(log => {
        const maxSet = log.sets.filter(s => s.completed).sort((a, b) => b.weight - a.weight)[0];
        if (maxSet) prLines.push(`${log.exerciseName}: ${maxSet.weight}kg`);
      });
    });

    const weekStart = week[0];
    let text = `TimFit Weekly Summary — Week of ${weekStart}\n`;
    text += `Sessions: ${sessionStatus}\n`;
    text += `Total volume: ${totalVol.toLocaleString()} kg\n`;
    text += `Workout time: ${TF.utils.formatDuration(totalTime)}\n\n`;

    if (prLines.length > 0) {
      text += `Strength:\n${prLines.slice(0, 8).map(l => `  • ${l}`).join('\n')}\n\n`;
    }

    if (latest) {
      text += `Body stats:\n`;
      if (latest.weight) {
        const diff = previous && previous.weight ? +(latest.weight - previous.weight).toFixed(1) : null;
        text += `  • Weight: ${latest.weight} kg${diff !== null ? ` (${TF.utils.sign(diff)} kg vs prev)` : ''}\n`;
      }
      if (latest.bodyFat) {
        const diff = previous && previous.bodyFat ? +(latest.bodyFat - previous.bodyFat).toFixed(1) : null;
        text += `  • Body fat: ${latest.bodyFat}%${diff !== null ? ` (${TF.utils.sign(diff)}% vs prev)` : ''}\n`;
      }
    }

    const cardio = TF.data.getCardioLogs().filter(l => week.includes(l.date));
    if (cardio.length > 0) {
      const steps = cardio.reduce((s, l) => s + (l.steps || 0), 0);
      const dist = cardio.reduce((s, l) => s + (l.distanceKm || 0), 0);
      text += `\nCardio:\n  • Total steps: ${steps.toLocaleString()}\n  • Distance: ${dist.toFixed(1)} km\n  • Active days: ${cardio.length}/6\n`;
    }

    el.textContent = text;
  },

  _copyExport() {
    const text = document.getElementById('exportSummaryText').textContent;
    navigator.clipboard.writeText(text).then(() => {
      TF.app.showToast(TF.i18n.t('progress.copied'));
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      TF.app.showToast(TF.i18n.t('progress.copied'));
    });
  }
};
