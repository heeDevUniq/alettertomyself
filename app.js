// app.js
// 화면 전환, 상처 고르기, 하나씩 무게 표시하기, 인터랙션 기록을 담당한다.
// 데이터는 data.js, 질문지 생성은 prompt.js 에 있고, 진행 상태는 state 객체 하나로 관리한다.

// -------------------------------------------------------
// 상수와 상태
// -------------------------------------------------------

const MIN_SELECT = 5;      // 상처를 최소한 골라야 하는 개수
const MAX_SELECT = 10;     // 고른 개수만큼 돌아보기를 하므로 상한을 둔다
const MIN_PRESENT = 1;     // 지금의 나를 최소한 골라야 하는 개수
const HESITATION_SEC = 5;  // 이 시간(초) 이상 걸린 답은 "망설임"으로 본다

const state = {
  currentScreen: "landing", // landing | select | weigh | present | result
  selectedWounds: [],       // 고르기 단계에서 선택한 상처 id 목록
  selectedPresent: [],      // 지금의 나 단계에서 선택한 항목 id 목록

  // 돌아보기 단계
  weighQueue: [],   // 아직 답하지 않은 id 목록
  weighIndex: 0,    // 지금 보고 있는 위치
  weights: {},      // id -> 0~3 (WEIGHT_LEVELS 의 value)
  skipped: [],      // 답하지 않고 넘긴 id 목록

  // 놓아주기 단계
  gestures: {},     // id -> GESTURES 의 key

  // 사용자의 인터랙션 기록
  interactions: {
    startedAt: null,
    lastActionAt: null,
    picks: [],     // { id, sinceLastSec }
    unpicked: [],  // 골랐다가 해제한 id 목록
    weighs: [],    // { id, value, sec }
  },
};

// -------------------------------------------------------
// 초기화
// -------------------------------------------------------

function init() {
  console.log("[init] 서비스 시작");

  renderSupportBox(document.getElementById("landing-support"),
    "혼자 감당하지 않아도 됩니다",
    "지금 힘든 상태라면, 아래로 연락하면 훈련받은 사람과 이야기할 수 있습니다. 24시간 언제든 가능합니다.");

  document.getElementById("btn-start").addEventListener("click", startJourney);
  document.getElementById("btn-next-select").addEventListener("click", startWeighing);
  document.getElementById("btn-skip").addEventListener("click", skipWound);
  document.getElementById("btn-weigh-next").addEventListener("click", continueWeighing);
  document.getElementById("btn-next-gesture").addEventListener("click", finishGesture);
  document.getElementById("btn-next-present").addEventListener("click", finishPresent);
  document.getElementById("btn-copy").addEventListener("click", copyPrompt);
  document.getElementById("btn-restart").addEventListener("click", restart);
}

// -------------------------------------------------------
// 화면 전환
// -------------------------------------------------------

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(function (screen) {
    screen.classList.remove("active");
  });
  document.getElementById("screen-" + name).classList.add("active");

  window.scrollTo(0, 0);
  state.currentScreen = name;
  console.log("[showScreen] 현재 화면:", name);
}

// 직전 행동 이후 흐른 시간(초)을 재고, 기준 시각을 갱신한다.
function elapsedSinceLastAction() {
  const now = Date.now();
  const sec = Math.round((now - (state.interactions.lastActionAt || now)) / 100) / 10;
  state.interactions.lastActionAt = now;
  return sec;
}

// -------------------------------------------------------
// 고르기 단계
// -------------------------------------------------------

function startJourney() {
  console.log("[startJourney] 시작");
  state.selectedWounds = [];
  state.selectedPresent = [];
  state.weights = {};
  state.skipped = [];
  state.gestures = {};
  state.interactions = {
    startedAt: Date.now(),
    lastActionAt: Date.now(),
    picks: [],
    unpicked: [],
    weighs: [],
  };

  renderChoices();
  showScreen("select");
}

