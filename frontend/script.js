/* SkillSync AI — Placement Readiness Console
   Single JS file: theme init (runs first) + full application logic
   (auth, navigation, charts, chatbot, mock interview with voice + webcam, etc.) */

/* ============ THEME INIT — runs before first paint to avoid a flash of the wrong theme ============ */
  // Apply system color-scheme preference before first paint to avoid a flash.
  (function(){
    try{
      var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      if(prefersLight) document.documentElement.setAttribute('data-theme','light');
    }catch(e){}
  })();

/* ============ APPLICATION LOGIC ============ */
/* ============ NAV ============ */
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('[data-view]');
const topTitle = document.getElementById('topTitle');
const topSub = document.getElementById('topSub');
const subMap = {
  dashboard:"Your unified placement-readiness overview",
  score:"Explainable, weighted breakdown of your composite score",
  resume:"NLP-based parsing and ATS scoring",
  github:"Portfolio strength from your repositories",
  leetcode:"Coding proficiency and topic mastery",
  skillgap:"Semantic similarity against your target role",
  interview:"AI asks questions aloud — you answer live by voice on camera",
  learning:"Courses mapped to your exact skill gaps",
  mentor:"Context-aware AI career guidance",
  notifications:"Real-time readiness alerts",
  team:"Meet the builders behind SkillSync AI",
  profile:"Your account & placement profile details"
};
const titleMap = {
  dashboard:"Dashboard", score:"Readiness Score", resume:"Resume Analysis", github:"GitHub Analysis",
  leetcode:"Coding Tracker", skillgap:"Skill Gap Detection", interview:"Mock Interview",
  learning:"Learning Path", mentor:"AI Career Mentor", notifications:"Notifications", team:"Project Team",
  profile:"My Profile"
};

let currentViewName = 'dashboard';
function goTo(name){
  if(currentViewName === 'interview' && name !== 'interview' && typeof stopInterviewMedia === 'function'){
    stopInterviewMedia();
  }
  currentViewName = name;
  views.forEach(v=>v.classList.toggle('active', v.id === 'view-'+name));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
  topTitle.textContent = titleMap[name] || name;
  topSub.textContent = subMap[name] || '';
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.content').scrollTo?.({top:0});
  window.scrollTo({top:0, behavior:'smooth'});
  // re-trigger reveal animations
  document.querySelectorAll('#view-'+name+' .reveal').forEach(el=>{
    el.style.animation='none'; el.offsetHeight; el.style.animation='';
  });
  if(name==='dashboard') requestAnimationFrame(initDashboardCharts);
  if(name==='score') requestAnimationFrame(initScoreChart);
  if(name==='github') requestAnimationFrame(initGithubChart);
  if(name==='leetcode') requestAnimationFrame(initLeetcodeChart);
  if(name==='skillgap') requestAnimationFrame(initSkillRadar);
  animateProgressBars();
}
navItems.forEach(item=>{
  item.addEventListener('click', ()=>goTo(item.dataset.view));
});
document.getElementById('menuToggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('open');
});

/* ============ PROGRESS BAR ANIM ============ */
function animateProgressBars(){
  document.querySelectorAll('.progress > i[data-w]').forEach(bar=>{
    const w = bar.getAttribute('data-w');
    bar.style.width = '0%';
    requestAnimationFrame(()=>{ setTimeout(()=>{ bar.style.width = w+'%'; }, 60); });
  });
}

