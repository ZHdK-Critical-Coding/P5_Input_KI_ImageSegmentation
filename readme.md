# P5.js: Image Segmentation

[Deutsch](README_DE.md)

Captures a frame from the webcam (or an MJPEG stream) and runs a panoptic
image segmentation model on it. For every detected segment it shows the
masked frame, the cropped segment, the raw mask and the label. A starting
point for cutting out objects or people from a camera image.

## Installation

Requirements: a webcam (or an MJPEG stream), Chrome (the model runs on
WebGPU, other browsers show "This runs only on Chrome!") and an internet
connection – transformers.js and the model are downloaded on first start.

Optional, MJPEG stream instead of webcam: set `videoSrc` at the top of
`sketch.js` and set `useWebcam = false` (`true`, the default, uses the
webcam). The stream needs a proxy (see Server).

Libraries (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (included, not
used), ml5.js 1.2.2, `ml5-extra-imagesegmentation.js`. transformers.js
(Hugging Face) is loaded in its latest version from jsDelivr.

## Server

Only needed for the MJPEG stream (`useWebcam = false`): `stream-proxy` from
[Servers_RaspberriPi](https://github.com/ZHdK-Critical-Coding/Servers_RaspberriPi)
(HTTP, port 5000), running on a Raspberry Pi in the same network as your
computer. Start it first with `bash run.sh` (or `python server.py`) in its
folder. It fetches the camera stream and passes it on with CORS headers,
so the model can read its pixels. Set `proxyUrl` in `sketch.js` to
`http://<pi-ip>:5000/stream?url=`.

## How to Run

1. Open the folder in Visual Studio Code and start Live Server (click
   **Go Live** in the status bar).
2. Allow webcam access.
3. Wait until the model has loaded (see console, the first load downloads it
   from Hugging Face), then press **capture**.

## Coding Help

- **Config at the top of `sketch.js`**: `videoSrc` (MJPEG stream URL),
  `proxyUrl` (CORS proxy) and `useWebcam` (source switch, see above).
- **`libraries/ml5-extra-imagesegmentation.js`**: adds
  `ml5.imageSegmentation()` on top of ml5.js. It loads transformers.js and
  runs the model `Xenova/detr-resnet-50-panoptic` (WebGPU, fp16). Each
  result contains a `mask` (`p5.Image`), a `label`, a `score` and a
  `boundingBox` computed from the mask. Requests are queued, since the model
  can only run one at a time.
- **`preload()`**: creates the model with
  `ml5.imageSegmentation({ feature_extractor_size: 256 })`. A smaller size
  is faster, a larger one more precise.
- **`setup()`**: creates a full-window canvas, the video source (webcam
  640 × 480 or `<img>` with the proxied stream) and the **capture** button.
- **`doSegmentation()`**: copies the current video frame into an off-screen
  buffer `frame` and runs `segmentation.detect()` on it. The results end up
  in `results` via `gotResults()`.
- **`draw()`**: draws the video in the left half. For every entry in
  `results` it applies `result.mask` to a copy of `frame`, crops it to
  `result.boundingBox` and draws masked image, cropped segment, raw mask and
  label in a row on the right. Filter by `result.label` here to keep only
  certain objects (e.g. `"person"`).
- **`drawUrl()`**: shows the stream URL and the ready state at the bottom.
