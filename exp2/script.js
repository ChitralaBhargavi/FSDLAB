// ---------- Questions ----------
const questions = [
  {
    text: "Which keyword declares a variable that cannot be reassigned?",
    options: ["var", "let", "const", "static"],
    answer: 2
  },
  {
    text: "What does DOM stand for?",
    options: ["Document Object Model", "Data Output Method", "Display Object Manager", "Digital Order Map"],
    answer: 0
  },
  {
    text: "Which method adds a new element to the end of an array?",
    options: ["pop()", "push()", "shift()", "slice()"],
    answer: 1
  },
  {
    text: "Which method finds an element by its id?",
    options: ["querySelectorAll()", "getElementsByTag()", "getElementById()", "findId()"],
    answer: 2
  },
  {
    text: "What is the result of typeof null in JavaScript?",
    options: ["null", "undefined", "object", "number"],
    answer: 2
  }
];

const TIME_PER_QUESTION = 15;
const POINTS_CORRECT = 10;

// ---------- State ----------
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let answered = false;

// ---------- DOM elements ----------
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const timerFill = document.getElementById("timer-fill");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const finalScoreEl = document.getElementById("final-score");
const summaryEl = document.getElementById("summary");
const bestScoreEl = document.getElementById("best-score");

// ---------- Best score (saved in the browser) ----------
function getBestScore() {
  try {
    return Number(localStorage.getItem("quizBestScore")) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem("quizBestScore", String(value));
  } catch (e) {
    // Storage not available, ignore
  }
}

function showBestScore() {
  const best = getBestScore();
  bestScoreEl.textContent = best > 0 ? "Best score: " + best : "";
}

// ---------- Screens ----------
function showScreen(screen) {
  startScreen.hidden = true;
  quizScreen.hidden = true;
  resultScreen.hidden = true;
  screen.hidden = false;
}

// ---------- Quiz flow ----------
function startQuiz() {
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  scoreEl.textContent = "Score: 0";
  showScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = questions[currentIndex];

  progressEl.textContent = "Question " + (currentIndex + 1) + " of " + questions.length;
  questionEl.textContent = q.text;
  nextBtn.hidden = true;

  // Clear old options, then build new buttons with createElement
  optionsEl.innerHTML = "";
  q.options.forEach(function (optionText, index) {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = optionText;
    btn.addEventListener("click", function () {
      selectAnswer(index);
    });
    optionsEl.appendChild(btn);
  });

  startTimer();
}

// ---------- Timer ----------
function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  // Reset the bar without animation, then let it shrink
  timerFill.style.transition = "none";
  timerFill.style.width = "100%";
  void timerFill.offsetWidth; // force reflow
  timerFill.style.transition = "width 1s linear";

  timerId = setInterval(function () {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerEl.textContent = timeLeft + "s";
  timerFill.style.width = (timeLeft / TIME_PER_QUESTION) * 100 + "%";

  const low = timeLeft <= 5;
  timerEl.classList.toggle("low", low);
  timerFill.classList.toggle("low", low);
}

function timeUp() {
  if (answered) return;
  answered = true;
  revealAnswer(-1); // -1 means no answer was chosen
  showNextButton();
}

// ---------- Answering ----------
function selectAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const q = questions[currentIndex];

  if (selectedIndex === q.answer) {
    // 10 points plus 1 point for each second left
    score += POINTS_CORRECT + timeLeft;
    correctCount++;
    scoreEl.textContent = "Score: " + score;
  }

  revealAnswer(selectedIndex);
  showNextButton();
}

function revealAnswer(selectedIndex) {
  const q = questions[currentIndex];
  const buttons = optionsEl.querySelectorAll(".option");

  buttons.forEach(function (btn, index) {
    btn.disabled = true;
    if (index === q.answer) btn.classList.add("correct");
    if (index === selectedIndex && index !== q.answer) btn.classList.add("wrong");
  });
}

function showNextButton() {
  const isLast = currentIndex === questions.length - 1;
  nextBtn.textContent = isLast ? "See results" : "Next question";
  nextBtn.hidden = false;
  nextBtn.focus();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// ---------- Results ----------
function showResults() {
  clearInterval(timerId);

  const best = getBestScore();
  const isNewBest = score > best;
  if (isNewBest) saveBestScore(score);

  finalScoreEl.textContent = "Your score: " + score;
  summaryEl.textContent =
    "You answered " + correctCount + " of " + questions.length + " correctly." +
    (isNewBest ? " That is a new best score!" : "");

  showScreen(resultScreen);
  restartBtn.focus();
}

function restart() {
  showBestScore();
  showScreen(startScreen);
  startBtn.focus();
}

// ---------- Events ----------
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restart);

showBestScore();
