const SUBJECT_NAMES = {
  tcpip:     'TCP/IP',
  general:   '네트워크 일반',
  nos:       'NOS',
  equipment: '네트워크 운용기기',
  security:  '정보보호개론',
};

function esc(s) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class ScoreBoard {
  constructor(questions, userAnswers) {
    this.questions = questions;
    this.answers   = userAnswers;
  }

  render() {
    const total   = this.questions.length;
    const correct = this.questions.filter((q, i) => this.answers[i] === q.answer).length;
    const pct     = Math.round(correct / total * 100);
    const passed  = pct >= 60;

    // Per-subject stats
    const bySubject = {};
    this.questions.forEach((q, i) => {
      const s = q.subject_id ?? 'unknown';
      if (!bySubject[s]) bySubject[s] = { total: 0, correct: 0 };
      bySubject[s].total++;
      if (this.answers[i] === q.answer) bySubject[s].correct++;
    });

    const wrongList = this.questions
      .map((q, i) => ({ q, i, userAns: this.answers[i] }))
      .filter(({ q, i }) => this.answers[i] !== q.answer);

    const el = document.createElement('div');
    el.className = 'score-board fade-in';

    el.innerHTML = `
      <div class="score-header ${passed ? 'pass' : 'fail'}">
        <h2>${passed ? '합격' : '불합격'}</h2>
        <div class="score-big">${correct} / ${total} (${pct}점)</div>
        <div class="pass-hint">합격 기준: 60점 이상</div>
      </div>

      <h3 class="section-heading">과목별 성적</h3>
      <table class="subject-table">
        <thead>
          <tr><th>과목</th><th>맞음</th><th>틀림</th><th>정답률</th></tr>
        </thead>
        <tbody>
          ${Object.entries(bySubject).map(([sid, d]) => `
            <tr>
              <td>${SUBJECT_NAMES[sid] ?? sid}</td>
              <td class="correct-cell">${d.correct}</td>
              <td class="wrong-cell">${d.total - d.correct}</td>
              <td>${Math.round(d.correct / d.total * 100)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${wrongList.length > 0 ? `
        <h3 class="section-heading">오답 복습 (${wrongList.length}문제)</h3>
        <div class="wrong-list">
          ${wrongList.map(({ q, userAns }) => `
            <div class="wrong-item">
              <div class="wrong-qtext">${esc(q.text)}</div>
              <div class="wrong-answer">내 답: ${userAns ?? '미답변'} / 정답: ${q.answer}</div>
              ${q.explanation ? `<div class="wrong-exp">${esc(q.explanation.correct_summary)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="score-actions">
        <button class="btn btn-secondary" id="homeBtn">← 홈으로</button>
        <button class="btn btn-primary" id="retryBtn">다시 풀기</button>
      </div>
    `;

    el.querySelector('#homeBtn').addEventListener('click', () => {
      window.location.hash = '#/';
    });
    el.querySelector('#retryBtn').addEventListener('click', () => {
      history.back();
    });

    return el;
  }
}
