// Behavior Lab v3 — full SVG board, clean snaking path

const startScreen=document.getElementById('start-screen');
const instructionsScreen=document.getElementById('instructions-screen');
const gameScreen=document.getElementById('game-screen');
const summaryScreen=document.getElementById('summary-screen');
const goToInstructionsBtn=document.getElementById('go-to-instructions-btn');
const backToTitleBtn=document.getElementById('back-to-title-btn');
const startGameBtn=document.getElementById('start-game-btn');
const startFromInstrBtn=document.getElementById('start-from-instr-btn');
const restartBtn=document.getElementById('restart-btn');
const backToTitleFinalBtn=document.getElementById('back-to-title-final-btn');
const gameSvg=document.getElementById('game-svg');
const messageBox=document.getElementById('message-box');
const messageIcon=document.getElementById('message-icon');
const rollBtn=document.getElementById('roll-btn');
const turnDisplay=document.getElementById('turn-display');
const p1SpaceDisplay=document.getElementById('p1-space-display');
const p2SpaceDisplay=document.getElementById('p2-space-display');
const playerDisplay=document.getElementById('player-display');
const conditionDisplay=document.getElementById('condition-display');
const correctDisplay=document.getElementById('correct-display');
const wrongDisplay=document.getElementById('wrong-display');
const condChip=document.getElementById('cond-chip');
const pendingRewardsCard=document.getElementById('pending-rewards-card');
const pendingList=document.getElementById('pending-list');
const questionCard=document.getElementById('question-card');
const questionText=document.getElementById('question-text');
const answerButtons=document.getElementById('answer-buttons');
const qDifficultyBadge=document.getElementById('q-difficulty-badge');
const choiceCard=document.getElementById('choice-card');
const choiceText=document.getElementById('choice-text');
const immediateBtn=document.getElementById('immediate-btn');
const delayedBtn=document.getElementById('delayed-btn');
const immediateDesc=document.getElementById('immediate-desc');
const delayedDesc=document.getElementById('delayed-desc');
const summaryCorrect=document.getElementById('summary-correct');
const summaryWrong=document.getElementById('summary-wrong');
const summaryAccuracy=document.getElementById('summary-accuracy');
const summaryPunishment=document.getElementById('summary-punishment');
const summaryCueShown=document.getElementById('summary-cue-shown');
const summaryCueRewarded=document.getElementById('summary-cue-rewarded');
const summaryPlayers=document.getElementById('summary-players');
const helpModal=document.getElementById('help-modal');
const openHelpBtn=document.getElementById('open-help-btn');
const closeHelpBtn=document.getElementById('close-help-btn');

// ============================================================
//  BOARD GEOMETRY  —  SVG viewBox 0 0 860 560
//  Row A (top):    spaces 1-7   y=115  left→right
//  Row B (middle): spaces 8-14  y=270  right→left
//  Row C (bottom): spaces 15-21 y=415  left→right
// ============================================================
const R=22, TOTAL_SPACES=21;
const CUE_SPACES=new Set([4,9,13,17,20]);

const SPACE_POS=[
  null,
  {x:95,  y:115},{x:210, y:115},{x:325, y:115},{x:430, y:115},{x:535, y:115},{x:648, y:115},{x:762, y:115},
  {x:762, y:270},{x:648, y:270},{x:535, y:270},{x:430, y:270},{x:325, y:270},{x:210, y:270},{x:95,  y:270},
  {x:95,  y:415},{x:210, y:415},{x:325, y:415},{x:430, y:415},{x:535, y:415},{x:648, y:415},{x:762, y:415},
];

const COND_STYLE={
  1:{fill:'#d1fae5',stroke:'#10b981',text:'#065f46'},
  2:{fill:'#cffafe',stroke:'#06b6d4',text:'#0e4f5e'},
  3:{fill:'#fee2e2',stroke:'#ef4444',text:'#7f1d1d'},
};

function conditionOf(n){if(n<=7)return 1;if(n<=14)return 2;return 3;}
function conditionLabel(c){return['','Acquisition','Increased Delay','Extinction'][c];}

