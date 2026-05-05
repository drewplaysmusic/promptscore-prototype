let ctx;
let stream;
let isOn = false;

const button = document.getElementById('toggle');
const statusBox = document.getElementById('statusBox');

function updateUI() {
  if (isOn) {
    statusBox.textContent = '🟢 LevelRoom Active';
    statusBox.style.background = '#14532d';
    button.textContent = 'Stop Leveling';
  } else {
    statusBox.textContent = '⚪ Off';
    statusBox.style.background = '#333';
    button.textContent = 'Start Leveling';
  }
}

button.addEventListener('click', () => {
  if (!isOn) {
    chrome.tabCapture.capture({ audio: true, video: false }, (capturedStream) => {
      stream = capturedStream;

      ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -30;
      comp.ratio.value = 8;

      source.connect(comp);
      comp.connect(ctx.destination);

      isOn = true;
      updateUI();
    });
  } else {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (ctx) {
      ctx.close();
    }

    isOn = false;
    updateUI();
  }
});

updateUI();