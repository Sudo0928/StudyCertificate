import { SubjectBadge } from './SubjectBadge.js';

function esc(str) {
  return (str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class QuestionCard {
  constructor(question, { onAnswer, selectedKey = null, showFeedback = true, number = null }) {
    this.q = question;
    this.onAnswer = onAnswer;
    this.selectedKey = selectedKey;
    this.showFeedback = showFeedback;
    this.number = number;
    this.answered = selectedKey !== null;
    this.el = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'question-card fade-in';

    el.appendChild(SubjectBadge.create(this.q.subject_id));

    if (this.number !== null) {
      const num = document.createElement('div');
      num.className = 'q-number';
      num.style.marginBottom = '8px';
      num.textContent = `문제 ${this.number}`;
      el.appendChild(num);
    }

    const text = document.createElement('p');
    text.className = 'question-text';
    text.innerHTML = esc(this.q.text).replace(/\n/g, '<br>');
    el.appendChild(text);

    const ul = document.createElement('ul');
    ul.className = 'options-list';

    this.q.options.forEach(o => {
      const li = document.createElement('li');
      li.className = 'option-item';
      li.dataset.key = o.key;

      if (this.answered) {
        li.classList.add('answered');
        if (this.showFeedback) {
          if (o.key === this.q.answer)         li.classList.add('correct');
          else if (o.key === this.selectedKey)  li.classList.add('wrong');
        } else if (o.key === this.selectedKey) {
          li.classList.add('selected');
        }
      }

      li.innerHTML = `
        <span class="option-key">${o.key}</span>
        <span class="option-text">${esc(o.text)}</span>
      `;

      li.addEventListener('click', () => {
        if (this.answered) return;
        this.answered = true;
        this.selectedKey = o.key;
        this._highlight(ul);
        this.onAnswer?.(o.key);
      });

      ul.appendChild(li);
    });

    el.appendChild(ul);
    this.el = el;
    return el;
  }

  _highlight(ul) {
    ul.querySelectorAll('.option-item').forEach(item => {
      const k = parseInt(item.dataset.key);
      item.classList.add('answered');
      if (this.showFeedback) {
        if (k === this.q.answer)         item.classList.add('correct');
        else if (k === this.selectedKey)  item.classList.add('wrong');
      } else if (k === this.selectedKey) {
        item.classList.add('selected');
      }
    });
  }
}
