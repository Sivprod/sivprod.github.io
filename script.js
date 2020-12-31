/* Конфиг */

const minMineProbability = 0.15;
const maxMineProbability = 0.3;
const shortClickTime = 300;
const cellSize = 32;
const deadZone = 5;

/* Инициализация */

const visibleField = document.querySelector(".field");
const cellCounter = document.querySelector("#cell-counter");
const timeCounter = document.querySelector("#time-counter");
const restartButton = document.querySelector(".btn.icon-restart");
const welcome = document.querySelector(".welcome");
const startButton = document.querySelector(".btn.start");
const showResultButton = document.querySelector(".show-result");

startButton.addEventListener("click", start);
restartButton.addEventListener("click", start);
showResultButton.addEventListener("click", () => {
  showResultButton.classList.add("hide");
});
document.addEventListener("DOMContentLoaded", function () {
  createVisibleField();
  cellCounter.textContent = numToString(openedCells, 4);
  displayTime();
  updateLeaderboard();
});

let results = JSON.parse(localStorage.getItem('results')) || [];

/* Обработка ввода */

let translateX = 0;
let translateY = 0;

// Нажатие
visibleField.addEventListener('mousedown', pressStart);
visibleField.addEventListener('touchstart', pressStart);
function pressStart(e) {
  if(e.button == 2) {
    let td = e.target.parentNode;
    let tr = td.parentNode;
    fieldX = visibleArea.startX + td.cellIndex;
    fieldY = visibleArea.startY + tr.rowIndex;
    markCell(fieldX, fieldY);
    return;
  };

  let pressStartX = e.pageX || e.touches[0].pageX;
  let pressStartY = e.pageY || e.touches[0].pageY;
  let pressStartTime = e.timeStamp;
  let startTranslateX = pressStartX - translateX;
  let startTranslateY = pressStartY - translateY;

  //Таскаем поле
  visibleField.addEventListener('mousemove', pressMove);
  visibleField.addEventListener('touchmove', pressMove);
  function pressMove(e) { 
    let pressMoveX = e.pageX || e.touches[0].pageX;
    let pressMoveY = e.pageY || e.touches[0].pageY;
    translateX = pressMoveX - startTranslateX;
    translateY = pressMoveY - startTranslateY;
    visibleField.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
  }

  // Отпустило
  visibleField.addEventListener('mouseup', pressEnd);
  visibleField.addEventListener('touchend', pressEnd);
  function pressEnd(e){
    visibleField.removeEventListener('touchmove', pressMove);
    visibleField.removeEventListener('mousemove', pressMove);
    visibleField.removeEventListener('touchend', pressEnd);
    visibleField.removeEventListener('mouseup', pressEnd);

    let pressEndX = e.pageX || e.changedTouches[0].pageX;
    let pressEndY = e.pageY || e.changedTouches[0].pageY;
    let pressEndTime = e.timeStamp;
    if (pressEndTime - pressStartTime == 0) return console.log("нездоровая хуйня");

    if (Math.abs(pressEndX - pressStartX) <= deadZone && Math.abs(pressEndY - pressStartY) <= deadZone) {
      let td = e.target.parentNode;
      let tr = td.parentNode;
      fieldX = visibleArea.startX + td.cellIndex;
      fieldY = visibleArea.startY + tr.rowIndex;

      if (pressEndTime - pressStartTime < shortClickTime) {
        openCell(fieldX, fieldY);
      } 
      else {
        markCell(fieldX, fieldY);
        window.navigator.vibrate(200);
      }
    }
    else {
      changeVisibleArea();
      displayField();
    }
  }
}

visibleField.addEventListener("contextmenu", function(e) {
  // let td = e.target.parentNode;
  // let tr = td.parentNode;
  // fieldX = visibleArea.startX + td.cellIndex;
  // fieldY = visibleArea.startY + tr.rowIndex;

  // markCell(fieldX, fieldY);
  e.preventDefault();
});

visibleField.ondragstart = function() {return false};

/* Видимое поле */

visibleField.array = [];
const visibleArea = {
  startX: 0,
  startY: 0,
  sizeX: 0,
  sizeY: 0,
}

// Cоздаем видимое поле
function createVisibleField() {
  visibleArea.sizeX = Math.ceil(window.innerWidth / cellSize ) * 3;
  visibleArea.sizeY = Math.ceil(window.innerHeight / cellSize ) * 3;

  for (y = 0; y < visibleArea.sizeY; y++) {
    let tr = document.createElement("tr");
    visibleField.appendChild(tr);
    for (x = 0; x < visibleArea.sizeX; x++) {
      let td = document.createElement("td");
      let cell = document.createElement("div");
      cell.className = "cell";
      tr.appendChild(td);
      td.appendChild(cell);
    }
  }

  visibleField.style.left = window.innerWidth / 2 -  visibleArea.sizeX * cellSize / 2 + "px";
  visibleField.style.top = window.innerHeight / 2 -  visibleArea.sizeY * cellSize / 2 + "px";
  startButton.classList.remove('hide');
}

