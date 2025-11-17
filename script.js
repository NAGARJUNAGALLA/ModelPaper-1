const quizzes = [
  {
    id:1,
    title:"Math & Science Quiz",
    sections:[
      {
        title:"Math Basics",
        timer:60,
        questions:[
          { q:"5 + 7 = $?$", options:["10","11","12","13"], answer:2 },
          { q:"$9 \\times 3 = ?$", options:["27","21","18","24"], answer:0 }
        ]
      },
      {
        title:"Science Basics",
        timer:90,
        questions:[
          { q:"H$_2$O is?", options:["Salt","Water","Oxygen","Carbon"], answer:1 },
          { q:"Sun is a?", options:["Planet","Star","Gas","Rock"], answer:1 }
        ]
      }
    ]
  }
];

let currentQuiz, currentSectionIndex, currentQuestionIndex;
let userAnswers=[], timerInterval, timeLeft;

const quizList=document.getElementById("quiz-list");
const modal=document.getElementById("quiz-modal");
const quizTitle=document.getElementById("quiz-title");
const timerBox=document.getElementById("timer");
const qNav=document.getElementById("q-nav");

const questionText=document.getElementById("question-text");
const optionsList=document.getElementById("options");

const prevBtn=document.getElementById("prev-btn");
const nextBtn=document.getElementById("next-btn");
const submitBtn=document.getElementById("submit-btn");

const quizBox=document.getElementById("quiz-box");
const resultBox=document.getElementById("result-box");
const scoreText=document.getElementById("score");
const reviewDiv=document.getElementById("review");
const closeModal=document.getElementById("close-modal");
const closeReview=document.getElementById("close-review");

// Load quiz list
function loadQuizList(){
  quizzes.forEach(q=>{
    const card=document.createElement("div");
    card.className="quiz-card";
    card.innerText=q.title;
    card.onclick=()=>openQuiz(q.id);
    quizList.appendChild(card);
  });
}
loadQuizList();

// Open quiz
function openQuiz(id){
  modal.classList.remove("hidden");
  currentQuiz=quizzes.find(q=>q.id===id);
  currentSectionIndex=0;
  currentQuestionIndex=0;
  userAnswers=currentQuiz.sections.map(s=>new Array(s.questions.length).fill(null));
  openSection(currentSectionIndex);
}

// Open section
function openSection(sectionIndex){
  const section=currentQuiz.sections[sectionIndex];
  quizTitle.textContent=section.title;
  timeLeft=section.timer;
  startTimer();
  buildQNav();
  renderQuestion();
}

// Timer
function startTimer(){
  timerBox.textContent=formatTime(timeLeft);
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    timeLeft--;
    timerBox.textContent=formatTime(timeLeft);
    if(timeLeft<=0){
      clearInterval(timerInterval);
      submitSection();
    }
  },1000);
}

function formatTime(sec){
  let m=Math.floor(sec/60);
  let s=sec%60;
  return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`;
}

// Question nav
function buildQNav(){
  const section=currentQuiz.sections[currentSectionIndex];
  qNav.innerHTML="";
  section.questions.forEach((_,i)=>{
    const b=document.createElement("div");
    b.className="q-btn";
    b.innerText=i+1;
    b.onclick=()=>{ currentQuestionIndex=i; renderQuestion(); };
    qNav.appendChild(b);
  });
}

// Render question
function renderQuestion(){
  const section=currentQuiz.sections[currentSectionIndex];
  const q=section.questions[currentQuestionIndex];

  questionText.innerHTML=q.q;
  MathJax.typesetPromise(); // Render math

  optionsList.innerHTML="";
  q.options.forEach((opt,i)=>{
    const li=document.createElement("li");
    li.innerHTML=opt;
    if(userAnswers[currentSectionIndex][currentQuestionIndex]===i) li.classList.add("selected");
    li.onclick=()=>selectOption(i);
    optionsList.appendChild(li);
  });

  prevBtn.style.display=currentQuestionIndex===0?"none":"block";
  nextBtn.style.display=currentQuestionIndex===section.questions.length-1?"none":"block";
  submitBtn.classList.toggle("hidden", currentQuestionIndex!==section.questions.length-1);

  updateNavColors();
}

// Update nav colors
function updateNavColors(){
  const section=currentQuiz.sections[currentSectionIndex];
  [...qNav.children].forEach((btn,i)=>{
    btn.classList.remove("active","answered");
    if(i===currentQuestionIndex) btn.classList.add("active");
    if(userAnswers[currentSectionIndex][i]!==null) btn.classList.add("answered");
  });
}

// Select option
function selectOption(i){
  userAnswers[currentSectionIndex][currentQuestionIndex]=i;
  updateNavColors();
  renderQuestion();
}

// Prev / Next
prevBtn.onclick=()=>{ if(currentQuestionIndex>0) currentQuestionIndex--; renderQuestion(); };
nextBtn.onclick=()=>{ const section=currentQuiz.sections[currentSectionIndex]; if(currentQuestionIndex<section.questions.length-1) currentQuestionIndex++; renderQuestion(); };

// Submit section
submitBtn.onclick=submitSection;
function submitSection(){
  clearInterval(timerInterval);
  if(currentSectionIndex<currentQuiz.sections.length-1){
    currentSectionIndex++;
    currentQuestionIndex=0;
    openSection(currentSectionIndex);
  } else showFinalResult();
}

// Final result
function showFinalResult(){
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  let totalScore=0,totalQuestions=0;
  reviewDiv.innerHTML="";

  currentQuiz.sections.forEach((section,sIndex)=>{
    section.questions.forEach((q,qIndex)=>{
      totalQuestions++;
      const userAns=userAnswers[sIndex][qIndex];
      if(userAns===q.answer) totalScore++;
      const rev=document.createElement("div");
      rev.className="review-item";
      rev.innerHTML=`<strong>${section.title} - Q${qIndex+1}: ${q.q}</strong><br>
        Your answer: ${q.options[userAns]??"Not Attempted"}<br>
        Correct: ${q.options[q.answer]}`;
      reviewDiv.appendChild(rev);
    });
  });

  scoreText.textContent=`Your Score: ${totalScore} / ${totalQuestions}`;
  MathJax.typesetPromise();
}

// Close modal
closeModal.onclick=()=>location.reload();
closeReview.onclick=()=>location.reload();
