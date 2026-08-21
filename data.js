// data.js
// 이 파일은 서비스에서 사용하는 "데이터"만 담당한다.
// 나중에 백엔드 API 응답으로 교체하기 쉽도록 로직(app.js)과 분리해 둔다.
//
// 분류 기준은 "누구에게 / 어디서 겪었는가" 하나로 통일한다.
// 폭력이나 방임 같은 가해의 형태는 별도 영역으로 두지 않고,
// 그 일이 일어난 관계 안에 넣는다. (예: 아버지에게 맞은 일 → 가족)
//
// heavy: true 인 항목을 하나라도 고르면 결과 화면에 도움받을 곳 안내를 함께 보여준다.
const WOUNDS = [
  // 가족
  { id: 1, text: "부모님이 나를 형제자매나 남과 비교했던 일", category: "family" },
  { id: 2, text: "부모님이 다른 형제자매만 예뻐했던 일", category: "family" },
  { id: 3, text: "내가 가고 싶은 길을 가족이 반대했던 일", category: "family" },
  { id: 4, text: "아무리 해도 부모님께 인정받지 못한다고 느낀 일", category: "family" },
  { id: 5, text: "가족에게 마음을 털어놨다가 대수롭지 않게 넘겨진 일", category: "family" },
  { id: 6, text: "가족을 위해 내 것을 접어야 했던 일", category: "family" },
  { id: 7, text: "부모님의 다툼을 지켜봐야 했던 시간", category: "family" },
  { id: 8, text: "부모님이 헤어지던 무렵의 시간", category: "family" },
  { id: 9, text: "집에 내 자리가 없다고 느낀 시절", category: "family" },
  { id: 10, text: "가족에게 내 모습을 숨겨야 했던 시간", category: "family" },
  { id: 11, text: "가족에게 폭언과 욕설을 들으며 자란 시간", category: "family", heavy: true },
  { id: 12, text: "아버지에게 맞았던 일", category: "family", heavy: true },
  { id: 13, text: "어머니에게 맞았던 일", category: "family", heavy: true },
  { id: 14, text: "형제나 자매에게 맞았던 일", category: "family", heavy: true },
  { id: 15, text: "가족이 맞는 것을 지켜봐야 했던 일", category: "family", heavy: true },
  { id: 16, text: "물건이 부서지고 고함이 오가던 밤", category: "family", heavy: true },
  { id: 17, text: "집에 들어가는 것이 무서웠던 시절", category: "family", heavy: true },
  { id: 18, text: "부모님 중 한 분이 집을 나간 일", category: "family", heavy: true },
  { id: 19, text: "나를 두고 떠나버린 가족이 있었던 일", category: "family", heavy: true },
  { id: 20, text: "아파도 돌봐주는 사람이 없었던 시간", category: "family", heavy: true },
  { id: 21, text: "끼니를 스스로 해결해야 했던 시절", category: "family", heavy: true },
  { id: 22, text: "친척 집이나 시설에 맡겨졌던 시간", category: "family", heavy: true },
  { id: 23, text: "가족의 술 문제로 힘들었던 시간", category: "family", heavy: true },
  { id: 24, text: "가족의 빚이나 도박으로 무너진 일", category: "family", heavy: true },
  { id: 25, text: "가족이 법적인 문제에 휘말린 일", category: "family" },
  { id: 26, text: "아픈 가족을 오래 돌봐야 했던 시간", category: "family" },
  { id: 27, text: "어린 나이에 어른 노릇을 해야 했던 시절", category: "family" },
  { id: 28, text: "가족의 문제를 밖에 말할 수 없었던 시간", category: "family" },

  // 친구
  { id: 29, text: "친했던 친구가 어느 날부터 나를 멀리한 일", category: "friend" },
  { id: 30, text: "내가 한 이야기가 뒷말이 되어 돌아온 일", category: "friend" },
  { id: 31, text: "믿고 말한 비밀이 퍼진 일", category: "friend" },
  { id: 32, text: "나만 빼고 약속이 잡혀 있던 걸 알게 된 순간", category: "friend" },
  { id: 33, text: "무리에서 밀려나 겉돌던 시간", category: "friend" },
  { id: 34, text: "가장 힘들 때 아무에게도 연락이 오지 않았던 시기", category: "friend" },
  { id: 35, text: "친구에게 이용 당했다고 느낀 일", category: "friend" },
  { id: 36, text: "오래된 친구와 이유 없이 연락이 끊긴 일", category: "friend" },
  { id: 37, text: "사과받지 못한 채 끝나버린 관계", category: "friend" },
  { id: 38, text: "친구의 좋은 소식을 진심으로 축하하지 못한 나를 본 일", category: "friend" },

  // 학교
  { id: 39, text: "선생님에게 억울하게 혼났던 일", category: "school" },
  { id: 40, text: "선생님에게 맞거나 모욕당한 일", category: "school", heavy: true },
  { id: 41, text: "친구들 앞에서 망신을 당한 일", category: "school" },
  { id: 42, text: "여럿에게 둘러싸여 괴롭힘을 당한 일", category: "school", heavy: true },
  { id: 43, text: "돈을 빼앗기거나 심부름을 강요당한 일", category: "school", heavy: true },
  { id: 44, text: "괴롭힘을 당하는데 아무도 내 편이 없었던 일", category: "school", heavy: true },
  { id: 45, text: "나에 대한 소문이 학교에 퍼진 일", category: "school" },
  { id: 46, text: "혼자 밥을 먹거나 혼자 남아 있던 시간", category: "school" },
  { id: 47, text: "학교에 가기 싫어 아프던 아침들", category: "school" },
  { id: 48, text: "성적으로만 나를 판단한다고 느낀 시간", category: "school" },
  { id: 49, text: "열심히 했는데 결과가 따라주지 않았던 시험", category: "school" },
  { id: 50, text: "원하는 학교에 가지 못한 일", category: "school" },

  // 사랑
  { id: 51, text: "사랑한다고 믿었던 사람에게 갑자기 이별을 통보받은 일", category: "love" },
  { id: 52, text: "끝내 마음을 전하지 못하고 지나간 사람", category: "love" },
  { id: 53, text: "상대에게 맞추다 나를 잃어버린 연애", category: "love" },
  { id: 54, text: "믿었던 사람의 거짓말을 알게 된 날", category: "love" },
  { id: 55, text: "다른 사람이 있었다는 걸 알게 된 날", category: "love" },
  { id: 56, text: "연인에게 맞았던 일", category: "love", heavy: true },
  { id: 57, text: "연인이 내 일상과 관계를 통제하려 했던 일", category: "love", heavy: true },
  { id: 58, text: "모든 게 내 잘못이라고 믿게 만든 사람을 만난 일", category: "love", heavy: true },
  { id: 59, text: "원치 않는 요구를 끝내 거절하지 못했던 일", category: "love", heavy: true },
  { id: 60, text: "이별을 내가 먼저 말해야 했던 일", category: "love" },
  { id: 61, text: "주변의 반대로 헤어져야 했던 일", category: "love" },
  { id: 62, text: "헤어진 뒤 혼자 오래 정리해야 했던 시간", category: "love" },
  { id: 63, text: "다시는 예전처럼 사랑하지 못할 것 같다고 느낀 마음", category: "love" },

  // 일터
  { id: 64, text: "내가 한 일의 공을 다른 사람이 가져간 일", category: "work" },
  { id: 65, text: "일하며 인격적으로 무시당한 일", category: "work" },
  { id: 66, text: "직장에서 지속적으로 괴롭힘을 당한 일", category: "work", heavy: true },
  { id: 67, text: "성적인 말이나 행동에 시달린 일", category: "work", heavy: true },
  { id: 68, text: "부당한 일을 알고도 참아야 했던 일", category: "work" },
  { id: 69, text: "최선을 다했는데 아무도 알아주지 않은 시간", category: "work" },
  { id: 70, text: "나를 대신할 사람은 얼마든지 있다는 말을 들은 일", category: "work" },
  { id: 71, text: "원치 않게 일을 그만두게 된 일", category: "work" },
  { id: 72, text: "몸이 상할 만큼 일해야 했던 시기", category: "work" },
  { id: 73, text: "사람들 사이에서 겉돌고 있다고 느낀 시간", category: "work" },
  { id: 74, text: "하고 싶은 일과 해야 하는 일 사이에서 지쳐간 시기", category: "work" },

  // 돈
  { id: 75, text: "돈 때문에 하고 싶은 것을 포기한 일", category: "money" },
  { id: 76, text: "형편이 갑자기 어려워졌던 시기", category: "money" },
  { id: 77, text: "생활비나 빚 걱정으로 잠 못 이룬 밤", category: "money" },
  { id: 78, text: "돈 문제로 가까운 사람과 사이가 틀어진 일", category: "money" },
  { id: 79, text: "믿었던 사람에게 돈을 떼이거나 사기당한 일", category: "money" },
  { id: 80, text: "남에게 손을 벌려야 했던 순간", category: "money" },
  { id: 81, text: "돈 때문에 자존심을 굽혀야 했던 일", category: "money" },
  { id: 82, text: "남들과 비교하며 내 처지가 초라해졌던 순간", category: "money" },

  // 몸과 마음
  { id: 83, text: "예상치 못한 진단을 받았던 날", category: "health" },
  { id: 84, text: "아픈 몸 때문에 계획을 접어야 했던 일", category: "health" },
  { id: 85, text: "병원에서 혼자 기다렸던 시간", category: "health" },
  { id: 86, text: "몸이 예전 같지 않다는 걸 실감한 순간", category: "health" },
  { id: 87, text: "사고나 병으로 몸에 자국이 남은 일", category: "health" },
  { id: 88, text: "마음이 아픈 걸 아무도 알아주지 않았던 시기", category: "health" },
  { id: 89, text: "마음의 병으로 병원을 찾아야 했던 일", category: "health", heavy: true },
  { id: 90, text: "약에 기대어 하루하루를 버텼던 시간", category: "health", heavy: true },
  { id: 91, text: "오래 잠들지 못했던 밤들", category: "health" },
  { id: 92, text: "먹는 것이 편하지 않았던 시기", category: "health", heavy: true },
  { id: 93, text: "임신이나 출산과 관련해 힘들었던 일", category: "health", heavy: true },

  // 나 자신
  { id: 94, text: "하고 싶은 말을 끝내 하지 못한 일", category: "self" },
  { id: 95, text: "나를 지키지 못하고 참기만 했던 시간", category: "self" },
  { id: 96, text: "내가 나를 가장 심하게 몰아붙였던 시기", category: "self" },
  { id: 97, text: "내 감정을 스스로 아니라고 부정했던 시간", category: "self" },
  { id: 98, text: "차라리 다른 사람이 되고 싶었던 순간", category: "self" },
  { id: 99, text: "외모 때문에 나를 미워했던 시간", category: "self" },
  { id: 100, text: "사진이나 거울 속 내 모습이 견디기 힘들었던 순간", category: "self" },
  { id: 101, text: "내가 한 일을 오래 후회하고 있는 것", category: "self" },
  { id: 102, text: "누군가에게 상처를 준 기억", category: "self" },
  { id: 103, text: "아무에게도 말하지 못한 일을 혼자 안고 있는 것", category: "self", heavy: true },
  { id: 104, text: "스스로를 해치고 싶었던 순간", category: "self", heavy: true },
  { id: 105, text: "살고 싶지 않다고 생각했던 시기", category: "self", heavy: true },

  // 실패와 좌절
  { id: 106, text: "오래 준비한 시험이나 도전에서 떨어진 일", category: "failure" },
  { id: 107, text: "크게 벌였다가 무너진 일", category: "failure" },
  { id: 108, text: "결국 포기하는 쪽을 택했던 순간", category: "failure" },
  { id: 109, text: "나를 믿어준 사람을 실망시킨 일", category: "failure" },
  { id: 110, text: "다시 시작할 엄두가 나지 않았던 시기", category: "failure" },
  { id: 111, text: "또래보다 뒤처졌다고 느낀 순간", category: "failure" },
  { id: 112, text: "재능이 여기까지라는 걸 인정해야 했던 순간", category: "failure" },

  // 이별과 상실
  { id: 113, text: "소중한 사람을 떠나보낸 일", category: "loss", heavy: true },
  { id: 114, text: "예고 없이 갑자기 떠나보낸 일", category: "loss", heavy: true },
  { id: 115, text: "제대로 인사하지 못하고 헤어진 일", category: "loss", heavy: true },
  { id: 116, text: "마지막이 될 줄 몰랐던 대화", category: "loss", heavy: true },
  { id: 117, text: "스스로 세상을 떠난 사람을 보낸 일", category: "loss", heavy: true },
  { id: 118, text: "아이를 잃은 일", category: "loss", heavy: true },
  { id: 119, text: "함께 살던 동물을 떠나보낸 일", category: "loss" },
  { id: 120, text: "장례를 치르고 난 뒤 혼자 남은 시간", category: "loss", heavy: true },
  { id: 121, text: "돌아갈 수 없는 시절이 끝났다는 걸 알게 된 순간", category: "loss" },

  // 세상과 사회
  { id: 122, text: "나이나 성별 때문에 함부로 평가받은 일", category: "society" },
  { id: 123, text: "출신이나 배경으로 선을 긋는 말을 들은 일", category: "society" },
  { id: 124, text: "혐오나 차별의 말을 직접 들은 일", category: "society", heavy: true },
  { id: 125, text: "남들과 다르다는 이유로 계속 설명해야 했던 순간", category: "society" },
  { id: 126, text: "내 모습을 숨기고 살아야 했던 시간", category: "society" },
  { id: 127, text: "남들의 기준에 맞추려다 지쳐버린 시간", category: "society" },
  { id: 128, text: "괜찮은 척해야 했던 자리", category: "society" },
  { id: 129, text: "도움을 청했지만 거절당한 일", category: "society" },
  { id: 130, text: "제도나 절차 앞에서 아무것도 할 수 없었던 순간", category: "society" },

  // 범죄와 안전
  { id: 131, text: "모르는 사람에게 폭행당한 일", category: "crime", heavy: true },
  { id: 132, text: "누군가에게 협박을 당한 일", category: "crime", heavy: true },
  { id: 133, text: "내 몸을 침해당한 일", category: "crime", heavy: true },
  { id: 134, text: "스토킹이나 집요한 괴롭힘을 당한 일", category: "crime", heavy: true },
  { id: 135, text: "온라인에서 나를 겨냥한 공격을 받은 일", category: "crime", heavy: true },
  { id: 136, text: "내 사진이나 정보가 퍼진 일", category: "crime", heavy: true },
  { id: 137, text: "말하거나 신고했지만 아무것도 달라지지 않았던 일", category: "crime", heavy: true },
  { id: 138, text: "내 잘못이 아닌데 나를 탓하는 말을 들은 일", category: "crime", heavy: true },
  { id: 139, text: "예기치 못한 사고를 겪은 일", category: "crime", heavy: true },
  { id: 140, text: "죽을 뻔했다고 느낀 순간", category: "crime", heavy: true },
  { id: 141, text: "나를 지켜줬어야 할 어른이 그러지 않았던 기억", category: "crime", heavy: true },
  { id: 142, text: "오래 잊히지 않는 장면 하나", category: "crime", heavy: true },

  // 외로움과 소속
  { id: 143, text: "사람들 속에 있는데 더 외로웠던 순간", category: "loneliness" },
  { id: 144, text: "아무에게도 연락할 수 없었던 밤", category: "loneliness" },
  { id: 145, text: "내 이야기를 들어줄 사람이 없다고 느낀 시기", category: "loneliness" },
  { id: 146, text: "큰 결정을 혼자 감당해야 했던 일", category: "loneliness" },
  { id: 147, text: "명절이나 기념일이 더 쓸쓸했던 날", category: "loneliness" },
  { id: 148, text: "익숙한 곳을 떠나야 했던 일", category: "loneliness" },
  { id: 149, text: "낯선 곳에 혼자 적응해야 했던 시간", category: "loneliness" },
  { id: 150, text: "어디에도 속하지 못한다고 느낀 시기", category: "loneliness" },
  { id: 151, text: "돌아갈 집이 편하지 않았던 시절", category: "loneliness" },

  // 시간과 나이듦
  { id: 152, text: "시간을 헛되이 보냈다고 느낀 시기", category: "time" },
  { id: 153, text: "부모님이 늙어가고 있다는 걸 실감한 날", category: "time" },
  { id: 154, text: "이제는 너무 늦었다고 생각한 순간", category: "time" },
  { id: 155, text: "그때 다르게 했더라면 하고 오래 되뇐 일", category: "time" },
  { id: 156, text: "함께 늙어갈 줄 알았던 관계가 끝난 일", category: "time" },
];

