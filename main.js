const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, nativeTheme, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// First run detection
const configPath = path.join(app.getPath('userData'), 'config.json');

function isFirstRun() {
  try {
    if (fs.existsSync(configPath)) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

function markFirstRunComplete() {
  try {
    fs.writeFileSync(configPath, JSON.stringify({ firstRun: false, setupShown: true }));
  } catch (e) {
    console.error('Could not write config:', e);
  }
}

let mainWindow = null;
let tray = null;
let overlayWindow = null;
let isQuitting = false;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

function createTrayIcon() {
  // Load tray icon from file (22x22 for standard, 44x44 for retina)
  const iconPath = path.join(__dirname, 'assets', 'trayIconTemplate.png');

  let trayIcon = nativeImage.createFromPath(iconPath);

  if (trayIcon.isEmpty()) {
    // Fallback: create a simple programmatic icon
    const size = 22;
    const buffer = Buffer.alloc(size * size * 4);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const isCircle = Math.abs(dist - r) < 1.2;
        const waveY = cy + Math.sin((x - 3) / 3.5) * 2.5;
        const isWave = x >= 4 && x <= size - 4 && Math.abs(y - waveY) < 1.2;

        if (isCircle || isWave) {
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 220;
        }
      }
    }

    trayIcon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  // Template images auto-adapt to light/dark mode on macOS
  trayIcon.setTemplateImage(true);

  return trayIcon;
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('BetaWave - Focus Timer');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show BetaWave',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 720,
    minWidth: 340,
    minHeight: 650,
    x: screenWidth - 400,
    y: 40,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    hasShadow: true,
    resizable: true,
    show: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Show setup dialog on first run
    if (isFirstRun()) {
      setTimeout(() => {
        showFirstRunSetup();
      }, 500);
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    vibrancy: 'fullscreen-ui',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  overlayWindow.loadFile('renderer/overlay.html');
  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.hide();
}

// First run setup dialog
async function showFirstRunSetup() {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Welcome to BetaWave!',
    message: 'Setup Focus Mode Integration',
    detail: `To automatically enable macOS Focus modes during focus sessions, you need to create Shortcuts:

1. Open the Shortcuts app
2. Create a new shortcut named "Turn On Work"
3. Add "Set Focus" action → select "Work" → "Turn On"
4. Click (i) info button → DISABLE "Ask Before Running"
5. Save the shortcut

Create similar shortcuts for:
• "Turn On Do Not Disturb"
• "Turn Off Focus" (to disable Focus mode)

You can skip this and set it up later from the app.`,
    buttons: ['Setup Now', 'Skip for Now'],
    defaultId: 0
  });

  markFirstRunComplete();

  if (result.response === 0) {
    shell.openExternal('shortcuts://');
  }
}

// IPC Handlers
ipcMain.handle('get-focus-modes', async () => {
  return new Promise((resolve) => {
    const fs = require('fs');
    const os = require('os');
    const plist = require('child_process');

    // Start with None option
    const modes = [{ id: 'none', name: 'None' }];

    // Method 1: Try to read Focus modes from focus configuration plist
    const possiblePaths = [
      path.join(os.homedir(), 'Library', 'DoNotDisturb', 'DB', 'ModeConfigurations.json'),
      path.join(os.homedir(), 'Library', 'Preferences', 'com.apple.Focus.plist')
    ];

    let foundModes = false;

    // Method 2: Use plutil to read Focus configurations
    try {
      const focusPlistPath = path.join(os.homedir(), 'Library', 'Focus', 'Configurations');
      if (fs.existsSync(focusPlistPath)) {
        const files = fs.readdirSync(focusPlistPath);
        files.forEach(file => {
          if (file.endsWith('.focus')) {
            const name = file.replace('.focus', '');
            modes.push({ id: name, name: name });
            foundModes = true;
          }
        });
      }
    } catch (err) {
      // Ignore
    }

    // Method 3: Read from Shortcuts to find Focus-related shortcuts
    exec('shortcuts list 2>/dev/null', (error, stdout) => {
      if (!error && stdout) {
        const lines = stdout.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          // Look for shortcuts that seem to be Focus-related
          if (trimmed && (trimmed.toLowerCase().includes('focus') || trimmed.toLowerCase().includes('do not disturb'))) {
            if (!modes.find(m => m.name === trimmed)) {
              modes.push({ id: `shortcut:${trimmed}`, name: trimmed });
              foundModes = true;
            }
          }
        });
      }

      // Always add standard Focus modes
      const standardModes = [
        { id: 'dnd', name: 'Do Not Disturb' },
        { id: 'work', name: 'Work' },
        { id: 'personal', name: 'Personal' },
        { id: 'sleep', name: 'Sleep' },
        { id: 'driving', name: 'Driving' },
        { id: 'fitness', name: 'Fitness' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'mindfulness', name: 'Mindfulness' },
        { id: 'reading', name: 'Reading' }
      ];

      standardModes.forEach(sm => {
        if (!modes.find(m => m.name === sm.name)) {
          modes.push(sm);
        }
      });

      resolve(modes);
    });
  });
});

