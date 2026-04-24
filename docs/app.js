import { Router }          from './js/router.js';
import { State }            from './js/state.js';
import { DataAPI }          from './js/api.js';
import { HomeView }         from './js/views/HomeView.js';
import { ModeView }         from './js/views/ModeView.js';
import { ExamPickerView }   from './js/views/ExamPickerView.js';
import { SingleView }       from './js/views/SingleView.js';
import { ExamView }         from './js/views/ExamView.js';

async function boot() {
  const state = new State();
  const api   = new DataAPI('./data/');

  await api.loadIndex();
  state.set('certifications', api.getCertifications());

  const router = new Router({
    '/':                        ()                  => new HomeView(state, api),
    '/:certId/mode':            ({ certId })        => new ModeView(state, api, certId),
    '/:certId/single':          ({ certId })        => new SingleView(state, api, certId),
    '/:certId/exam':            ({ certId })        => new ExamPickerView(state, api, certId),
    '/:certId/exam/random':     ({ certId })        => new ExamView(state, api, certId, 'random'),
    '/:certId/exam/:date':      ({ certId, date })  => new ExamView(state, api, certId, date),
  });

  const app = document.getElementById('app');
  router.mount(app);
  router.start();
}

boot().catch(err => {
  document.getElementById('app').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:60vh;gap:16px;color:#64748B;font-family:sans-serif">
      <p style="font-size:18px;font-weight:700;color:#DC2626">로딩 오류</p>
      <p>${err.message}</p>
      <button onclick="location.reload()" style="padding:8px 20px;border:1px solid #E2E8F0;
              border-radius:8px;cursor:pointer;background:#fff">새로고침</button>
    </div>
  `;
});