/* ============ RING HELPERS ============ */
function setRing(el, percent, radius){
  const c = 2*Math.PI*radius;
  el.setAttribute('stroke-dasharray', c.toFixed(1));
  const offset = c - (percent/100)*c;
  requestAnimationFrame(()=>{ el.style.strokeDashoffset = offset; });
}
function countUp(el, target, dur=1400){
  const start = performance.now();
  function tick(t){
    const p = Math.min(1,(t-start)/dur);
    const eased = 1-Math.pow(1-p,3);
    el.textContent = Math.round(eased*target);
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const READINESS = 71;
function initReadinessChip(){
  setRing(document.getElementById('chipRing'), READINESS, 16);
  countUp(document.getElementById('chipVal'), READINESS, 1200);
}
function initHeroRing(){
  setRing(document.getElementById('bigRing'), READINESS, 80);
  countUp(document.getElementById('bigRingVal'), READINESS, 1600);
}
function initScoreRing(){
  setRing(document.getElementById('bigRing2'), READINESS, 80);
  countUp(document.getElementById('bigRingVal2'), READINESS, 1600);
}

/* ============ CHARTS ============ */
Chart.defaults.color = '#8a95b6';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = 'rgba(255,255,255,.06)';
const gridOpt = {color:'rgba(255,255,255,.05)'};

let charts = {};
function killChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

function applyChartTheme(){
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  const textColor = light ? '#4c5573' : '#8a95b6';
  const gridColor = light ? 'rgba(20,25,45,.08)' : 'rgba(255,255,255,.06)';
  const angleColor = light ? 'rgba(20,25,45,.12)' : 'rgba(255,255,255,.08)';
  const pointLabelColor = light ? '#4c5573' : '#a6b0d6';
  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;
  gridOpt.color = gridColor;
  Object.values(charts).forEach(ch=>{
    if(ch.options.scales){
      Object.values(ch.options.scales).forEach(scale=>{
        if(scale.grid) scale.grid.color = gridColor;
        if(scale.angleLines) scale.angleLines.color = angleColor;
        if(scale.pointLabels) scale.pointLabels.color = pointLabelColor;
        if(scale.ticks) scale.ticks.color = textColor;
      });
    }
    if(ch.options.plugins && ch.options.plugins.legend && ch.options.plugins.legend.labels){
      ch.options.plugins.legend.labels.color = textColor;
    }
    ch.update();
  });
}

/* ============ THEME TOGGLE ============ */
let themeOverride = null; // null = follow system, 'light' | 'dark' = manual override
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');
const themeMedia = window.matchMedia('(prefers-color-scheme: light)');

function currentIsLight(){
  if(themeOverride) return themeOverride === 'light';
  return themeMedia.matches;
}
function paintTheme(){
  const light = currentIsLight();
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  iconSun.style.display = light ? 'block' : 'none';
  iconMoon.style.display = light ? 'none' : 'block';
  applyChartTheme();
}
document.getElementById('themeToggle').addEventListener('click', ()=>{
  themeOverride = currentIsLight() ? 'dark' : 'light';
  paintTheme();
});
themeMedia.addEventListener('change', ()=>{
  if(!themeOverride) paintTheme(); // only auto-update if user hasn't manually chosen
});
paintTheme();

function initDashboardCharts(){
  const rc = document.getElementById('radarChart');
  if(rc && !charts.radar){
    charts.radar = new Chart(rc, {
      type:'radar',
      data:{
        labels:['Python/ML','Web Dev','DSA','System Design','Databases','Cloud/DevOps'],
        datasets:[
          {label:'Your Skills', data:[88,74,70,35,72,40], backgroundColor:'rgba(34,229,172,.18)', borderColor:'#22e5ac', pointBackgroundColor:'#22e5ac'},
          {label:'Target Role', data:[85,70,80,70,75,65], backgroundColor:'rgba(138,124,255,.12)', borderColor:'#8a7cff', pointBackgroundColor:'#8a7cff'}
        ]
      },
      options:{
        responsive:true,
        scales:{ r:{ angleLines:{color:'rgba(255,255,255,.08)'}, grid:{color:'rgba(255,255,255,.07)'}, pointLabels:{color:'#a6b0d6', font:{size:10.5}}, ticks:{display:false}, suggestedMin:0, suggestedMax:100 } },
        plugins:{ legend:{ position:'bottom', labels:{boxWidth:10, font:{size:11}} } }
      }
    });
  }
  const pc = document.getElementById('progressChart');
  if(pc && !charts.progress){
    charts.progress = new Chart(pc, {
      type:'line',
      data:{
        labels:['W1','W2','W3','W4','W5','W6'],
        datasets:[{
          label:'Readiness Score', data:[48,53,58,62,66,71],
          borderColor:'#22e5ac', backgroundColor:'rgba(34,229,172,.12)',
          tension:.4, fill:true, pointRadius:3, pointBackgroundColor:'#22e5ac'
        }]
      },
      options:{
        responsive:true,
        scales:{ y:{grid:gridOpt, min:30, max:90}, x:{grid:{display:false}} },
        plugins:{ legend:{display:false} }
      }
    });
  }
  applyChartTheme();
}
function initScoreChart(){
  const dc = document.getElementById('doughnutChart');
  if(dc && !charts.doughnut){
    charts.doughnut = new Chart(dc, {
      type:'doughnut',
      data:{
        labels:['Resume/ATS (25%)','GitHub (20%)','Coding (25%)','Interview (30%)'],
        datasets:[{ data:[25,20,25,30], backgroundColor:['#22e5ac','#8a7cff','#ffbe55','#ff6f91'], borderColor:'#0f1524', borderWidth:3 }]
      },
      options:{ responsive:true, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{boxWidth:10, font:{size:11}} } } }
    });
  }
  applyChartTheme();
}
function initGithubChart(){
  const lc = document.getElementById('langChart');
  if(lc && !charts.lang){
    charts.lang = new Chart(lc, {
      type:'bar',
      data:{
        labels:['Python','JavaScript','HTML/CSS','C++','SQL'],
        datasets:[{ data:[42,31,14,8,5], backgroundColor:['#22e5ac','#f1e05a','#e34c26','#f34b7d','#8a7cff'], borderRadius:6 }]
      },
      options:{
        indexAxis:'y', responsive:true,
        scales:{ x:{grid:gridOpt, ticks:{callback:v=>v+'%'}}, y:{grid:{display:false}} },
        plugins:{ legend:{display:false} }
      }
    });
  }
  applyChartTheme();
}
function initLeetcodeChart(){
  const dfc = document.getElementById('difficultyChart');
  if(dfc && !charts.diff){
    charts.diff = new Chart(dfc, {
      type:'bar',
      data:{
        labels:['Easy','Medium','Hard'],
        datasets:[
          {label:'Solved', data:[168,120,24], backgroundColor:'#22e5ac', borderRadius:6},
          {label:'Total', data:[220,300,180], backgroundColor:'rgba(255,255,255,.08)', borderRadius:6}
        ]
      },
      options:{
        responsive:true,
        scales:{ y:{grid:gridOpt}, x:{grid:{display:false}} },
        plugins:{ legend:{ position:'bottom', labels:{boxWidth:10, font:{size:11}} } }
      }
    });
  }
  applyChartTheme();
}
function initSkillRadar(){
  const sr = document.getElementById('skillRadar');
  if(sr && !charts.skillgap){
    charts.skillgap = new Chart(sr, {
      type:'radar',
      data:{
        labels:['Python','React.js','MongoDB','NLP','Docker','System Design','CI/CD','Git'],
        datasets:[
          {label:'Have', data:[90,80,75,85,10,25,15,88], backgroundColor:'rgba(34,229,172,.15)', borderColor:'#22e5ac'},
          {label:'Required', data:[85,75,70,70,70,75,65,80], backgroundColor:'rgba(255,111,145,.08)', borderColor:'#ff6f91'}
        ]
      },
      options:{
        responsive:true,
        scales:{ r:{ angleLines:{color:'rgba(255,255,255,.08)'}, grid:{color:'rgba(255,255,255,.07)'}, pointLabels:{color:'#a6b0d6', font:{size:10}}, ticks:{display:false} } },
        plugins:{ legend:{ position:'bottom', labels:{boxWidth:10, font:{size:11}} } }
      }
    });
  }
  applyChartTheme();
}

