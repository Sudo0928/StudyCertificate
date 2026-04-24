export class DataAPI {
  constructor(basePath = './data/') {
    this.basePath = basePath;
    this.index = null;
    this.cache = new Map();
  }

  async loadIndex() {
    if (this.index) return this.index;
    const res = await fetch(this.basePath + 'index.json');
    if (!res.ok) throw new Error('index.json 로드 실패');
    this.index = await res.json();
    return this.index;
  }

  getCertifications() {
    return this.index?.certifications ?? [];
  }

  getCertification(certId) {
    return this.getCertifications().find(c => c.id === certId) ?? null;
  }

  async loadExam(certId, date) {
    const key = `${certId}/${date}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const cert = this.getCertification(certId);
    if (!cert) throw new Error(`알 수 없는 자격증: ${certId}`);

    const url = this.basePath + cert.data_path + date + '.json';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`시험 데이터 로드 실패: ${date}`);

    const exam = await res.json();
    this.cache.set(key, exam);
    return exam;
  }

  async getRandomQuestions(certId, count) {
    const cert = this.getCertification(certId);
    if (!cert) throw new Error(`알 수 없는 자격증: ${certId}`);

    const allDates = cert.exams.map(e => e.date);
    const shuffledDates = shuffle([...allDates]);

    const pool = [];
    for (const date of shuffledDates) {
      if (pool.length >= count * 3) break;
      try {
        const exam = await this.loadExam(certId, date);
        pool.push(...exam.questions);
      } catch (_) { /* skip failed loads */ }
    }

    return shuffle(pool).slice(0, count);
  }

  async getRandomQuestionsBySubject(certId, subjectCounts) {
    const cert = this.getCertification(certId);
    if (!cert) throw new Error(`알 수 없는 자격증: ${certId}`);

    // Load all questions grouped by subject
    const bySubject = {};
    for (const sub of cert.subjects) bySubject[sub.id] = [];

    const allDates = shuffle([...cert.exams.map(e => e.date)]);
    for (const date of allDates) {
      try {
        const exam = await this.loadExam(certId, date);
        for (const q of exam.questions) {
          if (bySubject[q.subject_id]) {
            bySubject[q.subject_id].push(q);
          }
        }
      } catch (_) { /* skip */ }
    }

    const result = [];
    for (const [subId, count] of Object.entries(subjectCounts)) {
      const pool = shuffle(bySubject[subId] ?? []);
      result.push(...pool.slice(0, count));
    }

    return shuffle(result);
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
