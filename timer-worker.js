// Web Worker — background rest timer
// Survives screen lock because it runs off the main thread.
// On iOS PWAs the worker may be throttled when backgrounded;
// we compensate by tracking wall-clock time so elapsed time
// stays accurate when the app regains focus.

let intervalId = null;
let endTime = null;
let remaining = 0;

self.onmessage = function (e) {
  const { type } = e.data;

  switch (type) {
    case 'START': {
      clearInterval(intervalId);
      remaining = e.data.duration; // seconds
      endTime = Date.now() + remaining * 1000;
      intervalId = setInterval(tick, 500);
      self.postMessage({ type: 'TICK', remaining });
      break;
    }
    case 'STOP': {
      clearInterval(intervalId);
      intervalId = null;
      endTime = null;
      remaining = 0;
      break;
    }
    case 'PAUSE': {
      clearInterval(intervalId);
      intervalId = null;
      break;
    }
    case 'RESUME': {
      if (endTime) {
        intervalId = setInterval(tick, 500);
      }
      break;
    }
    case 'ADD': {
      if (endTime) {
        endTime += e.data.seconds * 1000;
        remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        self.postMessage({ type: 'TICK', remaining });
      }
      break;
    }
    case 'SUBTRACT': {
      if (endTime) {
        endTime -= e.data.seconds * 1000;
        remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        self.postMessage({ type: 'TICK', remaining });
        if (remaining <= 0) {
          clearInterval(intervalId);
          intervalId = null;
          self.postMessage({ type: 'COMPLETE' });
        }
      }
      break;
    }
    case 'SYNC': {
      // Called when app regains visibility — recalc from wall clock
      if (endTime) {
        remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        if (remaining <= 0) {
          clearInterval(intervalId);
          intervalId = null;
          self.postMessage({ type: 'COMPLETE' });
        } else {
          self.postMessage({ type: 'TICK', remaining });
          if (!intervalId) intervalId = setInterval(tick, 500);
        }
      }
      break;
    }
  }
};

function tick() {
  if (!endTime) return;
  remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  self.postMessage({ type: 'TICK', remaining });
  if (remaining <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    endTime = null;
    self.postMessage({ type: 'COMPLETE' });
  }
}
