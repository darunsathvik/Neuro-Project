let video, poseNet, pose;
let prevX = null, prevY = null;
let canvasGfx;
let hue = 0;

function setup() {
  const cnv = createCanvas(1280, 480);
  cnv.parent('canvasContainer');
  canvasGfx = createGraphics(1280, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  poseNet = ml5.poseNet(video, () => console.log("✅ PoseNet Ready"));
  poseNet.on('pose', results => {
    if (results.length > 0) {
      pose = results[0].pose;
    }
  });

  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0);
  image(video, 0, 0, 640, 480);         // Webcam on left
  image(canvasGfx, 640, 0, 640, 480);   // Drawing on right

  if (pose && pose.rightWrist && pose.rightWrist.confidence > 0.2) {
    let x = pose.rightWrist.x + 640;
    let y = pose.rightWrist.y;

    if (prevX !== null && prevY !== null) {
      hue = (hue + 2) % 360;
      canvasGfx.stroke(hue, 100, 100);
      canvasGfx.strokeWeight(4);
      canvasGfx.line(prevX, prevY, x, y);
    }

    prevX = x;
    prevY = y;
  } else {
    prevX = null;
    prevY = null;
  }
}

function clearCanvas() {
  canvasGfx.clear();
}
