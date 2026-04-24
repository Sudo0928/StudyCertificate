export class Router {
  constructor(routes) {
    this.routes = Object.entries(routes).map(([pattern, factory]) => ({
      regex: patternToRegex(pattern),
      params: extractParams(pattern),
      factory,
    }));
    this.currentView = null;
    this.container = null;
  }

  mount(container) {
    this.container = container;
  }

  start() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  }

  navigate(path) {
    window.location.hash = '#' + path;
  }

  _resolve() {
    const path = decodeURIComponent(window.location.hash.slice(1)) || '/';

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (!match) continue;

      const params = {};
      route.params.forEach((name, i) => { params[name] = match[i + 1]; });

      this.currentView?.destroy?.();
      this.container.innerHTML = '';
      this.currentView = route.factory(params);
      this.currentView.render(this.container);
      window.scrollTo(0, 0);
      return;
    }

    this.container.innerHTML = '<div class="page"><p style="color:var(--color-text-muted)">페이지를 찾을 수 없습니다.</p></div>';
  }
}

function patternToRegex(pattern) {
  const esc = pattern
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  return new RegExp(`^${esc}$`);
}

function extractParams(pattern) {
  return [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
}
