package example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.CommentThreadListResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;

public class Handler implements RequestHandler<YoutubeCommentSearchDTO, CommentThreadListResponse> {

    private static final String APPLICATION_NAME = "Youtube Cloud Comment";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private final YouTube youtubeClient;

    public Handler() throws GeneralSecurityException, IOException {
        final NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        this.youtubeClient = new YouTube.Builder(httpTransport, JSON_FACTORY, null)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    @Override
    public CommentThreadListResponse handleRequest(YoutubeCommentSearchDTO searchDTO, Context context) {
        try {
            return getComments(searchDTO);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public CommentThreadListResponse getComments(YoutubeCommentSearchDTO searchDTO) throws Exception {
        String developerKey = System.getenv("YOUTUBE_API_KEY");

        YouTube.CommentThreads.List request = youtubeClient.commentThreads()
                .list(Arrays.asList(searchDTO.getPart().split(",")));

        request.setKey(developerKey)
                .setVideoId(searchDTO.getVideoId());

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
