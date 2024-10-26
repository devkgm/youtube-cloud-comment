let prevUrl = null;
let play = JSON.parse(localStorage.getItem("ytp-cloud-comment-toggle")) || false;
const DURATION_PER_COMMENT = 1;
const BASE_SPEED = 0.2;
let options = {
    speed: 1,
    fontSize: 1,
    speedSync: false,
    fontColor: "#000000",
    backgroundColor: "#ffffff",
    maxCommentLength: 100,
};
let nextPageToken = null;

chrome.storage.sync.get(["options"], (result) => {
    if (result.options) {
        Object.assign(options, result.options);
    }
});

const logic = async () => {
    const video = document.querySelector("video");
    if (!video || !video.getBoundingClientRect().width) {
        prevUrl = null;
        return;
    }

    removeExistingCanvas();
    const canvas = createCanvas(video);
    const context = canvas.getContext("2d");

    const videoId = extractVideoId(window.location.href);
    if (!videoId) return;

    let commentPositions = [];
    fetchCommentsAsync(videoId).then(initialComments => {
        commentPositions = createCommentPositions(canvas, initialComments);
    });

    const handleSizeChange = () => {
        commentPositions = handleVideoSizeChanges(canvas, video, commentPositions);
    };

    observeVideoSizeChanges(video, handleSizeChange);

    let isLoading = false;
    const renderFrame = async () => {
        const currentVideoId = extractVideoId(window.location.href);
        if (!currentVideoId) return;

        if (video.getBoundingClientRect().width !== canvas.width) {
            handleSizeChange();
        }

        if (play && !video.paused && !checkAds()) {
            clearCanvas(context, canvas);

            commentPositions = updateTextPositionsBasedOnTime(video, commentPositions);
            renderComments(context, commentPositions);

            if (video.currentTime + 5 > DURATION_PER_COMMENT * commentPositions.length && nextPageToken && !isLoading) {
                isLoading = true;
                fetchCommentsAsync(currentVideoId, nextPageToken).then(newComments => {
                    commentPositions = [
                        ...commentPositions,
                        ...createCommentPositions(canvas, newComments, commentPositions.length / 100)
                    ];
                    isLoading = false;
                }).catch(error => {
                    console.error("댓글 불러오기 오류:", error);
                    isLoading = false;
                });
            }
        }

        if (Math.floor(video.currentTime) === Math.floor(video.duration) || !play || checkAds()) {
            clearCanvas(context, canvas);
        }

        requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
};

const handleVideoSizeChanges = (canvas, video, comments) => {
    const prevWidth = canvas.width;
    updateCanvasSize(canvas, video);
    const scale = canvas.width / (prevWidth || 1);
    return resizeTextPositions(comments, scale);
};

const removeExistingCanvas = () => {
    const existingCanvas = document.getElementById("overlayCanvas");
    if (existingCanvas) existingCanvas.remove();
};

const createCanvas = (video) => {
    const canvas = document.createElement("canvas");
    canvas.id = "overlayCanvas";
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    updateCanvasSize(canvas, video);
    return canvas;
};

const updateCanvasSize = (canvas, video) => {
    const { width, height, top, left } = video.getBoundingClientRect();
    Object.assign(canvas.style, { width: `${width}px`, height: `${height}px`, top: `${top}px`, left: `${left}px` });
    canvas.width = width;
    canvas.height = height;
};

const resizeTextPositions = (comments, scale) =>
    comments.map(pos => ({
        ...pos,
        x: pos.x * scale,
        y: pos.y * scale,
        fontSize: pos.fontSize * scale,
    }));

const observeVideoSizeChanges = (video, callback) => {
    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(video);
};

const createUnOverlapNumbers = (min, max) => {
    const arr = Array.from({ length: max - min }, (_, i) => i + min);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const createCommentPositions = (canvas, comments, page = 0) => {
    const fontSize = 36 / (1920 / canvas.width);
    const min = 2;
    const max = Math.floor(canvas.height / ((fontSize * options.fontSize) / 10) - 2);
    let randomNumbers = createUnOverlapNumbers(min, max);

    return comments.map((comment, index) => ({
        text: comment,
        x: canvas.width + (index + page * 100) * (canvas.width / comments.length),
        y: (randomNumbers[index % randomNumbers.length] * fontSize * options.fontSize) / 10 - (fontSize * options.fontSize) / 10,
        random: Math.random() * 0.2,
        fontSize: fontSize,
        time: extractAndConvertTimes(comment),
    }));
};

const updateTextPositionsBasedOnTime = (video, comments) =>
    comments.map(comment => {
        const index = comment.time ? comment.time / DURATION_PER_COMMENT : comments.indexOf(comment);
        const timeOffset = ((video.currentTime - index * DURATION_PER_COMMENT) / DURATION_PER_COMMENT) * video.getBoundingClientRect().width;
        return {
            ...comment,
            x: (video.getBoundingClientRect().width - timeOffset) * ((BASE_SPEED * options.speed) / 10 + (!options.speedSync * comment.random)) + (comment.time === null ? 0 : video.getBoundingClientRect().width),
        };
    });

const renderComments = (ctx, comments) => {
    comments.forEach(comment => {
        ctx.font = `${(comment.fontSize * options.fontSize) / 10}px Arial`;
        ctx.fillStyle = options.fontColor;
        ctx.shadowColor = options.backgroundColor;
        ctx.shadowBlur = 4;
        ctx.fillText(comment.text, comment.x, comment.y);
    });
};

const clearCanvas = (context, canvas) => context.clearRect(0, 0, canvas.width, canvas.height);

const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : null;
};

const fetchCommentsAsync = async (videoId, pageToken = null) => {
    const params = {
        part: "snippet",
        videoId,
        maxResults: 100,
        order: "relevance",
    };
    if (pageToken) params.pageToken = pageToken;
    try {
        const response = await fetch(
            "https://cm3zyqdaz6.execute-api.ap-northeast-2.amazonaws.com/v1/comments",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            }
        );
        const data = await response.json();
        nextPageToken = data.nextPageToken;
        return data.items
            .filter(item => item.snippet.topLevelComment.snippet.textOriginal.length <= options.maxCommentLength)
            .map(item => item.snippet.topLevelComment.snippet.textOriginal);
    } catch (error) {
        console.error("댓글 불러오기 오류:", error);
        return [];
    }
};

