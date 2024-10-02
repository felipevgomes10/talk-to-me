const TEXTS = {
  MAIN: "TALK TO ME",
  STOP: "STOP TALKING",
  TALKING: "TALKING...",
  EMPTY_CLIPBOARD: "NOTHING TO TALK!",
};

const WRAPPER_ID = "speech-wrapper";
const SPEECH_BUTTON_ID = "speech-button";
const STOP_SPEECH_BUTTON_ID = "stop-speech-button";

function createSpeechButtons() {
  const wrapper = document.createElement("div");
  const speechButton = document.createElement("button");
  const stopSpeechButton = document.createElement("button");

  wrapper.id = WRAPPER_ID;

  speechButton.id = SPEECH_BUTTON_ID;
  speechButton.innerText = TEXTS.MAIN;
  setButtonColors(speechButton);

  stopSpeechButton.id = STOP_SPEECH_BUTTON_ID;
  stopSpeechButton.innerText = TEXTS.STOP;
  stopSpeechButton.disabled = true;
  setButtonColors(stopSpeechButton);

  speechButton.addEventListener(
    "click",
    handleSpeechButtonClick.bind(null, speechButton, stopSpeechButton)
  );

  stopSpeechButton.addEventListener(
    "click",
    handleStopSpeechButtonClick.bind(null, speechButton, stopSpeechButton)
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.metaKey) {
      handleSpeechButtonClick(speechButton, stopSpeechButton);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      handleStopSpeechButtonClick(speechButton, stopSpeechButton);
    }
  });

  wrapper.appendChild(speechButton);
  wrapper.appendChild(stopSpeechButton);

  document.body.appendChild(wrapper);
}

async function handleSpeechButtonClick(speechButton, stopSpeechButton) {
  const selectedText = await getText();

  if (!selectedText) return handleEmptyClipboard(speechButton);

  const speech = prepareSpeech(selectedText);

  speech.instance.onstart = () => {
    speechButton.innerText = TEXTS.TALKING;
    speechButton.disabled = true;
    stopSpeechButton.disabled = false;
  };

  speech.instance.onend = () => {
    cleanClipboard();

    speechButton.innerText = TEXTS.MAIN;
    speechButton.disabled = false;
    stopSpeechButton.disabled = true;
  };

  return speech.start();
}

function handleStopSpeechButtonClick(speechButton, stopSpeechButton) {
  window.speechSynthesis.cancel();
  cleanClipboard();

  speechButton.innerText = TEXTS.MAIN;
  speechButton.disabled = false;
  stopSpeechButton.disabled = true;
}

async function cleanClipboard() {
  await navigator.clipboard.writeText("");
}

async function getText() {
  try {
    const selectedText = await navigator.clipboard.readText();

    return selectedText;
  } catch (e) {
    console.error("Clipboard API is not supported");
  }
}

function handleEmptyClipboard(speechButton) {
  speechButton.innerText = TEXTS.EMPTY_CLIPBOARD;

  const TWO_SECONDS = 2000;

  setTimeout(() => {
    speechButton.innerText = TEXTS.MAIN;
  }, TWO_SECONDS);
}

function prepareSpeech(text) {
  const instance = new SpeechSynthesisUtterance(text);

  function start() {
    window.speechSynthesis.speak(instance);
  }

  return { instance, start };
}

function setButtonColors(button) {
  button.style.backgroundColor = "#333333";
  button.style.color = "#ffffff";
}

window.addEventListener("load", createSpeechButtons);
