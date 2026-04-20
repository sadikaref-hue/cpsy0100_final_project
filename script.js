const startScreen = document.getElementById('start-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const gameScreen = document.getElementById('game-screen');
const summaryScreen = document.getElementById('summary-screen');

const goToInstructionsBtn = document.getElementById('go-to-instructions-btn');
const backToTitleBtn = document.getElementById('back-to-title-btn');
const startGameBtn = document.getElementById('start-game-btn');
const startFromInstrBtn = document.getElementById('start-from-instr-btn');
const restartBtn = document.getElementById('restart-btn');
const backToTitleFinalBtn = document.getElementById('back-to-title-final-btn');

const boardContainer = document.getElementById('board-container');
const messageBox = document.getElementById('message-box');
const messageIcon = document.getElementById('message-icon');
const rollBtn = document.getElementById('roll-btn');

const turnDisplay = document.getElementById('turn-display');
const p1SpaceDisplay = document.getElementById('p1-space-display');
const p2SpaceDisplay = document.getElementById('p2-space-display');
const playerDisplay = document.getElementById('player-display');
const conditionDisplay = document.getElementById('condition-display');
const correctDisplay = document.getElementById('correct-display');
const wrongDisplay = document.getElementById('wrong-display');
const condChip = document.getElementById('cond-chip');

const pendingRewardsCard = document.getElementById('pending-rewards-card');
const pendingList = document.getElementById('pending-list');

const questionCard = document.getElementById('question-card');
const questionText = document.getElementById('question-text');
const answerButtons = document.getElementById('answer-buttons');
const qDifficultyBadge = document.getElementById('q-difficulty-badge');

const choiceCard = document.getElementById('choice-card');
const choiceText = document.getElementById('choice-text');
const immediateBtn = document.getElementById('immediate-btn');
const delayedBtn = document.getElementById('delayed-btn');
const immediateDesc = document.getElementById('immediate-desc');
const delayedDesc = document.getElementById('delayed-desc');

const summaryCorrect = document.getElementById('summary-correct');
const summaryWrong = document.getElementById('summary-wrong');
const summaryAccuracy = document.getElementById('summary-accuracy');
const summaryPunishment = document.getElementById('summary-punishment');
const summaryCueShown = document.getElementById('summary-cue-shown');
const summaryCueRewarded = document.getElementById('summary-cue-rewarded');
const summaryInterpretation = document.getElementById('summary-interpretation');
const summaryPlayers = document.getElementById('summary-players');

const helpModal = document.getElementById('help-modal');
const openHelpBtn = document.getElementById('open-help-btn');
const closeHelpBtn = document.getElementById('close-help-btn');

const TOTAL_SPACES = 20;
const CUE_SPACES = new Set([4, 9, 13, 16, 19]);

const QUESTIONS = [
  {
    prompt: "In operant conditioning, what is the term for a consequence that increases the likelihood of a behavior occurring again?",
    options: ["Extinction", "Reinforcement", "Habituation", "Punishment"],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is positive punishment?",
    options: [
      "Removing a pleasant stimulus to decrease behavior",
      "Presenting an unpleasant stimulus to decrease behavior",
      "Adding a pleasant stimulus to increase behavior",
      "Removing an unpleasant stimulus to increase behavior"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is negative punishment?",
    options: [
      "Adding an aversive stimulus after a response",
      "Removing a positive stimulus after a response to decrease that response",
      "Ignoring a behavior entirely",
      "Presenting a neutral stimulus"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "According to lecture, punishment is most effective when it is:",
    options: [
      "Delayed, mild, and occasional",
      "Swift, sufficient, and consistent",
      "Surprising and unpredictable",
      "Paired only with food rewards"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "In Pavlovian conditioning, the conditioned stimulus (CS) is:",
    options: [
      "A stimulus that naturally triggers a response",
      "A neutral stimulus that has been paired with a meaningful event",
      "The reward given after an operant response",
      "The behavior a subject performs for food"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is shaping in operant conditioning?",
    options: [
      "Punishing all incorrect behaviors at once",
      "Reinforcing successive approximations toward a target behavior",
      "Ignoring behavior until it disappears",
      "Pairing two unrelated stimuli together"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "Delay discounting refers to which phenomenon?",
    options: [
      "Future rewards become more desirable the longer you wait",
      "The subjective value of a reward decreases as the delay to receiving it increases",
      "Punishment becomes weaker when it is delayed",
      "Extinction is more rapid with longer inter-trial intervals"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "Pavlovian extinction involves:",
    options: [
      "Presenting the US without the CS",
      "Presenting the CS without the US until the CR decreases",
      "Strengthening the CR by increasing CS intensity",
      "Pairing the CS with a new, stronger US"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "According to the conditioned suppression account of punishment, punishment reduces behavior because:",
    options: [
      "It directly erases the S-R association",
      "It creates an emotional/fear response that interferes with ongoing behavior",
      "It permanently destroys the memory trace",
      "It increases motivation to seek alternative rewards"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "A key criticism of punishment as a behavior-change strategy is that:",
    options: [
      "It is impossible to apply consistently",
      "It tells the organism what not to do but does not teach what behavior is acceptable",
      "It only works for Pavlovian behaviors",
      "It can only suppress food-related behaviors"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "Spontaneous recovery in Pavlovian conditioning demonstrates that:",
    options: [
      "Extinction permanently destroys the original CS-US association",
      "After extinction and a rest period, the CR can re-emerge",
      "Reinforcement always overpowers extinction",
      "Habituation and extinction are the same process"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "Renewal of an extinguished response occurs when:",
    options: [
      "The US is presented alone after extinction",
      "The organism is tested in a context different from where extinction took place",
      "The CS intensity is increased",
      "A new operant response is reinforced"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "The Premack Principle states that:",
    options: [
      "Any stimulus can serve as a reinforcer if presented after a response",
      "High-probability behaviors can be used to reinforce low-probability behaviors",
      "Punishment is always more effective than reinforcement",
      "Extinction permanently weakens all responses"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "In Rescorla's contingency framework, conditioned inhibition occurs when:",
    options: [
      "P(US | CS) > P(US | no CS)",
      "P(US | CS) = P(US | no CS)",
      "P(US | CS) < P(US | no CS)",
      "The CS always immediately precedes the US"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "The blocking effect demonstrates that:",
    options: [
      "Simple temporal contiguity is enough for conditioning",
      "A CS only gains strength if it adds new predictive information",
      "All stimuli present during conditioning gain equal strength",
      "Motor fatigue prevents responding"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "Outcome devaluation is mainly used to test whether behavior is:",
    options: [
      "Habitual or goal-directed",
      "Pavlovian or sensory",
      "Innate or reflexive",
      "Strong or weak"
    ],
    correct: 0,
    difficulty: "hard"
  }
];

let state = {};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function makePlayer(name, token) {
  return {
    name,
    token,
    currentSpace: 0,
    turnStartSpace: 0,

    totalCorrect: 0,
    totalWrong: 0,
    lostMoveCount: 0,

    totalImmediate: 0,
    totalDelayed: 0,

    c1Immediate: 0, c1Delayed: 0,
    c2Immediate: 0, c2Delayed: 0,
    c3Immediate: 0, c3Delayed: 0,

    cueShown: 0,
    cueRewarded: 0,

    delayedRewards: []
  };
}

function resetState() {
  const shuffledQuestions = [...QUESTIONS];
  shuffle(shuffledQuestions);

  state = {
    turn: 0,
    activePlayerIndex: 0,
    gameOver: false,
    cueThisTurn: false,
    currentQuestion: null,
    questionIndex: 0,
    questions: shuffledQuestions,
    players: [
      makePlayer('Player 1', '🧠'),
      makePlayer('Player 2', '🔬')
    ]
  };
}

function currentPlayer() {
  return state.players[state.activePlayerIndex];
}

function nextPlayer() {
  state.activePlayerIndex = state.activePlayerIndex === 0 ? 1 : 0;
}

function clampPlayer(player) {
  if (player.currentSpace < 0) player.currentSpace = 0;
  if (player.currentSpace > TOTAL_SPACES + 1) player.currentSpace = TOTAL_SPACES + 1;
}

function conditionOf(space) {
  if (space <= 7) return 1;
  if (space <= 14) return 2;
  return 3;
}

function conditionLabel(cond) {
  return ['', 'Acquisition', 'Increased Delay', 'Extinction'][cond];
}

function setMessage(icon, html) {
  messageIcon.textContent = icon;
  messageBox.innerHTML = html;
}

function showScreen(screen) {
  [startScreen, instructionsScreen, gameScreen, summaryScreen].forEach(s => {
    s.classList.remove('active');
  });
  screen.classList.add('active');
  window.scrollTo(0, 0);
}

function updateCondChip(cond) {
  condChip.className = 'stat-chip cond-chip';
  if (cond === 2) condChip.classList.add('c2');
  if (cond === 3) condChip.classList.add('c3');
  conditionDisplay.textContent = conditionLabel(cond);
}

function updatePanel() {
  const player = currentPlayer();
  const p1 = state.players[0];
  const p2 = state.players[1];

  turnDisplay.textContent = state.turn;
  playerDisplay.textContent = `${player.name} ${player.token}`;
  p1SpaceDisplay.textContent = p1.currentSpace;
  p2SpaceDisplay.textContent = p2.currentSpace;
  correctDisplay.textContent = player.totalCorrect;
  wrongDisplay.textContent = player.totalWrong;

  const displaySpace = player.currentSpace <= 0 ? 1 : Math.min(player.currentSpace, TOTAL_SPACES);
  updateCondChip(conditionOf(displaySpace));
}

function buildBoard() {
  boardContainer.innerHTML = '';

  // matched to your latest sketch
  const positions = [
    { top: 50, left: 22 }, // 1
    { top: 45, left: 30 }, // 2
    { top: 36, left: 38 }, // 3
    { top: 24, left: 49 }, // 4
    { top: 20, left: 59 }, // 5
    { top: 22, left: 71 }, // 6
    { top: 32, left: 81 }, // 7
    { top: 47, left: 86 }, // 8
    { top: 61, left: 82 }, // 9
    { top: 53, left: 67 }, // 10
    { top: 41, left: 58 }, // 11
    { top: 35, left: 71 }, // 12
    { top: 31, left: 63 }, // 13
    { top: 29, left: 52 }, // 14
    { top: 38, left: 46 }, // 15
    { top: 56, left: 43 }, // 16
    { top: 56, left: 56 }, // 17
    { top: 72, left: 60 }, // 18
    { top: 69, left: 74 }, // 19
    { top: 79, left: 83 }  // 20
  ];

  positions.forEach((pos, index) => {
    const num = index + 1;
    const space = document.createElement('div');
    space.className = 'brain-space';
    space.id = `space-${num}`;

    const cond = conditionOf(num);
    if (cond === 1) space.classList.add('c1');
    if (cond === 2) space.classList.add('c2');
    if (cond === 3) space.classList.add('c3');
    if (CUE_SPACES.has(num)) space.classList.add('cue');

    space.textContent = CUE_SPACES.has(num) ? '⚡' : num;
    space.style.top = `${pos.top}%`;
    space.style.left = `${pos.left}%`;

    boardContainer.appendChild(space);
  });

  renderTokens();
}

function getTokenContainerForSpace(spaceNumber) {
  const spaceEl = document.getElementById(`space-${spaceNumber}`);
  if (!spaceEl) return null;

  let wrap = spaceEl.querySelector('.player-token-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'player-token-wrap';
    spaceEl.appendChild(wrap);
  }
  return wrap;
}

function clearTokens() {
  document.querySelectorAll('.player-token-wrap').forEach(el => el.remove());
  document.querySelectorAll('.space-active').forEach(el => el.classList.remove('space-active'));
  document.querySelectorAll('.start-token-wrap').forEach(el => el.remove());
  document.querySelectorAll('.finish-token-wrap').forEach(el => el.remove());
}

function renderTokens() {
  clearTokens();

  const activePlayer = currentPlayer();
  if (activePlayer.currentSpace >= 1 && activePlayer.currentSpace <= TOTAL_SPACES) {
    const activeSpaceEl = document.getElementById(`space-${activePlayer.currentSpace}`);
    activeSpaceEl?.classList.add('space-active');
  }

  const startNode = document.querySelector('.start-node');
  const finishNode = document.querySelector('.finish-node');

  const startWrap = document.createElement('div');
  startWrap.className = 'start-token-wrap';
  startWrap.style.display = 'flex';
  startWrap.style.gap = '3px';
  startWrap.style.marginTop = '6px';

  const finishWrap = document.createElement('div');
  finishWrap.className = 'finish-token-wrap';
  finishWrap.style.display = 'flex';
  finishWrap.style.gap = '3px';
  finishWrap.style.marginTop = '6px';

  state.players.forEach(player => {
    const tokenEl = document.createElement('div');
    tokenEl.className = 'player-token-icon';
    tokenEl.textContent = player.token;

    if (player.currentSpace <= 0) {
      startWrap.appendChild(tokenEl);
    } else if (player.currentSpace >= TOTAL_SPACES + 1) {
      finishWrap.appendChild(tokenEl);
    } else {
      const wrap = getTokenContainerForSpace(player.currentSpace);
      wrap?.appendChild(tokenEl);
    }
  });

  if (startWrap.children.length > 0) startNode.appendChild(startWrap);
  if (finishWrap.children.length > 0) finishNode.appendChild(finishWrap);
}

function updatePendingUI() {
  const player = currentPlayer();

  if (player.delayedRewards.length === 0) {
    pendingRewardsCard.classList.add('hidden');
    return;
  }

  pendingRewardsCard.classList.remove('hidden');
  pendingList.innerHTML = '';

  player.delayedRewards.forEach((reward, index) => {
    const item = document.createElement('div');
    item.className = 'pending-item';
    item.textContent = `Reward ${index + 1}: +${reward.spaces} spaces in ${reward.turnsLeft} turn${reward.turnsLeft !== 1 ? 's' : ''}`;
    pendingList.appendChild(item);
  });
}

function processDelayedRewards() {
  const player = currentPlayer();

  if (player.delayedRewards.length === 0) return null;

  player.delayedRewards.forEach(reward => {
    reward.turnsLeft--;
  });

  const dueRewards = player.delayedRewards.filter(reward => reward.turnsLeft <= 0);
  player.delayedRewards = player.delayedRewards.filter(reward => reward.turnsLeft > 0);

  if (dueRewards.length === 0) return null;

  const totalSpaces = dueRewards.reduce((sum, reward) => sum + reward.spaces, 0);
  player.currentSpace += totalSpaces;
  clampPlayer(player);

  renderTokens();
  updatePanel();
  updatePendingUI();

  return totalSpaces;
}

function resolveCue() {
  const player = currentPlayer();

  if (!state.cueThisTurn) return;

  const cond = conditionOf(player.currentSpace);
  let rewarded = false;

  if (cond === 1) rewarded = true;
  else if (cond === 2) rewarded = Math.random() < 0.5;

  player.cueShown++;

  if (rewarded) {
    player.cueRewarded++;
    player.currentSpace += 2;
    clampPlayer(player);
    renderTokens();
    updatePanel();
    setMessage('⚡', `The <strong>⚡ cue</strong> paid off for ${player.name}. Bonus <strong>+2 spaces</strong>.`);
  } else {
    if (cond === 3) {
      setMessage('⚡', `${player.name} landed on a <strong>⚡ cue space</strong>, but in this phase the cue no longer predicts a reward.`);
    } else {
      setMessage('⚡', `${player.name} hit a <strong>⚡ cue space</strong>, but it didn’t pay off this time.`);
    }
  }
}

function nextQuestion() {
  const question = state.questions[state.questionIndex % state.questions.length];
  state.questionIndex++;
  return question;
}

function showQuestion() {
  questionCard.classList.remove('hidden');
  choiceCard.classList.add('hidden');

  const question = nextQuestion();
  state.currentQuestion = question;
  questionText.textContent = question.prompt;

  qDifficultyBadge.textContent =
    question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
  qDifficultyBadge.className = 'q-badge';
  if (question.difficulty === 'medium') qDifficultyBadge.classList.add('med');
  if (question.difficulty === 'hard') qDifficultyBadge.classList.add('hard');

  answerButtons.innerHTML = '';

  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(index));
    answerButtons.appendChild(btn);
  });
}

function handleAnswer(selectedIndex) {
  const player = currentPlayer();
  const question = state.currentQuestion;
  const isCorrect = selectedIndex === question.correct;

  const btns = answerButtons.querySelectorAll('.answer-btn');
  btns.forEach((btn, idx) => {
    btn.classList.add('disabled-ans');
    if (idx === question.correct) btn.classList.add('correct-ans');
    if (idx === selectedIndex && !isCorrect) btn.classList.add('wrong-ans');
  });

  if (isCorrect) {
    player.totalCorrect++;
    updatePanel();
    resolveCue();

    setTimeout(() => {
      questionCard.classList.add('hidden');
      showChoiceScreen();
    }, 800);
  } else {
    player.totalWrong++;
    player.lostMoveCount++;

    player.currentSpace = player.turnStartSpace;
    clampPlayer(player);

    renderTokens();
    updatePanel();

    setTimeout(() => {
      questionCard.classList.add('hidden');
      setMessage('🚫', `${player.name} got it wrong, so they lose that move and go back to where they started the turn.`);

      if (checkFinish()) return;

      nextPlayer();
      updatePanel();
      updatePendingUI();
      rollBtn.disabled = false;

      setTimeout(() => {
        setMessage('🎲', `Now it’s <strong>${currentPlayer().name}</strong>’s turn. Click <strong>Roll</strong>.`);
      }, 600);
    }, 800);
  }
}

function showChoiceScreen() {
  choiceCard.classList.remove('hidden');

  const player = currentPlayer();
  const displaySpace = player.currentSpace <= 0 ? 1 : Math.min(player.currentSpace, TOTAL_SPACES);
  const cond = conditionOf(displaySpace);

  if (cond === 1) {
    choiceText.textContent = `${player.name}, choose your reward.`;
    immediateDesc.textContent = '+1 space right now';
    delayedDesc.textContent = '+3 spaces next turn';
  } else if (cond === 2) {
    choiceText.textContent = `${player.name}, the delay is longer now.`;
    immediateDesc.textContent = '+1 space right now';
    delayedDesc.textContent = '+3 spaces after 2 turns';
  } else {
    choiceText.textContent = `${player.name}, this is extinction.`;
    immediateDesc.textContent = '+1 space right now';
    delayedDesc.textContent = '(delayed reward no longer works)';
  }
}

function recordChoice(player, type) {
  const displaySpace = player.currentSpace <= 0 ? 1 : Math.min(player.currentSpace, TOTAL_SPACES);
  const cond = conditionOf(displaySpace);

  if (type === 'immediate') {
    player.totalImmediate++;
    if (cond === 1) player.c1Immediate++;
    if (cond === 2) player.c2Immediate++;
    if (cond === 3) player.c3Immediate++;
  } else {
    player.totalDelayed++;
    if (cond === 1) player.c1Delayed++;
    if (cond === 2) player.c2Delayed++;
    if (cond === 3) player.c3Delayed++;
  }
}

function handleImmediateChoice() {
  const player = currentPlayer();
  recordChoice(player, 'immediate');

  choiceCard.classList.add('hidden');

  player.currentSpace += 1;
  clampPlayer(player);
  renderTokens();
  updatePanel();

  if (checkFinish()) return;

  const playerName = player.name;
  nextPlayer();
  updatePanel();
  updatePendingUI();
  rollBtn.disabled = false;

  setMessage('⚡', `${playerName} took the <strong>immediate reward</strong> and moved forward 1 space. Now it’s <strong>${currentPlayer().name}</strong>’s turn.`);
}

function handleDelayedChoice() {
  const player = currentPlayer();
  recordChoice(player, 'delayed');

  choiceCard.classList.add('hidden');

  const displaySpace = player.currentSpace <= 0 ? 1 : Math.min(player.currentSpace, TOTAL_SPACES);
  const cond = conditionOf(displaySpace);
  const playerName = player.name;

  if (cond === 1) {
    player.delayedRewards.push({ turnsLeft: 1, spaces: 3 });
    setMessage('⏳', `${playerName} chose the <strong>delayed reward</strong>. They’ll get <strong>+3 spaces</strong> at the start of their next turn.`);
  } else if (cond === 2) {
    player.delayedRewards.push({ turnsLeft: 2, spaces: 3 });
    setMessage('⏳', `${playerName} chose the <strong>delayed reward</strong>. They’ll get <strong>+3 spaces</strong> in <strong>2 turns</strong>.`);
  } else {
    setMessage('💀', `${playerName} chose the delayed option, but in extinction it no longer pays off.`);
  }

  if (checkFinish()) return;

  nextPlayer();
  updatePanel();
  updatePendingUI();
  rollBtn.disabled = false;
}

function handleRoll() {
  if (state.gameOver) return;

  const player = currentPlayer();

  rollBtn.disabled = true;
  questionCard.classList.add('hidden');
  choiceCard.classList.add('hidden');

  state.turn++;
  player.turnStartSpace = player.currentSpace;
  updatePanel();

  const deliveredSpaces = processDelayedRewards();
  if (checkFinish()) return;

  const doRoll = () => {
    const roll = Math.floor(Math.random() * 3) + 1;
    player.currentSpace += roll;
    clampPlayer(player);

    if (player.currentSpace > TOTAL_SPACES) {
      player.currentSpace = TOTAL_SPACES + 1;
    }

    state.cueThisTurn = player.currentSpace >= 1 &&
      player.currentSpace <= TOTAL_SPACES &&
      CUE_SPACES.has(player.currentSpace);

    renderTokens();
    updatePanel();

    if (checkFinish()) return;

    let msg = `${player.name} rolled a <strong>${roll}</strong>`;
    if (player.currentSpace >= 1 && player.currentSpace <= TOTAL_SPACES) {
      msg += ` and moved to space <strong>${player.currentSpace}</strong>`;
      if (state.cueThisTurn) msg += ` — a <strong>⚡ cue space</strong>`;
      msg += `. Answer the question to unlock the reward choice.`;
      setMessage('🎲', msg);
      setTimeout(showQuestion, 500);
    } else {
      setMessage('🏁', `${player.name} rolled all the way to the finish!`);
      checkFinish();
    }
  };

  if (deliveredSpaces !== null) {
    setMessage('🎁', `${player.name}'s delayed reward arrived: <strong>+${deliveredSpaces} spaces</strong>.`);
    setTimeout(doRoll, 900);
  } else {
    doRoll();
  }
}

function checkFinish() {
  const winner = state.players.find(player => player.currentSpace >= TOTAL_SPACES + 1);
  if (!winner) return false;

  winner.currentSpace = TOTAL_SPACES + 1;
  state.gameOver = true;
  renderTokens();
  updatePanel();

  setMessage('🏁', `<strong>${winner.name}</strong> reached the finish first! Loading the summary...`);
  setTimeout(showSummary, 1200);
  return true;
}

function playerSummaryHTML(player) {
  const totalAnswered = player.totalCorrect + player.totalWrong;
  const accuracy = totalAnswered === 0
    ? 0
    : Math.round((player.totalCorrect / totalAnswered) * 100);

  const notes = [];

  if (player.c2Delayed < player.c1Delayed) {
    notes.push('Chose the delayed reward less often when the wait got longer.');
  }

  if (player.c3Delayed > 0) {
    notes.push('Still tried the delayed reward during extinction.');
  }

  if (player.cueShown > player.cueRewarded) {
    notes.push('Experienced cue exposure even when the cue stopped being reliable.');
  }

  if (player.lostMoveCount > 0) {
    notes.push('Lost turns after wrong answers, which created a real cost for incorrect responding.');
  }

  if (notes.length === 0) {
    notes.push('Showed pretty stable responding across the game.');
  }

  return `
    <div class="player-summary-card">
      <h3>${player.name} ${player.token}</h3>
      <p><strong>Final Position:</strong> ${player.currentSpace >= TOTAL_SPACES + 1 ? 'Finish' : player.currentSpace}</p>
      <p><strong>Correct:</strong> ${player.totalCorrect}</p>
      <p><strong>Wrong:</strong> ${player.totalWrong}</p>
      <p><strong>Accuracy:</strong> ${accuracy}%</p>
      <p><strong>Lost Moves:</strong> ${player.lostMoveCount}</p>
      <p><strong>Condition 1:</strong> Immediate ${player.c1Immediate}, Delayed ${player.c1Delayed}</p>
      <p><strong>Condition 2:</strong> Immediate ${player.c2Immediate}, Delayed ${player.c2Delayed}</p>
      <p><strong>Condition 3:</strong> Immediate ${player.c3Immediate}, Delayed ${player.c3Delayed}</p>
      <p><strong>Cue Shown:</strong> ${player.cueShown} | <strong>Cue Rewarded:</strong> ${player.cueRewarded}</p>
      <p><strong>Interpretation:</strong> ${notes.join(' ')}</p>
    </div>
  `;
}

function showSummary() {
  const p1 = state.players[0];
  const p2 = state.players[1];

  const totalCorrect = p1.totalCorrect + p2.totalCorrect;
  const totalWrong = p1.totalWrong + p2.totalWrong;
  const totalAnswered = totalCorrect + totalWrong;
  const totalLostMoves = p1.lostMoveCount + p2.lostMoveCount;
  const cueShownTotal = p1.cueShown + p2.cueShown;
  const cueRewardedTotal = p1.cueRewarded + p2.cueRewarded;

  const accuracy = totalAnswered === 0
    ? '—'
    : `${Math.round((totalCorrect / totalAnswered) * 100)}%`;

  summaryCorrect.textContent = totalCorrect;
  summaryWrong.textContent = totalWrong;
  summaryAccuracy.textContent = accuracy;
  summaryPunishment.textContent = totalLostMoves;
  summaryCueShown.textContent = cueShownTotal;
  summaryCueRewarded.textContent = cueRewardedTotal;

  summaryPlayers.innerHTML = playerSummaryHTML(p1) + playerSummaryHTML(p2);

  const winner =
    p1.currentSpace >= TOTAL_SPACES + 1
      ? p1
      : p2.currentSpace >= TOTAL_SPACES + 1
        ? p2
        : null;

  const notes = [];
  if (winner) {
    notes.push(`<p><strong>Winner:</strong> ${winner.name} finished first.</p>`);
  }
  notes.push(`<p>Compare the two player summaries to see whether both players responded the same way to delay, cue reliability, and extinction.</p>`);
  notes.push(`<p>If delayed choices dropped from Condition 1 to Condition 2, that supports delay discounting. If delayed choices kept showing up in Condition 3, that suggests persistence after prior reinforcement.</p>`);
  notes.push(`<p>Wrong answers cost the whole move from that turn, so incorrect responding had a clear punishment-like effect in gameplay.</p>`);

  summaryInterpretation.innerHTML = notes.join('');
  showScreen(summaryScreen);
}

function startGame() {
  resetState();
  buildBoard();
  updatePanel();
  updatePendingUI();

  questionCard.classList.add('hidden');
  choiceCard.classList.add('hidden');
  rollBtn.disabled = false;

  setMessage('🎲', `Welcome to the game. <strong>${currentPlayer().name}</strong> goes first. Click <strong>Roll</strong> to begin.`);
  showScreen(gameScreen);
}

openHelpBtn?.addEventListener('click', () => {
  helpModal.classList.remove('hidden');
});

closeHelpBtn?.addEventListener('click', () => {
  helpModal.classList.add('hidden');
});

document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
  helpModal.classList.add('hidden');
});

goToInstructionsBtn.addEventListener('click', () => showScreen(instructionsScreen));
backToTitleBtn.addEventListener('click', () => showScreen(startScreen));
startGameBtn.addEventListener('click', startGame);
startFromInstrBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backToTitleFinalBtn.addEventListener('click', () => showScreen(startScreen));

rollBtn.addEventListener('click', handleRoll);
immediateBtn.addEventListener('click', handleImmediateChoice);
delayedBtn.addEventListener('click', handleDelayedChoice);

showScreen(startScreen);