(function addButton() {
    const player = document.querySelector(".ytp-right-controls");
    if (!player) {
        setTimeout(addButton, 1000);
        return;
    }

    const buttonElement = document.createElement("button");
    buttonElement.className = "ytp-button";
    buttonElement.setAttribute("data-tooltip-target-id", "ytp-autonav-toggle-button");
    buttonElement.setAttribute("aria-label", "자동재생 사용 중지");
    buttonElement.setAttribute("title", "자동재생 사용 중지");

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "ytp-autonav-toggle-button-container";

    const toggle = document.createElement("div");
    toggle.className = "ytp-autonav-toggle-button";
    toggle.setAttribute("aria-checked", play.toString());

    toggleContainer.appendChild(toggle);
    buttonElement.appendChild(toggleContainer);
    player.insertAdjacentElement("afterbegin", buttonElement);

    buttonElement.addEventListener("click", () => {
        play = !play;
        toggle.setAttribute("aria-checked", play.toString());
        localStorage.setItem("ytp-cloud-comment-toggle", play);
    });
})();

function convertTimeToSeconds(timeStr) {
    const timeParts = timeStr.split(":").map(Number);
    if (timeParts.length === 2) {
        const [minutes, seconds] = timeParts;
        return minutes * 60 + seconds;
    } else if (timeParts.length === 3) {
        const [hours, minutes, seconds] = timeParts;
        return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
}

function extractAndConvertTimes(text) {
    const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
    const matches = text.match(timeRegex);
    return matches ? convertTimeToSeconds(matches[0]) : null;
}

const setupUrlChangeListener = () => {
    window.addEventListener("popstate", logic);
    setInterval(() => {
        if (prevUrl !== window.location.href) {
            prevUrl = window.location.href;
            logic();
        }
    }, 500);
};

setupUrlChangeListener();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "optionChange") {
        options = message.data;
    }
});

const checkAds = () => {
    const videoPlayer = document.querySelector(".html5-main-video");
    return videoPlayer && videoPlayer.closest(".ad-showing");
};
