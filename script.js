
"use strict";

// ==========================================
// 🌈 MUNDO DE LAS PALABRAS
// Motor principal del videojuego
// ==========================================

const words = [
  "abeja","avion","arbol","anillo","amigo","arana","ardilla","avena","ala","arco",
  "elefante","estrella","escuela","espejo","erizo","espada","escoba","enano","escalera","enfermera",
  "iglesia","isla","iguana","imán","invierno","idea","imagen","indio","insecto","inicio",
  "oso","oreja","oveja","olla","ojo","oruga","olivo","oro","onda","orquesta",
  "uva","uno","uniforme","universo","unicornio","urgencia","urbano","uso","usuario","unidad",
  "gato","perro","casa","mesa","pelota","mariposa","conejo","caballo","tortuga","pato"
];

const emojis = [
  "🐝","✈️","🌳","💍","🧑","🕷️","🐿️","🌾","🪽","🌈",
  "🐘","⭐","🏫","🪞","🦔","⚔️","🧹","🧙","🪜","👩‍⚕️",
  "⛪","🏝️","🦎","🧲","❄️","💡","🖼️","🧍","🐞","🚀",
  "🐻","👂","🐑","🍲","👁️","🐛","🌿","🥇","🌊","🎼",
  "🍇","1️⃣","👔","🌌","🦄","🚨","🏙️","🛠️","👤","🧩",
  "🐱","🐶","🏠","🪑","⚽","🦋","🐰","🐴","🐢","🦆"
];

const worlds = [
  {
    name: "Bosque de las vocales",
    emoji: "🌳",
    color: "#a9edc2",
    description: "Descubre las vocales"
  },
  {
    name: "Villa de las sílabas",
    emoji: "🏡",
    color: "#ffe1a8",
    description: "Aprende a separar sonidos"
  },
  {
    name: "Océano de palabras",
    emoji: "🌊",
    color: "#a6ddff",
    description: "Explora nuevas palabras"
  },
  {
    name: "Castillo de oraciones",
    emoji: "🏰",
    color: "#e4c6ff",
    description: "Completa palabras"
  },
  {
    name: "Montaña lectora",
    emoji: "⛰️",
    color: "#c9e9a6",
    description: "Domina las letras"
  },
  {
    name: "Reino mágico",
    emoji: "✨",
    color: "#ffc6e6",
    description: "Conviértete en maestro lector"
  }
];

const SHOP_ITEMS = [
  { id:"crown", name:"Corona real", emoji:"👑", price:50 },
  { id:"glasses", name:"Gafas mágicas", emoji:"🕶️", price:35 },
  { id:"rainbow", name:"Arcoíris", emoji:"🌈", price:70 },
  { id:"wings", name:"Alas mágicas", emoji:"🪽", price:90 },
  { id:"heart", name:"Vida extra", emoji:"❤️", price:25 },
  { id:"hint", name:"Pista extra", emoji:"💡", price:15 }
];

// ==========================================
// 💾 GUARDADO
// ==========================================

const SAVE_KEY = "mundoPalabrasSave";

function defaultSave() {
  return {
    coins: 100,
    stars: 0,
    lives: 5,
    completed: worlds.map(() => []),
    owned: [],
    equipped: [],
    hints: 3,
    lastDaily: "",
    sound: true,
    speech: true
  };
}

function loadSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== "object") return defaultSave();

    const base = defaultSave();

    return {
      ...base,
      ...saved,
      completed: Array.from({ length: 6 }, (_, i) =>
        Array.isArray(saved.completed?.[i])
          ? saved.completed[i].filter(n =>
              Number.isInteger(n) && n >= 1 && n <= 60
            )
          : []
      ),
      owned: Array.isArray(saved.owned) ? saved.owned : [],
      equipped: Array.isArray(saved.equipped) ? saved.equipped : []
    };
  } catch {
    return defaultSave();
  }
}

let save = loadSave();

function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  updateStats();
}

function updateStats() {
  document.getElementById("coins").textContent = save.coins;
  document.getElementById("lives").textContent = save.lives;
  document.getElementById("stars").textContent = save.stars;
}