const NS='http://www.w3.org/2000/svg';
function el(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function elTxt(tag,txt,attrs={}){const e=el(tag,attrs);e.textContent=txt;return e;}

// ============================================================
//  BUILD STATIC SVG
// ============================================================
function buildSVG(){
  while(gameSvg.firstChild)gameSvg.removeChild(gameSvg.lastChild);

  // --- DEFS ---
  const defs=el('defs');

  // Brain radial gradient
  const g=el('radialGradient',{id:'brainGrad',cx:'50%',cy:'42%',r:'58%'});
  g.appendChild(el('stop',{offset:'0%','stop-color':'#f5f0ff'}));
  g.appendChild(el('stop',{offset:'100%','stop-color':'#ede9fe'}));
  defs.appendChild(g);

  // Drop shadow
  const f=el('filter',{id:'bshadow',x:'-6%',y:'-6%',width:'112%',height:'112%'});
  const fgb=el('feGaussianBlur',{in:'SourceAlpha',stdDeviation:'7'});
  const foff=el('feOffset',{dx:'0',dy:'5',result:'ob'});
  const ffl=el('feFlood',{'flood-color':'rgba(109,40,217,0.18)',result:'fc'});
  const fco=el('feComposite',{in:'fc',in2:'ob',operator:'in',result:'sh'});
  const fm=el('feMerge');
  fm.appendChild(el('feMergeNode',{in:'sh'}));fm.appendChild(el('feMergeNode',{in:'SourceGraphic'}));
  f.appendChild(fgb);f.appendChild(foff);f.appendChild(ffl);f.appendChild(fco);f.appendChild(fm);
  defs.appendChild(f);

  // Glow for cue
  const glow=el('filter',{id:'cglow',x:'-30%',y:'-30%',width:'160%',height:'160%'});
  const fglow=el('feGaussianBlur',{stdDeviation:'3.5',result:'blur'});
  const fgm=el('feMerge');fgm.appendChild(el('feMergeNode',{in:'blur'}));fgm.appendChild(el('feMergeNode',{in:'SourceGraphic'}));
  glow.appendChild(fglow);glow.appendChild(fgm);defs.appendChild(glow);

  // Arrowhead marker
  const mark=el('marker',{id:'arr',markerWidth:'7',markerHeight:'7',refX:'5',refY:'3.5',orient:'auto'});
  mark.appendChild(el('polygon',{points:'0 0,7 3.5,0 7',fill:'#a78bfa'}));
  defs.appendChild(mark);

  gameSvg.appendChild(defs);

  // --- BRAIN BODY ---
  // Large, detailed organic brain silhouette enclosing the 3-row grid
  gameSvg.appendChild(el('path',{
    d:`M 428,38
       C 372,22 306,18 258,40
       C 212,56 184,84 170,112
       C 140,104 108,112 88,136
       C 62,156 52,190 56,222
       C 38,244 32,276 38,308
       C 28,334 34,368 52,392
       C 44,420 52,452 74,472
       C 96,496 128,506 162,500
       C 180,518 210,528 242,522
       C 264,538 298,540 328,530
       C 352,542 386,542 414,530
       C 440,540 472,540 498,526
       C 522,536 556,530 578,514
       C 608,520 638,508 656,488
       C 686,492 714,476 730,454
       C 758,446 778,424 784,398
       C 806,378 814,346 808,316
       C 824,292 824,258 810,232
       C 820,206 818,172 802,148
       C 792,122 770,104 746,96
       C 734,70 710,52 684,42
       C 654,26 620,20 590,24
       C 558,10 524,6 492,14
       C 465,6 444,16 428,38 Z`,
    fill:'url(#brainGrad)',stroke:'#7c3aed','stroke-width':'4.5','stroke-linejoin':'round',
    filter:'url(#bshadow)'
  }));

  // --- SULCI (brain fold lines) ---
  // These are anatomically inspired fold lines that make the brain look realistic.
  // They are positioned to avoid the 3 rows of spaces (y=115, 270, 415).
  const sulci=[
    // Longitudinal fissure (central divider, dashed)
    {d:'M 430,42 C 430,80 430,160 430,195 M 430,210 C 430,240 430,250 430,255 M 430,285 C 430,310 430,360 430,400 M 430,415 C 430,440 430,470 432,498',stroke:'#9d84f5',sw:'2',dash:'7 5',op:'0.5'},
    // Left frontal lobe folds (top-left area, between rows, above row A)
    {d:'M 170,115 C 185,95 205,82 230,78',stroke:'#c4b5fd',sw:'2',op:'0.75'},
    {d:'M 175,140 C 195,122 220,112 248,110',stroke:'#c4b5fd',sw:'2',op:'0.75'},
    // Right frontal (top-right)
    {d:'M 685,92 C 706,100 724,114 736,132',stroke:'#c4b5fd',sw:'2',op:'0.75'},
    {d:'M 690,116 C 712,126 728,140 740,158',stroke:'#c4b5fd',sw:'2',op:'0.75'},
    // Between row A and B (y ~170-215)
    {d:'M 68,188 C 130,175 200,168 270,170 C 340,172 400,180 430,178 C 462,176 520,170 590,168 C 646,166 700,172 750,180',stroke:'#c4b5fd',sw:'2.2',op:'0.7'},
    {d:'M 80,208 C 150,198 230,192 310,194 C 370,196 420,202 430,200 C 442,198 496,194 570,192 C 628,190 686,196 740,204',stroke:'#c4b5fd',sw:'1.8',op:'0.6'},
    // Left side vertical folds
    {d:'M 60,240 C 64,260 66,285 64,312 C 62,334 58,358 55,378',stroke:'#c4b5fd',sw:'1.8',op:'0.65'},
    {d:'M 82,230 C 86,254 88,280 86,308 C 84,332 80,356 77,376',stroke:'#c4b5fd',sw:'1.5',op:'0.55'},
    // Right side vertical folds
    {d:'M 798,238 C 804,262 806,288 804,316 C 802,340 798,364 794,384',stroke:'#c4b5fd',sw:'1.8',op:'0.65'},
    {d:'M 776,228 C 782,254 784,282 782,310 C 780,336 776,360 772,382',stroke:'#c4b5fd',sw:'1.5',op:'0.55'},
    // Between row B and C (y ~320-370)
    {d:'M 68,322 C 140,310 220,304 310,306 C 375,308 420,314 430,312 C 444,310 502,306 580,304 C 648,302 706,308 755,318',stroke:'#c4b5fd',sw:'2.2',op:'0.7'},
    {d:'M 72,344 C 148,334 228,328 316,330 C 382,332 424,338 430,336 C 448,334 508,330 588,328 C 652,326 710,332 756,342',stroke:'#c4b5fd',sw:'1.8',op:'0.6'},
    // Temporal gyri (sides, middle height)
    {d:'M 56,255 C 62,268 65,282 63,295',stroke:'#c4b5fd',sw:'1.8',op:'0.7'},
    {d:'M 800,253 C 806,266 809,280 807,294',stroke:'#c4b5fd',sw:'1.8',op:'0.7'},
    // Parieto-occipital (top middle area)
    {d:'M 322,42 C 318,66 316,96 316,118',stroke:'#c4b5fd',sw:'2',op:'0.7'},
    {d:'M 538,30 C 540,58 540,90 538,118',stroke:'#c4b5fd',sw:'2',op:'0.7'},
    // Occipital folds (bottom of brain)
    {d:'M 200,510 C 240,504 290,500 340,500',stroke:'#c4b5fd',sw:'1.8',op:'0.65'},
    {d:'M 510,500 C 560,500 610,504 658,510',stroke:'#c4b5fd',sw:'1.8',op:'0.65'},
    // Central sulcus (left hemisphere, arches between rows)
    {d:'M 246,110 C 242,140 240,170 240,195',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 360,110 C 358,140 356,170 356,195',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 500,110 C 500,140 500,170 500,195',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 615,110 C 616,140 617,170 618,195',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    // Between B-C vertical
    {d:'M 246,285 C 244,310 242,338 242,365',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 360,285 C 360,310 360,338 360,365',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 500,285 C 500,310 500,338 500,365',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    {d:'M 615,285 C 616,310 618,338 618,365',stroke:'#b8a4f7',sw:'1.8',op:'0.6'},
    // Brainstem
    {d:'M 375,524 C 372,542 370,552 369,560 M 485,522 C 483,540 482,552 481,560',stroke:'#7c3aed',sw:'4.5',cap:'round'},
    {d:'M 369,560 Q 425,572 481,560',stroke:'#7c3aed',sw:'4.5',cap:'round'},
  ];

  sulci.forEach(s=>{
    const attrs={d:s.d,fill:'none',stroke:s.stroke,'stroke-width':s.sw||'2','stroke-linecap':s.cap||'round'};
    if(s.dash)attrs['stroke-dasharray']=s.dash;
    if(s.op)attrs.opacity=s.op;
    gameSvg.appendChild(el('path',attrs));
  });

  // --- CONNECTOR LINES between spaces ---
  for(let i=1;i<TOTAL_SPACES;i++){
    const from=SPACE_POS[i], to=SPACE_POS[i+1];
    const isElbow=(i===7||i===14);

    if(isElbow){
      // Curved down-turn connector
      const c1x=from.x+(i===7?55:-55), c1y=from.y+70;
      const c2x=to.x+(i===7?55:-55),   c2y=to.y-70;
      gameSvg.appendChild(el('path',{
        d:`M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`,
        fill:'none',stroke:'#a78bfa','stroke-width':'2.5','stroke-dasharray':'7 4',
        'stroke-linecap':'round',opacity:'0.85','marker-end':'url(#arr)'
      }));
    } else {
      const dx=to.x-from.x, dy=to.y-from.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const ux=dx/dist, uy=dy/dist;
      gameSvg.appendChild(el('path',{
        d:`M ${from.x+ux*(R+3)} ${from.y+uy*(R+3)} L ${to.x-ux*(R+9)} ${to.y-uy*(R+9)}`,
        fill:'none',stroke:'#a78bfa','stroke-width':'2.5',
        'stroke-linecap':'round',opacity:'0.82','marker-end':'url(#arr)'
      }));
    }
  }

  // --- SPACE CIRCLES ---
  for(let n=1;n<=TOTAL_SPACES;n++){
    const{x,y}=SPACE_POS[n];
    const cond=conditionOf(n);
    const cs=COND_STYLE[cond];
    const isCue=CUE_SPACES.has(n);

    if(isCue){
      // Yellow glow ring
      gameSvg.appendChild(el('circle',{cx:x,cy:y,r:R+7,fill:'rgba(251,191,36,0.18)',stroke:'#fbbf24','stroke-width':'2.5',filter:'url(#cglow)'}));
    }

    // Main circle
    gameSvg.appendChild(el('circle',{cx:x,cy:y,r:R,fill:cs.fill,stroke:cs.stroke,'stroke-width':n===1||n===TOTAL_SPACES?'3.5':'2.5',id:`sc-${n}`}));

    // Number / label
    let lbl=String(n);
    if(n===1)lbl='S';
    if(n===TOTAL_SPACES)lbl='🏁';
    gameSvg.appendChild(elTxt('text',lbl,{x,y,'text-anchor':'middle','dominant-baseline':'central','font-family':'Fredoka One, cursive','font-size':'14',fill:cs.text,id:`st-${n}`}));

    // 🔔 badge — top-right corner, larger
    if(isCue){
      gameSvg.appendChild(elTxt('text','🔔',{x:x+R-1,y:y-R+1,'text-anchor':'middle','dominant-baseline':'central','font-size':'18',id:`cb-${n}`}));
    }
  }

  // --- START / FINISH pills ---
  const s1=SPACE_POS[1], sF=SPACE_POS[TOTAL_SPACES];
  gameSvg.appendChild(el('rect',{x:s1.x-28,y:s1.y+R+6,width:56,height:20,rx:10,fill:'#c7d2fe',stroke:'#818cf8','stroke-width':'1.5'}));
  gameSvg.appendChild(elTxt('text','START',{x:s1.x,y:s1.y+R+18,'text-anchor':'middle','dominant-baseline':'central','font-family':'Fredoka One, cursive','font-size':'10',fill:'#3730a3'}));
  gameSvg.appendChild(el('rect',{x:sF.x-30,y:sF.y+R+6,width:60,height:20,rx:10,fill:'#f5d0fe',stroke:'#d946ef','stroke-width':'1.5'}));
  gameSvg.appendChild(elTxt('text','FINISH',{x:sF.x,y:sF.y+R+18,'text-anchor':'middle','dominant-baseline':'central','font-family':'Fredoka One, cursive','font-size':'10',fill:'#86198f'}));

  // --- Condition zone labels (between rows) ---
  [{x:430,y:68,lbl:'Condition 1 — Acquisition',fill:'#059669'},
   {x:430,y:222,lbl:'Condition 2 — Increased Delay',fill:'#0284c7'},
   {x:430,y:370,lbl:'Condition 3 — Extinction',fill:'#dc2626'}].forEach(({x,y,lbl,fill})=>{
    gameSvg.appendChild(elTxt('text',lbl,{x,y,'text-anchor':'middle','dominant-baseline':'central','font-family':'Nunito, sans-serif','font-size':'11','font-weight':'700',fill,opacity:'0.65'}));
  });

  // --- Token layer (populated by renderTokens) ---
  gameSvg.appendChild(el('g',{id:'token-layer'}));
}

// ============================================================
//  TOKEN RENDERING
// ============================================================
function renderTokens(){
  const layer=document.getElementById('token-layer');
  while(layer.firstChild)layer.removeChild(layer.lastChild);

  const activeP=currentPlayer();

  // Active player ring
  if(activeP.currentSpace>=1&&activeP.currentSpace<=TOTAL_SPACES){
    const{x,y}=SPACE_POS[activeP.currentSpace];
    layer.appendChild(el('circle',{cx:x,cy:y,r:R+9,fill:'none',stroke:'#ff6b9d','stroke-width':'3',opacity:'0.9'}));
  }

  // Group players by space
  const groups={};
  state.players.forEach(p=>{
    if(p.currentSpace>=1&&p.currentSpace<=TOTAL_SPACES){
      const k=p.currentSpace;
      if(!groups[k])groups[k]=[];
      groups[k].push(p);
    }
  });

  Object.entries(groups).forEach(([sn,players])=>{
    const{x,y}=SPACE_POS[Number(sn)];
    const offsets=players.length===1?[{ox:0,oy:0}]:[{ox:-13,oy:0},{ox:13,oy:0}];
    players.forEach((p,i)=>{
      layer.appendChild(elTxt('text',p.token,{
        x:x+offsets[i].ox, y:y-R-10,
        'text-anchor':'middle','dominant-baseline':'central',
        'font-size':'28',
        style:'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))'
      }));
    });
  });

  // Tokens off-board
  state.players.forEach(p=>{
    if(p.currentSpace<=0){
      const{x,y}=SPACE_POS[1];
      layer.appendChild(elTxt('text',p.token,{x:x-38,y,'text-anchor':'middle','dominant-baseline':'central','font-size':'28',style:'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}));
    }
    if(p.currentSpace>=TOTAL_SPACES+1){
      const{x,y}=SPACE_POS[TOTAL_SPACES];
      layer.appendChild(elTxt('text',p.token,{x:x+38,y,'text-anchor':'middle','dominant-baseline':'central','font-size':'28',style:'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}));
    }
  });
}

// ============================================================
//  GAME STATE & LOGIC
// ============================================================
const ALL_QUESTIONS=[
  {prompt:"In operant conditioning, what is the term for a consequence that increases the likelihood of a behavior occurring again?",options:["Extinction","Reinforcement","Habituation","Punishment"],correct:1,difficulty:"easy"},
  {prompt:"What is positive punishment?",options:["Removing a pleasant stimulus to decrease behavior","Presenting an unpleasant stimulus to decrease behavior","Adding a pleasant stimulus to increase behavior","Removing an unpleasant stimulus to increase behavior"],correct:1,difficulty:"easy"},
  {prompt:"What is negative punishment?",options:["Adding an aversive stimulus after a response","Removing a positive stimulus after a response to decrease that response","Ignoring a behavior entirely","Presenting a neutral stimulus"],correct:1,difficulty:"easy"},
  {prompt:"According to lecture, punishment is most effective when it is:",options:["Delayed, mild, and occasional","Swift, sufficient, and consistent","Surprising and unpredictable","Paired only with food rewards"],correct:1,difficulty:"easy"},
  {prompt:"In Pavlovian conditioning, the conditioned stimulus (CS) is:",options:["A stimulus that naturally triggers a response","A neutral stimulus that has been paired with a meaningful event","The reward given after an operant response","The behavior a subject performs for food"],correct:1,difficulty:"easy"},
  {prompt:"What is shaping in operant conditioning?",options:["Punishing all incorrect behaviors at once","Reinforcing successive approximations toward a target behavior","Ignoring behavior until it disappears","Pairing two unrelated stimuli together"],correct:1,difficulty:"easy"},
  {prompt:"Delay discounting refers to which phenomenon?",options:["Future rewards become more desirable the longer you wait","The subjective value of a reward decreases as the delay to receiving it increases","Punishment becomes weaker when it is delayed","Extinction is more rapid with longer inter-trial intervals"],correct:1,difficulty:"easy"},
  {prompt:"In Skinner's experiment on positive punishment, paw-slapped rats during extinction:",options:["Stopped pressing the lever much faster than unpunished rats","Showed similar total lever presses to unpunished rats, suggesting punishment was ineffective","Pressed the lever more due to frustration","Never pressed the lever again after the first slap"],correct:1,difficulty:"easy"},
  {prompt:"Pavlovian extinction involves:",options:["Presenting the US without the CS","Presenting the CS without the US until the CR decreases","Strengthening the CR by increasing CS intensity","Pairing the CS with a new, stronger US"],correct:1,difficulty:"medium"},
  {prompt:"According to the conditioned suppression account of punishment, punishment reduces behavior because:",options:["It directly erases the S-R association","It creates an emotional/fear response that interferes with ongoing behavior","It permanently destroys the memory trace","It increases motivation to seek alternative rewards"],correct:1,difficulty:"medium"},
  {prompt:"Why did the child's self-injurious behavior return when a different therapist entered the room?",options:["The punishment had fully erased the behavior","The behavior was suppressed only near the therapist who delivered punishment — that therapist became an Sᴰ","The child forgot the rule","The new therapist accidentally reinforced the behavior"],correct:1,difficulty:"medium"},
  {prompt:"A key criticism of punishment as a behavior-change strategy is that:",options:["It is impossible to apply consistently","It tells the organism what not to do but does not teach what behavior is acceptable","It only works for Pavlovian behaviors","It can only suppress food-related behaviors"],correct:1,difficulty:"medium"},
  {prompt:"Spontaneous recovery in Pavlovian conditioning demonstrates that:",options:["Extinction permanently destroys the original CS-US association","After extinction and a rest period, the CR can re-emerge, showing original learning was not erased","Reinforcement always overpowers extinction","Habituation and extinction are the same process"],correct:1,difficulty:"medium"},
  {prompt:"Renewal of an extinguished response occurs when:",options:["The US is presented alone after extinction","The organism is tested in a context different from where extinction took place","The CS intensity is increased","A new operant response is reinforced"],correct:1,difficulty:"medium"},
  {prompt:"Reinstatement refers to:",options:["The return of an extinguished CR following an unexpected presentation of the US","Faster reacquisition of behavior after re-training","Spontaneous recovery during a rest period","Context-specific punishment suppression"],correct:0,difficulty:"medium"},
  {prompt:"The Premack Principle states that:",options:["Any stimulus can serve as a reinforcer if presented after a response","High-probability behaviors can be used to reinforce low-probability behaviors","Punishment is always more effective than reinforcement","Extinction permanently weakens all responses"],correct:1,difficulty:"medium"},
  {prompt:"In the case study from lecture, the 8-year-old's self-injury stopped by the 8th extinction session because:",options:["Punishment via shocks was applied","The behavior had been maintained by attention; removing attention eventually eliminated it","The child was medicated","The therapist used overcorrection"],correct:1,difficulty:"medium"},
  {prompt:"In the Camp, Raymond, and Church (1967) study on punishment timing:",options:["Delay of punishment had no effect","Immediate punishment produced more suppression, and more intense punishment produced more suppression","Only mild punishment was effective","Delayed punishment was more effective because it allowed anticipation"],correct:1,difficulty:"medium"},
  {prompt:"In Rescorla's contingency framework, conditioned inhibition occurs when:",options:["P(US|CS) > P(US|noCS)","P(US|CS) = P(US|noCS)","P(US|CS) < P(US|noCS)","The CS always immediately precedes the US"],correct:2,difficulty:"hard"},
  {prompt:"The blocking effect (Kamin) demonstrates that:",options:["Simple temporal contiguity between CS and US is sufficient","A CS only acquires strength if it adds new predictive information about the US","All stimuli present during conditioning gain equal strength","Motor fatigue prevents responding"],correct:1,difficulty:"hard"},
  {prompt:"Outcome devaluation tests whether behavior is goal-directed because:",options:["Habitual behavior persists even if the outcome is devalued, while goal-directed behavior decreases","Goal-directed behavior never changes after training","Habits are always stronger than goal-directed responses","Devaluation works only on Pavlovian behaviors"],correct:0,difficulty:"hard"},
  {prompt:"According to the negative law of effect (lecture theories of punishment):",options:["Punishment creates an emotional state that indirectly suppresses behavior","Punishment is the mirror image of reinforcement — it weakens S-R associations as reinforcement strengthens them","Punishment only works combined with positive reinforcement","Negative consequences have no lasting effect on association strength"],correct:1,difficulty:"hard"},
  {prompt:"A child misbehaves only when a particular parent is absent. This best illustrates:",options:["Generalization of punishment","The parent becoming an S-delta (discriminative stimulus signaling punishment will NOT occur)","Positive punishment losing effectiveness over time","Extinction of punishment-related fear"],correct:1,difficulty:"hard"},
  {prompt:"'Use of punishment may be reinforced' means:",options:["The person receiving punishment enjoys it","If punishment suppresses maladaptive behavior, administering it is negatively reinforced, potentially leading to overuse","Reinforcement always follows punishment","The punished organism reinforces the punisher"],correct:1,difficulty:"hard"},
  {prompt:"Outcome-mediated transfer shows that:",options:["Organisms do not encode outcome identity","S-R theory fully explains operant learning","Shared outcome identity can transfer responding across stimuli and responses","Extinction is not context-specific"],correct:2,difficulty:"hard"},
];

let state={};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
function makePlayer(name,token){return{name,token,currentSpace:0,turnStartSpace:0,totalCorrect:0,totalWrong:0,lostMoveCount:0,totalImmediate:0,totalDelayed:0,c1Immediate:0,c1Delayed:0,c2Immediate:0,c2Delayed:0,c3Immediate:0,c3Delayed:0,cueShown:0,cueRewarded:0,c1CueShown:0,c1CueRewarded:0,c2CueShown:0,c2CueRewarded:0,c3CueShown:0,c3CueRewarded:0,delayedRewards:[]};}
function resetState(){const q=[...ALL_QUESTIONS];shuffle(q);state={turn:0,activePlayerIndex:0,gameOver:false,cueThisTurn:false,currentQuestion:null,questionIndex:0,questions:q,players:[makePlayer('Player 1','🧠'),makePlayer('Player 2','🔬')]};}
function currentPlayer(){return state.players[state.activePlayerIndex];}
function nextPlayer(){state.activePlayerIndex=state.activePlayerIndex===0?1:0;}
function clampPlayer(p){if(p.currentSpace<0)p.currentSpace=0;if(p.currentSpace>TOTAL_SPACES+1)p.currentSpace=TOTAL_SPACES+1;}
function setMessage(icon,html){messageIcon.textContent=icon;messageBox.innerHTML=html;}
function showScreen(s){[startScreen,instructionsScreen,gameScreen,summaryScreen].forEach(x=>x.classList.remove('active'));s.classList.add('active');window.scrollTo(0,0);}
function updateCondChip(c){condChip.className='stat-chip cond-chip';if(c===2)condChip.classList.add('c2');if(c===3)condChip.classList.add('c3');conditionDisplay.textContent=conditionLabel(c);}
function updatePanel(){const p=currentPlayer(),p1=state.players[0],p2=state.players[1];turnDisplay.textContent=state.turn;playerDisplay.textContent=`${p.name} ${p.token}`;p1SpaceDisplay.textContent=p1.currentSpace<=0?'—':p1.currentSpace>=TOTAL_SPACES?'🏁':p1.currentSpace;p2SpaceDisplay.textContent=p2.currentSpace<=0?'—':p2.currentSpace>=TOTAL_SPACES?'🏁':p2.currentSpace;correctDisplay.textContent=p.totalCorrect;wrongDisplay.textContent=p.totalWrong;updateCondChip(conditionOf(Math.max(1,Math.min(p.currentSpace,TOTAL_SPACES))));}
function updatePendingUI(){const p=currentPlayer();if(p.delayedRewards.length===0){pendingRewardsCard.classList.add('hidden');return;}pendingRewardsCard.classList.remove('hidden');pendingList.innerHTML='';p.delayedRewards.forEach((r,i)=>{const d=document.createElement('div');d.className='pending-item';d.textContent=`Reward ${i+1}: +${r.spaces} spaces in ${r.turnsLeft} turn${r.turnsLeft!==1?'s':''}`;pendingList.appendChild(d);});}
function processDelayedRewards(){const p=currentPlayer();if(p.delayedRewards.length===0)return null;p.delayedRewards.forEach(r=>{r.turnsLeft--;});const due=p.delayedRewards.filter(r=>r.turnsLeft<=0);p.delayedRewards=p.delayedRewards.filter(r=>r.turnsLeft>0);if(due.length===0)return null;const total=due.reduce((s,r)=>s+r.spaces,0);p.currentSpace+=total;clampPlayer(p);renderTokens();updatePanel();updatePendingUI();return total;}
function resolveCue(){const p=currentPlayer();if(!state.cueThisTurn)return;const cond=conditionOf(p.currentSpace);let rew=false;if(cond===1)rew=true;else if(cond===2)rew=Math.random()<0.5;p.cueShown++;if(cond===1)p.c1CueShown++;if(cond===2)p.c2CueShown++;if(cond===3)p.c3CueShown++;if(rew){p.cueRewarded++;if(cond===1)p.c1CueRewarded++;if(cond===2)p.c2CueRewarded++;p.currentSpace+=2;clampPlayer(p);renderTokens();updatePanel();setMessage('🔔',`The <strong>🔔 cue</strong> paid off for ${p.name}! Bonus <strong>+2 spaces</strong>.`);}else{if(cond===2)setMessage('🔔',`${p.name} hit a <strong>🔔 cue space</strong>, but no bonus this time.`);else setMessage('🔔',`${p.name} hit a <strong>🔔 cue space</strong>, but nothing came of it.`);}}
function nextQuestion(){const q=state.questions[state.questionIndex%state.questions.length];state.questionIndex++;return q;}
function showQuestion(){questionCard.classList.remove('hidden');choiceCard.classList.add('hidden');const q=nextQuestion();state.currentQuestion=q;questionText.textContent=q.prompt;qDifficultyBadge.textContent=q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1);qDifficultyBadge.className='q-badge';if(q.difficulty==='medium')qDifficultyBadge.classList.add('med');if(q.difficulty==='hard')qDifficultyBadge.classList.add('hard');answerButtons.innerHTML='';q.options.forEach((opt,idx)=>{const btn=document.createElement('button');btn.className='answer-btn';btn.textContent=opt;btn.addEventListener('click',()=>handleAnswer(idx));answerButtons.appendChild(btn);});}
function handleAnswer(idx){const p=currentPlayer(),q=state.currentQuestion,ok=idx===q.correct;answerButtons.querySelectorAll('.answer-btn').forEach((b,i)=>{b.classList.add('disabled-ans');if(i===q.correct)b.classList.add('correct-ans');if(i===idx&&!ok)b.classList.add('wrong-ans');});if(ok){p.totalCorrect++;updatePanel();resolveCue();setTimeout(()=>{questionCard.classList.add('hidden');showChoiceScreen();},850);}else{p.totalWrong++;p.lostMoveCount++;p.currentSpace=p.turnStartSpace;clampPlayer(p);renderTokens();updatePanel();setTimeout(()=>{questionCard.classList.add('hidden');setMessage('🚫',`${p.name} got it wrong and loses that move, going back to space ${p.currentSpace}.`);if(checkFinish())return;nextPlayer();updatePanel();updatePendingUI();rollBtn.disabled=false;setTimeout(()=>setMessage('🎲',`It's now <strong>${currentPlayer().name}</strong>'s turn. Click <strong>Roll</strong>.`),550);},850);}}
function showChoiceScreen(){choiceCard.classList.remove('hidden');const p=currentPlayer();const cond=conditionOf(Math.max(1,Math.min(p.currentSpace,TOTAL_SPACES)));choiceText.textContent=`${p.name}, choose your reward.`;if(cond===1){immediateDesc.textContent='+1 space right now';delayedDesc.textContent='+3 spaces next turn';}else if(cond===2){immediateDesc.textContent='+1 space right now';delayedDesc.textContent='+3 spaces after 2 turns';}else{immediateDesc.textContent='+1 space right now';delayedDesc.textContent='+3 spaces later';}}
function recordChoice(p,t){const c=conditionOf(Math.max(1,Math.min(p.currentSpace,TOTAL_SPACES)));if(t==='immediate'){p.totalImmediate++;if(c===1)p.c1Immediate++;if(c===2)p.c2Immediate++;if(c===3)p.c3Immediate++;}else{p.totalDelayed++;if(c===1)p.c1Delayed++;if(c===2)p.c2Delayed++;if(c===3)p.c3Delayed++;}}
function handleImmediateChoice(){const p=currentPlayer();recordChoice(p,'immediate');choiceCard.classList.add('hidden');p.currentSpace++;clampPlayer(p);renderTokens();updatePanel();if(checkFinish())return;const n=p.name;nextPlayer();updatePanel();updatePendingUI();rollBtn.disabled=false;setMessage('⚡',`${n} took the <strong>immediate reward</strong> (+1 space). Now it's <strong>${currentPlayer().name}</strong>'s turn.`);}
function handleDelayedChoice(){const p=currentPlayer();recordChoice(p,'delayed');choiceCard.classList.add('hidden');const cond=conditionOf(Math.max(1,Math.min(p.currentSpace,TOTAL_SPACES)));const n=p.name;if(cond===1){p.delayedRewards.push({turnsLeft:1,spaces:3});setMessage('⏳',`${n} chose the <strong>delayed reward</strong>. They'll get <strong>+3 spaces</strong> next turn.`);}else if(cond===2){p.delayedRewards.push({turnsLeft:2,spaces:3});setMessage('⏳',`${n} chose the <strong>delayed reward</strong>. They'll get <strong>+3 spaces</strong> in 2 turns.`);}else{p.delayedRewards.push({turnsLeft:1,spaces:0});setMessage('⏳',`${n} chose the delayed reward. It will arrive next turn.`);}if(checkFinish())return;nextPlayer();updatePanel();updatePendingUI();rollBtn.disabled=false;}
function handleRoll(){if(state.gameOver)return;const p=currentPlayer();rollBtn.disabled=true;questionCard.classList.add('hidden');choiceCard.classList.add('hidden');state.turn++;p.turnStartSpace=p.currentSpace;updatePanel();const del=processDelayedRewards();if(checkFinish())return;const doRoll=()=>{const roll=Math.floor(Math.random()*3)+1;p.currentSpace+=roll;clampPlayer(p);if(p.currentSpace>TOTAL_SPACES){p.currentSpace=TOTAL_SPACES+1;checkFinish();return;}state.cueThisTurn=p.currentSpace>=1&&p.currentSpace<=TOTAL_SPACES&&CUE_SPACES.has(p.currentSpace);renderTokens();updatePanel();if(checkFinish())return;let msg=`${p.name} rolled a <strong>${roll}</strong> and moved to space <strong>${p.currentSpace}</strong>`;if(state.cueThisTurn)msg+=` — a <strong>🔔 cue space</strong>`;msg+='. Answer the question to unlock your reward choice.';setMessage('🎲',msg);setTimeout(showQuestion,500);};if(del!==null){setMessage('🎁',`${p.name}'s delayed reward arrived: <strong>+${del} space${del!==1?'s':''}</strong>.`);setTimeout(doRoll,900);}else doRoll();}
function checkFinish(){const w=state.players.find(p=>p.currentSpace>=TOTAL_SPACES+1);if(!w)return false;w.currentSpace=TOTAL_SPACES+1;state.gameOver=true;renderTokens();updatePanel();setMessage('🏁',`<strong>${w.name}</strong> reached the finish! Loading summary…`);setTimeout(showSummary,1400);return true;}

function buildPI(p){
  const lines=[];
  const t1=p.c1Immediate+p.c1Delayed,t2=p.c2Immediate+p.c2Delayed,t3=p.c3Immediate+p.c3Delayed;
  if(t1>0){const pct=Math.round(p.c1Delayed/t1*100);lines.push(`In <strong>Condition 1 (Acquisition)</strong>, ${p.name} chose the delayed reward ${p.c1Delayed}/${t1} times (${pct}%). With a short wait and a reliable payoff, this is the baseline preference.`);}
  if(t2>0){const pct=Math.round(p.c2Delayed/t2*100);if(p.c2Delayed<p.c1Delayed)lines.push(`In <strong>Condition 2 (Increased Delay)</strong>, delayed choices dropped to ${p.c2Delayed}/${t2} (${pct}%). This shift is consistent with <em>delay discounting</em> — the longer the wait, the lower the subjective value of the delayed reward.`);else if(p.c2Delayed===p.c1Delayed)lines.push(`In <strong>Condition 2 (Increased Delay)</strong>, ${p.name} held steady at ${p.c2Delayed}/${t2} delayed choices (${pct}%), similar to Condition 1, suggesting stable delay tolerance.`);else lines.push(`In <strong>Condition 2 (Increased Delay)</strong>, delayed choices increased to ${p.c2Delayed}/${t2} (${pct}%), which is atypical — most subjects show delay discounting when waits grow.`);}
  if(t3>0){const pct=Math.round(p.c3Delayed/t3*100);if(p.c3Delayed>0)lines.push(`In <strong>Condition 3 (Extinction)</strong>, ${p.name} still picked the delayed option ${p.c3Delayed}/${t3} times (${pct}%) even though it no longer paid off. This persistence reflects the <em>Partial Reinforcement Extinction Effect (PREE)</em>: behavior reinforced on a partial schedule is slower to extinguish.`);else lines.push(`In <strong>Condition 3 (Extinction)</strong>, ${p.name} stopped choosing the delayed option (0/${t3}), suggesting primarily <em>goal-directed behavior</em> — once the outcome changed, the response changed quickly.`);}
  const tc=p.c1CueShown+p.c2CueShown+p.c3CueShown;
  if(tc>0){
    lines.push('<strong>🔔 Pavlovian Cue Analysis:</strong>');
    if(p.c1CueShown>0)lines.push(`During <strong>Condition 1</strong>, the 🔔 cue appeared ${p.c1CueShown} time(s) and was always rewarded. This consistent CS–US pairing established a <em>conditioned expectation (CR)</em> — ${p.name} could reliably anticipate a bonus when the bell appeared.`);
    if(p.c2CueShown>0){const u=p.c2CueShown-p.c2CueRewarded;lines.push(`In <strong>Condition 2</strong>, the 🔔 cue appeared ${p.c2CueShown} time(s) but only rewarded ${p.c2CueRewarded} (${u} no-bonus). This partial reinforcement mirrors a <em>variable schedule</em>, maintaining conditioned responding even when the US is inconsistent.`);}
    if(p.c3CueShown>0)lines.push(`In <strong>Condition 3</strong>, the 🔔 cue appeared ${p.c3CueShown} time(s) with no bonus — the classic <em>Pavlovian extinction</em> paradigm. Any continued anticipation reflects how CRs persist beyond the removal of reinforcement, consistent with spontaneous recovery and renewal effects.`);
    const tr=p.c1CueRewarded+p.c2CueRewarded;
    lines.push(`Overall the 🔔 cue was shown ${tc} times and rewarded ${tr} times — mirroring the acquisition → partial → extinction arc.`);
  }
  if(p.lostMoveCount>0)lines.push(`${p.name} lost <strong>${p.lostMoveCount} move(s)</strong> to wrong answers. Each lost move functioned as <em>positive punishment</em> — swift, sufficient, and consistent, matching the conditions lecture identified as making punishment effective.`);
  else lines.push(`${p.name} didn't lose any moves to wrong answers, so the punishment contingency had no measurable impact.`);
  return lines.map(l=>`<p>${l}</p>`).join('');
}

function playerHTML(p){const ta=p.totalCorrect+p.totalWrong;const acc=ta===0?'—':`${Math.round(p.totalCorrect/ta*100)}%`;const fp=p.currentSpace>=TOTAL_SPACES+1?'Finish 🏁':`Space ${p.currentSpace}`;return `<div class="player-summary-card"><h3>${p.name} ${p.token}</h3><div class="phase-block"><h4>Overall</h4><div class="phase-row"><span>Final Position:</span><span>${fp}</span></div><div class="phase-row"><span>Correct / Wrong:</span><span>${p.totalCorrect} / ${p.totalWrong} (${acc})</span></div><div class="phase-row"><span>Lost Moves:</span><span>${p.lostMoveCount}</span></div></div><div class="phase-block"><h4>Condition 1 — Acquisition</h4><div class="phase-row"><span>Immediate:</span><span>${p.c1Immediate}</span></div><div class="phase-row"><span>Delayed:</span><span>${p.c1Delayed}</span></div><div class="phase-row"><span>🔔 Shown / Rewarded:</span><span>${p.c1CueShown} / ${p.c1CueRewarded}</span></div></div><div class="phase-block"><h4>Condition 2 — Increased Delay</h4><div class="phase-row"><span>Immediate:</span><span>${p.c2Immediate}</span></div><div class="phase-row"><span>Delayed:</span><span>${p.c2Delayed}</span></div><div class="phase-row"><span>🔔 Shown / Rewarded:</span><span>${p.c2CueShown} / ${p.c2CueRewarded}</span></div></div><div class="phase-block"><h4>Condition 3 — Extinction</h4><div class="phase-row"><span>Immediate:</span><span>${p.c3Immediate}</span></div><div class="phase-row"><span>Delayed:</span><span>${p.c3Delayed}</span></div><div class="phase-row"><span>🔔 Shown (no reward):</span><span>${p.c3CueShown}</span></div></div><div class="interp-block">${buildPI(p)}</div></div>`;}

function showSummary(){const p1=state.players[0],p2=state.players[1];const tc=p1.totalCorrect+p2.totalCorrect,tw=p1.totalWrong+p2.totalWrong,ta=tc+tw;summaryCorrect.textContent=tc;summaryWrong.textContent=tw;summaryAccuracy.textContent=ta===0?'—':`${Math.round(tc/ta*100)}%`;summaryPunishment.textContent=p1.lostMoveCount+p2.lostMoveCount;summaryCueShown.textContent=p1.cueShown+p2.cueShown;summaryCueRewarded.textContent=p1.cueRewarded+p2.cueRewarded;summaryPlayers.innerHTML=playerHTML(p1)+playerHTML(p2);showScreen(summaryScreen);}

function startGame(){resetState();buildSVG();renderTokens();updatePanel();updatePendingUI();questionCard.classList.add('hidden');choiceCard.classList.add('hidden');rollBtn.disabled=false;setMessage('🎲',`Welcome! <strong>${currentPlayer().name}</strong> goes first. Click <strong>Roll</strong> to begin.`);showScreen(gameScreen);}

openHelpBtn?.addEventListener('click',()=>helpModal.classList.remove('hidden'));
closeHelpBtn?.addEventListener('click',()=>helpModal.classList.add('hidden'));
document.querySelector('.modal-backdrop')?.addEventListener('click',()=>helpModal.classList.add('hidden'));
goToInstructionsBtn.addEventListener('click',()=>showScreen(instructionsScreen));
backToTitleBtn.addEventListener('click',()=>showScreen(startScreen));
startGameBtn.addEventListener('click',startGame);
startFromInstrBtn.addEventListener('click',startGame);
restartBtn.addEventListener('click',startGame);
backToTitleFinalBtn.addEventListener('click',()=>showScreen(startScreen));
rollBtn.addEventListener('click',handleRoll);
immediateBtn.addEventListener('click',handleImmediateChoice);
delayedBtn.addEventListener('click',handleDelayedChoice);
showScreen(startScreen);