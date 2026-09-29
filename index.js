// ================= 게임 데이터 =================
const SUBJECTS = ['국어', '영어', '수학', '코딩', '사회', '과학', '도덕', '음악', '기가', '미술'];
const PRIMES = [2, 3, 5, 7, 11];
const BOOK_COLORS = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

let currentSubject = '';
let initialNumber = 0;
let currentNumber = 0;
let mistakeCount = 0;
let chosenFactors = [];
let comboCount = 0;

// ================= DOM 참조 =================
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');

const subjectDisplay = document.getElementById('subject-display');
const mistakeCountDisplay = document.getElementById('mistake-count');
const currentNumberDisplay = document.getElementById('current-number');
const numberCard = document.getElementById('number-card');
const formulaDisplay = document.getElementById('formula-display');
const bookStack = document.getElementById('book-stack');
const comboBadge = document.getElementById('combo-badge');

const gameAvatar = document.getElementById('game-avatar');
const avatarFace = document.getElementById('avatar-face');
const avatarShirt = document.getElementById('avatar-shirt');
const browLeft = document.getElementById('brow-left');
const browRight = document.getElementById('brow-right');
const mouth = document.getElementById('mouth');

const gameSpeech = document.getElementById('game-speech');
const primeButtons = document.querySelectorAll('.prime-btn');
const changeSubjectBtn = document.getElementById('change-subject-btn');

const interactionBox = document.getElementById('interaction-box');
const choiceButtons = document.getElementById('choice-buttons');
const apologizeBtn = document.getElementById('apologize-btn');
const talkbackBtn = document.getElementById('talkback-btn');
const restartBtn = document.getElementById('restart-btn');

