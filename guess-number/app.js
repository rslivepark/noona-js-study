let randomNumber = Math.floor(Math.random() * 100 + 1);
// console.log(randomNumber);

const form = document.querySelector('.input > form');
const userInput = document.querySelector('.input > form input');
const checkButton = document.querySelector('.check_button');
const resultMessage = document.querySelector('.result_message');
const retryButton = document.querySelector('.retry_button');
const leftChanceDisplay = document.querySelector('.left_chance');
const resultBox = document.querySelector('.result_box');
const scoreDisplay = document.querySelector('.score');

let chance = 5;
let userInputArray = [];

// 남은 기회 표시 초기화
leftChanceDisplay.innerText = chance;

// 메시지 표시 함수
const showMessage = (message, color = '#fafafa') => {
  resultMessage.style.display = 'block';
  resultMessage.innerText = message;
  resultMessage.style.color = color;
};

// 게임 리셋 함수
const gameReset = () => {
  randomNumber = Math.floor(Math.random() * 100 + 1);
  console.log(randomNumber);

  chance = 5;
  userInputArray = [];
  checkButton.disabled = false;
  userInput.value = '';
  retryButton.style.display = 'none';
  leftChanceDisplay.innerText = chance;
  resultMessage.style.display = 'none';
  resultMessage.style.color = '#fafafa';
  resultBox.innerHTML = `<span>정답</span><span class='answer'>?</span>`;
  scoreDisplay.style.display = 'block';
};

// 기회 차감 및 체크 함수
const checkGuess = (userNumber) => {
  if (randomNumber === userNumber) {
    showMessage('축하합니다! 🎉🎉', '#dc3545');
    resultBox.innerHTML = `<span>정답</span><span class='answer'>${randomNumber}</span>`;
    checkButton.disabled = true;
    scoreDisplay.style.display = 'none';
    retryButton.style.display = 'block';
  } else {
    showMessage(
      randomNumber > userNumber ? '그보다 큰 숫자...' : '그보다 작은 숫자...'
    );
    chance--;
    leftChanceDisplay.innerText = chance;
    if (chance === 0) {
      showMessage('남은 기회가 없습니다.', '#dc3545');
      checkButton.disabled = true;
      resultBox.innerHTML = `<span>정답</span><span class='answer'>${randomNumber}</span>`;
      scoreDisplay.style.display = 'none';
      retryButton.style.display = 'block';
    }
  }
};

// 폼 제출 이벤트 핸들러
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const userNumber = Number(userInput.value);

  // 중복 입력 확인
  if (userInputArray.includes(userNumber)) {
    alert('이미 입력한 숫자입니다!');
    return;
  }

  // 입력 숫자 검증
  if (userNumber < 1 || userNumber > 100) {
    alert('1~100사이 숫자를 입력해주세요!');
    return;
  }

  userInputArray.push(userNumber);
  checkGuess(userNumber);
  userInput.value = '';
});

// 리셋 버튼 클릭 이벤트 핸들러
retryButton.addEventListener('click', gameReset);
