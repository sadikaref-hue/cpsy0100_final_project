// Behavior Lab — script.js
// Side-profile brain board, final challenge mechanic, wiggly path

// ============================================================
//  DOM REFERENCES
// ============================================================
const startScreen = document.getElementById('start-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const gameScreen = document.getElementById('game-screen');
const summaryScreen = document.getElementById('summary-screen');
const gameSvg = document.getElementById('game-svg');
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
const qTitleText = document.getElementById('q-title-text');
const finalChallengeBanner = document.getElementById('final-challenge-banner');
const choiceCard = document.getElementById('choice-card');
const choiceText = document.getElementById('choice-text');
const immediateBtn = document.getElementById('immediate-btn');
const delayedBtn = document.getElementById('delayed-btn');
const immediateDesc = document.getElementById('immediate-desc');
const delayedDesc = document.getElementById('delayed-desc');
const helpModal = document.getElementById('help-modal');

// ============================================================
//  BOARD GEOMETRY
//  The board is drawn inside a side-profile brain silhouette.
//  Three rows snake left→right, right→left, left→right.
//
//  SVG viewBox: 0 0 900 560
//  Brain occupies roughly x=30..870, y=20..530
//
//  Row A (Condition 1, spaces 1-7):  y ≈ 130, left→right
//  Row B (Condition 2, spaces 8-14): y ≈ 290, right→left
//  Row C (Condition 3, spaces 15-21):y ≈ 435, left→right
// ============================================================
const R = 22;
const TOTAL_SPACES = 21;
const CUE_SPACES = new Set([4, 9, 13, 17, 20]);

// Wiggly positions — each space has a slightly varied y for organic feel
const SPACE_POS = [
  null,
  // Row A: left → right (Condition 1)
  { x: 100, y: 136 },
  { x: 215, y: 120 },
  { x: 328, y: 130 },
  { x: 438, y: 115 },
  { x: 548, y: 126 },
  { x: 658, y: 114 },
  { x: 768, y: 128 },
  // Row B: right → left (Condition 2)
  { x: 768, y: 282 },
  { x: 658, y: 296 },
  { x: 548, y: 282 },
  { x: 438, y: 296 },
  { x: 328, y: 282 },
  { x: 215, y: 294 },
  { x: 100, y: 280 },
  // Row C: left → right (Condition 3)
  { x: 100, y: 430 },
  { x: 215, y: 418 },
  { x: 328, y: 432 },
  { x: 438, y: 420 },
  { x: 548, y: 434 },
  { x: 658, y: 422 },
  { x: 768, y: 436 },
];

const COND_STYLE = {
  1: { fill: '#d1fae5', stroke: '#10b981', text: '#065f46' },
  2: { fill: '#cffafe', stroke: '#06b6d4', text: '#0e4f5e' },
  3: { fill: '#fee2e2', stroke: '#ef4444', text: '#7f1d1d' },
};

function conditionOf(n) { if (n <= 7) return 1; if (n <= 14) return 2; return 3; }
function conditionLabel(c) { return ['', 'Acquisition', 'Increased Delay', 'Extinction'][c]; }

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
function elTxt(tag, txt, attrs = {}) {
  const e = el(tag, attrs);
  e.textContent = txt;
  return e;
}

// ============================================================
//  BUILD SVG BOARD
// ============================================================
function buildSVG() {
  while (gameSvg.firstChild) gameSvg.removeChild(gameSvg.lastChild);

  // ---- DEFS ----
  const defs = el('defs');

  // Brain fill gradient
  const g = el('radialGradient', { id: 'brainGrad', cx: '42%', cy: '40%', r: '62%' });
  g.appendChild(el('stop', { offset: '0%', 'stop-color': '#f0ebff' }));
  g.appendChild(el('stop', { offset: '100%', 'stop-color': '#e2d9f7' }));
  defs.appendChild(g);

  // Drop shadow filter
  const f = el('filter', { id: 'bshadow', x: '-8%', y: '-8%', width: '116%', height: '116%' });
  const fgb = el('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '10' });
  const foff = el('feOffset', { dx: '0', dy: '6', result: 'ob' });
  const ffl = el('feFlood', { 'flood-color': 'rgba(109,40,217,0.20)', result: 'fc' });
  const fco = el('feComposite', { in: 'fc', in2: 'ob', operator: 'in', result: 'sh' });
  const fm = el('feMerge');
  fm.appendChild(el('feMergeNode', { in: 'sh' }));
  fm.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
  f.appendChild(fgb); f.appendChild(foff); f.appendChild(ffl); f.appendChild(fco); f.appendChild(fm);
  defs.appendChild(f);

  // Cue glow filter
  const glow = el('filter', { id: 'cglow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  const fgl = el('feGaussianBlur', { stdDeviation: '4', result: 'blur' });
  const fgm = el('feMerge');
  fgm.appendChild(el('feMergeNode', { in: 'blur' }));
  fgm.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
  glow.appendChild(fgl); glow.appendChild(fgm);
  defs.appendChild(glow);

  // Arrowhead marker
  const mark = el('marker', { id: 'arr', markerWidth: '7', markerHeight: '7', refX: '5', refY: '3.5', orient: 'auto' });
  mark.appendChild(el('polygon', { points: '0 0,7 3.5,0 7', fill: '#a78bfa' }));
  defs.appendChild(mark);

  gameSvg.appendChild(defs);

  // ============================================================
  //  SIDE-PROFILE BRAIN SILHOUETTE
  //
  //  This path traces a left-facing lateral brain profile:
  //  - Frontal lobe: upper-left dome
  //  - Parietal lobe: top ridge
  //  - Occipital lobe: rear bump
  //  - Temporal lobe: lower-right extension
  //  - Cerebellum: lower-rear rounded mass
  //  - Brainstem: thin neck descending from cerebellum
  //  - Frontal base curves back under to close the shape
  //
  //  Color scheme: purple/violet matching the game palette.
  // ============================================================
  gameSvg.appendChild(el('path', {
    d: `
      M 210,48
      C 240,28 278,18 318,16
      C 358,14 398,24 432,44
      C 462,28 498,20 534,22
      C 574,24 610,42 638,68
      C 668,58 702,60 730,76
      C 758,92 778,118 782,148
      C 800,152 818,164 830,182
      C 844,202 848,228 840,252
      C 860,268 870,294 866,320
      C 862,346 848,368 828,382
      C 836,402 834,426 820,446
      C 804,466 780,476 756,474
      C 740,492 716,502 690,502
      C 668,518 640,524 612,518
      C 590,530 564,532 540,522
      C 520,534 496,536 474,526
      C 458,538 438,542 418,536
      C 395,542 370,538 350,524
      C 326,530 300,524 280,510
      C 260,518 238,514 222,500
      C 198,506 174,496 158,478
      C 136,478 114,464 100,444
      C 78,440 58,422 50,398
      C 36,390 22,374 18,354
      C 10,338 10,318 18,302
      C 8,286 6,266 12,248
      C 18,228 34,212 54,204
      C 50,190 50,174 58,160
      C 68,144 84,132 104,128
      C 106,112 116,98 130,88
      C 148,76 170,70 192,70
      C 196,58 202,52 210,48 Z
    `,
    fill: 'url(#brainGrad)',
    stroke: '#8b5cf6',
    'stroke-width': '5',
    'stroke-linejoin': 'round',
    filter: 'url(#bshadow)',
  }));

  // ============================================================
  //  SULCI — gyri fold lines giving the brain texture
  //  Styled to match the purple/violet palette
  // ============================================================

  // // Helper to add a sulcus path
  const sulcus = (d, sw = '2', op = '0.6', dash = null, cap = 'round') => {
    const attrs = {
      d, fill: 'none', stroke: '#9d78f0',
      'stroke-width': sw, 'stroke-linecap': cap, opacity: op,
    };
    if (dash) attrs['stroke-dasharray'] = dash;
    gameSvg.appendChild(el('path', attrs));
  };

  // // Top frontal / parietal gyri — sweeping curves across the crown
  // sulcus('M 130,100 C 170,76 220,62 270,58 C 320,54 370,60 412,72', '2.5', '0.65');
  // sulcus('M 120,124 C 165,100 218,84 272,80 C 326,76 378,84 422,98', '2', '0.55');
  // sulcus('M 212,50 C 248,38 290,30 334,28 C 378,26 420,34 456,50', '2', '0.5');
  // sulcus('M 440,48 C 480,32 524,26 566,28 C 604,30 638,46 662,70', '2', '0.5');
  // sulcus('M 640,70 C 670,52 706,44 740,50 C 766,56 786,72 796,96', '2', '0.5');

  // // Central sulcus divider (parietal/frontal boundary) — prominent
  // sulcus('M 446,48 C 440,90 436,150 434,200', '3', '0.55');
  // sulcus('M 478,42 C 474,86 470,148 468,200', '2', '0.45');

  // // Between Row A and Row B (y ≈ 165–230) — horizontal gyri bands
  // sulcus('M 42,168 C 120,154 210,148 310,150 C 400,152 450,158 490,156 C 560,152 640,148 730,154 C 780,158 820,166 844,178', '2.5', '0.6');
  // sulcus('M 38,192 C 118,178 210,172 312,174 C 402,176 452,182 492,180 C 562,176 644,172 736,178 C 788,182 828,192 850,206', '2', '0.5');
  // sulcus('M 40,215 C 120,202 214,196 316,198 C 408,200 456,206 494,204 C 566,200 648,196 740,202 C 794,206 832,216 854,230', '1.8', '0.4');

  // // Vertical sulci between spaces in Row A (frontal lobe columns)
  // sulcus('M 258,112 C 255,140 253,168 252,194', '1.8', '0.5');
  // sulcus('M 372,122 C 370,148 368,174 367,198', '1.8', '0.5');
  // sulcus('M 490,110 C 490,138 490,166 490,192', '1.8', '0.5');
  // sulcus('M 604,116 C 604,144 604,170 604,196', '1.8', '0.5');

  // // Between Row B and Row C (y ≈ 330–390) — horizontal gyri bands
  // sulcus('M 36,335 C 118,322 210,316 314,318 C 406,320 456,326 494,324 C 566,320 650,316 742,322 C 796,326 836,336 858,350', '2.5', '0.6');
  // sulcus('M 34,360 C 118,346 212,340 316,342 C 408,344 458,350 496,348 C 570,344 654,340 746,346 C 800,350 840,360 860,374', '2', '0.5');
  // sulcus('M 36,382 C 120,370 216,364 318,366 C 412,368 460,374 498,372 C 572,368 656,364 748,370 C 804,374 842,384 862,398', '1.8', '0.4');

  // // Vertical sulci between spaces in Row B (parietal columns)
  // sulcus('M 258,275 C 255,302 252,330 250,357', '1.8', '0.5');
  // sulcus('M 372,284 C 370,310 368,338 366,364', '1.8', '0.5');
  // sulcus('M 490,278 C 490,306 490,334 490,362', '1.8', '0.5');
  // sulcus('M 604,288 C 604,314 604,342 604,368', '1.8', '0.5');

  // // Occipital / temporal lobe bumps (right side)
  // sulcus('M 828,378 C 840,398 844,422 836,446', '2', '0.55');
  // sulcus('M 802,382 C 816,404 820,430 812,454', '1.8', '0.5');
  // sulcus('M 760,428 C 768,450 770,476 762,498', '2', '0.55');
  // sulcus('M 732,440 C 738,462 740,488 732,510', '1.8', '0.5');

  // // Left side temporal gyri
  // sulcus('M 22,256 C 28,278 30,302 26,326', '2', '0.55');
  // sulcus('M 46,250 C 52,274 54,300 50,326', '1.8', '0.5');

  // // Bottom occipital bumps
  // sulcus('M 198,508 C 240,516 284,520 330,518', '2', '0.55');
  // sulcus('M 468,524 C 510,530 554,530 596,524', '2', '0.55');

  // // Cerebellum suggestion (lower right area)
  // sulcus('M 690,498 C 720,490 748,482 770,468', '2.5', '0.6');
  // sulcus('M 680,510 C 712,504 742,496 764,480', '2', '0.5');
  // sulcus('M 668,520 C 700,516 732,508 756,492', '1.8', '0.45');

  // // Brainstem (left side, lower area)
  // sulcus('M 100,440 C 84,454 72,470 68,490 C 64,508 66,524 72,538', '4', '0.5', null, 'round');
  // sulcus('M 130,442 C 118,458 108,476 106,496 C 104,514 108,530 116,542', '3', '0.4', null, 'round');

  // ============================================================
  //  CONNECTOR LINES between spaces (wiggly S-curves + curved elbows)
  // ============================================================
  for (let i = 1; i < TOTAL_SPACES; i++) {
    const from = SPACE_POS[i];
    const to = SPACE_POS[i + 1];
    const isElbow = (i === 7 || i === 14);

    if (isElbow) {
      // Curved elbow turn at end of each row
      const c1x = from.x + (i === 7 ? 80 : -80);
      const c1y = from.y + 90;
      const c2x = to.x + (i === 7 ? 80 : -80);
      const c2y = to.y - 90;
      gameSvg.appendChild(el('path', {
        d: `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`,
        fill: 'none', stroke: '#a78bfa', 'stroke-width': '2.8',
        'stroke-dasharray': '8 5', 'stroke-linecap': 'round',
        opacity: '0.85', 'marker-end': 'url(#arr)',
      }));
    } else {
      // Wiggly S-curve between adjacent spaces
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;
      const nx = -uy; // perpendicular x
      const ny = ux; // perpendicular y
      const wiggle = 13;
      const side = (i % 2 === 0) ? 1 : -1;

      const c1x = from.x * 0.6 + to.x * 0.4 + nx * wiggle * side;
      const c1y = from.y * 0.6 + to.y * 0.4 + ny * wiggle * side;
      const c2x = from.x * 0.4 + to.x * 0.6 - nx * wiggle * side;
      const c2y = from.y * 0.4 + to.y * 0.6 - ny * wiggle * side;

      const sx = from.x + ux * (R + 3);
      const sy = from.y + uy * (R + 3);
      const ex = to.x - ux * (R + 9);
      const ey = to.y - uy * (R + 9);

      gameSvg.appendChild(el('path', {
        d: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,
        fill: 'none', stroke: '#a78bfa', 'stroke-width': '2.5',
        'stroke-linecap': 'round', opacity: '0.80', 'marker-end': 'url(#arr)',
      }));
    }
  }

  // ============================================================
  //  SPACE CIRCLES
  // ============================================================
  for (let n = 1; n <= TOTAL_SPACES; n++) {
    const { x, y } = SPACE_POS[n];
    const cond = conditionOf(n);
    const cs = COND_STYLE[cond];
    const isCue = CUE_SPACES.has(n);

    // Cue glow ring
    if (isCue) {
      gameSvg.appendChild(el('circle', {
        cx: x, cy: y, r: R + 8,
        fill: 'rgba(251,191,36,0.22)', stroke: '#fbbf24',
        'stroke-width': '2.5', filter: 'url(#cglow)',
      }));
    }

    // Main circle
    gameSvg.appendChild(el('circle', {
      cx: x, cy: y, r: R,
      fill: cs.fill, stroke: cs.stroke,
      'stroke-width': n === 1 || n === TOTAL_SPACES ? '3.5' : '2.5',
      id: `sc-${n}`,
    }));

    // Number / label
    let lbl = String(n);
    if (n === 1) lbl = 'S';
    if (n === TOTAL_SPACES) lbl = '🏁';
    gameSvg.appendChild(elTxt('text', lbl, {
      x, y,
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-family': 'Fredoka One, cursive', 'font-size': '14',
      fill: cs.text, id: `st-${n}`,
    }));

    // Bell badge for cue spaces
    if (isCue) {
      gameSvg.appendChild(elTxt('text', '🔔', {
        x: x + R - 1, y: y - R + 1,
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': '18', id: `cb-${n}`,
      }));
    }
  }

  // ---- Start / Finish pills ----
  const s1 = SPACE_POS[1];
  const sF = SPACE_POS[TOTAL_SPACES];
  gameSvg.appendChild(el('rect', { x: s1.x - 28, y: s1.y + R + 6, width: 56, height: 20, rx: 10, fill: '#c7d2fe', stroke: '#818cf8', 'stroke-width': '1.5' }));
  gameSvg.appendChild(elTxt('text', 'START', { x: s1.x, y: s1.y + R + 18, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Fredoka One, cursive', 'font-size': '10', fill: '#3730a3' }));
  gameSvg.appendChild(el('rect', { x: sF.x - 30, y: sF.y + R + 6, width: 60, height: 20, rx: 10, fill: '#f5d0fe', stroke: '#d946ef', 'stroke-width': '1.5' }));
  gameSvg.appendChild(elTxt('text', 'FINISH', { x: sF.x, y: sF.y + R + 18, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Fredoka One, cursive', 'font-size': '10', fill: '#86198f' }));

  // ---- Condition zone labels ----
  // [
  //   { x: 434, y: 72, lbl: 'Condition 1 — Acquisition', fill: '#059669' },
  //   { x: 434, y: 236, lbl: 'Condition 2 — Increased Delay', fill: '#0284c7' },
  //   { x: 434, y: 394, lbl: 'Condition 3 — Extinction', fill: '#dc2626' },
  // ].forEach(({ x, y, lbl, fill }) => {
  //   gameSvg.appendChild(elTxt('text', lbl, {
  //     x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
  //     'font-family': 'Nunito, sans-serif', 'font-size': '11', 'font-weight': '700',
  //     fill, opacity: '0.65',
  //   }));
  // });

  // ---- Token layer (populated by renderTokens) ----
  gameSvg.appendChild(el('g', { id: 'token-layer' }));
}

// ============================================================
//  TOKEN RENDERING
// ============================================================
function renderTokens() {
  const layer = document.getElementById('token-layer');
  while (layer.firstChild) layer.removeChild(layer.lastChild);

  const activeP = currentPlayer();

  // Active player ring
  if (activeP.currentSpace >= 1 && activeP.currentSpace <= TOTAL_SPACES) {
    const { x, y } = SPACE_POS[activeP.currentSpace];
    layer.appendChild(el('circle', {
      cx: x, cy: y, r: R + 10,
      fill: 'none', stroke: '#ff6b9d', 'stroke-width': '3', opacity: '0.9',
    }));
  }

  // Group players by space
  const groups = {};
  state.players.forEach(p => {
    if (p.currentSpace >= 1 && p.currentSpace <= TOTAL_SPACES) {
      const k = p.currentSpace;
      if (!groups[k]) groups[k] = [];
      groups[k].push(p);
    }
  });

  Object.entries(groups).forEach(([sn, players]) => {
    const { x, y } = SPACE_POS[Number(sn)];
    const offsets = players.length === 1
      ? [{ ox: 0, oy: 0 }]
      : [{ ox: -14, oy: 0 }, { ox: 14, oy: 0 }];
    players.forEach((p, i) => {
      layer.appendChild(elTxt('text', p.token, {
        x: x + offsets[i].ox, y: y - R - 12,
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': '28',
        style: 'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
      }));
    });
  });

  // Tokens off-board
  state.players.forEach(p => {
    if (p.currentSpace <= 0) {
      const { x, y } = SPACE_POS[1];
      layer.appendChild(elTxt('text', p.token, { x: x - 44, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '28', style: 'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }));
    }
    if (p.currentSpace >= TOTAL_SPACES + 1) {
      const { x, y } = SPACE_POS[TOTAL_SPACES];
      layer.appendChild(elTxt('text', p.token, { x: x + 44, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '28', style: 'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }));
    }
  });
}

// ============================================================
//  QUESTIONS — converted from course question bank
//  Format matches ALL_QUESTIONS in script.js
// ============================================================
const ALL_QUESTIONS = [

  // ==================== UNIT 1 ====================

  // --- Easy ---
  {
    prompt: "What best explains the difference between Pavlovian and instrumental conditioning?",
    options: [
      "Pavlovian focuses on actions, while instrumental focuses on internal states",
      "Pavlovian links stimuli, while instrumental links behavior to outcomes",
      "Pavlovian forms habits directly, while instrumental avoids outcomes entirely",
      "Pavlovian ignores learning history, while instrumental depends only on repetition"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "Why are rats often used in learning experiments?",
    options: [
      "They display complex reasoning similar to humans in controlled settings",
      "They consistently learn faster than other animals in most experiments",
      "They are mammals with simple, controllable behavior",
      "They change behavior reliably without needing reinforcement"
    ],
    correct: 2,
    difficulty: "easy"
  },
  {
    prompt: "What is dishabituation?",
    options: [
      "A permanent loss of a learned response",
      "A response returning after a new stimulus is introduced",
      "A response increasing due to reinforcement",
      "A gradual weakening of response"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is sensitization?",
    options: [
      "A decrease in responding after repeated exposure",
      "A stable response level across trials",
      "A loss of responsiveness over time",
      "An increase in responsiveness after stimulation"
    ],
    correct: 3,
    difficulty: "easy"
  },
  {
    prompt: "Which of the following is NOT a form of learning?",
    options: [
      "Conditioning through repeated pairings",
      "Forming associations between events",
      "Motor fatigue",
      "Reinforcement-based behavior change"
    ],
    correct: 2,
    difficulty: "easy"
  },
  {
    prompt: "What happens during stimulus satiation?",
    options: [
      "A stimulus is removed once a response is consistently produced",
      "A stimulus is overused until it becomes unpleasant",
      "A stimulus is paired with another until a new response forms",
      "A stimulus becomes stronger with repeated reinforcement"
    ],
    correct: 1,
    difficulty: "easy"
  },

  // --- Medium ---
  {
    prompt: "Why do both groups need the same test at the end of an experiment?",
    options: [
      "To make sure differences are due to learning",
      "To ensure both groups experience equal numbers of trials",
      "To keep reinforcement schedules consistent across phases",
      "To reduce variation in testing procedures between groups"
    ],
    correct: 0,
    difficulty: "medium"
  },
  {
    prompt: "What did Siegel's research on drug tolerance show?",
    options: [
      "Tolerance reflects stable biological differences across individuals",
      "Tolerance becomes fixed after repeated exposure to the drug",
      "Tolerance depends only on the amount of drug taken",
      "Tolerance depends on environmental context"
    ],
    correct: 3,
    difficulty: "medium"
  },
  {
    prompt: "According to Dual Process Theory, behavior depends on:",
    options: [
      "Memory strength and reinforcement acting separately",
      "Habituation and sensitization working together",
      "Punishment and reward acting independently",
      "Stimulus-response links without emotional influence"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "Why was there a major issue in early habituation studies?",
    options: [
      "Too many participants introduced unnecessary variability",
      "They did not properly compare groups",
      "Stimuli were too weak to produce measurable responses",
      "Reinforcement procedures varied across trials"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "Why does gradual exposure help reduce reactions?",
    options: [
      "It increases stimulus intensity gradually",
      "It prevents sensitization entirely",
      "It allows adjustment without triggering strong sensitization",
      "It removes the stimulus early"
    ],
    correct: 2,
    difficulty: "medium"
  },
  {
    prompt: "Why is behavior considered ordinal?",
    options: [
      "It measures precise numerical differences between responses",
      "It shows order but not equal spacing between values",
      "It tracks continuous change in behavior over time",
      "It removes differences between individuals completely"
    ],
    correct: 1,
    difficulty: "medium"
  },

  // --- Hard ---
  {
    prompt: "According to Wagner, when does learning occur?",
    options: [
      "When a stimulus is repeated many times",
      "When a stimulus is unexpected or surprising",
      "When a stimulus is weak in intensity",
      "When the context remains constant"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "What happens if a stimulus is already active in short-term memory?",
    options: [
      "The response becomes stronger with repetition",
      "The response becomes weaker",
      "Learning stops completely",
      "Learning increases automatically"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "Why does a longer gap between stimuli improve learning?",
    options: [
      "It increases the intensity of the stimulus",
      "It reduces the number of exposures",
      "It allows the first stimulus to leave short-term memory",
      "It removes contextual influence"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "How does Wagner's model differ from Groves and Thompson's theory?",
    options: [
      "Both models ignore memory processes",
      "Wagner focuses on memory and context, while Groves and Thompson focus on two processes",
      "Groves and Thompson ignore habituation",
      "Wagner ignores sensitization"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "What role does context play in habituation?",
    options: [
      "It has no effect on behavior",
      "It always strengthens responses",
      "It determines whether habituation transfers to new situations",
      "It removes learned associations"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "What does it mean if a response returns in a new environment?",
    options: [
      "No learning occurred",
      "The stimulus was too weak",
      "The learning was tied to the original context",
      "Sensitization replaced habituation"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "Why is it important to compare different groups in experiments?",
    options: [
      "Individuals cannot learn reliably",
      "Behavior remains constant without comparison",
      "It separates learning from fatigue or other changes",
      "Groups always respond more consistently"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "What did Davis and Wagner find about strong stimuli?",
    options: [
      "Weak stimuli produce more consistent learning patterns",
      "Stimulus intensity has no effect on learning outcomes",
      "Strong stimuli can lead to strong habituation",
      "Strong stimuli prevent learning from occurring"
    ],
    correct: 2,
    difficulty: "hard"
  },

  // ==================== UNIT 2 ====================

  // --- Easy ---
  {
    prompt: "What does the Law of Effect suggest?",
    options: [
      "Behaviors followed by positive outcomes are more likely to repeat",
      "Behaviors followed by neutral outcomes are equally likely to continue",
      "Behaviors occur randomly regardless of the outcomes that follow them",
      "Behaviors decrease only when punishment is applied consistently"
    ],
    correct: 0,
    difficulty: "easy"
  },
  {
    prompt: "What is negative reinforcement?",
    options: [
      "Adding an unpleasant stimulus in order to reduce a behavior",
      "Removing something unpleasant to increase behavior",
      "Removing a rewarding stimulus in order to weaken a behavior",
      "Ignoring a behavior completely until it gradually disappears"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is a primary reinforcer?",
    options: [
      "Something naturally rewarding like food",
      "A signal that becomes rewarding through repeated association with outcomes",
      "A neutral event that gains value only after extensive conditioning trials",
      "A consequence that consistently reduces the likelihood of a behavior"
    ],
    correct: 0,
    difficulty: "easy"
  },
  {
    prompt: "What happens in escape learning?",
    options: [
      "A response prevents a stimulus from occurring in the future",
      "Behavior is strengthened without any aversive conditions present",
      "An ongoing unpleasant stimulus is stopped",
      "Stimuli are ignored because they no longer influence behavior"
    ],
    correct: 2,
    difficulty: "easy"
  },
  {
    prompt: "What is the overjustification effect?",
    options: [
      "Motivation increases when external rewards are consistently provided",
      "External rewards reduce internal motivation",
      "Motivation remains unchanged regardless of reward presence",
      "Learning becomes faster when rewards are introduced"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is the difference between escape and avoidance?",
    options: [
      "Both processes involve stopping a stimulus after it has already begun",
      "Escape occurs without learning while avoidance depends on learning",
      "Avoidance relies on punishment while escape relies on reinforcement",
      "Escape ends a stimulus, avoidance prevents it"
    ],
    correct: 3,
    difficulty: "easy"
  },

  // --- Medium ---
  {
    prompt: "Why do secondary reinforcers work?",
    options: [
      "They are naturally rewarding without requiring prior learning experiences",
      "They are associated with primary reinforcers and are immediate",
      "They are stronger than primary reinforcers across most learning situations",
      "They influence behavior even without any connection to prior outcomes"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "Why is shaping useful?",
    options: [
      "It removes unwanted behavior by consistently applying punishment procedures",
      "It replaces learned responses by encouraging automatic reflexive patterns",
      "It builds complex behavior step by step",
      "It avoids difficult tasks by reducing exposure to challenging conditions"
    ],
    correct: 2,
    difficulty: "medium"
  },
  {
    prompt: "What did Tinklepaugh's study show?",
    options: [
      "Animals respond only to rewards that are immediately presented to them",
      "Animals ignore differences between expected and received rewards",
      "Animals rely entirely on habit without considering expected outcomes",
      "Animals form expectations about outcomes"
    ],
    correct: 3,
    difficulty: "medium"
  },
  {
    prompt: "What did Crespi's experiment demonstrate?",
    options: [
      "Behavior remains stable even when reward size changes across trials",
      "Animals react emotionally to changes in reward",
      "Behavior decreases only when rewards are completely removed from tasks",
      "Learning stops entirely when rewards become inconsistent across trials"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "What does the matching law describe?",
    options: [
      "Behavior matches how often rewards are given",
      "Behavior is distributed equally across all available response options",
      "Behavior occurs randomly without regard to reinforcement schedules",
      "Learning stops once reinforcement becomes consistent across choices"
    ],
    correct: 0,
    difficulty: "medium"
  },
  {
    prompt: "What does the Premack Principle explain?",
    options: [
      "High-probability behaviors can reinforce low-probability ones",
      "Punishment is more effective than reinforcement for changing behavior",
      "Reinforcement is unnecessary because behavior changes naturally",
      "Habituation explains why behavior decreases after repeated exposure"
    ],
    correct: 0,
    difficulty: "medium"
  },
  {
    prompt: "What happens in avoidance learning?",
    options: [
      "A response stops a stimulus after it has already started",
      "A response prevents an unpleasant event from happening",
      "Behavior increases without any connection to aversive stimuli",
      "Learning does not occur because the stimulus is never experienced"
    ],
    correct: 1,
    difficulty: "medium"
  },

  // --- Hard ---
  {
    prompt: "What is being tested in outcome devaluation?",
    options: [
      "How well a subject remembers previous learning experiences over time",
      "Whether behavior depends on how valuable the outcome is",
      "Whether reflexive responses occur without considering expected outcomes",
      "How accurately a subject can detect changes in sensory information"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "What does it mean if behavior decreases after the reward loses value?",
    options: [
      "The behavior is controlled by habits rather than expected outcomes",
      "No meaningful learning occurred during the training phase",
      "The behavior is goal-directed",
      "Reinforcement procedures were not strong enough to influence behavior"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "What would S-R theory predict after a reward is devalued?",
    options: [
      "Behavior stays the same",
      "Behavior decreases because the reward is no longer considered valuable",
      "Behavior increases because the subject is uncertain about outcomes",
      "Behavior stops entirely once the reward loses its reinforcing value"
    ],
    correct: 0,
    difficulty: "hard"
  },
  {
    prompt: "What happens in outcome-mediated transfer?",
    options: [
      "A stimulus produces a response directly without activating any outcome memory",
      "A response becomes weaker because reinforcement is no longer delivered afterward",
      "A stimulus activates a memory of the outcome and influences behavior",
      "A stimulus prevents earlier learned associations from affecting current behavior"
    ],
    correct: 2,
    difficulty: "hard"
  },
  {
    prompt: "What is hierarchical learning?",
    options: [
      "Behavior is controlled only by reflexive processes without outcome information",
      "A stimulus signals which action leads to which outcome",
      "Behavior is based entirely on habits without representing expected outcomes",
      "Actions are selected randomly without influence from stimuli or outcomes"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "What is delay discounting?",
    options: [
      "Preference for delayed rewards regardless of their size or probability",
      "Preference for smaller immediate rewards over larger delayed ones",
      "Inability to choose between rewards due to uncertainty about outcomes",
      "Loss of memory for reward timing after repeated learning trials"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "What does a high discount rate suggest about behavior?",
    options: [
      "Strong preference for long-term rewards over immediate outcomes",
      "Impulsivity",
      "No consistent preference between immediate and delayed outcomes",
      "Improved ability to remember and evaluate future consequences"
    ],
    correct: 1,
    difficulty: "hard"
  },

  // ==================== UNIT 3 ====================

  // --- Easy ---
  {
    prompt: "What is positive punishment?",
    options: [
      "Removing a reward in order to reduce a behavior",
      "Adding something unpleasant to reduce behavior",
      "Increasing a behavior by providing a rewarding outcome",
      "Ignoring a behavior until it decreases over time"
    ],
    correct: 1,
    difficulty: "easy"
  },
  {
    prompt: "What is negative punishment?",
    options: [
      "Removing something pleasant to reduce behavior",
      "Adding an unpleasant stimulus to increase responding",
      "Reinforcing behavior to make it occur more frequently",
      "Ignoring behavior so it decreases naturally"
    ],
    correct: 0,
    difficulty: "easy"
  },
  {
    prompt: "Why did Skinner argue punishment is not very effective?",
    options: [
      "It increases behavior rather than reducing it over time",
      "It teaches correct behavior in a clear and consistent way",
      "It only suppresses behavior instead of reversing learning",
      "It has no measurable effect on behavior at all"
    ],
    correct: 2,
    difficulty: "easy"
  },

  // --- Medium ---
  {
    prompt: "What makes punishment more effective?",
    options: [
      "Applying punishment after a delay following the behavior",
      "Using low intensity to avoid negative emotional effects",
      "Being immediate, strong, and consistent",
      "Delivering punishment randomly across different situations"
    ],
    correct: 2,
    difficulty: "medium"
  },
  {
    prompt: "What is conditioned suppression?",
    options: [
      "Learning disappears completely after repeated extinction trials",
      "Fear interferes with normal behavior",
      "Reinforcement increases the likelihood of responding over time",
      "Memory is lost due to repeated exposure to the stimulus"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    prompt: "What is a major problem with punishment?",
    options: [
      "It often does not show what behavior should replace the bad one",
      "It removes all learning associated with the punished behavior",
      "It teaches the correct behavior that should replace the unwanted one",
      "It prevents emotional responses from forming during learning"
    ],
    correct: 0,
    difficulty: "medium"
  },
  {
    prompt: "In blocking, what happens to a new cue introduced after learning?",
    options: [
      "A new cue becomes strongly associated because it appears with reinforcement",
      "A new cue replaces the original cue in controlling the response",
      "A new cue gains little or no associative strength because the outcome is predicted",
      "A new cue causes extinction of the previously learned response"
    ],
    correct: 2,
    difficulty: "medium"
  },
  {
    prompt: "Overshadowing occurs when:",
    options: [
      "Both cues are learned equally during conditioning trials",
      "A weaker cue becomes the strongest predictor of the outcome",
      "A more noticeable cue limits learning about another cue",
      "No association forms between cues and outcomes"
    ],
    correct: 2,
    difficulty: "medium"
  },

  // --- Hard ---
  {
    prompt: "In the Rescorla–Wagner model, learning depends on:",
    options: [
      "The number of times a stimulus is paired with reinforcement",
      "The overall intensity of the stimulus during each trial",
      "Changes in context that alter how the stimulus is processed",
      "Prediction error between expected and actual outcomes"
    ],
    correct: 3,
    difficulty: "hard"
  },
  {
    prompt: "According to the Rescorla–Wagner model, learning stops when:",
    options: [
      "The outcome is fully predicted",
      "The stimulus is no longer presented during training",
      "The number of trials reaches a fixed limit in the experiment",
      "The behavioral response gradually decreases over time"
    ],
    correct: 0,
    difficulty: "hard"
  },
  {
    prompt: "A child behaves well only when a strict parent is present. This illustrates:",
    options: [
      "The behavior has been permanently erased by punishment",
      "No meaningful learning has taken place",
      "The child is being positively reinforced for good behavior",
      "The parent has become an S-delta signaling that punishment will not occur when absent"
    ],
    correct: 3,
    difficulty: "hard"
  },
  {
    prompt: "Avoidance behavior persists even when the threat is gone because:",
    options: [
      "A reward is provided each time the behavior occurs",
      "Fear reduction reinforces the avoidance response",
      "No learning took place during the original conditioning",
      "Punishment strengthens avoidance over time"
    ],
    correct: 1,
    difficulty: "hard"
  },
  {
    prompt: "Behavior returns after punishment is removed because:",
    options: [
      "The behavior was permanently erased from memory",
      "The behavior was reinforced during the punishment phase",
      "The behavior was suppressed but never unlearned",
      "The behavior was forgotten and then reacquired"
    ],
    correct: 2,
    difficulty: "hard"
  }

];

// ============================================================
//  GAME STATE
// ============================================================
let state = {};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function makePlayer(name, token) {
  return {
    name, token,
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
    cueShown: 0, cueRewarded: 0,
    c1CueShown: 0, c1CueRewarded: 0,
    c2CueShown: 0, c2CueRewarded: 0,
    c3CueShown: 0, c3CueRewarded: 0,
    delayedRewards: [],
    finalChallengeAttempts: 0,
  };
}

function resetState() {
  const q = [...ALL_QUESTIONS];
  shuffle(q);
  state = {
    turn: 0,
    activePlayerIndex: 0,
    gameOver: false,
    cueThisTurn: false,
    currentQuestion: null,
    isFinalChallenge: false,
    questionIndex: 0,
    questions: q,
    players: [makePlayer('Player 1', '🧠'), makePlayer('Player 2', '🔬')],
  };
}

function currentPlayer() { return state.players[state.activePlayerIndex]; }
function nextPlayer() { state.activePlayerIndex = state.activePlayerIndex === 0 ? 1 : 0; }

function clampPlayer(p) {
  if (p.currentSpace < 0) p.currentSpace = 0;
}

function setMessage(icon, html) {
  messageIcon.textContent = icon;
  messageBox.innerHTML = html;
}

function showScreen(s) {
  [startScreen, instructionsScreen, gameScreen, summaryScreen].forEach(x => x.classList.remove('active'));
  s.classList.add('active');
  window.scrollTo(0, 0);
}

function updateCondChip(c) {
  condChip.className = 'stat-chip cond-chip';
  if (c === 2) condChip.classList.add('c2');
  if (c === 3) condChip.classList.add('c3');
  conditionDisplay.textContent = conditionLabel(c);
}

function updatePanel() {
  const p = currentPlayer();
  const p1 = state.players[0];
  const p2 = state.players[1];
  turnDisplay.textContent = state.turn;
  playerDisplay.textContent = `${p.name} ${p.token}`;
  p1SpaceDisplay.textContent = p1.currentSpace <= 0 ? '—' : p1.currentSpace >= TOTAL_SPACES ? '🏁' : p1.currentSpace;
  p2SpaceDisplay.textContent = p2.currentSpace <= 0 ? '—' : p2.currentSpace >= TOTAL_SPACES ? '🏁' : p2.currentSpace;
  correctDisplay.textContent = p.totalCorrect;
  wrongDisplay.textContent = p.totalWrong;
  updateCondChip(conditionOf(Math.max(1, Math.min(p.currentSpace || 1, TOTAL_SPACES))));
}

function updatePendingUI() {
  const p = currentPlayer();
  if (p.delayedRewards.length === 0) { pendingRewardsCard.classList.add('hidden'); return; }
  pendingRewardsCard.classList.remove('hidden');
  pendingList.innerHTML = '';
  p.delayedRewards.forEach((r, i) => {
    const d = document.createElement('div');
    d.className = 'pending-item';
    d.textContent = `Reward ${i + 1}: +${r.spaces} spaces in ${r.turnsLeft} turn${r.turnsLeft !== 1 ? 's' : ''}`;
    pendingList.appendChild(d);
  });
}

function processDelayedRewards() {
  const p = currentPlayer();
  if (p.delayedRewards.length === 0) return null;
  p.delayedRewards.forEach(r => { r.turnsLeft--; });
  const due = p.delayedRewards.filter(r => r.turnsLeft <= 0);
  p.delayedRewards = p.delayedRewards.filter(r => r.turnsLeft > 0);
  if (due.length === 0) return null;
  const total = due.reduce((s, r) => s + r.spaces, 0);
  p.currentSpace = Math.min(p.currentSpace + total, TOTAL_SPACES);
  renderTokens();
  updatePanel();
  updatePendingUI();
  return total;
}

function resolveCue() {
  const p = currentPlayer();
  if (!state.cueThisTurn) return;
  const cond = conditionOf(p.currentSpace);
  let rew = false;
  if (cond === 1) rew = true;
  else if (cond === 2) rew = Math.random() < 0.5;
  p.cueShown++;
  if (cond === 1) p.c1CueShown++;
  if (cond === 2) p.c2CueShown++;
  if (cond === 3) p.c3CueShown++;
  if (rew) {
    p.cueRewarded++;
    if (cond === 1) p.c1CueRewarded++;
    if (cond === 2) p.c2CueRewarded++;
    p.currentSpace = Math.min(p.currentSpace + 2, TOTAL_SPACES);
    renderTokens();
    updatePanel();
    setMessage('🔔', `The <strong>🔔 cue</strong> paid off for ${p.name}! Bonus <strong>+2 spaces</strong>.`);
  } else {
    if (cond === 2) setMessage('🔔', `${p.name} hit a <strong>🔔 cue space</strong>, but no bonus this time.`);
    else setMessage('🔔', `${p.name} hit a <strong>🔔 cue space</strong>, but nothing came of it.`);
  }
}

function nextQuestion() {
  const q = state.questions[state.questionIndex % state.questions.length];
  state.questionIndex++;
  return q;
}

function showQuestion(isFinal = false) {
  state.isFinalChallenge = isFinal;
  questionCard.classList.remove('hidden');
  choiceCard.classList.add('hidden');
  finalChallengeBanner.classList.toggle('hidden', !isFinal);

  if (isFinal) {
    qDifficultyBadge.textContent = 'Final';
    qDifficultyBadge.className = 'q-badge final';
    qTitleText.textContent = 'Answer correctly to WIN!';
  } else {
    qTitleText.textContent = 'Answer to Unlock Your Choice';
  }

  const q = nextQuestion();
  state.currentQuestion = q;
  questionText.textContent = q.prompt;

  if (!isFinal) {
    qDifficultyBadge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
    qDifficultyBadge.className = 'q-badge';
    if (q.difficulty === 'medium') qDifficultyBadge.classList.add('med');
    if (q.difficulty === 'hard') qDifficultyBadge.classList.add('hard');
  }

  answerButtons.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(idx));
    answerButtons.appendChild(btn);
  });
}

function handleAnswer(idx) {
  const p = currentPlayer();
  const q = state.currentQuestion;
  const ok = idx === q.correct;

  answerButtons.querySelectorAll('.answer-btn').forEach((b, i) => {
    b.classList.add('disabled-ans');
    if (i === q.correct) b.classList.add('correct-ans');
    if (i === idx && !ok) b.classList.add('wrong-ans');
  });

  // ---- FINAL CHALLENGE ----
  if (state.isFinalChallenge) {
    if (ok) {
      p.totalCorrect++;
      p.currentSpace = TOTAL_SPACES + 1;
      updatePanel();
      setTimeout(() => {
        questionCard.classList.add('hidden');
        state.gameOver = true;
        renderTokens();
        setMessage('🏆', `<strong>${p.name}</strong> answered correctly and wins! Loading summary…`);
        setTimeout(showSummary, 1400);
      }, 900);
    } else {
      p.totalWrong++;
      p.lostMoveCount++;
      p.finalChallengeAttempts = (p.finalChallengeAttempts || 0) + 1;
      // Push back 2 spaces from finish
      p.currentSpace = TOTAL_SPACES - 2;
      clampPlayer(p);
      renderTokens();
      updatePanel();
      setTimeout(() => {
        questionCard.classList.add('hidden');
        setMessage('🚫', `${p.name} answered wrong on the Final Challenge! Sent back to space <strong>${p.currentSpace}</strong> — keep trying!`);
        nextPlayer();
        updatePanel();
        updatePendingUI();
        rollBtn.disabled = false;
        setTimeout(() => setMessage('🎲', `It's now <strong>${currentPlayer().name}</strong>'s turn. Click <strong>Roll</strong>.`), 600);
      }, 900);
    }
    return;
  }

  // ---- NORMAL QUESTION ----
  if (ok) {
    p.totalCorrect++;
    updatePanel();
    resolveCue();
    setTimeout(() => { questionCard.classList.add('hidden'); showChoiceScreen(); }, 850);
  } else {
    p.totalWrong++;
    p.lostMoveCount++;
    p.currentSpace = p.turnStartSpace;
    clampPlayer(p);
    renderTokens();
    updatePanel();
    setTimeout(() => {
      questionCard.classList.add('hidden');
      setMessage('🚫', `${p.name} got it wrong and loses that move, going back to space ${p.currentSpace || 'Start'}.`);
      nextPlayer();
      updatePanel();
      updatePendingUI();
      rollBtn.disabled = false;
      setTimeout(() => setMessage('🎲', `It's now <strong>${currentPlayer().name}</strong>'s turn. Click <strong>Roll</strong>.`), 550);
    }, 850);
  }
}

function showChoiceScreen() {
  choiceCard.classList.remove('hidden');
  const p = currentPlayer();
  const cond = conditionOf(Math.max(1, Math.min(p.currentSpace, TOTAL_SPACES)));
  choiceText.textContent = `${p.name}, choose your reward.`;
  if (cond === 1) { immediateDesc.textContent = '+1 space right now'; delayedDesc.textContent = '+3 spaces next turn'; }
  else if (cond === 2) { immediateDesc.textContent = '+1 space right now'; delayedDesc.textContent = '+3 spaces after 2 turns'; }
  else { immediateDesc.textContent = '+1 space right now'; delayedDesc.textContent = '+3 spaces later'; }
}

function recordChoice(p, t) {
  const c = conditionOf(Math.max(1, Math.min(p.currentSpace, TOTAL_SPACES)));
  if (t === 'immediate') { p.totalImmediate++; if (c === 1) p.c1Immediate++; if (c === 2) p.c2Immediate++; if (c === 3) p.c3Immediate++; }
  else { p.totalDelayed++; if (c === 1) p.c1Delayed++; if (c === 2) p.c2Delayed++; if (c === 3) p.c3Delayed++; }
}

function handleImmediateChoice() {
  const p = currentPlayer();
  recordChoice(p, 'immediate');
  choiceCard.classList.add('hidden');
  p.currentSpace = Math.min(p.currentSpace + 1, TOTAL_SPACES);
  renderTokens();
  updatePanel();

  if (p.currentSpace >= TOTAL_SPACES) {
    setMessage('🏁', `${p.name} reached the <strong>Finish</strong>! Now answer the <strong>Final Challenge</strong> to win!`);
    setTimeout(() => showQuestion(true), 800);
    return;
  }

  const n = p.name;
  nextPlayer();
  updatePanel();
  updatePendingUI();
  rollBtn.disabled = false;
  setMessage('⚡', `${n} took the <strong>immediate reward</strong> (+1 space). Now it's <strong>${currentPlayer().name}</strong>'s turn.`);
}

function handleDelayedChoice() {
  const p = currentPlayer();
  recordChoice(p, 'delayed');
  choiceCard.classList.add('hidden');
  const cond = conditionOf(Math.max(1, Math.min(p.currentSpace, TOTAL_SPACES)));
  const n = p.name;

  if (cond === 1) {
    p.delayedRewards.push({ turnsLeft: 1, spaces: 3 });
    setMessage('⏳', `${n} chose the <strong>delayed reward</strong>. They'll get <strong>+3 spaces</strong> next turn.`);
  } else if (cond === 2) {
    p.delayedRewards.push({ turnsLeft: 2, spaces: 3 });
    setMessage('⏳', `${n} chose the <strong>delayed reward</strong>. They'll get <strong>+3 spaces</strong> in 2 turns.`);
  } else {
    p.delayedRewards.push({ turnsLeft: 1, spaces: 0 });
    setMessage('⏳', `${n} chose the delayed reward. It will arrive next turn.`);
  }

  nextPlayer();
  updatePanel();
  updatePendingUI();
  rollBtn.disabled = false;
}

function handleRoll() {
  if (state.gameOver) return;
  const p = currentPlayer();
  rollBtn.disabled = true;
  questionCard.classList.add('hidden');
  choiceCard.classList.add('hidden');
  state.turn++;
  p.turnStartSpace = p.currentSpace;
  updatePanel();

  const del = processDelayedRewards();

  const doRoll = () => {
    const roll = Math.floor(Math.random() * 3) + 1;
    p.currentSpace = Math.min(p.currentSpace + roll, TOTAL_SPACES);
    state.cueThisTurn = p.currentSpace >= 1 && p.currentSpace <= TOTAL_SPACES && CUE_SPACES.has(p.currentSpace);
    renderTokens();
    updatePanel();

    if (p.currentSpace >= TOTAL_SPACES) {
      setMessage('🏁', `${p.name} rolled a <strong>${roll}</strong> and reached the <strong>Finish</strong>! Answer the <strong>Final Challenge</strong> to win!`);
      setTimeout(() => showQuestion(true), 600);
      return;
    }

    let msg = `${p.name} rolled a <strong>${roll}</strong> and moved to space <strong>${p.currentSpace}</strong>`;
    if (state.cueThisTurn) msg += ` — a <strong>🔔 cue space</strong>`;
    msg += '. Answer the question to unlock your reward choice.';
    setMessage('🎲', msg);
    setTimeout(showQuestion, 500);
  };

  if (del !== null) {
    const p2 = state.players[state.activePlayerIndex];
    if (p2.currentSpace >= TOTAL_SPACES) {
      setMessage('🏁', `${p2.name}'s delayed reward arrived and pushed them to the <strong>Finish</strong>! Answer the Final Challenge to win!`);
      setTimeout(() => showQuestion(true), 900);
      return;
    }
    setMessage('🎁', `${p2.name}'s delayed reward arrived: <strong>+${del} space${del !== 1 ? 's' : ''}</strong>.`);
    setTimeout(doRoll, 900);
  } else {
    doRoll();
  }
}

// ============================================================
//  SUMMARY
// ============================================================
function buildPI(p) {
  const lines = [];
  const t1 = p.c1Immediate + p.c1Delayed;
  const t2 = p.c2Immediate + p.c2Delayed;
  const t3 = p.c3Immediate + p.c3Delayed;

  if (t1 > 0) {
    const pct = Math.round(p.c1Delayed / t1 * 100);
    lines.push(`In <strong>Condition 1 (Acquisition)</strong>, ${p.name} chose the delayed reward ${p.c1Delayed}/${t1} times (${pct}%). With a short wait and a reliable payoff, this is the baseline preference.`);
  }
  if (t2 > 0) {
    const pct = Math.round(p.c2Delayed / t2 * 100);
    if (p.c2Delayed < p.c1Delayed) lines.push(`In <strong>Condition 2 (Increased Delay)</strong>, delayed choices dropped to ${p.c2Delayed}/${t2} (${pct}%): <em>delay discounting</em>.`);
    else if (p.c2Delayed === p.c1Delayed) lines.push(`In <strong>Condition 2</strong>, ${p.name} held steady at ${p.c2Delayed}/${t2} delayed choices (${pct}%), suggesting delay tolerance.`);
    else lines.push(`In <strong>Condition 2</strong>, delayed choices increased to ${p.c2Delayed}/${t2} (${pct}%), atypical of delay discounting.`);
  }
  if (t3 > 0) {
    const pct = Math.round(p.c3Delayed / t3 * 100);
    if (p.c3Delayed > 0) lines.push(`In <strong>Condition 3 (Extinction)</strong>, ${p.name} still chose delayed ${p.c3Delayed}/${t3} times (${pct}%) even though it no longer paid off: the <em>Partial Reinforcement Extinction Effect</em>.`);
    else lines.push(`In <strong>Condition 3</strong>, ${p.name} stopped choosing delayed (0/${t3}), suggesting goal-directed behavior responsive to outcome change.`);
  }

  const tc = p.c1CueShown + p.c2CueShown + p.c3CueShown;
  if (tc > 0) {
    lines.push('<strong>🔔 Pavlovian Cue Analysis:</strong>');
    if (p.c1CueShown > 0) lines.push(`During <strong>Condition 1</strong>, the 🔔 cue appeared ${p.c1CueShown} time(s) and was always rewarded, establishing a reliable <em>conditioned expectation</em>.`);
    if (p.c2CueShown > 0) lines.push(`In <strong>Condition 2</strong>, the cue appeared ${p.c2CueShown} time(s) but rewarded only ${p.c2CueRewarded}, representing a <em>variable schedule</em> maintaining partial responding.`);
    if (p.c3CueShown > 0) lines.push(`In <strong>Condition 3</strong>, the cue appeared ${p.c3CueShown} time(s) with no bonus — classic <em>Pavlovian extinction</em>.`);
  }

  if (p.finalChallengeAttempts > 1) lines.push(`${p.name} needed <strong>${p.finalChallengeAttempts} attempts</strong> at the Final Challenge, showing persistence in the face of punishment!`);
  if (p.lostMoveCount > 0) lines.push(`${p.name} lost <strong>${p.lostMoveCount} move(s)</strong> to wrong answers, functioning as <em>positive punishment</em>.`);
  else lines.push(`${p.name} didn't lose any moves, so punishment had no measurable impact this game.`);

  return lines.map(l => `<p>${l}</p>`).join('');
}

function playerHTML(p) {
  const ta = p.totalCorrect + p.totalWrong;
  const acc = ta === 0 ? '—' : `${Math.round(p.totalCorrect / ta * 100)}%`;
  const fp = p.currentSpace >= TOTAL_SPACES + 1 ? 'Finish 🏁' : `Space ${p.currentSpace}`;
  return `
    <div class="player-summary-card">
      <h3>${p.name} ${p.token}</h3>
      <div class="phase-block">
        <h4>Overall</h4>
        <div class="phase-row"><span>Final Position:</span><span>${fp}</span></div>
        <div class="phase-row"><span>Correct / Wrong:</span><span>${p.totalCorrect} / ${p.totalWrong} (${acc})</span></div>
        <div class="phase-row"><span>Lost Moves:</span><span>${p.lostMoveCount}</span></div>
        <div class="phase-row"><span>Final Challenge Attempts:</span><span>${p.finalChallengeAttempts || 0}</span></div>
      </div>
      <div class="phase-block">
        <h4>Condition 1 — Acquisition</h4>
        <div class="phase-row"><span>Immediate:</span><span>${p.c1Immediate}</span></div>
        <div class="phase-row"><span>Delayed:</span><span>${p.c1Delayed}</span></div>
        <div class="phase-row"><span>🔔 Shown / Rewarded:</span><span>${p.c1CueShown} / ${p.c1CueRewarded}</span></div>
      </div>
      <div class="phase-block">
        <h4>Condition 2 — Increased Delay</h4>
        <div class="phase-row"><span>Immediate:</span><span>${p.c2Immediate}</span></div>
        <div class="phase-row"><span>Delayed:</span><span>${p.c2Delayed}</span></div>
        <div class="phase-row"><span>🔔 Shown / Rewarded:</span><span>${p.c2CueShown} / ${p.c2CueRewarded}</span></div>
      </div>
      <div class="phase-block">
        <h4>Condition 3 — Extinction</h4>
        <div class="phase-row"><span>Immediate:</span><span>${p.c3Immediate}</span></div>
        <div class="phase-row"><span>Delayed:</span><span>${p.c3Delayed}</span></div>
        <div class="phase-row"><span>🔔 Shown (no reward):</span><span>${p.c3CueShown}</span></div>
      </div>
      <div class="interp-block">${buildPI(p)}</div>
    </div>`;
}

function showSummary() {
  const p1 = state.players[0], p2 = state.players[1];
  const tc = p1.totalCorrect + p2.totalCorrect;
  const tw = p1.totalWrong + p2.totalWrong;
  const ta = tc + tw;
  document.getElementById('summary-correct').textContent = tc;
  document.getElementById('summary-wrong').textContent = tw;
  document.getElementById('summary-accuracy').textContent = ta === 0 ? '—' : `${Math.round(tc / ta * 100)}%`;
  document.getElementById('summary-punishment').textContent = p1.lostMoveCount + p2.lostMoveCount;
  document.getElementById('summary-cue-shown').textContent = p1.cueShown + p2.cueShown;
  document.getElementById('summary-cue-rewarded').textContent = p1.cueRewarded + p2.cueRewarded;
  document.getElementById('summary-players').innerHTML = playerHTML(p1) + playerHTML(p2);
  showScreen(summaryScreen);
}

// ============================================================
//  START GAME
// ============================================================
function startGame() {
  resetState();
  buildSVG();
  renderTokens();
  updatePanel();
  updatePendingUI();
  questionCard.classList.add('hidden');
  choiceCard.classList.add('hidden');
  rollBtn.disabled = false;
  setMessage('🎲', `Welcome! <strong>${currentPlayer().name}</strong> goes first. Click <strong>Roll</strong> to begin.`);
  showScreen(gameScreen);
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.getElementById('open-help-btn')?.addEventListener('click', () => helpModal.classList.remove('hidden'));
document.getElementById('close-help-btn')?.addEventListener('click', () => helpModal.classList.add('hidden'));
document.querySelector('.modal-backdrop')?.addEventListener('click', () => helpModal.classList.add('hidden'));
document.getElementById('go-to-instructions-btn').addEventListener('click', () => showScreen(instructionsScreen));
document.getElementById('back-to-title-btn').addEventListener('click', () => showScreen(startScreen));
document.getElementById('start-game-btn').addEventListener('click', startGame);
document.getElementById('start-from-instr-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('back-to-title-final-btn').addEventListener('click', () => showScreen(startScreen));
rollBtn.addEventListener('click', handleRoll);
immediateBtn.addEventListener('click', handleImmediateChoice);
delayedBtn.addEventListener('click', handleDelayedChoice);

showScreen(startScreen);