// ==========================================
// 🧭 NAVEGACIÓN
// ==========================================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);
  if (screen) screen.classList.add("active");

  if (id === "worlds") renderWorlds();
  if (id === "levels") renderLevels();
  if (id === "shop") renderShop();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function completedCount(worldIndex) {
  return save.completed[worldIndex].length;
}

function isWorldUnlocked(index) {
  if (index === 0) return true;
  return completedCount(index - 1) === 60;
}

function isLevelUnlocked(worldIndex, level) {
  if (!isWorldUnlocked(worldIndex)) return false;
  if (level === 1) return true;

  return save.completed[worldIndex].includes(level - 1);
}

function startAdventure() {
  for (let w = 0; w < 6; w++) {
    if (!isWorldUnlocked(w)) continue;

    for (let l = 1; l <= 60; l++) {
      if (!save.completed[w].includes(l)) {
        openLevel(w, l);
        return;
      }
    }
  }

  showScreen("worlds");
  document.getElementById("homeMessage").textContent =
    "¡Felicidades! ¡Has conquistado todos los mundos! 🏆";
}

// ==========================================
// 🌍 MUNDOS Y NIVELES
// ==========================================

function renderWorlds() {
  const grid = document.getElementById("worldGrid");
  grid.innerHTML = "";

  worlds.forEach((world, index) => {
    const unlocked = isWorldUnlocked(index);
    const completed = completedCount(index);

    const card = document.createElement("button");
    card.className = "world-card" + (unlocked ? "" : " locked");
    card.style.borderColor = world.color;
    card.innerHTML = `
      <div class="world-emoji">${world.emoji}</div>
      <h3>${world.name}</h3>
      <p>${world.description}</p>
      <p>${unlocked ? "⭐ " + completed + "/60 niveles" : "🔒 Bloqueado"}</p>
    `;

    card.disabled = !unlocked;
    card.addEventListener("click", () => {
      currentWorld = index;
      showScreen("levels");
    });

    grid.appendChild(card);
  });
}

let currentWorld = 0;
let currentLevel = 1;

function renderLevels() {
  const world = worlds[currentWorld];

  document.getElementById("levelTitle").textContent =
    `${world.emoji} ${world.name}`;

  const grid = document.getElementById("levelGrid");
  grid.innerHTML = "";

  for (let i = 1; i <= 60; i++) {
    const done = save.completed[currentWorld].includes(i);
    const unlocked = isLevelUnlocked(currentWorld, i);

    const button = document.createElement("button");
    button.className = "level-btn" +
      (done ? " done" : "") +
      (!unlocked ? " locked" : "");

    button.textContent = done ? "⭐" + i : unlocked ? i : "🔒";
    button.disabled = !unlocked;

    button.addEventListener("click", () => {
      openLevel(currentWorld, i);
    });

    grid.appendChild(button);
  }
}

// ==========================================
// 🧠 GENERADOR DE 360 PREGUNTAS
// ==========================================

// Cada mundo utiliza un reto diferente.
// Cada palabra ocupa un nivel distinto.
// Por eso las preguntas no se repiten
// dentro de cada mundo.