/* ============ ROLE CHIPS ============ */
document.querySelectorAll('.role-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.role-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* ============ RESUME UPLOAD SIMULATION ============ */
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
let uploadedName = 'Tejashri_Kamble_Resume.pdf';

uploadZone.addEventListener('click', ()=> fileInput.click());
['dragover','dragenter'].forEach(evt=> uploadZone.addEventListener(evt, e=>{ e.preventDefault(); uploadZone.classList.add('dragover'); }));
['dragleave','drop'].forEach(evt=> uploadZone.addEventListener(evt, e=>{ e.preventDefault(); uploadZone.classList.remove('dragover'); }));
uploadZone.addEventListener('drop', e=>{
  if(e.dataTransfer.files.length) uploadedName = e.dataTransfer.files[0].name;
  uploadZone.querySelector('b').textContent = uploadedName;
});
fileInput.addEventListener('change', ()=>{
  if(fileInput.files.length) uploadedName = fileInput.files[0].name;
  uploadZone.querySelector('b').textContent = uploadedName;
});

analyzeBtn.addEventListener('click', runResumeAnalysis);
function runResumeAnalysis(){
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing…';
  document.getElementById('resumeResults').style.display='none';
  const steps = document.querySelectorAll('.parse-step');
  steps.forEach(s=>{ s.classList.remove('active','done'); s.querySelector('.dotwrap').innerHTML=''; });

  let i = 0;
  function nextStep(){
    if(i>0){
      const prev = steps[i-1];
      prev.classList.remove('active'); prev.classList.add('done');
      prev.querySelector('.dotwrap').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
    }
    if(i < steps.length){
      steps[i].classList.add('active');
      steps[i].querySelector('.dotwrap').innerHTML = '<div class="spin"></div>';
      i++;
      setTimeout(nextStep, 650);
    } else {
      finishAnalysis();
    }
  }
  nextStep();
}
function finishAnalysis(){
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = 'Re-run Analysis';
  setRing(document.getElementById('atsRing'), 82, 16);
  countUp(document.getElementById('atsVal'), 82, 1200);
  document.getElementById('atsLabel').textContent = 'Strong ATS Compatibility';
  const results = document.getElementById('resumeResults');
  results.style.display='block';
  const tagWrap = document.getElementById('skillTags');
  tagWrap.innerHTML='';
  const matched = ['Python','React.js','Node.js','MongoDB','NLP','Sentence Transformers','Git'];
  const missing = ['Docker','System Design'];
  matched.forEach((s,idx)=>{
    const t = document.createElement('span'); t.className='skill-tag matched'; t.textContent=s;
    t.style.animationDelay = (idx*0.05)+'s'; tagWrap.appendChild(t);
  });
  missing.forEach((s,idx)=>{
    const t = document.createElement('span'); t.className='skill-tag missing'; t.textContent=s;
    t.style.animationDelay = ((matched.length+idx)*0.05)+'s'; tagWrap.appendChild(t);
  });
}

/* ============ CHAT ============ */
const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

const botReplies = {
  "what should i focus on this week?": "Based on your profile: prioritize Docker fundamentals (biggest missing skill for your target role) and one more mock interview to lift your confidence score above 70%. Your DSA and NLP skills are already strong.",
  "how do i close my docker skill gap fast?": "Start with the 'Docker for Developers' module in your Learning Path — it's 6 hours. Then containerize your Smart Warehouse project's backend as hands-on practice. I can generate a step-by-step plan if you'd like.",
  "review my resume summary section": "Your summary is clear but generic. Try: 'Final-year AI & Data Science student with hands-on experience building end-to-end ML pipelines (NLP, semantic search) — seeking an SDE/AI-ML role.' Leading with your specialization helps ATS keyword matching."
};
function botDefault(msg){
  return "Good question! Looking at your resume, GitHub, and skill-gap data — I'd suggest breaking this into a small, testable goal for this week. Want me to turn that into a 3-step action plan?";
}
function addMsg(text, who){
  const div = document.createElement('div');
  div.className = 'msg '+who;
  div.innerHTML = text + '<div class="msg-meta">'+(who==='bot'?'AI Mentor':'You')+' · just now</div>';
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function botTyping(cb){
  const t = document.createElement('div');
  t.className='typing'; t.id='typingIndicator';
  t.innerHTML='<span></span><span></span><span></span>';
  chatLog.appendChild(t);
  chatLog.scrollTop = chatLog.scrollHeight;
  setTimeout(()=>{ t.remove(); cb(); }, 900+Math.random()*500);
}
function sendChat(text){
  if(!text.trim()) return;
  addMsg(text,'user');
  chatInput.value='';
  botTyping(()=>{
    const reply = botReplies[text.trim().toLowerCase()] || botDefault(text);
    addMsg(reply,'bot');
  });
}
chatSend.addEventListener('click', ()=> sendChat(chatInput.value));
chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendChat(chatInput.value); });
document.querySelectorAll('.suggest-chip').forEach(chip=>{
  chip.addEventListener('click', ()=> sendChat(chip.dataset.msg));
});

