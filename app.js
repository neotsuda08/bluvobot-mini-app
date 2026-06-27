const telegram = window.Telegram?.WebApp;
const vomitButton = document.getElementById("vomit");
const counter = document.getElementById("counter");
const segments = document.getElementById("segments");
const status = document.getElementById("status");
const hint = document.getElementById("hint");
const particles = document.getElementById("particles");
const finish = document.getElementById("finish");
const finishAction = document.getElementById("finish-action");
const app = document.getElementById("app");
const screenSplats = document.getElementById("screen-splats");

const statusByCount = [
  "ЖЕЛУДОК ПОКА СПОКОЕН",
  "НАЧАЛОСЬ…",
  "ЧТО-ТО ПОДКАТЫВАЕТ",
  "УЖЕ НЕ ОСТАНОВИТЬ",
  "ДЕРЖИСЬ",
  "ПОЛОВИНА. НАЗАД ПОЗДНО",
  "СТАНОВИТСЯ ХУЖЕ",
  "ЕЩЁ НЕМНОГО",
  "ПОЧТИ…",
  "ПОСЛЕДНИЙ РЫВОК",
  "ВАС ОББЛЮВАЛИ",
];

let count = 0;
let completed = false;
let resultSent = false;

for (let index = 0; index < 10; index += 1) {
  const segment = document.createElement("span");
  segment.className = "segment";
  segments.appendChild(segment);
}

telegram?.ready();
telegram?.expand();
telegram?.setHeaderColor?.("#07140d");
telegram?.setBackgroundColor?.("#07140d");
telegram?.disableVerticalSwipes?.();

function haptic(kind = "medium") {
  telegram?.HapticFeedback?.impactOccurred(kind);
}

function makeSplat() {
  const colors = ["#b7ff34", "#78e047", "#d8ff76", "#4bbd35"];
  const amount = 7;

  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 55 + Math.random() * 100;
    particle.className = "particle";
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--r", `${Math.random() * 240 - 120}deg`);
    particle.style.setProperty("--size", `${7 + Math.random() * 13}px`);
    particle.style.setProperty("--color", colors[index % colors.length]);
    particles.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function animateEmoji() {
  vomitButton.classList.remove("hit");
  void vomitButton.offsetWidth;
  vomitButton.classList.add("hit");
}

function makeScreenMess() {
  const splatCount = 15;
  screenSplats.replaceChildren();

  for (let index = 0; index < splatCount; index += 1) {
    const splat = document.createElement("span");
    const size = 46 + Math.random() * 145;
    splat.className = "screen-splat";
    splat.style.setProperty("--left", `${4 + Math.random() * 92}%`);
    splat.style.setProperty("--top", `${5 + Math.random() * 90}%`);
    splat.style.setProperty("--size", `${size}px`);
    splat.style.setProperty("--delay", `${260 + Math.random() * 650}ms`);
    splat.style.setProperty("--rotate", `${Math.random() * 260 - 130}deg`);
    splat.style.setProperty(
      "--radius",
      `${35 + Math.random() * 30}% ${36 + Math.random() * 32}% ${34 + Math.random() * 34}% ${38 + Math.random() * 28}%`,
    );
    screenSplats.appendChild(splat);
  }
}

function render() {
  counter.textContent = `${count}/10`;
  status.textContent = statusByCount[count];
  hint.textContent = count === 9 ? "ЕЩЁ ОДИН РАЗ" : "НАЖИМАЙ БЫСТРЕЕ";
  [...segments.children].forEach((segment, index) => {
    segment.classList.toggle("on", index < count);
  });
}

function complete() {
  completed = true;
  haptic("heavy");
  telegram?.HapticFeedback?.notificationOccurred("success");
  makeScreenMess();
  app.classList.add("final-hit");
  finish.classList.add("show");
  finish.setAttribute("aria-hidden", "false");
}

function returnToBot() {
  if (resultSent) return;
  resultSent = true;
  haptic("heavy");
  finishAction.disabled = true;
  finishAction.textContent = "ОТКРЫВАЕМ СЕКРЕТ…";

  const payload = JSON.stringify({ action: "vomit_completed", count: 10 });
  if (telegram?.sendData) {
    telegram.sendData(payload);
    window.setTimeout(() => telegram.close(), 450);
  } else {
    finishAction.textContent = "ОТКРОЙ MINI APP В TELEGRAM";
  }
}

vomitButton.addEventListener("click", () => {
  if (completed) return;

  count += 1;
  haptic(count >= 9 ? "heavy" : "medium");
  animateEmoji();
  makeSplat();
  render();

  if (count === 10) {
    window.setTimeout(complete, 360);
  }
});

finishAction.addEventListener("click", returnToBot);

render();
