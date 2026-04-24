export class ModeView {
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

    container.innerHTML = `
      <div class="view-header">
        <button class="btn-back" id="backBtn">← 뒤로</button>
        <h1>${cert.name}</h1>
      </div>
      <div class="page">
        <p class="section-heading">학습 모드 선택</p>
        <div class="mode-grid stagger">
          <div class="mode-card fade-in" id="singleMode">
            <span class="mode-icon">📝</span>
            <h3>단일 문제 학습</h3>
            <p>한 문제씩 풀며 즉시 정답과 해설을 확인합니다.</p>
          </div>
          <div class="mode-card fade-in" id="examMode">
            <span class="mode-icon">⏱</span>
            <h3>실전 모의고사</h3>
            <p>실제 시험처럼 제한 시간 안에 전체 문제를 풉니다.</p>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#backBtn').addEventListener('click', () => {
      window.location.hash = '#/';
    });
    container.querySelector('#singleMode').addEventListener('click', () => {
      window.location.hash = `#/${this.certId}/single`;
    });
    container.querySelector('#examMode').addEventListener('click', () => {
      window.location.hash = `#/${this.certId}/exam`;
    });
  }

  destroy() {}
}
