export class State {
  constructor() {
    this._data = {};
    this._listeners = new Map();
  }

  set(key, value) {
    this._data[key] = value;
    (this._listeners.get(key) ?? []).forEach(fn => fn(value));
  }

  get(key) { return this._data[key]; }

  subscribe(key, fn) {
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key).push(fn);
    return () => {
      const arr = this._listeners.get(key);
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    };
  }
}