/* ============ MOCK INTERVIEW — VOICE + WEBCAM ============ */
const questions = [
  "Tell me about a project where you used NLP and explain a key design trade-off you made.",
  "How would you explain the difference between supervised and unsupervised learning to a non-technical recruiter?",
  "Describe a time you had to debug a difficult issue in a group project. What was your approach?",
  "Why are you interested in an AI/ML engineering role, and how does your major project prepare you for it?",
  "Walk me through how you would design a skill-matching system between a resume and a job description."
];
let qIndex = 0;
let timerInterval = null;
let camStream = null;
let recognizer = null;
let isListening = false;

const qText = document.getElementById('qText');
const qCount = document.getElementById('qCount');
const timerVal = document.getElementById('timerVal');
const timerRing = document.getElementById('timerRing');
const feedbackBox = document.getElementById('feedbackBox');
const answerBox = document.getElementById('answerBox');
const interviewPermission = document.getElementById('interviewPermission');
const interviewLive = document.getElementById('interviewLive');
const enableMediaBtn = document.getElementById('enableMediaBtn');
const permError = document.getElementById('permError');
const camPreview = document.getElementById('camPreview');
const micBtn = document.getElementById('micBtn');
const micBtnLabel = document.getElementById('micBtnLabel');
const voiceStatus = document.getElementById('voiceStatus');
const voiceStatusText = document.getElementById('voiceStatusText');
const voiceNote = document.getElementById('voiceNote');
const endInterviewLink = document.getElementById('endInterviewLink');

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

