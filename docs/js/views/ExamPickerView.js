export class ExamPickerView {
  constructor(state, api, certId) {
    this.state  = state;
    this.api    = api;
    this.certId = certId;
  }

  render(container) {
    const cert = this.api.getCertification(this.certId);
    if (!cert) {
      container.innerHTML = '<div class="page"><p>자격증 정보를 찾을 수 없습니다.</p></div>';
      return;
    }

    const examsHtml = [...cert.exams].reverse().map(exam => `
      <div class="exam-picker-option" data-date="${exam.date}">
        <span class="exam-label">${exam.label}</span>
        <span class="exam-meta">${exam.question_count ?? cert.question_count}문제</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="view-header">
        <button class="btn-back" id="backBtn">← 뒤로</button>
        <h1>${cert.name}</h1>
        <span class="mode-label">모의고사</span>
      </div>
      <div class="page">
        <div class="exam-picker-option random-option" id="randomBtn">
          <span class="exam-label">🎲 전체 문제 중 무작위 출제</span>
          <span class="exam-meta">${cert.question_count}문제</span>
        </div>
        <p class="section-heading" style="margin-top: 20px;">기출 연도 선택</p>
        <div class="exam-list">${examsHtml}</div>
      </div>
    `;

    container.querySelector('#backBtn').addEventListener('click', () => {
      window.location.hash = `#/${this.certId}/mode`;
    });

    container.querySelector('#randomBtn').addEventListener('click', () => {
      window.location.hash = `#/${this.certId}/exam/random`;
    });

    container.querySelectorAll('.exam-picker-option[data-date]').forEach(el => {
      el.addEventListener('click', () => {
        window.location.hash = `#/${this.certId}/exam/${el.dataset.date}`;
      });
    });
  }

  destroy() {}
}