// 영역 별 상처 카드
function renderChoices() {
  const container = document.getElementById("choice-groups");
  container.innerHTML = "";

  const groups = {};
  WOUNDS.forEach(function (wound) {
    if (!groups[wound.category]) groups[wound.category] = [];
    groups[wound.category].push(wound);
  });

  renderGroupNav(Object.keys(groups));

  Object.keys(groups).forEach(function (category) {
    const section = document.createElement("div");
    section.className = "choice-group";
    section.id = "group-" + category;

    const heading = document.createElement("h3");
    heading.className = "choice-group-title";
    heading.textContent = CATEGORY_INFO[category].name;

    const grid = document.createElement("div");
    grid.className = "choice-grid";

    groups[category].forEach(function (wound) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "choice-card";
      card.textContent = wound.text;
      card.dataset.id = wound.id;
      card.addEventListener("click", function () {
        selectWound(wound.id);
      });
      grid.appendChild(card);
    });

    section.appendChild(heading);
    section.appendChild(grid);
    container.appendChild(section);
  });

  updateSelectStatus();
}

function renderGroupNav(categories) {
  const nav = document.getElementById("group-nav");
  nav.innerHTML = "";

  categories.forEach(function (category) {
    const link = document.createElement("a");
    link.className = "group-nav-item";
    link.href = "#group-" + category;
    link.textContent = CATEGORY_INFO[category].name;
    nav.appendChild(link);
  });
}

// 카드를 고르기/고르기 취소
function selectWound(id) {
  const index = state.selectedWounds.indexOf(id);
  const sec = elapsedSinceLastAction();

  if (index >= 0) {
    state.selectedWounds.splice(index, 1);
    state.interactions.unpicked.push(id);
    console.log("[selectWound] 해제:", id);
  } else {
    // 상한에 닿았으면 더 담지 않고 안내만 한다
    if (state.selectedWounds.length >= MAX_SELECT) {
      showSelectHint(
        MAX_SELECT + "개까지만 고를 수 있어요. 더 담고 싶으면 고른 것 중 하나를 눌러 빼주세요."
      );
      return;
    }
    state.selectedWounds.push(id);
    state.interactions.picks.push({ id: id, sinceLastSec: sec });
    console.log("[selectWound] 선택:", id, sec + "s");
  }

  updateSelectStatus();
}

// 선택 상태 표시 + 카운터 + 다음 버튼을 갱신
function updateSelectStatus() {
  const count = state.selectedWounds.length;
  const maxed = count >= MAX_SELECT;

  document.querySelectorAll(".choice-card").forEach(function (card) {
    const id = Number(card.dataset.id);
    const picked = state.selectedWounds.includes(id);
    card.classList.toggle("selected", picked);
    card.classList.toggle("dimmed", maxed && !picked);
  });

  document.getElementById("select-count").textContent = count;
  document.getElementById("btn-next-select").disabled = count < MIN_SELECT;

  if (count < MIN_SELECT) {
    showSelectHint("최소 " + MIN_SELECT + "개는 골라주세요.", true);
  } else if (maxed) {
    showSelectHint("여기까지면 충분합니다. 다음으로 넘어가세요.", true);
  } else {
    showSelectHint("", true);
  }
}

function showSelectHint(message, quiet) {
  const hint = document.getElementById("select-hint");
  hint.textContent = message;
  hint.className = "select-hint" + (message && !quiet ? " alert" : "");
}

// -------------------------------------------------------
// 돌아보기 단계 (하나씩 지금의 무게를 표시)
// -------------------------------------------------------

function startWeighing() {
  state.weighQueue = state.selectedWounds.slice();
  state.weighIndex = 0;
  state.weights = {};
  state.skipped = [];

  console.log("[startWeighing] 대상:", state.weighQueue.length, "개");

  document.getElementById("weigh-total").textContent = state.weighQueue.length;
  renderWeighOptions();
  renderWeighCard();
  showScreen("weigh");
}

// 답변 버튼들은 한 번만 만들어 두고 계속 재사용한다.
function renderWeighOptions() {
  const box = document.getElementById("weigh-options");
  box.innerHTML = "";

  WEIGHT_LEVELS.forEach(function (level) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weigh-option";

    const label = document.createElement("span");
    label.className = "weigh-option-label";
    label.textContent = level.label;

    const hint = document.createElement("span");
    hint.className = "weigh-option-hint";
    hint.textContent = level.hint;

    button.appendChild(label);
    button.appendChild(hint);
    button.addEventListener("click", function () {
      answerWeigh(level.value);
    });
    box.appendChild(button);
  });
}