function setVoiceStatus(mode, label){
  voiceStatus.classList.remove('speaking','listening','ready');
  voiceStatus.classList.add(mode);
  voiceStatusText.textContent = label;
}

/* ---- Camera + Mic permission ---- */
enableMediaBtn.addEventListener('click', async ()=>{
  permError.classList.remove('show');
  enableMediaBtn.disabled = true;
  enableMediaBtn.textContent = 'Requesting access…';
  try{
    camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    camPreview.srcObject = camStream;
    interviewPermission.style.display = 'none';
    interviewLive.classList.add('show');
    setupSpeechRecognition();
    loadQuestion();
  }catch(err){
    permError.classList.add('show');
    enableMediaBtn.disabled = false;
    enableMediaBtn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5 22 7v10l-6-3.5"/></svg> Try Again';
  }
});

function stopInterviewMedia(){
  clearInterval(timerInterval);
  if(synth) synth.cancel();
  if(recognizer && isListening){ try{ recognizer.stop(); }catch(e){} }
  isListening = false;
  if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream = null; }
  interviewLive.classList.remove('show');
  interviewPermission.style.display = 'block';
  enableMediaBtn.disabled = false;
  enableMediaBtn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5 22 7v10l-6-3.5"/></svg> Enable Camera &amp; Microphone';
  qIndex = 0;
}
endInterviewLink.addEventListener('click', stopInterviewMedia);

