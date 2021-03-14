let capture;
// webカメラのロードフラグ
let videoDataLoaded = false;

let handsfree;

const targetIndex = [4, 8, 12, 16, 20];

let isLoadedBothHands = false;

let emojiParticles = [];
let emojiParticlesNum = 35;
let MIN;

const emojiA = 128512;
const emojiB = 128568;

function setup() {
  // webカメラの映像を準備
  capture = createCapture(VIDEO);

  // 映像をロードできたらキャンバスの大きさを設定
  capture.elt.onloadeddata = function () {
    videoDataLoaded = true;
    createCanvas(capture.width, capture.height);
    MIN = min(capture.width, capture.height);
    // emoji準備
    angleMode(DEGREES);
    textAlign(CENTER, CENTER);
    textSize(60);

    for (let i = 0; i < emojiParticlesNum; i++) {
      emojiParticles.push(new emojiParticle(i));
    }
  }

  // 映像を非表示化
  capture.hide();

  // handsfreeのhandモデルを準備
  handsfree = new Handsfree({
    showDebug: false,
    hands: true,
    maxNumHands: 2
  })

  // handsfreeを開始
  handsfree.start()
}

function draw() {
  // 映像を左右反転させて表示
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0, width, height);
  pop();

  push();

  // 手の頂点を表示
  drawLines();

  drawingContext.clip();

  // 窓
  if (isLoadedBothHands) {
    // webカメラの映像
    push();
    drawingContext.filter = 'invert(100%)';

    translate(width, 0);
    scale(-1, 1);
    image(capture, 0, 0, width, height);
    pop();

    // emoji
    stroke(0, 255, 0);
    for (let i = 0; i < emojiParticles.length; i++) {
      emojiParticles[i].move();
      emojiParticles[i].drawLine();
    }

    for (let j = 0; j < emojiParticles.length; j++) {
      emojiParticles[j].drawEmoji();
    }
  }

  pop();
}

function drawLines() {
  const hands = handsfree.data?.hands;

  // 手が検出されなければreturn
  if (!hands?.multiHandLandmarks) {
    isLoadedBothHands = false;
    return;
  }
  // 片手のみの検出ならreturn
  else if (!hands?.multiHandLandmarks[1]) {
    isLoadedBothHands = false;
    return;
  } else {
    isLoadedBothHands = true;
  }

  const hand_0 = hands.multiHandLandmarks[0];
  const hand_1 = hands.multiHandLandmarks[1];

  noStroke();
  beginShape();

  for (let i = 0; i < 5; i++) {
    vertex(width - hand_0[targetIndex[i]].x * width, hand_0[targetIndex[i]].y * height);
  }

  for (let j = 4; j >= 0; j--) {
    vertex(width - hand_1[targetIndex[j]].x * width, hand_1[targetIndex[j]].y * height);
  }

  endShape(CLOSE);
}

class emojiParticle {
  constructor(tmpIndex) {
    this.index = tmpIndex;

    this.x = 0;
    this.y = 0;

    this.NX = random(100);
    this.nx = 0;
    this.NY = random(100);
    this.ny = 0;

    this.nn = random(10);

    this.t = random(360);
    this.tStep = random(0.2, 1.0);
    this.tStep *= random(1) >= 0.5 ? -1 : 1;

    this.R = random(MIN);

    this.emoji = String.fromCodePoint(floor(random(emojiA, emojiB)));

    this.life = 60 * random(0.1, 1);
  }

  move() {
    this.x = map(noise(this.NX, this.nx), 0, 1, 0, width) + (this.R * cos(this.t));
    this.y = map(noise(this.NY, this.ny), 0, 1, 0, height) + (this.R * sin(this.t));

    this.nx += (0.0031 + this.nn * 0.0001);
    this.ny += (0.0037 + this.nn * 0.0001);

    this.t += this.tStep;
  }

  drawLine() {
    for (let i = 0; i < emojiParticles.length; i++) {
      if (i != this.index) {
        if (dist(this.x, this.y, emojiParticles[i].x, emojiParticles[i].y) < 250) {
          line(this.x, this.y, emojiParticles[i].x, emojiParticles[i].y);
        }
      }
    }
  }

  drawEmoji() {
    text(this.emoji, this.x, this.y);

    this.life -= random(0.5, 2.5);
    if (this.life < 0) {
      this.emoji = String.fromCodePoint(floor(random(emojiA, emojiB)));
      this.life = 60 * 1;
    }
  }
}