function countSyllables(word) {
  const groups = word.toLowerCase().match(/[aeiouáéíóúü]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getQuestion(worldIndex, level) {
  const index = level - 1;
  const word = words[index];
  const emoji = emojis[index];

  let question = "";
  let visual = emoji;
  let answer = "";
  let options = [];

  if (worldIndex === 0) {
    const vowels = word.match(/[aeiouáéíóú]/i);
    answer = vowels ? vowels[0].toUpperCase() : "A";
    question = `¿Cuál es la primera vocal de ${word.toUpperCase()}?`;
    visual = emoji + " 🔤";

    options = ["A", "E", "I", "O", "U"];
  }

  else if (worldIndex === 1) {
    const count = countSyllables(word);
    answer = String(count);
    question = `¿Cuántas sílabas tiene la palabra ${word.toUpperCase()}?`;
    visual = emoji + " 🧩";

    options = ["1", "2", "3", "4", "5"];
  }

  else if (worldIndex === 2) {
    answer = word[word.length - 1].toUpperCase();
    question = `¿Con qué letra termina ${word.toUpperCase()}?`;
    visual = emoji + " 🌊";

    options = [...new Set([
      answer,
      "A", "E", "O", "S", "R", "L"
    ])];
  }

  else if (worldIndex === 3) {
    answer = word[0].toUpperCase();
    question = `Completa la palabra: ${word.slice(1).toUpperCase()}`;
    visual = emoji + " 🏰";

    options = [...new Set([
      answer, "A", "E", "M", "P", "S", "T"
    ])];
  }

  else if (worldIndex === 4) {
    answer = String(word.length);
    question = `¿Cuántas letras tiene ${word.toUpperCase()}?`;
    visual = emoji + " ⛰️";

    options = [
      String(word.length),
      String(word.length + 1),
      String(Math.max(1, word.length - 1)),
      String(word.length + 2)
    ];
  }

  else {
    answer = word.slice(-1).toUpperCase();
    question = `Completa la última letra: ${word.slice(0, -1).toUpperCase()}___`;
    visual = emoji + " ✨";

    options = [...new Set([
      answer, "A", "E", "O", "S", "N", "R"
    ])];
  }

  options = [...new Set(options)];

  const extras = ["B", "C", "D", "F", "G", "H", "J", "K",
    "L", "M", "N", "P", "Q", "R", "S", "T", "V", "X", "Z"];

  while (options.length < 4) {
    const extra = extras[Math.floor(Math.random() * extras.length)];
    if (!options.includes(extra)) options.push(extra);
  }

  options = shuffle(options.slice(0, 4));

  if (!options.includes(answer)) {
    options[0] = answer;
    options = shuffle(options);
  }

  return {
    question,
    visual,
    answer,
    options
  };
}

// ==========================================
// 🎮 SISTEMA DE JUEGO
// ==========================================

let currentQuestion = null;
let answered = false;
let attempts = 0;
let hintUsed = false;
let levelReward = 0;

function openLevel(world, level) {
  if (!isLevelUnlocked(world, level)) return;

  currentWorld = world;
  currentLevel = level;
  attempts = 0;
  hintUsed = false;
  answered = false;
  levelReward = 0;

  if (save.lives <= 0) save.lives = 5;

  currentQuestion = getQuestion(world, level);

  document.getElementById("worldName").textContent =
    worlds[world].emoji + " " + worlds[world].name;

  document.getElementById("levelNumber").textContent =
    "Nivel " + level + "/60";

  document.getElementById("progressBar").style.width =
    (level / 60 * 100) + "%";

  document.getElementById("questionType").textContent =
    "RETO " + (world + 1);

  document.getElementById("questionText").textContent =
    currentQuestion.question;

  document.getElementById("questionVisual").textContent =
    currentQuestion.visual;

  document.getElementById("feedback").textContent =
    "¡Elige la respuesta correcta!";

  const options = document.getElementById("answerOptions");
  options.innerHTML = "";

  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;

    button.addEventListener("click", () => {
      checkAnswer(option, button);
    });

    options.appendChild(button);
  });

  showScreen("game");
  updateStats();
}

// ==========================================
// ✅ RESPUESTAS
// ==========================================

function checkAnswer(answer, button) {
  if (answered) return;

  if (answer === currentQuestion.answer) {
    answered = true;
    button.classList.add("correct");

    const reward = 5 + Math.floor(currentLevel / 5);
    levelReward = reward;

    save.coins += reward;
    save.stars += 1;

    save.completed[currentWorld] =
      [...new Set([...save.completed[currentWorld], currentLevel])];

    persist();

    document.getElementById("feedback").textContent =
      "🎉 ¡Correcto! ¡Eres increíble!";

    document.querySelectorAll(".answer-btn").forEach(b => {
      b.disabled = true;
    });

    playSound(true);

    setTimeout(showResult, 650);

  } else {
    attempts++;
    button.classList.add("wrong");
    button.disabled = true;

    save.lives = Math.max(0, save.lives - 1);
    persist();

    document.getElementById("feedback").textContent =
      attempts >= 3
        ? "¡Vamos! Observa bien y vuelve a intentarlo."
        : "❌ ¡Inténtalo otra vez!";

    playSound(false);

    if (save.lives === 0) {
      document.getElementById("feedback").textContent =
        "❤️ Te has quedado sin vidas. ¡Recuperaste 5 vidas!";

      save.lives = 5;
      persist();
    }
  }
}

