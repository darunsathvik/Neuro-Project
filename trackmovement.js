let video, poseNet, poses = [], lastPose = null;
let smoothedMovement = 0;
let showMeter = true;

function setup() {
  createCanvas(640, 480).parent('canvasContainer');

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  poseNet = ml5.poseNet(video, () => console.log("✅ PoseNet Loaded"));
  poseNet.on("pose", results => poses = results);
}

function draw() {
  background(0);
  image(video, 0, 0);

  if (poses.length > 0) {
    let pose = poses[0].pose;
    let movement = calculateMovement(pose);
    
    // Smooth movement score
    smoothedMovement = lerp(smoothedMovement, movement, 0.1);

    if (showMeter) drawMovementMeter(smoothedMovement);
    lastPose = structuredClone(pose);
  }
}

function calculateMovement(pose) {
  if (!lastPose) return 0;
  let total = 0;
  for (let i = 0; i < pose.keypoints.length; i++) {
    let a = pose.keypoints[i].position;
    let b = lastPose.keypoints[i].position;
    total += dist(a.x, a.y, b.x, b.y);
  }
  return constrain(total, 0, 200);
}

function drawMovementMeter(score) {
  let percent = map(score, 0, 200, 0, 100);
  fill(50);
  rect(20, height - 40, width - 40, 20);
  fill(0, 255, 0);
  rect(20, height - 40, map(score, 0, 200, 0, width - 40), 20);
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text("Movement: " + nf(percent, 2, 1) + "%", width / 2, height - 50);
}

function toggleMovementMeter() {
  showMeter = !showMeter;
}