/* ---- AI asks the question aloud (Text-to-Speech) ---- */
function speakQuestion(text, onEnd){
  if(!synth){ if(onEnd) onEnd(); return; }
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.98; utter.pitch = 1; utter.lang = 'en-US';
  const voices = synth.getVoices();
  const preferred = voices.find(v=>/en-(US|GB|IN)/i.test(v.lang) && /female|Google US English|Samantha|Zira/i.test(v.name)) || voices.find(v=>/en/i.test(v.lang));
  if(preferred) utter.voice = preferred;
  setVoiceStatus('speaking', 'AI is asking the question…');
  micBtn.disabled = true;
  utter.onend = ()=>{
    setVoiceStatus('ready', 'Ready — tap mic to answer');
    micBtn.disabled = false;
    if(onEnd) onEnd();
  };
  utter.onerror = ()=>{ setVoiceStatus('ready','Ready — tap mic to answer'); micBtn.disabled = false; if(onEnd) onEnd(); };
  synth.speak(utter);
}

/* ---- Candidate answers by voice (Speech-to-Text) ---- */
function setupSpeechRecognition(){
  if(!SpeechRecognitionAPI){
    micBtn.disabled = true;
    micBtnLabel.textContent = 'Voice not supported';
    voiceNote.textContent = 'Your browser doesn\'t support speech recognition — please type your answer instead.';
    return;
  }
  recognizer = new SpeechRecognitionAPI();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = 'en-US';

  recognizer.onresult = (e)=>{
    let finalTranscript = '';
    for(let i=e.resultIndex; i<e.results.length; i++){
      if(e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
    }
    if(finalTranscript) answerBox.value = (answerBox.value + ' ' + finalTranscript).trim();
  };
  recognizer.onerror = ()=>{ stopListening(); };
  recognizer.onend = ()=>{ if(isListening){ isListening = false; micBtn.classList.remove('recording'); micBtnLabel.textContent = 'Speak Answer'; setVoiceStatus('ready','Ready — tap mic to answer'); } };
}
function startListening(){
  if(!recognizer) return;
  try{ recognizer.start(); }catch(e){}
  isListening = true;
  micBtn.classList.add('recording');
  micBtnLabel.textContent = 'Listening… tap to stop';
  setVoiceStatus('listening','Listening to your answer…');
}
function stopListening(){
  if(!recognizer) return;
  try{ recognizer.stop(); }catch(e){}
  isListening = false;
  micBtn.classList.remove('recording');
  micBtnLabel.textContent = 'Speak Answer';
  setVoiceStatus('ready','Ready — tap mic to answer');
}
micBtn.addEventListener('click', ()=>{
  if(!SpeechRecognitionAPI) return;
  isListening ? stopListening() : startListening();
});

/* ---- Timer ---- */
function startTimer(){
  let t = 60;
  const c = 2*Math.PI*24;
  timerRing.setAttribute('stroke-dasharray', c.toFixed(1));
  timerRing.style.strokeDashoffset = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    t--;
    timerVal.textContent = Math.max(t,0);
    const offset = c - (Math.max(t,0)/60)*c;
    timerRing.style.strokeDashoffset = offset;
    if(t<=0){ clearInterval(timerInterval); stopListening(); }
  },1000);
}
function loadQuestion(){
  qCount.textContent = 'QUESTION '+(qIndex+1)+' OF '+questions.length;
  qText.style.opacity=0;
  answerBox.value='';
  feedbackBox.classList.remove('show');
  setTimeout(()=>{
    qText.textContent = questions[qIndex];
    qText.style.transition='opacity .4s'; qText.style.opacity=1;
    speakQuestion(questions[qIndex], ()=> startTimer());
  },200);
}
document.getElementById('submitAnswer').addEventListener('click', ()=>{
  clearInterval(timerInterval);
  stopListening();
  if(synth) synth.cancel();
  feedbackBox.classList.add('show');
  const metrics = feedbackBox.querySelectorAll('.fm b');
  const vals = [ 70+Math.round(Math.random()*25), 55+Math.round(Math.random()*30), 65+Math.round(Math.random()*28), 50+Math.round(Math.random()*35) ];
  metrics.forEach((m,i)=> countUp(m, vals[i], 900));
  setTimeout(()=>{
    metrics.forEach((m,i)=>{ m.textContent = vals[i]+'%'; });
  },950);
  setTimeout(()=>{
    qIndex = (qIndex+1)%questions.length;
    loadQuestion();
  }, 3200);
});
document.getElementById('skipQ').addEventListener('click', ()=>{
  clearInterval(timerInterval);
  stopListening();
  if(synth) synth.cancel();
  qIndex = (qIndex+1)%questions.length;
  loadQuestion();
});

