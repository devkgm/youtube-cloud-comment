package com.devkgm.youtubecloudcomment.youtube;

/**
 * Sample Java code for youtube.commentThreads.list
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/code-samples#java
 */

import com.google.api.client.googleapis.json.GoogleJsonResponseException;

import com.google.api.services.youtube.model.CommentThreadListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class YoutubeController {
    private final YoutubeService youtubeService;
    @PostMapping("/comments")
    public CommentThreadListResponse getComments(@RequestBody YoutubeCommentSearchDTO searchDto) throws Exception {
        return youtubeService.getComments(searchDto);
    }
}
