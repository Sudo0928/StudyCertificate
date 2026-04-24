import { QuestionCard }   from '../components/QuestionCard.js';
import { AnswerFeedback } from '../components/AnswerFeedback.js';

export class SingleView {
  constructor(state, api, certId) {
    this.state  = state;
    this.api    = api;
    this.certId = certId;
    this.cert   = api.getCertification(certId);
    this.pool   = [];
    this.idx    = 0;
    this._dead  = false;
  }

  async render(container) {
    this.container = container;

    container.innerHTML = `
      <div class="view-header">
        <button class="btn-back" id="backBtn">← 뒤로</button>
        <h1>${this.cert?.name ?? ''}</h1>
        <span class="mode-label">단일 문제 학습</span>
      </div>
      <div class="question-area" id="qArea">
        <div class="initial-loading"><div class="spinner"></div><p>문제 불러오는 중...</p></div>
      </div>
      <div class="feedback-area hidden" id="fbArea"></div>
      <div class="nav-row">
        <button class="btn btn-next hidden" id="nextBtn">다음 문제 →</button>
      </div>
    `;

    container.querySelector('#backBtn').addEventListener('click', () => {
      window.location.hash = `#/${this.certId}/mode`;
    });

    try {
      this.pool = await this.api.getRandomQuestions(this.certId, 200);
      if (!this._dead) this._renderQuestion();
    } catch (e) {
      if (!this._dead) {
        container.querySelector('#qArea').innerHTML =
          `<p style="color:var(--color-error);padding:20px">오류: ${e.message}</p>`;
      }
    }
  }

  _renderQuestion() {
    if (this._dead) return;
    const q = this.pool[this.idx];
    const qArea = this.container.querySelector('#qArea');
    const fbArea = this.container.querySelector('#fbArea');
    const nextBtn = this.container.querySelector('#nextBtn');

    fbArea.classList.add('hidden');
    fbArea.innerHTML = '';
    nextBtn.classList.add('hidden');

    qArea.innerHTML = '';
    const card = new QuestionCard(q, {
      showFeedback: true,
      onAnswer: (selectedKey) => {
        const isCorrect = selectedKey === q.answer;
        const fb = new AnswerFeedback(q, selectedKey, isCorrect);
        fbArea.appendChild(fb.render());
        fbArea.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        setTimeout(() => fbArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      },
    });
    qArea.appendChild(card.render());

    nextBtn.onclick = () => {
      this.idx = (this.idx + 1) % this.pool.length;
      this._renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  destroy() { this._dead = true; }
}
