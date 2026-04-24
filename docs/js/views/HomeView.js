export class HomeView {
  constructor(state, api) {
    this.state = state;
    this.api   = api;
  }

  render(container) {
    const certs = this.api.getCertifications();

    container.innerHTML = `
      <div class="home-hero">
        <h1>📚 자격증 기출문제 학습</h1>
        <p>기출문제로 자격증 시험을 대비하세요</p>
      </div>
      <div class="page">
        <p class="section-heading">시험 선택</p>
        <div class="cert-grid stagger" id="certGrid"></div>
      </div>
    `;

    const grid = container.querySelector('#certGrid');

    certs.forEach(cert => {
      const card = document.createElement('div');
      card.className = 'cert-card fade-in card-clickable';
      card.innerHTML = `
        <h2>${cert.name}</h2>
        <p class="cert-desc">${cert.name_en}</p>
        <div class="cert-stats">
          <span>📄 ${cert.exams.length}회 기출</span>
          <span>❓ ${cert.question_count}문제/회</span>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.hash = `#/${cert.id}/mode`;
      });
      grid.appendChild(card);
    });
  }

  destroy() {}
}
