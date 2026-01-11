const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Focus modes
  getFocusModes: () => ipcRenderer.invoke('get-focus-modes'),
  setFocusMode: (mode) => ipcRenderer.invoke('set-focus-mode', mode),
  openFocusSetup: () => ipcRenderer.invoke('open-focus-setup'),

  // Overlay
  showOverlay: (suggestion) => ipcRenderer.invoke('show-overlay', suggestion),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),
  closeOverlay: () => ipcRenderer.send('close-overlay'),
  onOverlayClosed: (callback) => ipcRenderer.on('overlay-closed', callback),

  // Audio
  getAudioPath: () => ipcRenderer.invoke('get-audio-path'),

  // Overlay receiver
  onShowSuggestion: (callback) => ipcRenderer.on('show-suggestion', (event, suggestion) => callback(suggestion))
});
