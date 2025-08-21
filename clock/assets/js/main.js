/* =========================================
   저장 로직
========================================= */
const STORE_ALARMS = 'alarms.v1';

function getAlarms(){
  try { return JSON.parse(localStorage.getItem(STORE_ALARMS)) || []; }
  catch { return []; }
}
function saveAlarms(list){ localStorage.setItem(STORE_ALARMS, JSON.stringify(list)); }
function addAlarm(time){
  const list = getAlarms(); // 기존에 저장되어있는 알람 목록 리스트로 가져오기
  if(list.length >= 3) return { ok:false, msg:'알람은 최대 3개까지 가능합니다.' };
  const item = { id:crypto.randomUUID(), time, enabled:true }; 
  // crypto.randomUUID를 통해 각각 차별되는 랜덤한 식별자 적용, 활성화된 상태로 저장장
  list.push(item); saveAlarms(list); // 알람을 리스트에 저장하고 리스트를 로컬저장소에 넣어 통합적으로 관리
  return { ok:true, item }; // 알림이 설정되었다는 alert 알림을 띄우기 위해 리턴값 설정
}
function toggleAlarm(id){
  const list = getAlarms(); // 기존에 저장되어있는 알람 목록 리스트로 가져오기
  const t = list.find(a=>a.id===id); // 매개변수로 받은 id와 같은 알람을 찾아오기
  if(!t) return; // 없으면 그냥 종료
  t.enabled = !t.enabled; // 활성/비활성 상태를 변경
  saveAlarms(list); // 수정된 알람 목록을 다시 저장
}
function deleteAlarm(id){ saveAlarms(getAlarms().filter(a=>a.id!==id)); } // 전체 알림 목록을 가져와 필터를 통해 그 알람만 삭제하고 다시 저장

/* =========================================
   공통 로직
========================================= */
const $  = (sel,root=document)=>root.querySelector(sel); // 선택자를 이용하여 찾기 편하도록 사용
const pad2 = n => String(n).padStart(2,'0'); // 두 자리 수로 변환하려고 사용

/* =========================================
   시계
========================================= */
const timeEl = $('#time');
const dateEl = $('#date');
const clockWrap = $('#clockWrap');

function tickClock(){
  const now = new Date();
  const y = now.getFullYear(), m = pad2(now.getMonth()+1), d = pad2(now.getDate()); // 날짜 설정
  const hh = pad2(now.getHours()), mm = pad2(now.getMinutes()), ss = pad2(now.getSeconds()); // 시간 설정
  timeEl.textContent = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  const w = '일월화수목금토'[now.getDay()];
  dateEl.textContent = `${y}년 ${m}월 ${d}일 (${w})`; // getDat로 요일(일월화수목금) 인덱스(0~6)를 받아와서 요일 설정
  checkAlarms(`${hh}:${mm}:${ss}`);
}
setInterval(tickClock, 250); tickClock();

/* =========================================
   배터리 로직
========================================= */
const bFill = document.getElementById('bFill');   // 배터리 게이지
const bTxt  = document.getElementById('bTxt');    // 배터리 % 글자
const batteryBox = document.getElementById('battery'); // 배터리 전체 컨테이너

let batteryValue = 100;   // 현재 배터리 값(%)
let batteryStepMs = 1000; // 배터리 감소 주기(1초)
let batteryTimer = null;  // setInterval을 저장할 변수

function renderBattery(){
  bFill.style.width = `${batteryValue}%`; // 배터리 값을 통해 게이지 길이 맞추기
  bTxt.textContent = `${batteryValue}%`; // 배터리 값을 통해 배터리 % 앞 글자 맞추기
  batteryBox.classList.toggle('low', batteryValue <= 20); // 배터리가 20보다 낮을 때 배터리 
}

function stopBattery(){
  if (batteryTimer !== null) {
    clearInterval(batteryTimer);
    batteryTimer = null;
  }
}

function startBattery(){
  stopBattery();
  batteryTimer = setInterval(()=>{
    if(batteryValue > 0){ // 배터리가 남아 있을 때만 실행
      batteryValue = Math.max(0, batteryValue - 1); // 1씩 감소
      renderBattery(); // 배터리를 감소 적용한 것으로 갱신
      if(batteryValue === 0){
        document.getElementById('clockWrap').classList.add('blackout'); // 배터리가 0일때 블랙아웃 처리
        stopBattery();
      }
    }
  }, batteryStepMs);
}