// 지금 차례인 상처 하나를 보여준다.
function renderWeighCard() {
  // 다 답했으면 놓아주기로 넘어간다
  if (state.weighIndex >= state.weighQueue.length) {
    startGesture();
    return;
  }

  const wound = findWoundById(state.weighQueue[state.weighIndex]);
  const card = document.getElementById("weigh-card");

  card.textContent = wound.text;
  card.classList.remove("weigh-card-enter");
  void card.offsetWidth; // 애니메이션을 다시 재생시키기 위한 리플로우
  card.classList.add("weigh-card-enter");

  updateWeighProgress();
  state.interactions.lastActionAt = Date.now();
}

// 지금의 무게를 답한다.
// 답한 직후 바로 다음 카드로 넘기지 않고, 그 자리에서 한마디를 돌려준다.
// 침묵하고 넘어가면 설문지가 되고, 그게 상처를 긁는 느낌의 원인이었다.
function answerWeigh(value) {
  const id = state.weighQueue[state.weighIndex];
  const sec = elapsedSinceLastAction();

  state.weights[id] = value;
  state.interactions.weighs.push({ id: id, value: value, sec: sec });

  console.log("[answerWeigh]", id, "→", value, sec + "s");
  showWeighResponse(id, value);
}

// 답에 대한 한마디를 보여준다.
// 아직 아프다고 답한 경우에는 그 상처에 맞게 따로 쓴 말을, 아니면 무게에 맞는 말을 쓴다.
// 156개를 개별로 써 둔 이유는, 같은 영역 안에도 폭력과 비교처럼 성격이 다른 일이 섞여
// 하나의 문장으로는 엉뚱한 말이 나갔기 때문이다.
function showWeighResponse(id, value) {
  const wound = findWoundById(id);
  const message = value >= 2
    ? (WOUND_SAY[id] || HARM_RESPONSES[wound.harm])
    : WEIGH_RESPONSES[value];

  document.getElementById("weigh-response-text").textContent = message;
  document.getElementById("weigh-options").hidden = true;
  document.getElementById("btn-skip").hidden = true;
  document.getElementById("weigh-response").hidden = false;
}

// 한마디를 읽고 나면 다음 카드로 넘어간다.
function continueWeighing() {
  document.getElementById("weigh-response").hidden = true;
  document.getElementById("weigh-options").hidden = false;
  document.getElementById("btn-skip").hidden = false;

  state.weighIndex += 1;
  renderWeighCard();
}

// 답하지 않고 넘어간다. 꺼내기 힘든 이야기는 지나가도 된다.
function skipWound() {
  const id = state.weighQueue[state.weighIndex];
  if (id === undefined) return;

  state.skipped.push(id);
  state.weighIndex += 1;

  console.log("[skipWound] 건너뜀:", id);
  renderWeighCard();
}

function updateWeighProgress() {
  const done = state.weighIndex;
  const total = state.weighQueue.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 100;

  document.getElementById("weigh-done").textContent = done;
  document.getElementById("progress-fill").style.width = percent + "%";
}

// -------------------------------------------------------
// 놓아주기 단계
// -------------------------------------------------------

// 무게를 매기는 것만으로는 측정에서 끝난다.
// 각 상처를 어떻게 할지 직접 정하게 해서, 사용자가 무언가를 하게 만든다.
function startGesture() {
  state.gestures = {};
  renderGestureList();
  showScreen("gesture");
}

