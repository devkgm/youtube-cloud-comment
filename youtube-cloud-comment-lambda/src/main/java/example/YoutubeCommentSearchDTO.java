package example;

public class YoutubeCommentSearchDTO {

    // 필수 매개변수
    private String part; // 포함할 리소스 속성을 지정 예: "snippet,id"

    // 필터 매개변수 (이 중 하나는 반드시 지정)
    private String allThreadsRelatedToChannelId; // 지정된 채널과 연결된 모든 댓글 대화목록을 반환
    private String id; // 검색할 댓글 대화목록 ID를 쉼표로 구분된 목록으로 지정
    private String videoId; // 지정된 동영상 ID와 연결된 댓글 대화목록을 반환

    // 선택적 매개변수
    private Long maxResults; // 반환할 최대 항목 수를 지정 유효한 값: 1-100, 기본값: 20
    private String moderationStatus; // 특정 검토 상태로 댓글 대화목록을 제한 예: "heldForReview", "likelySpam", "published"
    private String order; // 댓글 대화목록을 나열할 순서를 지정 예: "time", "relevance"
    private String pageToken; // 결과 집합의 특정 페이지를 식별
    private String searchTerms; // 지정된 검색어가 포함된 댓글만 반환하도록 제한
    private String textFormat; // 댓글을 HTML 형식 또는 일반 텍스트 형식으로 반환 예: "html", "plainText"

    public String getPart() {
        return part;
    }

    public void setPart(String part) {
        this.part = part;
    }

    public String getAllThreadsRelatedToChannelId() {
        return allThreadsRelatedToChannelId;
    }

    public void setAllThreadsRelatedToChannelId(String allThreadsRelatedToChannelId) {
        this.allThreadsRelatedToChannelId = allThreadsRelatedToChannelId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public Long getMaxResults() {
        return maxResults;
    }

    public void setMaxResults(Long maxResults) {
        this.maxResults = maxResults;
    }

    public String getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(String moderationStatus) {
        this.moderationStatus = moderationStatus;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public String getPageToken() {
        return pageToken;
    }

    public void setPageToken(String pageToken) {
        this.pageToken = pageToken;
    }

    public String getSearchTerms() {
        return searchTerms;
    }

    public void setSearchTerms(String searchTerms) {
        this.searchTerms = searchTerms;
    }

    public String getTextFormat() {
        return textFormat;
    }

    public void setTextFormat(String textFormat) {
        this.textFormat = textFormat;
    }
}
