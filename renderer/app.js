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

    // Rest suggestions - expanded list with variety
    this.restSuggestions = [
      // Physical exercises
      { title: "Do 5 Push-ups", description: "Quick burst of energy to get your blood flowing!", icon: "💪" },
      { title: "Do 10 Squats", description: "Strengthen your legs and boost circulation", icon: "🦵" },
      { title: "Plank for 30 Seconds", description: "Engage your core and build stability", icon: "🏋️" },
      { title: "Jumping Jacks", description: "Do 20 jumping jacks to energize yourself", icon: "⭐" },
      { title: "Stand Up, Sit Down", description: "Do 10 stand-up sit-downs to stretch your legs", icon: "🧍" },
      { title: "Calf Raises", description: "Stand on your tiptoes 15 times to stretch your calves", icon: "🦶" },
      { title: "Wall Sit", description: "Hold a wall sit for 30 seconds", icon: "🧱" },
      { title: "Lunges", description: "Do 5 lunges on each leg", icon: "🚶" },
      { title: "High Knees", description: "March in place with high knees for 30 seconds", icon: "🏃" },
      { title: "Burpees", description: "Do 3 burpees for a full-body wake-up", icon: "🔥" },

      // Stretching
      { title: "Stretch Your Neck", description: "Roll your head slowly in circles", icon: "🔄" },
      { title: "Shoulder Rolls", description: "Roll your shoulders forward and backward 10 times", icon: "🤸" },
      { title: "Wrist Stretches", description: "Rotate your wrists and stretch your fingers", icon: "✋" },
      { title: "Touch Your Toes", description: "Bend forward and reach for your toes", icon: "🙆" },
      { title: "Chest Opener", description: "Clasp hands behind back and open your chest", icon: "🫁" },
      { title: "Hip Flexor Stretch", description: "Lunge forward and stretch your hip flexors", icon: "🧎" },
      { title: "Spinal Twist", description: "Sit and twist your torso gently each direction", icon: "🌀" },
      { title: "Arm Circles", description: "Make big circles with your arms 10 times each way", icon: "⭕" },
      { title: "Side Stretch", description: "Reach overhead and lean to each side", icon: "🌊" },
      { title: "Quad Stretch", description: "Stand on one leg and pull your foot to your glutes", icon: "🦩" },

      // Eye care
      { title: "Look Out The Window", description: "Give your eyes a break - focus on something distant", icon: "🪟" },
      { title: "Eye Exercises", description: "Look up, down, left, right - repeat 5 times", icon: "👀" },
      { title: "20-20-20 Rule", description: "Look at something 20 feet away for 20 seconds", icon: "👁️" },
      { title: "Palm Your Eyes", description: "Cup your palms over closed eyes for 30 seconds", icon: "🙈" },
      { title: "Blink Rapidly", description: "Blink 20 times to refresh your eyes", icon: "😌" },
      { title: "Eye Figure-8s", description: "Trace a figure-8 pattern with your eyes", icon: "♾️" },

      // Mindfulness
      { title: "5-Minute Meditation", description: "Close your eyes and focus on your breath", icon: "🧘" },
      { title: "Deep Breathing", description: "4 seconds in, 4 seconds hold, 4 seconds out", icon: "🌬️" },
      { title: "Body Scan", description: "Notice sensations from head to toe", icon: "🫀" },
      { title: "Gratitude Moment", description: "Think of 3 things you're grateful for", icon: "🙏" },
      { title: "Mindful Listening", description: "Close your eyes and notice all the sounds around you", icon: "👂" },
      { title: "Progressive Relaxation", description: "Tense and release each muscle group", icon: "😮‍💨" },
      { title: "Visualization", description: "Picture your favorite peaceful place", icon: "🏖️" },
      { title: "Counting Breath", description: "Count each exhale up to 10, then restart", icon: "🔢" },

      // Hydration & nutrition
      { title: "Drink Water", description: "Stay hydrated! Grab a glass of water", icon: "💧" },
      { title: "Have Some Tea", description: "Make yourself a cup of herbal tea", icon: "🍵" },
      { title: "Healthy Snack", description: "Grab some nuts, fruit, or veggies", icon: "🥕" },
      { title: "Refill Your Water", description: "Top up your water bottle for the next session", icon: "🚰" },

      // Movement
      { title: "Walk Around", description: "Take a quick lap around your space", icon: "🚶" },
      { title: "Quick Dance", description: "Put on your favorite song and move!", icon: "💃" },
      { title: "Shake It Out", description: "Shake your hands, arms, and legs vigorously", icon: "🫨" },
      { title: "March in Place", description: "March with arm swings for 1 minute", icon: "🎖️" },
      { title: "Go Outside", description: "Step outside for some fresh air", icon: "🌳" },
      { title: "Climb Stairs", description: "Go up and down the stairs a few times", icon: "🪜" },
      { title: "Balance Practice", description: "Stand on one foot for 30 seconds each side", icon: "⚖️" },

      // Self-care
      { title: "Wash Your Face", description: "Splash some cold water on your face", icon: "🧊" },
      { title: "Hand Massage", description: "Massage your palms and fingers for 1 minute", icon: "💆" },
      { title: "Apply Eye Drops", description: "Refresh your eyes if they feel dry", icon: "💧" },
      { title: "Fix Your Posture", description: "Sit up straight, shoulders back, chin tucked", icon: "🪑" },
      { title: "Smile Wide", description: "Hold a big smile for 30 seconds - it boosts mood!", icon: "😊" },
      { title: "Jaw Relaxation", description: "Open mouth wide, then relax - release tension", icon: "😮" },

      // Mental refresh
      { title: "Doodle Something", description: "Draw anything for 2 minutes - no judgment", icon: "✏️" },
      { title: "Listen to Music", description: "Play your favorite uplifting song", icon: "🎵" },
      { title: "Look at Nature", description: "Watch clouds, trees, or birds for a moment", icon: "🌿" },
      { title: "Pet Your Pet", description: "Give your furry friend some love", icon: "🐱" },
      { title: "Tidy Your Desk", description: "Quick 2-minute desk cleanup", icon: "🗂️" },
      { title: "Text Someone", description: "Send a quick hello to a friend or family", icon: "📱" },
      { title: "Plan Something Fun", description: "Think about something you're looking forward to", icon: "🎉" },
      { title: "Read a Page", description: "Read one page of a book you enjoy", icon: "📖" }
    ];

    // Track last shown suggestion to avoid repetition
    this.lastSuggestionIndex = -1;

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

    // Prevent media keys from controlling this audio
    // Override MediaSession to ignore system media controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;

      // Set action handlers to do nothing (prevents default behavior)
      const noopHandler = () => {
        // If running and in focus mode, keep playing
        if (this.isRunning && this.isFocusMode) {
          this.elements.audioPlayer.play().catch(() => {});
        }
      };

      navigator.mediaSession.setActionHandler('play', noopHandler);
      navigator.mediaSession.setActionHandler('pause', noopHandler);
      navigator.mediaSession.setActionHandler('stop', noopHandler);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }

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
    // Ensure we don't show the same suggestion twice in a row
    let index;
    do {
      index = Math.floor(Math.random() * this.restSuggestions.length);
    } while (index === this.lastSuggestionIndex && this.restSuggestions.length > 1);

    this.lastSuggestionIndex = index;
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