function renderGestureList() {
  const list = document.getElementById("gesture-list");
  list.innerHTML = "";

  const targets = state.weighQueue.filter(function (id) {
    return state.weights[id] !== undefined;
  });

  document.getElementById("gesture-total").textContent = targets.length;

  targets.forEach(function (id) {
    const item = document.createElement("div");
    item.className = "gesture-item";
    item.dataset.id = id;

    const text = document.createElement("p");
    text.className = "gesture-text";
    text.textContent = findWoundById(id).text;

    const options = document.createElement("div");
    options.className = "gesture-options";

    GESTURES.forEach(function (gesture) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gesture-option";
      button.dataset.key = gesture.key;

      const label = document.createElement("span");
      label.className = "gesture-option-label";
      label.textContent = gesture.label;

      const hint = document.createElement("span");
      hint.className = "gesture-option-hint";
      hint.textContent = gesture.hint;

      button.appendChild(label);
      button.appendChild(hint);
      button.addEventListener("click", function () {
        setGesture(id, gesture.key);
      });
      options.appendChild(button);
    });

    item.appendChild(text);
    item.appendChild(options);
    list.appendChild(item);
  });

  updateGestureStatus();
}

function setGesture(id, key) {
  state.gestures[id] = key;
  console.log("[setGesture]", id, "→", key);
  updateGestureStatus();
}

function updateGestureStatus() {
  const total = document.querySelectorAll(".gesture-item").length;
  const done = Object.keys(state.gestures).length;

  document.querySelectorAll(".gesture-item").forEach(function (item) {
    const id = Number(item.dataset.id);
    const chosen = state.gestures[id];
    item.classList.toggle("answered", chosen !== undefined);
    item.querySelectorAll(".gesture-option").forEach(function (button) {
      button.classList.toggle("selected", button.dataset.key === chosen);
    });
  });

  document.getElementById("gesture-count").textContent = done;
  document.getElementById("btn-next-gesture").disabled = done < total;
  document.getElementById("gesture-hint").textContent =
    done < total ? "남은 " + (total - done) + "개도 정해주세요." : "";
}

function finishGesture() {
  startPresent();
}

// -------------------------------------------------------
// 지금의 나 단계
// -------------------------------------------------------

function startPresent() {
  renderPresentChoices();
  showScreen("present");
}

// 그때는 없었지만 지금은 있는 것
function renderPresentChoices() {
  const container = document.getElementById("present-groups");
  container.innerHTML = "";

  const groups = {};
  PRESENT_ITEMS.forEach(function (item) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });

  Object.keys(groups).forEach(function (category) {
    const section = document.createElement("div");
    section.className = "choice-group";

    const heading = document.createElement("h3");
    heading.className = "choice-group-title";
    heading.textContent = PRESENT_CATEGORY_INFO[category].name;

    const grid = document.createElement("div");
    grid.className = "choice-grid";

    groups[category].forEach(function (item) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "choice-card present-card";
      card.textContent = item.text;
      card.dataset.id = item.id;
      card.addEventListener("click", function () {
        selectPresent(item.id);
      });
      grid.appendChild(card);
    });

    section.appendChild(heading);
    section.appendChild(grid);
    container.appendChild(section);
  });

  updatePresentStatus();
}

function selectPresent(id) {
  const index = state.selectedPresent.indexOf(id);

  if (index >= 0) {
    state.selectedPresent.splice(index, 1);
  } else {
    state.selectedPresent.push(id);
  }

  console.log("[selectPresent] 현재:", state.selectedPresent);
  updatePresentStatus();
}

function updatePresentStatus() {
  const count = state.selectedPresent.length;

  document.querySelectorAll(".present-card").forEach(function (card) {
    const id = Number(card.dataset.id);
    card.classList.toggle("selected", state.selectedPresent.includes(id));
  });

  document.getElementById("present-count").textContent = count;
  document.getElementById("btn-next-present").disabled = count < MIN_PRESENT;
}

function finishPresent() {
  renderResult();
  showScreen("result");
}

// -------------------------------------------------------
// 결과
// -------------------------------------------------------

function groupByWeight() {
  const groups = {};

  WEIGHT_LEVELS.forEach(function (level) {
    groups[level.value] = [];
  });

  Object.keys(state.weights).forEach(function (id) {
    groups[state.weights[id]].push(Number(id));
  });

  return groups;
}

