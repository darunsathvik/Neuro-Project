let video;
let poseNet;
let poses = [];

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('canvasContainer');

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, () => {
    console.log('✅ PoseNet loaded');
  });
  poseNet.on('pose', (results) => {
    poses = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);
  drawKeypoints();
  drawSkeleton();
}

function drawKeypoints() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2) {
        fill(0, 255, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      strokeWeight(2);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