// 영역별 표시 이름과 결과 화면에 쓰일 설명
const CATEGORY_INFO = {
  family: {
    name: "가족",
    description:
      "가장 가까운 사람에게서 받은 상처는 가장 늦게까지 남습니다. 사랑과 아픔이 같은 자리에서 나왔기 때문입니다. 안전해야 할 곳에서 다쳤다면, 그건 어떤 이유로도 당신 잘못이 아니었습니다.",
  },
  friend: {
    name: "친구",
    description:
      "곁에 있어 줄 거라 믿었던 관계에서 받은 상처입니다. 멀어짐에 이유가 없었기에 더 오래 곱씹게 됩니다.",
  },
  school: {
    name: "학교",
    description:
      "아직 나를 지킬 방법을 몰랐던 시절의 상처입니다. 그때의 당신은 어렸을 뿐, 잘못한 것이 아닙니다.",
  },
  love: {
    name: "사랑",
    description:
      "마음을 다 열었기에 그만큼 깊이 남은 자국입니다. 그렇게 사랑할 수 있었다는 뜻이기도 합니다. 사랑이라는 이름으로 당신을 다치게 한 것은 사랑이 아니었습니다.",
  },
  work: {
    name: "일터",
    description:
      "애쓴 만큼 돌려받지 못했던 자리에서의 상처입니다. 인정받지 못했다고 해서 하지 않은 일이 되지는 않습니다.",
  },
  money: {
    name: "돈",
    description:
      "선택할 수 없었던 순간들이 남긴 상처입니다. 형편은 당신의 가치와 아무 상관이 없습니다.",
  },
  health: {
    name: "몸과 마음",
    description:
      "내 뜻대로 되지 않는 몸과 마음 앞에서 받은 상처입니다. 버텨온 것만으로 충분히 애쓴 일입니다.",
  },
  self: {
    name: "나 자신",
    description:
      "다른 누구도 아닌 내가 나에게 남긴 상처입니다. 가장 오래 함께 살아온 사람에게 조금 너그러워져도 됩니다.",
  },
  failure: {
    name: "실패와 좌절",
    description:
      "무너진 자리에서 받은 상처입니다. 넘어졌다는 건 그만큼 멀리 가보려 했다는 증거입니다.",
  },
  loss: {
    name: "이별과 상실",
    description:
      "다시 돌이킬 수 없는 것을 잃은 자리의 상처입니다. 그리움이 남았다는 건 그만큼 소중했다는 뜻입니다.",
  },
  society: {
    name: "세상과 사회",
    description:
      "나를 잘 모르는 사람들의 잣대에 부딪힌 상처입니다. 설명해야 했던 쪽은 늘 당신이 아니었습니다.",
  },
  crime: {
    name: "범죄와 안전",
    description:
      "당신이 당한 일이지, 당신이 만든 일이 아닙니다. 잘못은 전적으로 그 일을 한 사람에게 있고, 지켜졌어야 할 사람은 분명히 당신이었습니다.",
  },
  loneliness: {
    name: "외로움과 소속",
    description:
      "혼자 견뎌야 했던 시간이 남긴 상처입니다. 그때 곁에 아무도 없었던 건 당신 탓이 아닙니다.",
  },
  time: {
    name: "시간과 나이듦",
    description:
      "흘러간 시간과 놓친 것들 앞에서의 상처입니다. 늦었다는 감각은 대개 사실보다 앞서 옵니다.",
  },
};