/* ============ AUTH SCREEN ============ */
const authScreen = document.getElementById('authScreen');
const authCard = document.querySelector('.auth-card');
const authTabs = document.querySelectorAll('.auth-tab');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const profileForm = document.getElementById('profileForm');
const authFootText = document.getElementById('authFootText');
const authDivider = document.getElementById('authDivider');
const guestEnterBtn = document.getElementById('guestEnter');

let userProfile = null; // populated when a user completes the profile-setup module

function setAuthTab(tab){
  authTabs.forEach(t=> t.classList.toggle('active', t.dataset.tab===tab));
  signinForm.classList.toggle('active', tab==='signin');
  signupForm.classList.toggle('active', tab==='signup');
  profileForm.classList.remove('active');
  authCard.classList.remove('wide');
  document.querySelector('.auth-tabs').style.display = '';
  authDivider.style.display = '';
  guestEnterBtn.style.display = '';
  authFootText.style.display = '';
  authFootText.innerHTML = tab==='signin'
    ? 'New here? <a id="switchToSignup">Create an account</a>'
    : 'Already have an account? <a id="switchToSignin">Sign in</a>';
  const link = tab==='signin' ? document.getElementById('switchToSignup') : document.getElementById('switchToSignin');
  link.addEventListener('click', ()=> setAuthTab(tab==='signin' ? 'signup' : 'signin'));
}
authTabs.forEach(t=> t.addEventListener('click', ()=> setAuthTab(t.dataset.tab)));
document.getElementById('switchToSignup').addEventListener('click', ()=> setAuthTab('signup'));

function showProfileStep(prefillName, prefillEmail){
  document.querySelector('.auth-tabs').style.display = 'none';
  signinForm.classList.remove('active');
  signupForm.classList.remove('active');
  profileForm.classList.add('active');
  authDivider.style.display = 'none';
  guestEnterBtn.style.display = 'none';
  authFootText.style.display = 'none';
  authCard.classList.add('wide');
  document.getElementById('pfName').value = prefillName || '';
  document.getElementById('pfEmail').value = prefillEmail || '';
}
document.getElementById('pfBack').addEventListener('click', ()=> setAuthTab('signup'));

/* Resume upload inside the profile module */
let pfResumeFileObj = null;
const pfResumeZone = document.getElementById('pfResumeZone');
const pfResumeFile = document.getElementById('pfResumeFile');
const pfResumeLabel = document.getElementById('pfResumeLabel');
pfResumeZone.addEventListener('click', ()=> pfResumeFile.click());
pfResumeFile.addEventListener('change', ()=>{
  if(pfResumeFile.files.length){
    pfResumeFileObj = pfResumeFile.files[0];
    pfResumeLabel.textContent = '📄 ' + pfResumeFileObj.name;
    pfResumeZone.classList.add('has-file');
  }
});

