let prevUrl = null;
let play = JSON.parse(localStorage.getItem("ytp-cloud-comment-toggle"));
let durationPerComment = 1;
let nextPageToken = null;
const logic = async () => {
    const video = document.querySelector("video"); //비디오 가져오기
    if (!video || !video.getBoundingClientRect().width) {
        prevUrl = null;
        return;
    }
    //캔버스 생성하기
    removeExistingCanvas(); //기존 캔버스 삭제
    const canvas = createCanvas(video); //새로운 캔버스 생성
    const context = canvas.getContext("2d");

    //댓글 불러오기
    const videoId = extractVideoId(window.location.href);
    if (!videoId) return;

    //댓글 위치 생성
    const data = await fetchComments(videoId);
    nextPageToken = data.nextPageToken;
    const comments = data.items.map(
        (comment) => comment.snippet.topLevelComment.snippet.textOriginal
    );
    let commentPositions = createCommentPositions(canvas, comments);

    //캔버스 업데이트 이벤트 리스너
    const handleSizeChange = () => {
        commentPositions = handleVideoSizeChanges(
            canvas,
            video,
            commentPositions
        );
    };
    // video.addEventListener("loadedmetadata", handleSizeChange);
    observeVideoSizeChanges(video, handleSizeChange);
    let isLoading = false;
    const renderFrame = () => {
        const videoId = extractVideoId(window.location.href);
        if (!videoId) return;

        if (play && !video.paused) {
            clearCanvas(context, canvas);

            commentPositions = updateTextPositionsBasedOnTime(
                video,
                commentPositions
            );
            renderComments(context, commentPositions);
            if (
                video.currentTime + 5 >
                durationPerComment * commentPositions.length
            ) {
                if (nextPageToken && !isLoading) {
                    isLoading = true;
                    fetchComments(videoId, nextPageToken).then((data) => {
                        nextPageToken = data.nextPageToken;
                        const comments = data.items.map(
                            (comment) =>
                                comment.snippet.topLevelComment.snippet
                                    .textOriginal
                        );
                        commentPositions = [
                            ...commentPositions,
                            ...createCommentPositions(
                                canvas,
                                comments,
                                commentPositions.length / 100
                            ),
                        ];
                        isLoading = false;
                    });
                }
            }
        }
        if (
            Math.floor(video.currentTime) == Math.floor(video.duration) ||
            !play
        )
            clearCanvas(context, canvas);
        requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
};

// 비디오 사이즈 변경 핸들러
const handleVideoSizeChanges = (canvas, video, comments) => {
    const prevWidth = canvas.width;
    updateCanvasSize(canvas, video);
    const scale = canvas.width / (prevWidth || 1);
    return resizeTextPositions(comments, scale);
};
//기존 캔버스 삭제
const removeExistingCanvas = () => {
    const existingCanvas = document.getElementById("overlayCanvas");
    if (existingCanvas) existingCanvas.remove();
    return null;
};
//캔버스 생성
const createCanvas = (video) => {
    const canvas = document.createElement("canvas");
    canvas.id = "overlayCanvas";
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    updateCanvasSize(canvas, video);
    return canvas;
};
//캔버스 사이즈 업데이트
const updateCanvasSize = (canvas, video) => {
    const { width, height, top, left } = video.getBoundingClientRect();
    Object.assign(canvas.style, {
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        left: `${left}px`,
    });
    canvas.width = width;
    canvas.height = height;
};
const resizeTextPositions = (comments, scale) =>
    comments.map((pos) => ({
        ...pos,
        x: pos.x * scale,
        y: pos.y * scale,
        fontSize: pos.fontSize * scale,
    }));

const observeVideoSizeChanges = (video, callback) => {
    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(video);
};
const observeVideo = (video, callback) => {
    const mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(video);
};

const createCommentPositions = (canvas, comments, page = 0) =>
    comments.map((comment, index) => ({
        text: comment,
        x:
            canvas.width +
            (index + page * 100) * (canvas.width / comments.length),
        y: Math.random() * (canvas.height - 40) + 40,
        random: Math.random() * 0.2,
        fontSize: 36 / (1920 / canvas.width),
        time:
            extractAndConvertTimes(comment).length === 0
                ? null
                : extractAndConvertTimes(comment),
    }));

const updateTextPositionsBasedOnTime = (video, comments) =>
    comments.map((comment, index) => {
        if (comment.time) {
            index = comment.time / durationPerComment;
        }
        const timeOffset =
            ((video.currentTime - index * durationPerComment) /
                durationPerComment) *
            video.getBoundingClientRect().width;
        return {
            ...comment,
            x:
                (video.getBoundingClientRect().width - timeOffset) *
                (0.2 + comment.random),
        };
    });

//댓글 렌더링
const renderComments = (ctx, comments) =>
    comments.forEach((comment) => {
        ctx.font = `${comment.fontSize}px Arial`;
        ctx.fillStyle = "black";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 4;
        ctx.fillText(comment.text, comment.x, comment.y);
    });

// 캔버스 지우기
const clearCanvas = (context, canvas) =>
    context.clearRect(0, 0, canvas.width, canvas.height);

const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : null;
};

const fetchComments = async (videoId, nextPageToken) => {
    const params = {
        part: "snippet",
        videoId,
        maxResults: 100,
        order: "relevance",
    };
    if (nextPageToken) params.pageToken = nextPageToken;
    const response = await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    return response.json();
};

// 버튼 추가
(function () {
    function addButton() {
        const player = document.querySelector(".ytp-right-controls");

        if (player) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = `
                <button class="ytp-button" data-tooltip-target-id="ytp-autonav-toggle-button" style="" aria-label="자동재생 사용 중지" title="자동재생 사용 중지">
                    <div class="ytp-autonav-toggle-button-container">
                        <div class="ytp-autonav-toggle-button" aria-checked="false">
                        </div>
                    </div>
                </button>`;
            const buttonElement = tempDiv.firstElementChild;
            player.insertAdjacentElement("afterbegin", buttonElement);

            const toggle = buttonElement.getElementsByClassName(
                "ytp-autonav-toggle-button"
            )[0];
            if (!play) {
                localStorage.setItem("ytp-cloud-comment-toggle", true);
                play = true;
            }
            toggle.ariaChecked = play === true ? "true" : "false";
            buttonElement.addEventListener("click", () => {
                toggle.ariaChecked =
                    toggle.ariaChecked === "true" ? "false" : "true";
                play = toggle.ariaChecked === "true" ? true : false;
                localStorage.setItem("ytp-cloud-comment-toggle", play);
            });
        } else {
            setTimeout(addButton, 1000);
        }
    }

    addButton();
})();

function convertTimeToSeconds(timeStr) {
    const timeParts = timeStr.split(":").map(Number);
    let seconds = 0;

    if (timeParts.length === 2) {
        // 분:초 형식
        const [minutes, secondsPart] = timeParts;
        seconds = minutes * 60 + secondsPart;
    } else if (timeParts.length === 3) {
        // 시간:분:초 형식
        const [hours, minutes, secondsPart] = timeParts;
        seconds = hours * 3600 + minutes * 60 + secondsPart;
    }

    return seconds;
}

function extractAndConvertTimes(text) {
    const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
    const matches = text.match(timeRegex);
    if (matches) {
        return convertTimeToSeconds(matches[0]);
    } else {
        return [];
    }
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
