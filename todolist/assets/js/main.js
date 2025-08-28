const todoInput = document.getElementById("todoInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const todoList = document.getElementById("todoList");

// 오늘 날짜 구하기
function getToday() {
  const today = new Date();
  const year = today.getFullYear(); // 년도 반환
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 5 -> 05, 두자리 수로 반환
  const day = String(today.getDate()).padStart(2, "0"); // 5 -> 05, 두자리 수로 반환
  return `${year}-${month}-${day}`;
}

dateInput.min = getToday(); // 이전 날짜는 선택할 수 없게 min을 오늘 날짜로 설정

// 일정 추가
function addTodo() {
  const text = todoInput.value.trim(); // 일정 입력값
  const date = dateInput.value; // 날짜 입력값
  const time = timeInput.value; // 시간 입력값

  if (text === "" || date === "" || time === "") { // 일정, 날짜, 시간 중 하나를 입력하지않았을 때 바로 리턴
    alert("할 일, 날짜, 시간을 모두 입력하세요");
    return;
  }

  // 날짜 포맷팅
  const [year, month, day] = date.split("-"); // "-" 기준으로 year, month, day 할당
  const formattedDate = `${month}월 ${day}일`; // 2025-12-23 -> 12월 23일 변경

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${formattedDate} ${time} - ${text}</span>
    <button class="delete-btn" onclick="deleteTodo(this)">삭제</button>
  `; // li에 일정 콘텐츠 추가
  todoList.appendChild(li); // ul 요소인 todoList에 자식 요소로 li 추가

  // 입력창 초기화
  todoInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
}

// 일정 삭제
function deleteTodo(button) {
  const li = button.parentElement; // 누른 버튼의 부모 요소 li를 가져옴
  todoList.removeChild(li); // 누른 버튼의 부모 요소 li를 삭제
}