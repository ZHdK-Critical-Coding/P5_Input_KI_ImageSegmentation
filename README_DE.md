# P5.js: Image Segmentation

[English](readme.md)

Nimmt ein Bild von der Webcam (oder einem MJPEG-Stream) auf und wendet ein
panoptisches Segmentierungsmodell darauf an. Für jedes erkannte Segment
werden das maskierte Bild, das ausgeschnittene Segment, die Maske und das
Label angezeigt. Ein Ausgangspunkt, um Objekte oder Personen aus einem
Kamerabild auszuschneiden.

## Installation

Voraussetzungen: eine Webcam (oder ein MJPEG-Stream), Chrome (das Modell
läuft auf WebGPU, andere Browser zeigen "This runs only on Chrome!") und
eine Internetverbindung – transformers.js und das Modell werden beim ersten
Start heruntergeladen.

Optional, MJPEG-Stream statt Webcam: `videoSrc` oben in `sketch.js` und
`useWebcam = false` setzen (`true`, der Standard, verwendet die Webcam).
Der Stream braucht einen Proxy (siehe Server).

Bibliotheken (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (eingebunden,
nicht verwendet), ml5.js 1.2.2, `ml5-extra-imagesegmentation.js`.
transformers.js (Hugging Face) wird in der neusten Version von jsDelivr
geladen.

## Server

Nur für den MJPEG-Stream nötig (`useWebcam = false`): `stream-proxy` aus
[Servers_RaspberriPi](https://github.com/ZHdK-Critical-Coding/Servers_RaspberriPi)
(HTTP, Port 5000), auf einem Raspberry Pi im selben Netzwerk wie dein
Computer. Zuerst im Ordner mit `bash run.sh` (oder `python server.py`)
starten. Er holt den Kamerastream und reicht ihn mit CORS-Headern weiter,
damit das Modell seine Pixel lesen kann. In `sketch.js` `proxyUrl` auf
`http://<pi-ip>:5000/stream?url=` setzen.

## Ausführen

1. Den Ordner in Visual Studio Code öffnen und Live Server starten (in der
   Statusleiste auf **Go Live** klicken).
2. Den Zugriff auf die Webcam erlauben.
3. Warten, bis das Modell geladen ist (siehe Konsole, beim ersten Mal wird
   es von Hugging Face heruntergeladen), dann auf **capture** klicken.

## Coding-Hilfe

- **Konfiguration oben in `sketch.js`**: `videoSrc` (MJPEG-Stream-URL),
  `proxyUrl` (CORS-Proxy) und `useWebcam` (Umschalter für die Quelle, siehe
  oben).
- **`libraries/ml5-extra-imagesegmentation.js`**: ergänzt ml5.js um
  `ml5.imageSegmentation()`. Lädt transformers.js und führt das Modell
  `Xenova/detr-resnet-50-panoptic` aus (WebGPU, fp16). Jedes Ergebnis
  enthält eine `mask` (`p5.Image`), ein `label`, einen `score` und eine aus
  der Maske berechnete `boundingBox`. Anfragen kommen in eine Warteschlange,
  da das Modell nur eine aufs Mal verarbeiten kann.
- **`preload()`**: erstellt das Modell mit
  `ml5.imageSegmentation({ feature_extractor_size: 256 })`. Ein kleinerer
  Wert ist schneller, ein grösserer genauer.
- **`setup()`**: erstellt eine fensterfüllende Zeichenfläche, die
  Videoquelle (Webcam 640 × 480 oder `<img>` mit dem Stream über den Proxy)
  und den Knopf **capture**.
- **`doSegmentation()`**: kopiert das aktuelle Videobild in einen
  Offscreen-Buffer `frame` und führt darauf `segmentation.detect()` aus. Die
  Ergebnisse landen über `gotResults()` in `results`.
- **`draw()`**: zeichnet das Video in die linke Hälfte. Für jeden Eintrag in
  `results` wird `result.mask` auf eine Kopie von `frame` angewendet, auf
  `result.boundingBox` zugeschnitten und rechts in einer Zeile als
  maskiertes Bild, Ausschnitt, Maske und Label gezeichnet. Hier nach
  `result.label` filtern, um nur bestimmte Objekte zu behalten (z. B.
  `"person"`).
- **`drawUrl()`**: zeigt unten die Stream-URL und den Ladezustand an.
