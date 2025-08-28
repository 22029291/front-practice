const STORAGE_KEY = "users"; // localStorage에 저장할 키

// 저장된 유저 목록 호출
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// 유저 목록 저장
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// 유저 목록 삭제
function deleteUsers() {
  localStorage.clear();
  alert("저장된 유저 목록이 삭제되었습니다.")
  console.log(`저장소 : ${JSON.stringify(getUsers())}`)
}

// 아이디 중복체크
function checkId() {
  const id = document.getElementById("id").value.trim(); // 앞 뒤 공백을 제거한 id 입력값
  const msg = document.getElementById("idMsg"); // id 아래 성공/실패 메세지를 위한 요소
  if (id === "") { // ID를 입력하지않았을 때
    msg.textContent = "아이디를 입력해주세요.";
    msg.className = "msg error";
    return false;
  }
  const users = getUsers();
  if (users.some(u => u.id === id)) { // ID가 이미 존재할 때
    msg.textContent = "이미 존재하는 아이디입니다.";
    msg.className = "msg error";
    return false;
  } else { // ID가 사용 가능할 때
    msg.textContent = "사용 가능한 아이디입니다.";
    msg.className = "msg success";
    return true;
  }
}

// 비밀번호 체크
function validatePassword() {
  const pw = document.getElementById("password").value; // 입력한 비밀번호 값
  const msg = document.getElementById("passwordMsg"); // pw 아래 성공/실패 메세지를 위한 요소

  const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/; // 비밀번호 규칙 -> 8~20자, 영문+숫자+특수문자 필수

  if (pattern.test(pw)) { // 지정한 패턴을 통해 pw가 규칙에 맞게 들어왔는지 확인
    msg.textContent = "안전한 비밀번호입니다.";
    msg.className = "msg success";
    return true;
  } else {
    msg.textContent = "비밀번호는 8~20자, 영문+숫자+특수문자를 포함해야 합니다.";
    msg.className = "msg error";
    return false;
  }
}

// 폼 제출
document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault(); // 새로고침이 되지않도록 기본 동작 막음

  const username = document.getElementById("username").value.trim(); // 앞뒤 공백을 제거한 이름 입력값
  const id = document.getElementById("id").value.trim(); // 앞뒤 공백을 제거한 ID 입력값
  const pw = document.getElementById("password").value; // PW 입력값

  // 아이디 & 비밀번호 체크
  if (!checkId() || !validatePassword()) { // submit할 때 마지막 검사
    alert("입력값을 확인해주세요.");
    return;
  }

  // 유저 목록에 추가
  const users = getUsers(); // 로컬저장소 리스트 호출
  users.push({username, id, pw}); // 호출한 리스트에 push
  saveUsers(users); // 추가된 리스트를 다시 로컬저장소에 저장
  console.log(`저장소 : ${JSON.stringify(getUsers(), null, 2)}`) // 저장된 목록 확인

  alert("회원가입 완료!");
  this.reset(); // reset을 통해 현재 form에 입력된 값을 지움
  document.getElementById("idMsg").textContent = ""; // id 상태 메세지 초기화
  document.getElementById("passwordMsg").textContent = ""; // pw 상태 메세지 초기화
});