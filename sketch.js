let video;
let poseNet;
let poses = [];
let leftGfx, rightGfx;
let isMirrored = false;
let showTrace = false;
let traceBuffer = [];
let party = false;
let movementMeter = false;
let lastPose = null;
let poseGameActive = false;
let targetPose = null;
let poseMatchThreshold = 100;

function setup() {
  createCanvas(1280, 480).parent('canvasContainer');
  leftGfx = createGraphics(640, 480);
  rightGfx = createGraphics(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  poseNet = ml5.poseNet(video, () => console.log("✅ PoseNet Loaded"));
  poseNet.on("pose", (results) => {
    poses = results;
  });
}

function draw() {
  leftGfx.image(video, 0, 0);
  rightGfx.background(0);

  if (poses.length > 0) {
    let pose = poses[0].pose;
    if (movementMeter && lastPose) {
      let totalMovement = 0;
      for (let i = 0; i < pose.keypoints.length; i++) {
        let dx = pose.keypoints[i].position.x - lastPose.keypoints[i].position.x;
        let dy = pose.keypoints[i].position.y - lastPose.keypoints[i].position.y;
        totalMovement += sqrt(dx * dx + dy * dy);
      }
      drawMovementBar(totalMovement);
    }
    lastPose = JSON.parse(JSON.stringify(pose));

    if (poseGameActive && targetPose) checkPoseMatch(pose);
    drawSkeleton(rightGfx);
    drawKeypoints(rightGfx, pose);
    if (showTrace) {
      traceBuffer.push(pose);
      if (traceBuffer.length > 10) traceBuffer.shift();
      for (let tPose of traceBuffer) drawSkeleton(rightGfx, tPose, 50);
    }
    if (party) drawPartyEffects(rightGfx, pose);
  }

  image(leftGfx, 0, 0);
  image(rightGfx, 640, 0);
}

function drawKeypoints(g, pose) {
  for (let k of pose.keypoints) {
    if (k.score > 0.2) {
      g.fill(0, 255, 0);
      g.noStroke();
      g.ellipse(k.position.x, k.position.y, 10, 10);
    }
  }
}

function drawSkeleton(g, poseOverride = null, alpha = 255) {
  let skeletonData = poseOverride ? ml5.poseNet.singlePoseSkeleton(poseOverride) : (poses.length > 0 ? poses[0].skeleton : null);
  if (!skeletonData) return;
  g.stroke(255, 0, 0, alpha);
  g.strokeWeight(2);
  for (let j = 0; j < skeletonData.length; j++) {
    let partA = skeletonData[j][0];
    let partB = skeletonData[j][1];
    g.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
}

function toggleMirror() {
  isMirrored = !isMirrored;
  video.style('transform', isMirrored ? 'scaleX(-1)' : 'scaleX(1)');
}

function startTrace() {
  showTrace = !showTrace;
  traceBuffer = [];
}

function startPoseGame() {
  if (poses.length > 0) {
    poseGameActive = true;
    targetPose = JSON.parse(JSON.stringify(poses[0].pose));
    alert("🎯 Match this pose now!");
  }
}

function checkPoseMatch(currentPose) {
  let score = 0;
  for (let i = 0; i < currentPose.keypoints.length; i++) {
    let dx = currentPose.keypoints[i].position.x - targetPose.keypoints[i].position.x;
    let dy = currentPose.keypoints[i].position.y - targetPose.keypoints[i].position.y;
    score += sqrt(dx * dx + dy * dy);
  }
  if (score < poseMatchThreshold) {
    alert("✅ Perfect Match!");
    poseGameActive = false;
  }
}

function partyMode() {
  party = !party;
}

function drawPartyEffects(g, pose) {
  for (let k of pose.keypoints) {
    if (k.score > 0.2) {
      g.fill(random(255), random(255), random(255));
      g.noStroke();
      g.ellipse(k.position.x, k.position.y, 15 + random(10), 15 + random(10));
    }
  }
}

function capturePose() {
  saveCanvas('my_pose', 'png');
}

function toggleMovementMeter() {
  movementMeter = !movementMeter;
}

function drawMovementBar(movement) {
  fill(0);
  rect(20, 20, 200, 20);
  fill(0, 255, 0);
  rect(20, 20, constrain(movement, 0, 200), 20);
}