// ================= 🔊 풍성한 효과음 재생기 (4번 기능) =================
function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'slice') { // 나눌 때 잘리는 소리
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') { // 일반 성공
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'special') { // ⭐ 10단위 숫자의 경쾌한 소리
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'combo') { // 콤보 성공
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659, audioCtx.currentTime);
      osc.frequency.setValueAtTime(987, audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') { // 오답
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      osc.frequency.setValueAtTime(110, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {}
}

// ================= 30~200 합성수 생성기 =================
function generateValidCompositeNumber() {
  const validNumbers = [];
  for (let n = 30; n <= 200; n++) {
    let temp = n;
    for (let p of PRIMES) {
      while (temp % p === 0) temp /= p;
    }
    if (temp === 1) validNumbers.push(n);
  }
  return validNumbers[Math.floor(Math.random() * validNumbers.length)];
}

// ================= 📚 시각적 숙제 더미 렌더링 =================
function renderBookStack() {
  bookStack.innerHTML = '';
  const displayCount = Math.max(1, Math.min(12, Math.ceil(currentNumber / 15)));
  
  for (let i = 0; i < displayCount; i++) {
    const book = document.createElement('div');
    book.className = 'book-item';
    const color = BOOK_COLORS[i % BOOK_COLORS.length];
    const width = 60 + (i % 3) * 5;
    book.style.backgroundColor = color;
    book.style.width = `${width}%`;
    bookStack.appendChild(book);
  }
}

// ================= 💬 표정 및 다양한 말풍선 종류 설정 =================
function setDoyoonState(expression, bubbleType, text) {
  gameAvatar.classList.remove('dance-anim');
  avatarFace.setAttribute('fill', '#ffe0b2');
  avatarShirt.setAttribute('fill', '#42a5f5');
  
  // 말풍선 클래스 초기화 후 새로 적용
  gameSpeech.className = `speech-bubble ${bubbleType}`;
  gameSpeech.textContent = text;

  if (expression === 'normal') {
    browLeft.setAttribute('d', 'M 32 40 Q 38 38 44 40');
    browRight.setAttribute('d', 'M 56 40 Q 62 38 68 40');
    mouth.setAttribute('d', 'M 43 58 Q 50 64 57 58');
  } else if (expression === 'happy') {
    browLeft.setAttribute('d', 'M 32 37 Q 38 34 44 37');
    browRight.setAttribute('d', 'M 56 37 Q 62 34 68 37');
    mouth.setAttribute('d', 'M 40 56 Q 50 68 60 56');
  } else if (expression === 'dance') { // 💃 춤추기
    gameAvatar.classList.add('dance-anim');
    browLeft.setAttribute('d', 'M 32 35 Q 38 30 44 35');
    browRight.setAttribute('d', 'M 56 35 Q 62 30 68 35');
    mouth.setAttribute('d', 'M 40 54 Q 50 70 60 54');
  } else if (expression === 'sad') {
    browLeft.setAttribute('d', 'M 32 38 Q 38 42 44 40');
    browRight.setAttribute('d', 'M 56 40 Q 62 42 68 38');
    mouth.setAttribute('d', 'M 43 62 Q 50 55 57 62');
  } else if (expression === 'angry') {
    avatarFace.setAttribute('fill', '#ffcdd2');
    browLeft.setAttribute('d', 'M 32 36 L 44 43');
    browRight.setAttribute('d', 'M 56 43 L 68 36');
    mouth.setAttribute('d', 'M 40 64 Q 50 52 60 64');
  }
}

// ================= 게임 초기화 =================
function initGame() {
  currentSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  initialNumber = generateValidCompositeNumber();
  currentNumber = initialNumber;
  mistakeCount = 0;
  comboCount = 0;
  chosenFactors = [];

  // UI 업데이트
  subjectDisplay.textContent = `과목: ${currentSubject}`;
  mistakeCountDisplay.textContent = mistakeCount;
  currentNumberDisplay.textContent = currentNumber;
  comboBadge.classList.add('hidden');

  // 처음 시작할 때도 10 단위 숫자 검사
  if (currentNumber % 10 === 0) {
    setDoyoonState('dance', 'bubble-special', '오! 딱 틀어맞는 좋은 숫자다!');
  } else {
    setDoyoonState('normal', 'bubble-normal', `내 ${currentSubject} 숙제가 ${initialNumber}개 있어! 줄여줘!`);
  }

  updateFormulaDisplay();
  renderBookStack();

  interactionBox.classList.add('hidden');
  choiceButtons.classList.add('hidden');
  restartBtn.classList.add('hidden');
  enablePrimeButtons(true);
}

// ================= 공식 업데이트 =================
function updateFormulaDisplay() {
  if (chosenFactors.length === 0) {
    formulaDisplay.textContent = `${initialNumber} = `;
  } else {
    const factorString = chosenFactors.join(' × ');
    formulaDisplay.textContent = (currentNumber === 1) 
      ? `${initialNumber} = ${factorString}` 
      : `${initialNumber} = ${factorString} × ${currentNumber}`;
  }
}

function enablePrimeButtons(enable) {
  primeButtons.forEach(btn => btn.disabled = !enable);
}

// ================= 💥 숫자 슬라이스 애니메이션 연출 (4번) =================
function triggerSliceAnimation(prime) {
  // 숫자 카드 팝핑
  currentNumberDisplay.classList.remove('number-pop');
  void currentNumberDisplay.offsetWidth; // 리플로우
  currentNumberDisplay.classList.add('number-pop');

  // 날아가는 ÷소수 파티클 생성
  const particle = document.createElement('div');
  particle.className = 'slice-particle';
  particle.textContent = `÷${prime}`;
  numberCard.appendChild(particle);

  setTimeout(() => particle.remove(), 600);
}

// ================= 소수 나눗셈 실행 =================
function handleDivide(prime) {
  if (currentNumber % prime === 0) {
    // 정답!
    playSound('slice'); // 잘리는 소리
    triggerSliceAnimation(prime); // 슬라이스 연출

    currentNumber /= prime;
    chosenFactors.push(prime);
    comboCount++;

    updateFormulaDisplay();
    currentNumberDisplay.textContent = currentNumber;
    renderBookStack();

    if (currentNumber === 1) {
      handleVictory();
    } else if (currentNumber % 10 === 0) { 
      // ⭐ 10 단위 숫자 이벤트 (10, 20, 30, 40, 50, 100 등)
      playSound('special');
      setDoyoonState('dance', 'bubble-special', '오! 딱 틀어맞는 좋은 숫자다!');
    } else if (comboCount >= 2) {
      // 🔥 콤보 피버 댄스
      playSound('combo');
      comboBadge.textContent = `${comboCount} COMBO! 🔥`;
      comboBadge.classList.remove('hidden');
      setDoyoonState('dance', 'bubble-dance', `우와! ${comboCount}연속 성공! 오늘 일찍 자겠는데?!`);
    } else {
      // 일반 성공
      playSound('success');
      comboBadge.classList.add('hidden');
      setDoyoonState('happy', 'bubble-happy', `좋았어! ${prime}(으)로 나누어졌어!`);
      setTimeout(() => {
        if (currentNumber % 10 !== 0 && currentNumber !== 1) {
          setDoyoonState('normal', 'bubble-normal', '다음 소수로 또 나누어줘!');
        }
      }, 1200);
    }
  } else {
    // 오답
    playSound('wrong');
    comboCount = 0;
    comboBadge.classList.add('hidden');
    mistakeCount++;
    mistakeCountDisplay.textContent = mistakeCount;

    gameScreen.classList.add('shake');
    setTimeout(() => gameScreen.classList.remove('shake'), 350);

    if (mistakeCount >= 5) {
      handleGameOver();
    } else {
      setDoyoonState('sad', 'bubble-sad', `${currentNumber}은(는) ${prime}(으)로 안 나눠져! (실패: ${mistakeCount}/5)`);
    }
  }
}

// ================= 게임 성공 =================
function handleVictory() {
  enablePrimeButtons(false);
  comboBadge.classList.add('hidden');
  playSound('special');
  setDoyoonState('happy', 'bubble-happy', '내 숙제를 다 줄였어! 완벽해!');

  interactionBox.classList.remove('hidden');
  restartBtn.textContent = '도윤이의 숙제 다시 줄여주기';
  restartBtn.classList.remove('hidden');
}

// ================= 게임 실패 =================
function handleGameOver() {
  enablePrimeButtons(false);
  comboBadge.classList.add('hidden');
  setDoyoonState('sad', 'bubble-sad', '내 숙제 줄여준다고 했잖아!!');

  interactionBox.classList.remove('hidden');
  choiceButtons.classList.remove('hidden');
}

// ================= 이벤트 리스너 =================

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initGame();
});

primeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const prime = parseInt(button.getAttribute('data-prime'));
    handleDivide(prime);
  });
});

changeSubjectBtn.addEventListener('click', () => initGame());

// 사과하기
apologizeBtn.addEventListener('click', () => {
  choiceButtons.classList.add('hidden');
  setDoyoonState('happy', 'bubble-happy', '알았어. 한 번 봐줄게');

  restartBtn.textContent = '도윤이의 숙제 다시 줄여주기';
  restartBtn.classList.remove('hidden');
});

// 말대답하기
talkbackBtn.addEventListener('click', () => {
  playSound('wrong');
  choiceButtons.classList.add('hidden');
  setDoyoonState('angry', 'bubble-angry', '야!!!!! 너 자꾸 말대답할래?!!!!!');

  restartBtn.textContent = '반성하고 도윤이 숙제 다시 줄여주기';
  restartBtn.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => initGame());