// "그때는 없었지만 지금은 있는 것" — 지금의 나를 설명하는 항목들.
// 편지에서 그때의 나에게 전해 줄 소식이 되므로, 작고 구체적인 것 위주로 담는다.
// 아무것도 해당되지 않는 사람을 위해 마지막 영역에 정직한 선택지를 둔다.
const PRESENT_ITEMS = [
  // 곁에 있는 것
  { id: 1, text: "내 이야기를 들어주는 사람이 있어요", category: "companion" },
  { id: 2, text: "연락하면 받아주는 사람이 있어요", category: "companion" },
  { id: 3, text: "마음 편한 친구가 한 명은 있어요", category: "companion" },
  { id: 4, text: "나를 아껴주는 사람을 만났어요", category: "companion" },
  { id: 5, text: "나를 이해해주는 사람이 생겼어요", category: "companion" },
  { id: 6, text: "함께 사는 동물이 있어요", category: "companion" },
  { id: 7, text: "가족과 예전보다는 편해졌어요", category: "companion" },
  { id: 8, text: "아직 곁에 아무도 없지만, 찾고 있어요", category: "companion" },

  // 할 수 있게 된 것
  { id: 9, text: "싫은 건 싫다고 말할 수 있게 됐어요", category: "ability" },
  { id: 10, text: "도움을 청할 수 있게 됐어요", category: "ability" },
  { id: 11, text: "화가 나면 화를 낼 수 있게 됐어요", category: "ability" },
  { id: 12, text: "울고 싶을 때 울 수 있게 됐어요", category: "ability" },
  { id: 13, text: "아니라고 말하고 자리를 뜰 수 있어요", category: "ability" },
  { id: 14, text: "그 사람에게서 벗어났어요", category: "ability" },
  { id: 15, text: "내 힘으로 먹고살고 있어요", category: "ability" },
  { id: 16, text: "혼자서도 잘 지낼 수 있어요", category: "ability" },
  { id: 17, text: "필요할 때 도움을 받으러 갔어요", category: "ability" },
  { id: 18, text: "그 일을 누군가에게 말할 수 있게 됐어요", category: "ability" },

  // 가지게 된 것
  { id: 19, text: "마음 편히 쉴 수 있는 내 공간이 있어요", category: "having" },
  { id: 20, text: "돌아갈 집이 있어요", category: "having" },
  { id: 21, text: "하고 싶은 일을 하고 있어요", category: "having" },
  { id: 22, text: "나를 지켜주는 나만의 기준이 생겼어요", category: "having" },
  { id: 23, text: "좋아하는 것이 생겼어요", category: "having" },
  { id: 24, text: "잘 자고 잘 먹는 날이 늘었어요", category: "having" },
  { id: 25, text: "그때는 상상도 못 한 곳에 와 있어요", category: "having" },
  { id: 26, text: "당장 급하지 않을 만큼의 돈이 있어요", category: "having" },

  // 지금의 나
  { id: 27, text: "그때보다 단단해졌어요", category: "nowme" },
  { id: 28, text: "나를 덜 미워하게 됐어요", category: "nowme" },
  { id: 29, text: "웃을 일이 있어요", category: "nowme" },
  { id: 30, text: "내가 나를 챙길 줄 알게 됐어요", category: "nowme" },
  { id: 31, text: "그때의 나를 이제는 이해해요", category: "nowme" },
  { id: 32, text: "누군가에게 기댈 곳이 되어주고 있어요", category: "nowme" },
  { id: 33, text: "아직 힘들지만 버티고 있어요", category: "nowme" },
  { id: 34, text: "아직 잘 모르겠어요. 그래도 여기까지 왔어요", category: "nowme" },
];