// Обновление зоны видимого поля
function changeVisibleArea() {
  let visibleAreaShiftX = translateX < 0 ? Math.floor(-translateX / cellSize) : Math.ceil(-translateX / cellSize);
  let visibleAreaShiftY = translateY < 0 ? Math.floor(-translateY / cellSize) : Math.ceil(-translateY / cellSize);
  visibleArea.startX += visibleAreaShiftX;
  visibleArea.startY += visibleAreaShiftY;
  translateX = translateX % cellSize;
  translateY = translateY % cellSize;
  visibleField.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
}

// Отображение поля
function displayField() {
  for (let y = visibleArea.startY; y < visibleArea.startY + visibleArea.sizeY; y++) {
    for (let x = visibleArea.startX; x < visibleArea.startX + visibleArea.sizeX; x++) {
      displayCell(x, y);
    }
  }
}

// Отображение клетки
function displayCell(x, y) {
  let tr = visibleField.rows[y - visibleArea.startY];
  if (!tr) return;
  let td = tr.cells[x - visibleArea.startX];
  if (!td) return;
  let cell = td.childNodes[0];
  cell.className = "cell";
  cell.textContent = '';

  if (field[y] && field[y][x]) {
    
    if (field[y][x].state == 'o') {
      switch (field[y][x].value) {
        case 0:
          cell.classList.add("cell_o");
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
          cell.classList.add("cell_o");
          cell.textContent = field[y][x].value;
          break;
        case 10: 
          cell.classList.add("cell_o");
          cell.classList.add("icon-mine");
      }
    }

    if (field[y][x].state == 'f') {
      cell.classList.add("cell_f", "icon-mark");
    }

    if (field[y][x].state == 'm') {
      cell.classList.add("cell_m", "icon-mine");
    }
  }
}

/* Геймплей */

let gameIsOn = false, field, mineProbability;
let cells, openedCells = 0;
let startDate, time = 0, timeInterval;

//Выполнить func для области вокруг x, y с радиусом radius. includeCenter: true — включая x, y.
function around(x, y, func, includeCenter, radius) {
  let range = radius ? radius : 1;
  for (let i = -range; i <= range; i++) {
    if (!field[y + i]) field[y + i] = [];
    for (let j = -range; j <= range; j++) {
      if (!includeCenter && i == 0 && j == 0) continue;
      func(x + j, y + i);
    }
  }
}

// Сгенерировать клетку
function createCell(x, y) {
  around(x, y, function(xx, yy) {
    if (!field[yy][xx]) {
      // console.log('cells: ', cells, '; mineProbability: ', mineProbability);
      let isMine = Math.random() < mineProbability;
      if (isMine) field[yy][xx] = {state: 'c', value: 10};
      else field[yy][xx] = {state: 'c', value: 0};
      cells++;
      if (cells % 100 == 0 && mineProbability < maxMineProbability) mineProbability += 0.01;
    }
  }, true);
}

// Открыть клетку
function openCell(x, y, initial) {
  if (gameIsOn) {
    if (field[y] && field[y][x] && field[y][x].state != 'c') return;
    if (time < 10000 && (!field[y] || (field[y] && !field[y][x]))) field[y][x] = {state: 'c', value: 10};
    else createCell(x, y);
    
    if (field[y][x].value == 10) {
      field[y][x].state = 'm';
      finish();
    }
    else {
      field[y][x].state = 'o';
      if (!initial) {
        openedCells++;
        cellCounter.textContent = numToString(openedCells, 4);
      }

      around(x, y, function(xx, yy) {
        if (field[yy][xx].value == 10) field[y][x].value++;
      });
      
      if (field[y][x].value == 0) {
        setTimeout(function(){
          around(x, y, function(xx, yy) {
            if (initial) openCell(xx, yy, initial);
            else openCell(xx, yy);
          });
        }, 10);
      }
    }

    displayCell(x, y);
  } 
}

// Пометить клетку
function markCell(x, y) {
  if(!gameIsOn) return;
  createCell(x, y);

  if (field[y][x].state == 'o') return;
  if (field[y][x].state == 'c') field[y][x].state = 'f';
  else if (field[y][x].state == 'f') field[y][x].state = 'c';

  displayCell(x, y);
}

// Подсчет птс
function countPTS() {
  return Math.floor(openedCells * (openedCells / 100) * (openedCells / (1 + Math.floor(time / 1000))));
}

// Секундомер
function displayTime() {
  if (gameIsOn) time = new Date() - startDate;
  timeCounter.textContent = timeToString(time);
}

