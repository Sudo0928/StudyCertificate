export class Timer {
  constructor(seconds, onExpire) {
    this.remaining = seconds;
    this.onExpire = onExpire;
    this._id = null;
    this.el = null;
    this._started = false;
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'timer';
    this._update();
    return this.el;
  }

  start() {
    if (this._started) return;
    this._started = true;
    this._id = setInterval(() => {
      this.remaining--;
      this._update();
      if (this.remaining <= 300) this.el?.classList.add('urgent');
      if (this.remaining <= 0) { this.stop(); this.onExpire?.(); }
    }, 1000);
  }

  stop() {
    clearInterval(this._id);
    this._id = null;
  }

  _update() {
    if (!this.el) return;
    const m = String(Math.floor(this.remaining / 60)).padStart(2, '0');
    const s = String(this.remaining % 60).padStart(2, '0');
    this.el.textContent = `⏱ ${m}:${s}`;
  }
}