function showResult() {
  document.getElementById("resultIcon").textContent =
    currentLevel === 60 ? "🏆" : "🌟";

  document.getElementById("resultTitle").textContent =
    currentLevel === 60 ? "¡Mundo completado!" : "¡Excelente trabajo!";

  document.getElementById("resultText").textContent =
    currentLevel === 60
      ? `¡Has terminado ${worlds[currentWorld].name}!`
      : `¡Has superado el nivel ${currentLevel}!`;

  document.getElementById("resultRewards").textContent =
    `🪙 +${levelReward} monedas  ⭐ +1 estrella`;

  showScreen("result");
}

function nextLevel() {
  if (currentLevel < 60) {
    openLevel(currentWorld, currentLevel + 1);
    return;
  }

  if (currentWorld < 5) {
    currentWorld++;
    openLevel(currentWorld, 1);
    return;
  }

  showScreen("worlds");
}

// ==========================================
// 💡 PISTAS
// ==========================================

function useHint() {
  if (answered) return;

  if (save.hints <= 0) {
    document.getElementById("feedback").textContent =
      "No tienes pistas. ¡Puedes comprar más en la tienda!";
    return;
  }

  if (hintUsed) {
    document.getElementById("feedback").textContent =
      "Ya utilizaste una pista en este nivel.";
    return;
  }

  const buttons = [...document.querySelectorAll(".answer-btn")];

  const wrongButtons = buttons.filter(button =>
    button.textContent !== currentQuestion.answer &&
    !button.disabled
  );

  shuffle(wrongButtons).slice(0, 2).forEach(button => {
    button.disabled = true;
    button.style.opacity = ".4";
  });

  save.hints--;
  hintUsed = true;
  persist();

  document.getElementById("feedback").textContent =
    "💡 ¡Te he ayudado a eliminar dos respuestas!";
}

// ==========================================
// 🔊 SONIDOS Y LECTURA
// ==========================================

function playSound(correct) {
  if (!save.sound) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = correct ? 660 : 220;
    gain.gain.value = 0.08;

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
    oscillator.onended = () => ctx.close();
  } catch (error) {
    console.log("Sonido no disponible");
  }
}

function readQuestion() {
  if (!save.speech) return;

  if (!("speechSynthesis" in window)) {
    document.getElementById("feedback").textContent =
      "Tu navegador no permite lectura en voz alta.";
    return;
  }

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(
    currentQuestion.question
  );

  speech.lang = "es-ES";
  speech.rate = 0.85;

  speechSynthesis.speak(speech);
}

// ==========================================
// 🦄 LUNA INTERACTIVA
// ==========================================

let lunaMessages = [
  "¡Hola! ¡Vamos a aprender juntos! 🦄",
  "¡Eres mi mejor amigo! 💖",
  "¡Sigue practicando! ¡Tú puedes!",
  "¡Me encanta jugar contigo! 🌈",
  "¡Vamos a descubrir nuevas palabras!"
];

function petLuna() {
  const message = lunaMessages[
    Math.floor(Math.random() * lunaMessages.length)
  ];

  const homeMessage = document.getElementById("homeMessage");
  if (homeMessage) homeMessage.textContent = message;

  const feedback = document.getElementById("feedback");
  if (feedback) feedback.textContent = message;

  const luna = document.querySelector(".hero-unicorn");

  if (luna) {
    luna.animate(
      [
        { transform: "scale(1) rotate(0)" },
        { transform: "scale(1.2) rotate(-12deg)" },
        { transform: "scale(1) rotate(12deg)" },
        { transform: "scale(1)" }
      ],
      { duration: 600 }
    );
  }
}

