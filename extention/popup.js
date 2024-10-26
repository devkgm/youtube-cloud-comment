const speedInput = document.getElementById("speedInput");
const fontSizeInput = document.getElementById("fontSizeInput");
const resetButton = document.getElementById("resetButton");
const speedSyncToggle = document.getElementById("speedSyncToggle");
const backgroundColorInput = document.getElementById("backgroundColorInput");
const fontColorInput = document.getElementById("fontColorInput");
const maxCommentLengthInput = document.getElementById("maxCommentLengthInput");
const maxCommentLengthValue = document.getElementById("maxCommentLengthValue");

const defaultSpeed = 10;
const defaultFontSize = 10;
const defaultSyncSpeed = false;
const defaultFontColor = "#000000";
const defaultBackgroundColor = "#ffffff";
const defaultMaxCommentLength = 100;

const defaultOptions = {
    speed: defaultSpeed,
    fontSize: defaultFontSize,
    speedSync: defaultSyncSpeed,
    fontColor: defaultFontColor,
    backgroundColor: defaultBackgroundColor,
    maxCommentLength: defaultMaxCommentLength,
};
let options = null;

// 설정값을 로드하여 슬라이더에 적용
chrome.storage.sync.get(["options"], (result) => {
    options = result.options !== undefined ? result.options : defaultOptions;
    speedInput.value = options.speed;
    fontSizeInput.value = options.fontSize;
    speedSyncToggle.checked = options.speedSync;
    backgroundColorInput.value = options.backgroundColor;
    fontColorInput.value = options.fontColor;
    maxCommentLengthInput.value = options.maxCommentLength;
    maxCommentLengthValue.textContent = options.maxCommentLength;
    sendMessage({
        type: "optionChange",
        data: options,
    });
});

// 슬라이더 값 변경 시 메시지 전송 및 저장
speedInput.addEventListener("input", (e) => {
    options.speed = e.target.value;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});

fontSizeInput.addEventListener("input", (e) => {
    options.fontSize = e.target.value;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});
speedSyncToggle.addEventListener("input", (e) => {
    options.speedSync = e.target.checked;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});
//글자 색상
backgroundColorInput.addEventListener("input", function (e) {
    options.backgroundColor = e.target.value;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});

fontColorInput.addEventListener("input", function (e) {
    options.fontColor = e.target.value;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});

// 최대 댓글 길이 슬라이더 이벤트 리스너
maxCommentLengthInput.addEventListener("input", (e) => {
    options.maxCommentLength = parseInt(e.target.value);
    maxCommentLengthValue.textContent = options.maxCommentLength;
    chrome.storage.sync.set({ options: options });
    sendMessage({
        type: "optionChange",
        data: options,
    });
});

// 초기화 버튼 클릭 시 슬라이더 값 초기화 및 저장
resetButton.addEventListener("click", () => {
    speedInput.value = defaultOptions.speed;
    fontSizeInput.value = defaultOptions.fontSize;
    speedSyncToggle.checked = defaultOptions.speedSync;
    fontColorInput.value = defaultOptions.fontColor;
    backgroundColorInput.value = defaultOptions.backgroundColor;
    maxCommentLengthInput.value = defaultOptions.maxCommentLength;
    maxCommentLengthValue.textContent = defaultOptions.maxCommentLength;

    chrome.storage.sync.set({
        options: defaultOptions,
    });
    sendMessage({
        type: "optionChange",
        data: defaultOptions,
    });
});

// 메시지 전송
const sendMessage = (payload) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, payload);
        }
    });
};
