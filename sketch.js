let capture;
let hands;
let predictions = [];
let gameState = 'READY'; // READY, COUNTDOWN, RESULT, MENU
let timer = 0;
let playerHand = 'None';
let computerHand = '';
let resultMsg = '';

const GESTURES = {
  ROCK: '石頭',
  PAPER: '布',
  SCISSORS: '剪刀',
  CONTINUE: '食指向上(繼續)',
  END: '比叉叉(結束)',
  UNKNOWN: '未知'
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 暫時移除攝影機初始化，改用鍵盤模擬測試畫面
  console.log("遊戲啟動 (測試模式)");
  console.log("模擬手勢操作：數字鍵 1(石頭), 2(布), 3(剪刀), 4(繼續), 5(結束)");
}

function onResults(results) {
  predictions = results.multiHandLandmarks;
}

// 手勢辨識邏輯
function classifyHand(landmarks) {
  // 判斷手指是否伸直 (y 座標越小代表越高)
  const isExtended = (tip, pip) => landmarks[tip].y < landmarks[pip].y;

  const indexExtended = isExtended(8, 6);
  const middleExtended = isExtended(12, 10);
  const ringExtended = isExtended(16, 14);
  const pinkyExtended = isExtended(20, 18);

  // 1. 布：四指全開
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) return GESTURES.PAPER;
  
  // 2. 剪刀 vs 叉叉 (END)
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    // 檢查食指尖(8)與中指尖(12)的距離，判斷是否交叉
    let d = dist(landmarks[8].x, landmarks[8].y, landmarks[12].x, landmarks[12].y);
    if (d < 0.04) return GESTURES.END; // 距離近視為交叉
    return GESTURES.SCISSORS; // 距離遠視為剪刀
  }

  // 3. 只有食指向上 (繼續遊戲)
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return GESTURES.CONTINUE;
  }

  // 4. 石頭
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return GESTURES.ROCK;
  }

  return GESTURES.UNKNOWN;
}

function draw() {
  background(255, 220, 230); // 換成粉嫩的粉紅色底

  // 繪製裝飾小愛心
  drawDecoration();

  // 遊戲畫面 UI
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(20);
  fill(150, 100, 120);
  text(`[測試模式] 數字鍵 1,2,3 出拳 | 4:繼續 | 5:結束`, width / 2, 40);
  text(`目前偵測狀態：${playerHand}`, width / 2, 70);
  
  if (gameState === 'READY') {
    fill(255, 150, 180, 180); 
    rect(width / 2 - 250, height / 2 - 60, 500, 120, 20);
    fill(255); textSize(40);
    text("準備出拳 ❤️ (1/2/3)", width/2, height/2);

    if (playerHand === GESTURES.ROCK || playerHand === GESTURES.PAPER || playerHand === GESTURES.SCISSORS) {
      gameState = 'COUNTDOWN';
      timer = frameCount;
    }
  } 
  else if (gameState === 'COUNTDOWN') {
    let count = 3 - floor((frameCount - timer) / 60);
    fill(255, 0, 0); textSize(100);
    text(count > 0 ? count : "出！", width/2, height/2);
    if (count < 0) {
      computerHand = random([GESTURES.ROCK, GESTURES.PAPER, GESTURES.SCISSORS]);
      gameState = 'RESULT';
      timer = frameCount;
    }
  }
  else if (gameState === 'RESULT') {
    textSize(40); fill(255);
    text(`你：${playerHand}  VS  電腦：${computerHand}`, width/2, height/2 - 50);
    
    // 判定勝負
    if (playerHand === computerHand) resultMsg = "平手！";
    else if (
      (playerHand === GESTURES.ROCK && computerHand === GESTURES.SCISSORS) ||
      (playerHand === GESTURES.PAPER && computerHand === GESTURES.ROCK) ||
      (playerHand === GESTURES.SCISSORS && computerHand === GESTURES.PAPER)
    ) resultMsg = "你贏了！ 🎉";
    else resultMsg = "你輸了... 💀";

    textSize(60); fill(255, 80, 120);
    text(resultMsg, width/2, height/2 + 50);
    if ((frameCount - timer) > 120) {
      gameState = 'MENU';
      playerHand = 'None'; // 重置手勢，以免直接跳過選單
    }
  }
  else if (gameState === 'MENU') {
    fill(255, 245, 247, 220); rect(0, 0, width, height);
    fill(255, 100, 150); textSize(32);
    text("遊戲結束 - 選單 ❤️", width/2, height/2 - 100);
    textSize(24);
    text("繼續遊玩：請比「食指向上 ☝️」", width/2, height/2 - 20);
    text("結束遊戲：請比「手指交叉 🤞」", width/2, height/2 + 30);
    
    fill(255, 50, 100);
    text(`目前偵測：${playerHand}`, width/2, height/2 + 100);

    if (playerHand === GESTURES.CONTINUE) {
      gameState = 'READY';
      playerHand = 'None';
    } else if (playerHand === GESTURES.END) {
      gameState = 'EXIT';
    }
  }
  else if (gameState === 'EXIT') {
    background(0);
    fill(255); textSize(40);
    text("遊戲已結束", width/2, height/2);
    noLoop();
  }
}

// 畫背景裝飾
function drawDecoration() {
  textSize(40);
  text('❤️', 80, 120);
  text('🌸', width - 80, 150);
  text('💖', 120, height - 100);
  text('✨', width - 150, height - 150);
}

// 模擬鍵盤輸入手勢
function keyPressed() {
  if (key === '1') playerHand = GESTURES.ROCK;
  if (key === '2') playerHand = GESTURES.PAPER;
  if (key === '3') playerHand = GESTURES.SCISSORS;
  if (key === '4') playerHand = GESTURES.CONTINUE;
  if (key === '5') playerHand = GESTURES.END;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