ipcMain.handle('set-focus-mode', async (event, mode) => {
  // Return immediately - Focus mode activation happens in background
  // This prevents blocking the timer start

  const runShortcut = (name) => {
    const { spawn } = require('child_process');
    const proc = spawn('shortcuts', ['run', name], {
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();

    // Kill the process after 3 seconds if it hangs (likely "Ask Before Running" is on)
    setTimeout(() => {
      try { proc.kill(); } catch (e) { /* ignore */ }
    }, 3000);
  };

  if (mode === 'none') {
    runShortcut('Turn Off Focus');
    return true;
  }

  if (mode.startsWith('shortcut:')) {
    const shortcutName = mode.replace('shortcut:', '');
    runShortcut(shortcutName);
    return true;
  }

  // Map standard mode IDs to names
  const modeNames = {
    'dnd': 'Do Not Disturb',
    'work': 'Work',
    'personal': 'Personal',
    'sleep': 'Sleep',
    'driving': 'Driving',
    'fitness': 'Fitness',
    'gaming': 'Gaming',
    'mindfulness': 'Mindfulness',
    'reading': 'Reading'
  };

  const modeName = modeNames[mode] || mode;
  runShortcut(`Turn On ${modeName}`);

  return true;
});

ipcMain.handle('show-overlay', async (event, suggestion) => {
  if (overlayWindow) {
    overlayWindow.webContents.send('show-suggestion', suggestion);
    overlayWindow.show();
    overlayWindow.focus();
  }
});

ipcMain.handle('hide-overlay', async () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
  if (mainWindow) {
    mainWindow.webContents.send('overlay-closed');
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('get-audio-path', () => {
  return path.join(__dirname, '40hzbeat.mp3');
});

ipcMain.handle('open-focus-setup', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Setup Focus Mode Shortcuts',
    message: 'To enable automatic Focus mode control, create Shortcuts with these EXACT settings:',
    detail: `Steps to set up:

1. Open Shortcuts app
2. Create new shortcut named exactly "Turn On Work"
3. Add "Set Focus" action → select "Work" → "Turn On"
4. IMPORTANT: Click the (i) info button on the shortcut
5. DISABLE "Ask Before Running" toggle
6. Save

Repeat for:
• "Turn On Do Not Disturb"
• "Turn Off Focus" (select "Turn Off" in Set Focus)

⚠️ "Ask Before Running" MUST be OFF or shortcuts will hang!`,
    buttons: ['Open Shortcuts', 'Cancel'],
    defaultId: 0
  });

  if (result.response === 0) {
    shell.openExternal('shortcuts://');
  }

  return true;
});

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();
  createTray();
  createOverlayWindow();

  // Set dock icon
  const dockIconPath = path.join(__dirname, 'assets', 'icon.png');
  if (fs.existsSync(dockIconPath)) {
    app.dock.setIcon(dockIconPath);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
