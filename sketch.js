// A p5.js sketch that reads an MJPEG input stream and displays it.
// Additionally, it runs an image segmentation model in streaming mode,
// which continuously analyses captured frames and returns results (masks, bounding boxes).
// © uh 2025

// URL of the MJPEG stream to read
const videoSrc = 'http://153.169.104.107:8080/?action=stream';  
// Proxy server to bypass CORS issues when loading the MJPEG stream
const proxyUrl = 'http://10.21.19.158:5000/stream?url='; 

const useWebcam = false

let videoReady = false; // Tracks if the video stream is ready
let imageStream;        // Will hold the MJPEG <img> element
let segmentation;       // ml5.js segmentation model
let results;            // Segmentation results from the model
let frame;              // Off-screen graphics buffer to capture frames

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Build proxy URL to avoid CORS issues
  const proxy = `${proxyUrl}${encodeURIComponent(videoSrc)}`;
  console.log(proxy);

  // Create the HTML <img> element that streams MJPEG video
  if (useWebcam) {
    imageStream = createImg(proxy, '', 'anonymous', (e) => {
      imageStream.hide();   // Hide original element, we draw it manually on canvas
      videoReady = true;    // Mark as ready when loaded
    });
  } else {
    imageStream = createCapture(VIDEO);
    imageStream.size(640, 480);
    imageStream.hide();
    videoReady = true;    // Mark as ready when loaded
  }

  // Create a button to trigger segmentation on demand
  captureBtn = createButton("capture");
  captureBtn.position(20, 20);
  captureBtn.mousePressed(doSegmentation); 
}

function preload() {
  // Load the ml5.js segmentation model
  segmentation = ml5.imageSegmentation({ feature_extractor_size: 256 }); 
}

// Callback function for segmentation results
function gotResults(r) {
  console.log(r);
  results = r;
}

// Function to capture a frame and run segmentation
async function doSegmentation() {
  if (videoReady) {
    // Copy current video frame into an off-screen graphics buffer
    frame = createGraphics(imageStream.width, imageStream.height);
    frame.image(imageStream, 0, 0, imageStream.width, imageStream.height);
    try {
      // Run segmentation on the captured frame
      await segmentation.detect(frame, gotResults);
    } catch (err) {
      alert('This runs only on Chrome!'); // Some features may not be supported elsewhere
    }
  }
}

// Ensure canvas resizes when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Helper function to draw the video URL and status (ready/loading)
function drawUrl(gap) {
  fill(255);
  textSize(10);
  text(`${videoReady ? '💿' : '⏳'} ${videoSrc}`, 2 * gap, height - (2 * gap));
}

function draw() {
  background(128);

  let x = width / 2 + 20; // Starting x position for segmentation results
  let gap = 10;           // Spacing between elements
  let size = ((width - 40) / 6) - gap; // Size for result panels

  if (videoReady) {
    // Draw video background panel
    fill(0, 0, 0, 10);
    rect(gap, gap, width / 2, height - (2 * gap));

    try {
      // Draw video stream into left panel
      image(imageStream, gap, gap, width / 2, height - (2 * gap),
            0, 0, imageStream.width, imageStream.height, CONTAIN);
    } catch (e) {
      console.warn('Error drawing video frame:', e);
    }

    // If segmentation results exist, display them
    if (results && results.length && frame) {
      let sizeY = (height - (2 * gap) - ((results.length - 1) * gap)) / results.length;
      let offset = 0;

      // Iterate over each detected segment
      results.forEach(result => {
        // Clone captured frame
        let maskedImg = frame.get();
        // Apply the mask for this segment
        maskedImg.mask(result.mask);
        // Crop to bounding box of the detected segment
        let croppedImg = maskedImg.get(result.boundingBox.x, result.boundingBox.y,
                                       result.boundingBox.w, result.boundingBox.h);

        // Reserve panel space for 3 outputs per detection:
        // 1. Masked original image
        // 2. Cropped segment
        // 3. Raw mask
        rect(x, gap + offset, size, sizeY);
        rect(x + size + gap, gap + offset, size, sizeY);
        rect(x + 2 * (size + gap), gap + offset, size, sizeY);

        // Draw masked image, cropped segment, and mask
        image(maskedImg, x, gap + offset, size, sizeY,
              0, 0, maskedImg.width, maskedImg.height, CONTAIN);
        image(croppedImg, x + size + gap, gap + offset, size, sizeY,
              0, 0, croppedImg.width, croppedImg.height, CONTAIN);
        image(result.mask, x + 2 * (size + gap), gap + offset, size, sizeY,
              0, 0, result.mask.width, result.mask.height, CONTAIN);

        // Draw detected label text
        push();
          fill(255);
          text(`${result.label}`, x + gap, gap + offset + 20);
        pop();

        // Move offset for next result
        offset += sizeY + gap;
      });
    }
  }

  // Always draw stream status at bottom
  drawUrl(gap);
}