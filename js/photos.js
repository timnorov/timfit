window.TF = window.TF || {};

TF.photos = {
  _mode: 'grid',       // 'grid' | 'compare'
  _filter: 'all',
  _compareA: null,
  _compareB: null,
  _sliderPos: 50,

  render() {
    const container = document.getElementById('tab-photos');
    const photos = TF.data.getPhotos();

    container.innerHTML = `
      <div class="photos-toolbar">
        <h2 class="section-title">${TF.i18n.t(this._mode === 'grid' ? 'photos.grid' : 'photos.compare')}</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-sm btn-secondary" onclick="TF.photos._toggleMode()">
            ${this._mode === 'grid' ? TF.i18n.t('photos.compare') : TF.i18n.t('photos.grid')}
          </button>
          <button class="btn btn-sm btn-primary" onclick="TF.photos._showAddForm()">+</button>
        </div>
      </div>
    `;

    if (this._mode === 'grid') {
      this._renderGrid(container, photos);
    } else {
      this._renderCompare(container, photos);
    }
  },

  _renderGrid(container, photos) {
    // Filter pills
    const filterDiv = document.createElement('div');
    filterDiv.className = 'photo-filters';
    ['all','front','back','left','right'].forEach(f => {
      const pill = document.createElement('div');
      pill.className = 'pill ' + (f === this._filter ? 'pill-blue' : 'pill-gray');
      pill.textContent = TF.i18n.t('photos.filter.' + f);
      pill.onclick = () => { this._filter = f; this.render(); };
      filterDiv.appendChild(pill);
    });
    container.appendChild(filterDiv);

    const filtered = this._filter === 'all' ? photos : photos.filter(p => p.angle === this._filter);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    if (sorted.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;padding:60px 20px;color:var(--text3)';
      empty.innerHTML = `<div style="font-size:48px;margin-bottom:12px">📸</div><div>${TF.i18n.t('photos.no.photos')}</div>`;
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'photo-grid';
    sorted.forEach(photo => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.innerHTML = `
        <img src="${photo.imageData}" alt="Progress photo" loading="lazy">
        <div class="photo-thumb-info">
          <div class="photo-thumb-date">${photo.date}</div>
          <div class="photo-thumb-angle">${photo.angle}</div>
        </div>
      `;
      thumb.onclick = () => this._showPhotoDetail(photo);
      grid.appendChild(thumb);
    });
    container.appendChild(grid);
  },

  _renderCompare(container, photos) {
    if (photos.length < 2) {
      const msg = document.createElement('div');
      msg.style.cssText = 'text-align:center;padding:60px 20px;color:var(--text3)';
      msg.textContent = TF.i18n.t('photos.compare.instructions');
      container.appendChild(msg);
      return;
    }

    const sorted = [...photos].sort((a, b) => a.date.localeCompare(b.date));

    // Photo selectors
    const selectors = document.createElement('div');
    selectors.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:8px 16px 12px';
    selectors.innerHTML = `
      <div>
        <div class="form-label">${TF.i18n.t('photos.slider.a')}</div>
        <select class="form-input" id="compareSelA" style="font-size:13px" onchange="TF.photos._onCompareSelect()">
          ${sorted.map((p, i) => `<option value="${i}" ${p.id === (this._compareA && this._compareA.id) ? 'selected' : ''}>${p.date} (${p.angle})</option>`).join('')}
        </select>
      </div>
      <div>
        <div class="form-label">${TF.i18n.t('photos.slider.b')}</div>
        <select class="form-input" id="compareSelB" style="font-size:13px" onchange="TF.photos._onCompareSelect()">
          ${sorted.map((p, i) => `<option value="${i}" ${p.id === (this._compareB && this._compareB.id) ? 'selected' : ''}>${p.date} (${p.angle})</option>`).join('')}
        </select>
      </div>
    `;
    container.appendChild(selectors);

    this._compareA = sorted[0];
    this._compareB = sorted[sorted.length - 1];

    const sel = document.getElementById('compareSelB');
    if (sel) sel.value = sorted.length - 1;

    this._renderSlider(container, sorted);
  },

  _onCompareSelect() {
    const sorted = [...TF.data.getPhotos()].sort((a, b) => a.date.localeCompare(b.date));
    const ai = parseInt(document.getElementById('compareSelA').value);
    const bi = parseInt(document.getElementById('compareSelB').value);
    this._compareA = sorted[ai];
    this._compareB = sorted[bi];
    const sliderContainer = document.getElementById('sliderContainer');
    if (sliderContainer) sliderContainer.remove();
    const container = document.getElementById('tab-photos');
    this._renderSlider(container, sorted);
  },

  _renderSlider(container, sorted) {
    const a = this._compareA || sorted[0];
    const b = this._compareB || sorted[sorted.length - 1];

    const div = document.createElement('div');
    div.id = 'sliderContainer';
    div.className = 'comparison-container';
    div.innerHTML = `
      <img class="comparison-img" src="${a.imageData}" alt="Before">
      <img class="comparison-img comparison-img-b" id="compareImgB" src="${b.imageData}" alt="After">
      <div class="comparison-divider" id="compareDivider"></div>
      <div class="comparison-handle" id="compareHandle">⇔</div>
      <div class="comparison-labels">
        <div class="comparison-label">${a.date}</div>
        <div class="comparison-label">${b.date}</div>
      </div>
    `;
    container.appendChild(div);

    this._sliderPos = 50;
    this._updateSlider();

    // Touch/mouse drag
    let dragging = false;
    const onStart = (e) => { dragging = true; e.preventDefault(); };
    const onMove = (e) => {
      if (!dragging) return;
      const rect = div.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = TF.utils.clamp(((clientX - rect.left) / rect.width) * 100, 5, 95);
      this._sliderPos = pct;
      this._updateSlider();
    };
    const onEnd = () => { dragging = false; };

    div.addEventListener('mousedown', onStart);
    div.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  },

  _updateSlider() {
    const pct = this._sliderPos;
    const divider = document.getElementById('compareDivider');
    const handle = document.getElementById('compareHandle');
    const imgB = document.getElementById('compareImgB');
    if (divider) divider.style.left = pct + '%';
    if (handle) handle.style.left = pct + '%';
    if (imgB) imgB.style.clipPath = `inset(0 0 0 ${pct}%)`;
  },

  _toggleMode() {
    this._mode = this._mode === 'grid' ? 'compare' : 'grid';
    this.render();
  },

  _showAddForm() {
    const latest = TF.data.getLatestMeasurement() || {};
    const modal = document.createElement('div');
    modal.id = 'addPhotoModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:700;display:flex;align-items:flex-end;';

    modal.innerHTML = `
      <div style="background:var(--bg-modal);border-radius:20px 20px 0 0;padding:20px 20px calc(var(--safe-bottom)+20px);width:100%">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:16px">${TF.i18n.t('photos.add')}</h3>
        <div style="margin-bottom:12px">
          <label style="display:block;padding:14px;background:var(--accent);color:white;border-radius:var(--radius-sm);text-align:center;font-weight:600;cursor:pointer">
            📷 ${TF.i18n.t('photos.camera')} / ${TF.i18n.t('photos.library')}
            <input type="file" accept="image/*" id="photoFileInput" style="display:none" capture="environment">
          </label>
        </div>
        <div id="photoPreview" style="display:none;margin-bottom:12px;border-radius:var(--radius-sm);overflow:hidden;max-height:200px">
          <img id="photoPreviewImg" style="width:100%;object-fit:contain">
        </div>
        <div class="form-grid" style="margin-bottom:12px">
          <div class="form-field">
            <div class="form-label">${TF.i18n.t('photos.date')}</div>
            <input type="date" id="photoDate" class="form-input" value="${TF.utils.todayStr()}">
          </div>
          <div class="form-field">
            <div class="form-label">${TF.i18n.t('photos.angle')}</div>
            <select id="photoAngle" class="form-input">
              <option value="front">${TF.i18n.t('photos.filter.front')}</option>
              <option value="back">${TF.i18n.t('photos.filter.back')}</option>
              <option value="left">${TF.i18n.t('photos.filter.left')}</option>
              <option value="right">${TF.i18n.t('photos.filter.right')}</option>
            </select>
          </div>
          <div class="form-field">
            <div class="form-label">${TF.i18n.t('photos.weight.at')} (kg)</div>
            <input type="number" step="0.1" id="photoWeight" class="form-input" value="${latest.weight || ''}">
          </div>
          <div class="form-field">
            <div class="form-label">${TF.i18n.t('photos.bf.at')} (%)</div>
            <input type="number" step="0.1" id="photoBF" class="form-input" value="${latest.bodyFat || ''}">
          </div>
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <div class="form-label">${TF.i18n.t('photos.notes')}</div>
          <input type="text" id="photoNotes" class="form-input" placeholder="...">
        </div>
        <button class="btn btn-primary btn-full" onclick="TF.photos._savePhoto()">${TF.i18n.t('photos.save')}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px" onclick="document.getElementById('addPhotoModal').remove()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('photoFileInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const compressed = await TF.utils.compressImage(file, 800, 0.75);
      modal._imageData = compressed;
      document.getElementById('photoPreviewImg').src = compressed;
      document.getElementById('photoPreview').style.display = 'block';
    });
  },

  async _savePhoto() {
    const modal = document.getElementById('addPhotoModal');
    if (!modal._imageData) { alert('Please select a photo first.'); return; }

    const photo = {
      id: TF.utils.generateId(),
      date: document.getElementById('photoDate').value || TF.utils.todayStr(),
      angle: document.getElementById('photoAngle').value,
      imageData: modal._imageData,
      notes: document.getElementById('photoNotes').value,
      weightAtTime: parseFloat(document.getElementById('photoWeight').value) || null,
      bodyFatAtTime: parseFloat(document.getElementById('photoBF').value) || null
    };

    TF.data.savePhoto(photo);
    modal.remove();
    TF.app.showToast(TF.i18n.t('settings.saved'));
    this.render();
  },

  _showPhotoDetail(photo) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:700;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top)+20px) 20px calc(env(safe-area-inset-bottom)+20px)';
    modal.innerHTML = `
      <button onclick="this.parentNode.remove()" style="position:absolute;top:calc(env(safe-area-inset-top)+12px);right:16px;background:rgba(255,255,255,0.15);color:white;border-radius:50%;width:32px;height:32px;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>
      <img src="${photo.imageData}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:12px">
      <div style="color:white;margin-top:16px;text-align:center">
        <div style="font-size:18px;font-weight:700">${photo.date} — ${photo.angle}</div>
        ${photo.weightAtTime ? `<div style="color:rgba(255,255,255,0.7);margin-top:4px">${photo.weightAtTime} kg${photo.bodyFatAtTime ? ` · ${photo.bodyFatAtTime}%` : ''}</div>` : ''}
        ${photo.notes ? `<div style="color:rgba(255,255,255,0.6);margin-top:4px;font-size:14px">${photo.notes}</div>` : ''}
      </div>
      <button onclick="TF.photos._deletePhoto('${photo.id}', this.closest('[style]'))"
              style="margin-top:20px;background:var(--red);color:white;border-radius:10px;padding:12px 28px;font-size:16px;font-weight:600">
        ${TF.i18n.t('photos.delete')}
      </button>
    `;
    document.body.appendChild(modal);
  },

  _deletePhoto(id, modal) {
    if (!confirm(TF.i18n.t('photos.delete.confirm'))) return;
    TF.data.deletePhoto(id);
    if (modal) modal.remove();
    this.render();
  }
};