// Начать игру
function start() {
  gameIsOn = true;
  welcome.classList.add("hide");
  showResultButton.classList.add("hide");
  endScreen.place.textContent = "";
  hideModal();
  
  visibleArea.startX = 0;
  visibleArea.startY = 0;

  openedCells = 0;
  cells = 0;
  cellCounter.textContent = numToString(openedCells, 4);
  startDate = new Date();
  time = 0;
  pts = 0;

  mineProbability = minMineProbability;
  field = [];
  displayField();

  around(Math.floor(visibleArea.sizeX / 2), Math.floor(visibleArea.sizeY / 2), function(xx, yy) {
    field[yy][xx] = {state: 'c', value: 0};
  }, true, 2);

  openCell(Math.floor(visibleArea.sizeX / 2), Math.floor(visibleArea.sizeY / 2), true);
  setTimeout(() => {
    timeInterval = setInterval(displayTime, 10);
  }, 100);
}

// Закончить игру
function finish() {
  gameIsOn = false;
  clearInterval(timeInterval);
  let pts = countPTS();
  let place;

  // Вычисляем позицию в топе
  if (results.length > 0) {
    for (i = 0; i < 8; i++) {
      if (results[i]) {
        if (results[i].pts < pts) {
          place = i + 1;
          break;
        }
      }
      else {
        place = i + 1;
        break;
      }
    }
  }
  else {
    place = 1;
  }

  // Если заняли топ
  if (place) {
    results.splice(place - 1, 0, {place, openedCells, time, pts});
    if (results.length > 8) results.splice(-1, 1);
    results.forEach((result, i) => {
      result.place = i + 1;
    });
    localStorage.setItem("results", JSON.stringify(results));
    updateLeaderboard();
    endScreen.place.textContent = place + "-е место!";
  }

  endScreen.totalCells.textContent = numToString(openedCells, 4);
  endScreen.totalTime.textContent = timeToString(time);
  endScreen.pts.textContent = numToString(pts, 6);
  setTimeout(() => { showModal(endScreen) }, 500);
}

/* Перевод значений в строку */

// Добавляем нули к num до нужного количества digits
function numToString(num, digits) {
  if (num >= Math.pow(10, digits)) return "9".repeat(digits);
  let string = '' + num;
  if (string.length < digits) string = "0".repeat(digits - string.length) + string;
  return string;
}

// Превращаем ms в формат мм:сс.мс или чч:мм:сс
function timeToString(time) {
  let string;
  let s = Math.floor(time / 1000) % 60;
  if (s < 10) s = '0' + s;

  let m = Math.floor(time / 60000) % 60;
  if (m < 10) m = '0' + m;

  if (Math.floor(time / 3600000) > 0) {
    let h = Math.floor (time / 3600000);
    if (h >= 100) string = '99:59:59';
    else{
      if (h < 10) h = '0' + h;
      string = h + ':' + m + ':' + s;
    }
  }
  else {
    let ms = Math.floor((time % 1000) / 10);
    if (ms < 10) ms = '0' + ms;
    string = m + ':' + s + '.' + ms;
  }
  return string;
}

function placeToString(place) {
  return place + '-e';
}

/* Конечный экран */

const endScreen = document.querySelector(".end-screen");
endScreen.totalCells = endScreen.querySelector("#total-cells");
endScreen.totalTime = endScreen.querySelector("#total-time");
endScreen.pts = endScreen.querySelector("#pts");
endScreen.restartButton = endScreen.querySelector(".end-screen__restart");
endScreen.restartButton.addEventListener('click', start);
endScreen.place = endScreen.querySelector(".endscreen__place");

/* Рекорды */

const leaderboard = document.querySelector(".leaderboard");
leaderboard.statCols = leaderboard.querySelectorAll(".stat-col");
leaderboard.statCols.forEach(statCol => {
  statCol.stats = statCol.querySelectorAll(".leaderboard__stat");
});

function updateLeaderboard() {
  results.forEach(function(result, i) {
    leaderboard.statCols[0].stats[i].textContent = placeToString(result.place);
    leaderboard.statCols[1].stats[i].textContent = numToString(result.openedCells, 4);
    leaderboard.statCols[2].stats[i].textContent = timeToString(result.time);
    leaderboard.statCols[3].stats[i].textContent = numToString(result.pts, 6);
  });
}

/* Модалки */

const modals = document.querySelectorAll(".modal");
modals.forEach(modal => {
  // Закрывашка
  modal.close = modal.querySelector(".modal__close");
  if (modal.close) modal.close.addEventListener("click", hideModal);

  // Клик вне карточки
  modal.card = modal.querySelector(".card")
  modal.addEventListener("click", function(e) {
    if (!modal.card.contains(e.target)) hideModal();
  });
});

const modalTriggers = document.querySelectorAll(".modal-trigger");
if (modalTriggers.length > 0) {
  modalTriggers.forEach(modalTrigger => {
    modalTrigger.addEventListener("click", function(e) {
      showModal(document.querySelector(modalTrigger.getAttribute('href')));
      e.preventDefault();
    });
  });
}

let activeModal;

function showModal(modal) {
  hideModal(activeModal);
  activeModal = modal;
  modal.classList.remove("hide");
}

function hideModal() {
  if(activeModal) {
    if (activeModal == endScreen && !gameIsOn) showResultButton.classList.remove("hide");
    activeModal.classList.add("hide");
    activeModal = null;
  }
}