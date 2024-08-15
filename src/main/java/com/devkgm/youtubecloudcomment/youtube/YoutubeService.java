package com.devkgm.youtubecloudcomment.youtube;

import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.CommentThreadListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class YoutubeService {
    private final YouTube youtubeClient;
    @Value("${api.key.youtube}")
    private String DEVELOPER_KEY;
    
    public CommentThreadListResponse getComments(YoutubeCommentSearchDTO searchDTO) throws Exception {
        YouTube.CommentThreads.List request = youtubeClient.commentThreads()
                .list(Arrays.asList(searchDTO.getPart().split(",")));
        // 필수 매개변수 설정
        request.setKey(DEVELOPER_KEY)
                .setVideoId(searchDTO.getVideoId()); // 비디오 ID 설정

        // 선택적 매개변수는 값이 있을 때만 설정
        if (searchDTO.getMaxResults() != null) {
            request.setMaxResults(searchDTO.getMaxResults());
        }
        if (searchDTO.getModerationStatus() != null) {
            request.setModerationStatus(searchDTO.getModerationStatus());
        }
        if (searchDTO.getOrder() != null) {
            request.setOrder(searchDTO.getOrder());
        }
        if (searchDTO.getPageToken() != null) {
            request.setPageToken(searchDTO.getPageToken());
        }
        if (searchDTO.getSearchTerms() != null) {
            request.setSearchTerms(searchDTO.getSearchTerms());
        }
        if (searchDTO.getTextFormat() != null) {
            request.setTextFormat(searchDTO.getTextFormat());
        }

        return request.execute();
    }
}
