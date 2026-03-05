class AudioPlaybackManager {
  currentPlayer = null;

  play(playerRef) {
    if (this.currentPlayer && this.currentPlayer !== playerRef) {
      this.currentPlayer.pause();
    }
    this.currentPlayer = playerRef;
  }

  stop(playerRef) {
    if (this.currentPlayer === playerRef) {
      this.currentPlayer = null;
    }
  }
}

export default new AudioPlaybackManager();
