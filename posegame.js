let video, poseNet, poses = [];
let leftGfx, rightGfx;
let lastPose = null;
let popupTexts = [];
let lastPopupTime = 0;

// Store all phrases and use them one by one
let phrasePool = [];
const allPhrases = [
  "🔥 Awesome!", "💃 Groovy!", "🎉 Let's go!", "🕺 Smooth!", "⚡ Electric!",
  "👑 King/Queen Vibes!", "🎶 In the Rhythm!", "🌈 Stylish!", "🚀 Energy Blast!", "🌟 Superstar!",
  "🎵 Beat Catcher!", "🎈 Float like a feather!", "💥 That was lit!", "🧠 Brain Dance!", "🌀 Swag overload!"
];

function setup() {
  createCanvas(1280, 480).parent('canvasContainer');
  leftGfx = createGraphics(640, 480);
  rightGfx = createGraphics(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  poseNet = ml5.poseNet(video, () => console.log("✅ PoseNet Loaded"));
  poseNet.on("pose", (results) => poses = results);

  shufflePhrases(); // Prepare first round
}

function draw() {
  leftGfx.image(video, 0, 0);
  rightGfx.background(0);
  rightGfx.push();

  if (poses.length > 0) {
    let pose = poses[0].pose;
    let movement = calculateMovement(pose);

    drawNeonSkeleton(rightGfx, poses[0].skeleton);
    drawGlowKeypoints(rightGfx, pose);

    if (millis() - lastPopupTime > 2000 && movement > 80) {
      showNextPhrase();
      lastPopupTime = millis();
    }

    lastPose = JSON.parse(JSON.stringify(pose));
  }

  drawPopups(rightGfx);
  rightGfx.pop();

  image(leftGfx, 0, 0);
  image(rightGfx, 640, 0);
}

function calculateMovement(pose) {
  if (!lastPose) return 0;
  let total = 0;
  for (let i = 0; i < pose.keypoints.length; i++) {
    let dx = pose.keypoints[i].position.x - lastPose.keypoints[i].position.x;
    let dy = pose.keypoints[i].position.y - lastPose.keypoints[i].position.y;
    total += sqrt(dx * dx + dy * dy);
  }
  return total;
}

function drawNeonSkeleton(g, skeleton) {
  if (!skeleton) return;
  g.strokeWeight(3);
  g.stroke(0, 255, 255);
  for (let i = 0; i < skeleton.length; i++) {
    let partA = skeleton[i][0];
    let partB = skeleton[i][1];
    g.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
}

function drawGlowKeypoints(g, pose) {
  for (let k of pose.keypoints) {
    if (k.score > 0.2) {
      g.noFill();
      g.stroke(255, 0, 255, 100);
      g.strokeWeight(4);
      g.ellipse(k.position.x, k.position.y, 16 + sin(frameCount * 0.2) * 4);
    }
  }
}

function showNextPhrase() {
  if (phrasePool.length === 0) shufflePhrases();
  const next = phrasePool.pop();
  addPopup(next);
}

function shufflePhrases() {
  phrasePool = [...allPhrases];
  for (let i = phrasePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [phrasePool[i], phrasePool[j]] = [phrasePool[j], phrasePool[i]];
  }
}

function addPopup(txt) {
  if (popupTexts.length >= 2) return;
  popupTexts.push({ text: txt, x: random(100, 540), y: 460, life: 80 });
}

function drawPopups(g) {
  for (let i = popupTexts.length - 1; i >= 0; i--) {
    let p = popupTexts[i];
    g.fill(255, p.life * 2.5);
    g.textSize(20);
    g.text(p.text, p.x, p.y);
    p.y -= 0.8;
    p.life -= 2;
    if (p.life <= 0) popupTexts.splice(i, 1);
  }
}
