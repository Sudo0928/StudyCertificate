import { Timer }      from '../components/Timer.js';
import { QuestionCard } from '../components/QuestionCard.js';
import { ScoreBoard }   from '../components/ScoreBoard.js';

const EXAM_TIME = { na1: 3600, na2: 3000 }; // 60 min / 50 min

export class ExamView {
  constructor(state, api, certId, dateOrRandom) {
    this.state   = state;
    this.api     = api;
    this.certId  = certId;
    this.mode    = dateOrRandom;
    this.cert    = api.getCertification(certId);
    this.questions = [];
    this.answers   = [];
    this.curIdx    = 0;
    this.submitted = false;
    this.timer     = null;
    this._dead     = false;
  }

  async render(container) {
    this.container = container;
    container.innerHTML = '<div class="loading-screen"><div class="spinner"></div><p>시험 로딩 중...</p></div>';

    try {
      if (this.mode === 'random') {
        this.questions = await this.api.getRandomQuestions(
          this.certId, this.cert?.question_count ?? 50
        );
      } else {
        const exam = await this.api.loadExam(this.certId, this.mode);
        this.questions = exam.questions;
      }
      this.answers = new Array(this.questions.length).fill(null);
      if (!this._dead) this._renderExam();
    } catch (e) {
      if (!this._dead)
        container.innerHTML = `<div class="page"><p style="color:var(--color-error)">로드 실패: ${e.message}</p></div>`;
    }
  }

  _renderExam() {
    const n    = this.questions.length;
    const secs = EXAM_TIME[this.certId] ?? 3000;

    this.container.innerHTML = `
      <div class="exam-view">
        <div class="exam-header">
          <div class="exam-meta">
            <div class="exam-title">${this._title()}</div>
          </div>
          <div id="timerSlot"></div>
        </div>
        <div class="exam-question-slot" id="qSlot"></div>
        <div class="exam-nav">
          <div class="q-grid" id="qGrid"></div>
        </div>
        <div class="exam-footer">
          <button class="btn btn-submit" id="submitBtn">제출하기</button>
        </div>
      </div>
    `;

    this.timer = new Timer(secs, () => this._submit(true));
    this.container.querySelector('#timerSlot').appendChild(this.timer.render());
    this.timer.start();

    this._renderGrid();
    this._renderCurrent();

    this.container.querySelector('#submitBtn').addEventListener('click', () => this._confirmSubmit());
  }

  _renderCurrent() {
    const q    = this.questions[this.curIdx];
    const slot = this.container.querySelector('#qSlot');
    if (!slot) return;

    slot.innerHTML = '';
    const card = new QuestionCard(q, {
      showFeedback: false,
      selectedKey:  this.answers[this.curIdx],
      number:       this.curIdx + 1,
      onAnswer: (key) => {
        this.answers[this.curIdx] = key;
        this._renderGrid();
        // Auto-advance
        if (this.curIdx < this.questions.length - 1) {
          this.curIdx++;
          this._renderCurrent();
          this._renderGrid();
        }
      },
    });
    slot.appendChild(card.render());
    slot.scrollIntoView({ block: 'nearest' });
  }

  _renderGrid() {
    const grid = this.container.querySelector('#qGrid');
    if (!grid) return;
    grid.innerHTML = '';
    this.questions.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'q-dot';
      if (this.answers[i] !== null) btn.classList.add('answered');
      if (i === this.curIdx) btn.classList.add('current');
      btn.textContent = i + 1;
      btn.addEventListener('click', () => {
        this.curIdx = i;
        this._renderCurrent();
        this._renderGrid();
      });
      grid.appendChild(btn);
    });
  }

  _confirmSubmit() {
    const unanswered = this.answers.filter(a => a === null).length;
    if (unanswered > 0 && !confirm(`${unanswered}문제가 미답변 상태입니다.\n제출하시겠습니까?`)) return;
    this._submit(false);
  }

  _submit(auto = false) {
    if (this.submitted) return;
    this.submitted = true;
    this.timer?.stop();
    this.container.innerHTML = '';
    const board = new ScoreBoard(this.questions, this.answers);
    this.container.appendChild(board.render());
  }

  _title() {
    if (this.mode === 'random') return '무작위 모의고사';
    const d = this.mode;
    return `${d.slice(0,4)}년 ${d.slice(4,6)}월 ${d.slice(6,8)}일 기출`;
  }

  destroy() {
    this._dead = true;
    this.timer?.stop();
  }
}
