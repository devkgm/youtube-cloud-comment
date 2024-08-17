const speedInput = document.getElementById("speedInput");
const fontSizeInput = document.getElementById("fontSizeInput");
const resetButton = document.getElementById("resetButton");

const defaultSpeed = 10;
const defaultFontSize = 10;

// 설정값을 로드하여 슬라이더에 적용
chrome.storage.sync.get(["speed", "fontSize"], (result) => {
    speedInput.value = result.speed !== undefined ? result.speed : defaultSpeed;
    fontSizeInput.value =
        result.fontSize !== undefined ? result.fontSize : defaultFontSize;

    sendMessage({
        type: "speedChange",
        data: speedInput.value,
    });
    sendMessage({
        type: "fontSizeChange",
        data: fontSizeInput.value,
    });
});

// 슬라이더 값 변경 시 메시지 전송 및 저장
speedInput.addEventListener("input", (e) => {
    const speedValue = e.target.value;
    chrome.storage.sync.set({ speed: speedValue });
    sendMessage({
        type: "speedChange",
        data: speedValue,
    });
});

fontSizeInput.addEventListener("input", (e) => {
    const fontSizeValue = e.target.value;
    chrome.storage.sync.set({ fontSize: fontSizeValue });
    sendMessage({
        type: "fontSizeChange",
        data: fontSizeValue,
    });
});

// 초기화 버튼 클릭 시 슬라이더 값 초기화 및 저장
resetButton.addEventListener("click", () => {
    speedInput.value = defaultSpeed;
    fontSizeInput.value = defaultFontSize;

    chrome.storage.sync.set({ speed: defaultSpeed, fontSize: defaultFontSize });

    sendMessage({
        type: "speedChange",
        data: defaultSpeed,
    });
    sendMessage({
        type: "fontSizeChange",
        data: defaultFontSize,
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