renderBattery();
startBattery();

/* 절전 모드 */
const powerSave = document.getElementById('powerSave');
powerSave.addEventListener('change', ()=>{
  document.body.classList.toggle('power-save', powerSave.checked); // powerSave가 체크된 상태면 power-save 클래스 추가
  batteryStepMs = powerSave.checked ? 3000 : 1000; // 절전모드가 실행되면 3초로 변경
  startBattery(); // 반영사항 적용
});


/* =========================================
   알람 로직
========================================= */
const panel = $('#alarmPanel');
$('#toggleAlarm').addEventListener('click', ()=>{
  panel.style.display = panel.style.display==='none' ? 'block' : 'none'; 
  // 알람 토글을 클릭했을 때 display가 none이면 block으로 변환 block이면 none으로 바꾸기
});

const listEl = $('#list');
function renderList(){
  const alarms = getAlarms(); // 전체 알람 목록 가져오기
  listEl.innerHTML = '';
  if(alarms.length===0){ // 알람이 없다면 #list에 아래 문장 추가
    listEl.innerHTML = '<div class="note">등록된 알람이 없습니다. 시간을 입력해 추가하세요.</div>';
    return;
  }
  alarms.forEach(a=>{ // 알람 리스트를 순회
    const row = document.createElement('div'); row.className='item'; // 알람 1개를 표시하는 div태그 생성 및 item 클래스를 적용하여 css 적용
    const left = document.createElement('div'); left.className='left'; // 알람 시간과 활성/비활성 상태를 표시하기위해 좌측에 div태그 추가
    left.innerHTML = `<div class="t">${a.time}</div><div class="m">${a.enabled?'활성':'비활성'}</div>`;
    const right = document.createElement('div'); right.style.display='flex'; right.style.gap='8px'; right.style.alignItems='center';
    // 활성/비활성 토글과 삭제버튼을 표시하기 위해 우측에 div 태그 추가, 가로정렬:flex, 버튼 사이 간격:gap, 가운데 정렬:center

    const sw = document.createElement('div'); sw.className='switch'+(a.enabled?' active':''); // div형태의 스위치 생성 로직직
    sw.title='켜기/끄기';
    sw.onclick = ()=>{ toggleAlarm(a.id); renderList(); };

    const del = document.createElement('button'); del.className='btn btn-danger'; del.textContent='삭제'; // button형태의 버튼 생성 로직
    del.onclick = ()=>{ deleteAlarm(a.id); renderList(); };

    right.append(sw, del); row.append(left,right); listEl.appendChild(row); // 생성한 스위치와 삭제 버튼 추가 로직
  });
}
renderList();

const hh = $('#hh'), mm = $('#mm'), ss = $('#ss'); // 각각 변수에 시, 분, 초 저장
$('#clearBtn').onclick = ()=>{ hh.value=''; mm.value=''; ss.value=''; }; // 초기화 버튼을 누르면 전체 공백으로 값 설정
$('#addBtn').onclick = ()=>{
  const H = Math.min(23, Math.max(0, parseInt(hh.value||'0',10))); // 입력한 값을 int로 변환 || 0을 통해 입력하지않으면 0으로 설정
  const M = Math.min(59, Math.max(0, parseInt(mm.value||'0',10)));
  const S = Math.min(59, Math.max(0, parseInt(ss.value||'0',10)));
  const time = `${pad2(H)}:${pad2(M)}:${pad2(S)}`; // 입력값을 두자리 수로 변경 (5 입력 시 -> 05로 설정)
  const res = addAlarm(time); // addAlarm()을 통해 리턴값 ok, false를 받아서 성공/실패 알림
  if(!res.ok) { alert(res.msg); return; } // 실패할 시 msg를 통해 이유 알려줌
  alert(`알람이 추가되었습니다: ${time}`); // 성공 시 추가 alert 제공
  renderList();
};

function checkAlarms(now){
  if(clockWrap.classList.contains('blackout')) return; // 0%면 울리지 않음
  const alarms = getAlarms();
  const hit = alarms.find(a=>a.enabled && a.time===now);
  if(hit)  alert(`🔔 알람: ${hit.time}`);
}