function findMainCategory() {
  const scores = {};

  Object.keys(state.weights).forEach(function (id) {
    const wound = findWoundById(Number(id));
    const weight = state.weights[id] + 1; // 0점짜리도 최소 1점은 반영한다
    scores[wound.category] = (scores[wound.category] || 0) + weight;
  });

  let topCategory = null;
  let topScore = 0;
  Object.keys(scores).forEach(function (category) {
    if (scores[category] > topScore) {
      topScore = scores[category];
      topCategory = category;
    }
  });

  // 전부 건너뛴 경우를 대비한 기본값
  if (!topCategory && state.selectedWounds.length > 0) {
    topCategory = findWoundById(state.selectedWounds[0]).category;
  }

  console.log("[findMainCategory] 영역 점수:", scores, "→", topCategory);
  return topCategory;
}

function hasHeavyWound() {
  return state.selectedWounds.some(function (id) {
    return findWoundById(id).heavy === true;
  });
}

function renderSupportBox(box, title, desc) {
  box.className = "support-box";
  box.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "support-title";
  heading.textContent = title;

  const description = document.createElement("p");
  description.className = "support-desc";
  description.textContent = desc;

  const list = document.createElement("ul");
  list.className = "support-lines";

  SUPPORT_LINES.forEach(function (line) {
    const item = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = line.name;

    const number = document.createElement("span");
    number.className = "support-number";
    number.textContent = line.number;

    item.appendChild(name);
    item.appendChild(number);
    list.appendChild(item);
  });

  box.appendChild(heading);
  box.appendChild(description);
  box.appendChild(list);
}

// 내가 어떻게 하기로 했는지
function renderResult() {
  const container = document.getElementById("result-list");
  container.innerHTML = "";

  GESTURES.forEach(function (gesture) {
    const ids = Object.keys(state.gestures)
      .filter(function (id) { return state.gestures[id] === gesture.key; })
      .map(Number);
    if (ids.length === 0) return;

    const section = document.createElement("div");
    section.className = "result-group gesture-" + gesture.key;

    const title = document.createElement("h3");
    title.className = "result-group-title";
    title.textContent = gesture.resultTitle;

    const list = document.createElement("div");
    list.className = "result-items";

    ids.forEach(function (id) {
      const item = document.createElement("div");
      item.className = "result-item";
      item.textContent = findWoundById(id).text;
      list.appendChild(item);
    });

    section.appendChild(title);
    section.appendChild(list);
    container.appendChild(section);
  });

  if (state.skipped.length > 0) {
    const note = document.createElement("p");
    note.className = "result-skipped";
    note.textContent =
      "아직 꺼내지 않기로 한 이야기가 " + state.skipped.length + "개 있습니다. 그래도 괜찮습니다.";
    container.appendChild(note);
  }

  const info = CATEGORY_INFO[findMainCategory()];
  const box = document.getElementById("result-category");
  box.innerHTML = "";

  if (info) {
    const label = document.createElement("p");
    label.className = "result-category-label";
    label.textContent = "당신의 상처가 모여 있는 곳";

    const name = document.createElement("h3");
    name.className = "result-category-name";
    name.textContent = info.name;

    const desc = document.createElement("p");
    desc.className = "result-category-desc";
    desc.textContent = info.description;

    box.appendChild(label);
    box.appendChild(name);
    box.appendChild(desc);
  }

  const support = document.getElementById("result-support");
  if (hasHeavyWound()) {
    renderSupportBox(support,
      "지금도 힘들다면",
      "오래 혼자 안고 있던 일이라면, 이야기할 곳이 있습니다. 아래는 24시간 열려 있습니다.");
  } else {
    support.className = "";
    support.innerHTML = "";
  }

  // 붙여넣기용 질문지 생성
  document.getElementById("copy-status").textContent = "";
  document.getElementById("prompt-text").value = buildFullPrompt(buildSummary());
}

// -------------------------------------------------------
// 인터랙션 요약 (질문지에 들어갈 재료만 추린다)
// -------------------------------------------------------

