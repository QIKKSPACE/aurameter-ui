class AudioPlaybackManager {
  currentController = null;

  play(controller) {
    // stop currently playing audio
    if (
      this.currentController &&
      this.currentController !== controller
    ) {
      this.currentController.stop?.();
    }

    this.currentController = controller;
  }

  stop(controller) {
    if (this.currentController === controller) {
      this.currentController = null;
    }
  }

  stopCurrent() {
    this.currentController?.stop?.();
    this.currentController = null;
  }
}

export default new AudioPlaybackManager();