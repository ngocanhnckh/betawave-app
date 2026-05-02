const iconEl = document.getElementById('suggestionIcon');
const titleEl = document.getElementById('suggestionTitle');
const descEl = document.getElementById('suggestionDescription');
const restTimerEl = document.getElementById('restTimer');
const skipBtn = document.getElementById('skipBtn');

function applySuggestion(suggestion) {
  if (!suggestion) return;
  iconEl.textContent = suggestion.icon || '';
  titleEl.textContent = suggestion.title || '';
  descEl.textContent = suggestion.description || '';
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

window.electronAPI.onShowSuggestion(applySuggestion);

window.electronAPI.onOverlayTick((seconds) => {
  restTimerEl.textContent = formatTime(seconds);
});

// Safety net: if the show-suggestion IPC was missed (e.g., race with first
// show), pull the current suggestion from main on load.
window.electronAPI.getCurrentSuggestion().then(applySuggestion);

function closeOverlay() {
  window.electronAPI.closeOverlay();
}

skipBtn.addEventListener('click', closeOverlay);
skipBtn.addEventListener('mousedown', closeOverlay);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === ' ') {
    closeOverlay();
  }
});