// ==========================================
// 🛍️ TIENDA
// ==========================================

function renderShop() {
  const grid = document.getElementById("shopGrid");
  grid.innerHTML = "";

  SHOP_ITEMS.forEach(item => {
    const owned = save.owned.includes(item.id);
    const equipped = save.equipped.includes(item.id);

    const card = document.createElement("div");
    card.className = "shop-item";

    const button = document.createElement("button");

    if (item.id === "heart" || item.id === "hint") {
      button.textContent = `Comprar 🪙 ${item.price}`;
      button.disabled = save.coins < item.price;
      button.addEventListener("click", () => buyItem(item.id));
    } else {
      button.textContent = equipped ? "Equipado ✓" :
        owned ? "Equipar" : `Comprar 🪙 ${item.price}`;

      button.disabled = equipped || (!owned && save.coins < item.price);

      button.addEventListener("click", () => buyItem(item.id));
    }

    const icon = document.createElement("div");
    icon.className = "item-icon";
    icon.textContent = item.emoji;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `🪙 ${item.price} monedas`;

    card.append(icon, title, price, button);
    grid.appendChild(card);
  });
}

function buyItem(id) {
  const item = SHOP_ITEMS.find(product => product.id === id);
  if (!item) return;

  if (save.coins < item.price) {
    alert("¡No tienes suficientes monedas!");
    return;
  }

  if (id === "heart") {
    save.coins -= item.price;
    save.lives += 1;
  }

  else if (id === "hint") {
    save.coins -= item.price;
    save.hints += 1;
  }

  else {
    if (save.owned.includes(id)) {
      save.equipped = [...save.equipped, id];
    } else {
      save.coins -= item.price;
      save.owned.push(id);
      save.equipped.push(id);
    }
  }

  persist();
  renderShop();
}

// ==========================================
// 🎁 REGALO DIARIO
// ==========================================

function dailyReward() {
  const today = new Date().toLocaleDateString("en-CA");

  if (save.lastDaily === today) {
    alert("🎁 ¡Ya recibiste tu regalo de hoy!");
    return;
  }

  save.lastDaily = today;
  save.coins += 30;
  save.hints += 1;

  persist();

  alert("🎉 ¡Regalo recibido! +30 monedas y +1 pista.");
}

// ==========================================
// ⚙️ AJUSTES
// ==========================================

document.getElementById("soundToggle").checked = save.sound;
document.getElementById("speechToggle").checked = save.speech;

document.getElementById("soundToggle").addEventListener("change", e => {
  save.sound = e.target.checked;
  persist();
});

document.getElementById("speechToggle").addEventListener("change", e => {
  save.speech = e.target.checked;
  persist();
});

function resetGame() {
  const confirmReset = confirm(
    "¿Seguro que quieres borrar TODO tu progreso?"
  );

  if (!confirmReset) return;

  save = defaultSave();
  persist();

  document.getElementById("soundToggle").checked = save.sound;
  document.getElementById("speechToggle").checked = save.speech;

  showScreen("home");
  alert("¡Tu aventura comienza de nuevo!");
}

// ==========================================
// ⌨️ CONTROLES DE TECLADO PARA PC
// ==========================================

document.addEventListener("keydown", event => {
  if (!document.getElementById("game").classList.contains("active")) {
    return;
  }

  if (answered) return;

  const number = Number(event.key);

  if (number >= 1 && number <= 4) {
    const buttons = document.querySelectorAll(".answer-btn");
    buttons[number - 1]?.click();
  }
});

// ==========================================
// 🚀 INICIO
// ==========================================

function initializeGame() {
  updateStats();
  renderWorlds();

  document.getElementById("homeMessage").textContent =
    "¡Luna está esperando jugar contigo! 🦄";

  showScreen("home");
}

initializeGame();
