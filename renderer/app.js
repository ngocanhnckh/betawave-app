// BetaWave App - Main Renderer Script

class BetaWaveApp {
  constructor() {
    // Timer settings
    this.FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
    this.REST_DURATION = 5 * 60;   // 5 minutes in seconds

    // State
    this.isRunning = false;
    this.isFocusMode = true;
    this.timeRemaining = this.FOCUS_DURATION;
    this.timerInterval = null;
    this.sessionsCompleted = 0;
    this.totalFocusSeconds = 0;

    // Rest suggestions
    this.restSuggestions = [
      { title: "Do 5 Push-ups", description: "Quick burst of energy to get your blood flowing!", icon: "💪" },
      { title: "Stand Up, Sit Down", description: "Do 10 stand-up sit-downs to stretch your legs", icon: "🧍" },
      { title: "Look Out The Window", description: "Give your eyes a break - focus on something distant", icon: "🪟" },
      { title: "5-Minute Meditation", description: "Close your eyes and take deep breaths", icon: "🧘" },
      { title: "Drink Water", description: "Stay hydrated! Grab a glass of water", icon: "💧" },
      { title: "Stretch Your Neck", description: "Roll your head slowly in circles", icon: "🔄" },
      { title: "Walk Around", description: "Take a quick lap around your space", icon: "🚶" },
      { title: "Eye Exercises", description: "Look up, down, left, right - repeat 5 times", icon: "👀" },
      { title: "Deep Breathing", description: "4 seconds in, 4 seconds hold, 4 seconds out", icon: "🌬️" },
      { title: "Shoulder Rolls", description: "Roll your shoulders forward and backward", icon: "🤸" },
      { title: "Wrist Stretches", description: "Rotate your wrists and stretch your fingers", icon: "✋" },
      { title: "Quick Dance", description: "Put on your favorite song and move!", icon: "💃" }
    ];

    // DOM Elements
    this.elements = {
      timerDisplay: document.getElementById('timerDisplay'),
      timerLabel: document.getElementById('timerLabel'),
      progressRing: document.getElementById('progressRing'),
      timerRing: document.querySelector('.timer-ring'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      volumeSlider: document.getElementById('volumeSlider'),
      volumeValue: document.getElementById('volumeValue'),
      focusModeSelect: document.getElementById('focusModeSelect'),
      focusHint: document.getElementById('focusHint'),
      setupFocusBtn: document.getElementById('setupFocusBtn'),
      setupLink: document.getElementById('setupLink'),
      goalInput: document.getElementById('goalInput'),
      sessionsCompleted: document.getElementById('sessionsCompleted'),
      totalFocusTime: document.getElementById('totalFocusTime'),
      audioPlayer: document.getElementById('audioPlayer'),
      closeBtn: document.getElementById('closeBtn'),
      minimizeBtn: document.getElementById('minimizeBtn')
    };

    this.init();
  }

  async init() {
    // Set up audio
    await this.setupAudio();

    // Bind event listeners
    this.bindEvents();

    // Load focus modes
    await this.loadFocusModes();

    // Update display
    this.updateDisplay();

    // Listen for overlay closed event
    window.electronAPI.onOverlayClosed(() => {
      this.startFocusSession();
    });
  }

  async setupAudio() {
    const audioPath = await window.electronAPI.getAudioPath();
    this.elements.audioPlayer.src = audioPath;
    this.elements.audioPlayer.volume = 0.05; // 5% default

    // Handle loop - reset to beginning when it ends
    this.elements.audioPlayer.addEventListener('ended', () => {
      this.elements.audioPlayer.currentTime = 0;
      if (this.isRunning && this.isFocusMode) {
        this.elements.audioPlayer.play();
      }
    });

    // Seamless loop - reset just before end
    this.elements.audioPlayer.addEventListener('timeupdate', () => {
      if (this.elements.audioPlayer.duration - this.elements.audioPlayer.currentTime < 0.1) {
        this.elements.audioPlayer.currentTime = 0;
      }
    });
  }

  bindEvents() {
    // Window controls
    this.elements.closeBtn.addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });

    this.elements.minimizeBtn.addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });

    // Timer controls
    this.elements.startBtn.addEventListener('click', () => {
      this.startTimer();
    });

    this.elements.stopBtn.addEventListener('click', () => {
      this.stopTimer();
    });

    // Volume control
    this.elements.volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value;
      this.elements.volumeValue.textContent = `${volume}%`;
      this.elements.audioPlayer.volume = volume / 100;
    });

    // Focus mode setup button
    this.elements.setupFocusBtn.addEventListener('click', () => {
      window.electronAPI.openFocusSetup();
    });

    // Setup link
    this.elements.setupLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.electronAPI.openFocusSetup();
    });

    // Focus mode change - show hint
    this.elements.focusModeSelect.addEventListener('change', (e) => {
      if (e.target.value !== 'none') {
        this.elements.focusHint.textContent = 'Requires Shortcuts setup (click ?)';
      } else {
        this.elements.focusHint.textContent = '';
      }
    });
  }

  async loadFocusModes() {
    const modes = await window.electronAPI.getFocusModes();
    this.elements.focusModeSelect.innerHTML = modes
      .map(mode => `<option value="${mode.id}">${mode.name}</option>`)
      .join('');
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateDisplay() {
    // Update timer display
    this.elements.timerDisplay.textContent = this.formatTime(this.timeRemaining);

    // Update label
    this.elements.timerLabel.textContent = this.isFocusMode ? 'FOCUS' : 'REST';

    // Update progress ring
    const totalDuration = this.isFocusMode ? this.FOCUS_DURATION : this.REST_DURATION;
    const progress = this.timeRemaining / totalDuration;
    const circumference = 2 * Math.PI * 90; // r = 90
    const offset = circumference * (1 - progress);
    this.elements.progressRing.style.strokeDashoffset = offset;

    // Update ring color based on mode
    if (this.isFocusMode) {
      this.elements.timerRing.classList.remove('rest');
    } else {
      this.elements.timerRing.classList.add('rest');
    }

    // Update session stats
    this.elements.sessionsCompleted.textContent = this.sessionsCompleted;
    this.elements.totalFocusTime.textContent = this.formatTotalTime(this.totalFocusSeconds);
  }

  formatTotalTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  async startTimer() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.elements.startBtn.classList.add('hidden');
    this.elements.stopBtn.classList.remove('hidden');
    this.elements.timerRing.classList.add('active');
    this.elements.goalInput.disabled = true;
    this.elements.focusModeSelect.disabled = true;

    // Set macOS Focus mode
    const selectedMode = this.elements.focusModeSelect.value;
    if (selectedMode !== 'none') {
      await window.electronAPI.setFocusMode(selectedMode);
    }

    // Start audio during focus
    if (this.isFocusMode) {
      this.elements.audioPlayer.currentTime = 0;
      this.elements.audioPlayer.play().catch(console.error);
    }

    // Start the timer
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;

      // Track focus time
      if (this.isFocusMode) {
        this.totalFocusSeconds++;
      }

      this.updateDisplay();
    } else {
      // Timer completed
      this.handleTimerComplete();
    }
  }

  async handleTimerComplete() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    if (this.isFocusMode) {
      // Focus session completed
      this.sessionsCompleted++;
      this.elements.audioPlayer.pause();

      // Switch to rest mode
      this.isFocusMode = false;
      this.timeRemaining = this.REST_DURATION;
      this.updateDisplay();

      // Show rest overlay
      const suggestion = this.getRandomSuggestion();
      await window.electronAPI.showOverlay(suggestion);

      // Turn off Focus mode during rest
      await window.electronAPI.setFocusMode('none');

      // Continue timer for rest period
      this.timerInterval = setInterval(() => {
        this.tick();
      }, 1000);
    } else {
      // Rest period completed - this should happen after overlay is closed
      // The overlay closing will trigger startFocusSession
      this.isFocusMode = true;
      this.timeRemaining = this.FOCUS_DURATION;
      this.updateDisplay();
      this.startFocusSession();
    }
  }

  async startFocusSession() {
    // Hide overlay if showing
    await window.electronAPI.hideOverlay();

    // Reset to focus mode
    this.isFocusMode = true;
    this.timeRemaining = this.FOCUS_DURATION;
    this.updateDisplay();

    // Re-enable Focus mode
    const selectedMode = this.elements.focusModeSelect.value;
    if (selectedMode !== 'none') {
      await window.electronAPI.setFocusMode(selectedMode);
    }

    // Start audio
    this.elements.audioPlayer.currentTime = 0;
    this.elements.audioPlayer.play().catch(console.error);

    // Clear any existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Start new timer
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  getRandomSuggestion() {
    const index = Math.floor(Math.random() * this.restSuggestions.length);
    return this.restSuggestions[index];
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    // Stop audio
    this.elements.audioPlayer.pause();
    this.elements.audioPlayer.currentTime = 0;

    // Reset UI
    this.elements.startBtn.classList.remove('hidden');
    this.elements.stopBtn.classList.add('hidden');
    this.elements.timerRing.classList.remove('active');
    this.elements.goalInput.disabled = false;
    this.elements.focusModeSelect.disabled = false;

    // Reset timer
    this.isFocusMode = true;
    this.timeRemaining = this.FOCUS_DURATION;
    this.updateDisplay();

    // Turn off Focus mode
    window.electronAPI.setFocusMode('none');

    // Hide overlay if showing
    window.electronAPI.hideOverlay();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BetaWaveApp();
});