const PRESENT_CATEGORY_INFO = {
  companion: { name: "곁에 있는 것" },
  ability: { name: "할 수 있게 된 것" },
  having: { name: "가지게 된 것" },
  nowme: { name: "지금의 나" },
};

// 상처 하나하나에 대해 "지금은 어떤지" 답하는 선택지.
// value 가 클수록 아직 생생한 상처다.
const WEIGHT_LEVELS = [
  {
    value: 0,
    key: "healed",
    label: "이제는 괜찮아요",
    hint: "지나온 일이 되었어요",
    resultTitle: "이제는 괜찮아진 것들",
  },
  {
    value: 1,
    key: "occasional",
    label: "가끔 생각나요",
    hint: "문득 떠오르지만 지나갈 수 있어요",
    resultTitle: "가끔 떠오르는 것들",
  },
  {
    value: 2,
    key: "aching",
    label: "아직 아파요",
    hint: "생각하면 여전히 마음이 무거워요",
    resultTitle: "아직 아픈 것들",
  },
  {
    value: 3,
    key: "vivid",
    label: "지금도 선명해요",
    hint: "떠올리면 그때로 돌아간 것 같아요",
    resultTitle: "지금도 선명한 것들",
  },
];

// 혼자 감당하기 어려울 때 연결할 수 있는 곳 (대한민국)
const SUPPORT_LINES = [
  { name: "자살예방 상담전화", number: "109" },
  { name: "정신건강 상담전화", number: "1577-0199" },
  { name: "여성긴급전화 (가정폭력·성폭력)", number: "1366" },
  { name: "청소년 상담전화", number: "1388" },
  { name: "범죄·학대 신고", number: "112" },
];
