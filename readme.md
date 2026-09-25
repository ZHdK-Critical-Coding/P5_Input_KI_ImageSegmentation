# P5 -> Image Segmentation

A p5.js sketch that captures a frame from the webcam (or an MJPEG stream) and
runs a panoptic image segmentation model on it. For every detected segment it
shows the masked frame, the cropped segment, the raw mask and the label.

## How to Use

1. Use Chrome: the model runs on WebGPU, which is not available in every
   browser (other browsers show "This runs only on Chrome!").
2. Start Live Server (click **Go Live** in the VS Code status bar) and allow
   webcam access.
3. Wait until the model has loaded (see console, the first load downloads it
   from Hugging Face), then press **capture**.
4. Optional: to use an MJPEG stream instead of the webcam, set `videoSrc` and
   `proxyUrl` at the top of `sketch.js` and set `useWebcam = true` (note: the
   flag is inverted, `true` loads the stream, `false` uses the webcam). The
   stream is loaded through a CORS proxy server that you need to provide
   yourself.

## How it Works

`libraries/ml5-extra-imagesegmentation.js` adds `ml5.imageSegmentation()` on
top of ml5.js. It loads transformers.js from jsDelivr and runs the model
`Xenova/detr-resnet-50-panoptic` (WebGPU, fp16). Results contain a mask as
`p5.Image`, a label, a score and a bounding box computed from the mask.

## Libraries

- p5.js 1.10.0
- p5.sound 1.0.1
- ml5.js 1.2.2
- transformers.js (Hugging Face, latest version from jsDelivr)
