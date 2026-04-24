function esc(str) {
  return (str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class AnswerFeedback {
  constructor(question, selectedKey, isCorrect) {
    this.q = question;
    this.selectedKey = selectedKey;
    this.isCorrect = isCorrect;
  }

  render() {
    const el = document.createElement('div');
    el.className = `answer-feedback ${this.isCorrect ? 'correct' : 'wrong'} slide-up`;

    const exp = this.q.explanation;
    const wrongReason = (!this.isCorrect && exp?.why_wrong?.[String(this.selectedKey)])
      ? `<div class="why-wrong"><strong>선택한 답이 틀린 이유:</strong> ${esc(exp.why_wrong[String(this.selectedKey)])}</div>`
      : '';

    const explanationHTML = exp
      ? `<div class="explanation-body">
           <div class="correct-summary">${esc(exp.correct_summary)}</div>
           ${wrongReason}
           <details class="full-explanation">
             <summary>자세한 해설 보기</summary>
             <p>${esc(exp.why_correct).replace(/\n/g, '<br>')}</p>
           </details>
           <div class="key-concept">핵심 개념: <strong>${esc(exp.key_concept)}</strong></div>
         </div>`
      : '<p class="no-exp">해설이 아직 준비되지 않았습니다.</p>';

    el.innerHTML = `
      <div class="feedback-header">
        <span class="result-icon">${this.isCorrect ? '✓' : '✗'}</span>
        <span class="result-text">${this.isCorrect ? '정답입니다!' : `오답 (정답: ${this.q.answer}번)`}</span>
      </div>
      ${explanationHTML}
    `;

    return el;
  }
}