function applyProfileToUI(){
  if(!userProfile) return;
  const initials = userProfile.name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase() || 'U';
  document.querySelectorAll('.avatar').forEach(a=> a.textContent = initials);
  const firstName = userProfile.name.trim().split(/\s+/)[0];
  const welcomeH2 = document.querySelector('#view-dashboard .view-head h2');
  if(welcomeH2) welcomeH2.textContent = 'Welcome back, ' + firstName + ' 👋';

  const set = (id, val, isLink)=>{
    const el = document.getElementById(id);
    if(!el) return;
    if(!val){ el.textContent = '—'; return; }
    if(isLink){ el.innerHTML = '<a href="'+val+'" target="_blank" rel="noopener">'+val+'</a>'; }
    else { el.textContent = val; }
  };
  set('profName', userProfile.name);
  set('profAge', userProfile.age);
  set('profMobile', userProfile.mobile);
  set('profEmail', userProfile.email);
  set('profCollege', userProfile.college);
  set('profBranch', userProfile.branch);
  set('profYear', userProfile.year);
  set('profRole', userProfile.role);
  set('profCompany', userProfile.company || 'Not specified');
  set('profGithub', userProfile.github, true);
  set('profLinkedin', userProfile.linkedin, true);
  set('profLeetcode', userProfile.leetcode, true);
  set('profResume', userProfile.resumeName || 'Not uploaded');
}

function enterApp(){
  document.body.classList.remove('pre-auth');
  authScreen.style.display = 'none';
  applyProfileToUI();
  initReadinessChip();
  initHeroRing();
  initDashboardCharts();
  animateProgressBars();
}

signinForm.addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('siEmail').value.trim();
  const pass = document.getElementById('siPassword').value;
  const err = document.getElementById('siError');
  if(!email.includes('@') || pass.length < 4){ err.style.display='block'; return; }
  err.style.display='none';
  enterApp();
});

signupForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const pass = document.getElementById('suPassword').value;
  const err = document.getElementById('suError');
  if(!name || !email.includes('@') || pass.length < 4){ err.style.display='block'; return; }
  err.style.display='none';
  showProfileStep(name, email);
});

profileForm.addEventListener('submit', e=>{
  e.preventDefault();
  const err = document.getElementById('pfError');
  const name = document.getElementById('pfName').value.trim();
  const age = document.getElementById('pfAge').value.trim();
  const mobile = document.getElementById('pfMobile').value.trim();
  const email = document.getElementById('pfEmail').value.trim();
  const college = document.getElementById('pfCollege').value.trim();
  const branch = document.getElementById('pfBranch').value.trim();
  const year = document.getElementById('pfYear').value;
  const role = document.getElementById('pfRole').value.trim();
  const company = document.getElementById('pfCompany').value.trim();
  const github = document.getElementById('pfGithub').value.trim();
  const linkedin = document.getElementById('pfLinkedin').value.trim();
  const leetcode = document.getElementById('pfLeetcode').value.trim();

  const mobileOk = /^[0-9]{10}$/.test(mobile);
  const ageOk = age && +age >= 15 && +age <= 80;
  const validUrl = v => !v || /^https?:\/\/.+/i.test(v);

  if(!name || !ageOk || !mobileOk || !email.includes('@') || !college || !branch || !year || !role || !pfResumeFileObj || !validUrl(github) || !validUrl(linkedin) || !validUrl(leetcode)){
    err.style.display='block';
    return;
  }
  err.style.display='none';

  userProfile = { name, age, mobile, email, college, branch, year, role, company, github, linkedin, leetcode, resumeName: pfResumeFileObj ? pfResumeFileObj.name : '' };
  enterApp();
});

document.getElementById('guestEnter').addEventListener('click', enterApp);