function buildSummary() {
  const textOf = function (id) { return findWoundById(id).text; };
  const groups = groupByWeight();

  // 무게별 목록
  const byWeight = WEIGHT_LEVELS.slice().reverse().map(function (level) {
    return {
      title: level.resultTitle,
      items: groups[level.value].map(textOf),
    };
  }).filter(function (group) {
    return group.items.length > 0;
  });

  // 답하기까지 유독 오래 걸린 것
  const hesitated = state.interactions.weighs
    .filter(function (w) { return w.sec >= HESITATION_SEC; })
    .map(function (w) { return textOf(w.id); });

  // 고를 때 머뭇거린 것
  const slowPicks = state.interactions.picks
    .filter(function (p) { return p.sinceLastSec >= HESITATION_SEC; })
    .map(function (p) { return textOf(p.id); });

  // 골랐다가 취소한 것 (최종 목록에 없는 것만)
  const unpicked = state.interactions.unpicked
    .filter(function (id) { return !state.selectedWounds.includes(id); })
    .map(textOf);

  const categoryNames = [];
  state.selectedWounds.forEach(function (id) {
    const name = CATEGORY_INFO[findWoundById(id).category].name;
    if (categoryNames.indexOf(name) < 0) categoryNames.push(name);
  });

  const mainCategory = findMainCategory();

  // 지금의 나 — 편지에서 그때의 나에게 전해 줄 소식
  const present = state.selectedPresent.map(function (id) {
    return PRESENT_ITEMS.find(function (item) { return item.id === id; }).text;
  });

  // 어떻게 하기로 했는지
  const byGesture = GESTURES.map(function (gesture) {
    return {
      key: gesture.key,
      title: gesture.resultTitle,
      items: Object.keys(state.gestures)
        .filter(function (id) { return state.gestures[id] === gesture.key; })
        .map(function (id) { return textOf(Number(id)); }),
    };
  }).filter(function (group) {
    return group.items.length > 0;
  });

  const summary = {
    byWeight: byWeight,
    byGesture: byGesture,
    present: present,
    skippedCount: state.skipped.length,
    mainCategory: mainCategory ? CATEGORY_INFO[mainCategory].name : "",
    pickedCount: state.selectedWounds.length,
    categoryNames: categoryNames,
    hesitated: hesitated,
    slowPicks: slowPicks,
    unpicked: unpicked,
  };

  console.log("[buildSummary]", summary);
  return summary;
}

// -------------------------------------------------------
// 질문지 복사
// -------------------------------------------------------

async function copyPrompt() {
  const area = document.getElementById("prompt-text");
  const status = document.getElementById("copy-status");

  // 1순위: 최신 클립보드 API
  try {
    await navigator.clipboard.writeText(area.value);
    showCopySuccess(area.value.length);
    return;
  } catch (error) {
    console.log("[copyPrompt] 클립보드 API 사용 불가, 대체 방식 시도:", error.message);
  }

  // 2순위: 구형 복사 명령 (텍스트를 선택한 뒤 복사)
  area.closest("details").open = true;
  area.select();
  try {
    if (document.execCommand("copy")) {
      showCopySuccess(area.value.length);
      return;
    }
  } catch (error) {
    console.log("[copyPrompt] 대체 방식도 실패:", error.message);
  }

  // 3순위: 직접 복사하도록 안내 (텍스트는 이미 선택되어 있음)
  status.textContent = "아래 내용이 선택되어 있습니다. Ctrl+C(맥은 ⌘+C)를 눌러 복사해 주세요.";
  status.className = "copy-status error";
}

function showCopySuccess(length) {
  const status = document.getElementById("copy-status");
  status.textContent = "복사했습니다. 이제 AI 채팅창에 붙여넣으세요.";
  status.className = "copy-status success";
  console.log("[copyPrompt] 복사 완료:", length + "자");
}

// -------------------------------------------------------
// 다시 하기
// -------------------------------------------------------

function restart() {
  console.log("[restart] 처음부터 다시 시작");
  state.selectedWounds = [];
  state.selectedPresent = [];
  state.weighQueue = [];
  state.weighIndex = 0;
  state.weights = {};
  state.skipped = [];
  state.gestures = {};
  showScreen("landing");
}

// -------------------------------------------------------
// 유틸리티
// -------------------------------------------------------

function findWoundById(id) {
  return WOUNDS.find(function (wound) {
    return wound.id === id;
  });
}

// 시작
init();
