const SUBJECT_NAMES = {
  tcpip:     'TCP/IP',
  general:   '네트워크 일반',
  nos:       'NOS',
  equipment: '네트워크 운용기기',
  security:  '정보보호개론',
};

export const SubjectBadge = {
  create(subjectId) {
    const el = document.createElement('span');
    el.className = `subject-badge ${subjectId}`;
    el.textContent = SUBJECT_NAMES[subjectId] ?? subjectId;
    return el;
  },
};
