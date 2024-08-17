package example;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.api.services.youtube.model.CommentThreadListResponse;
import org.junit.jupiter.params.ParameterizedTest;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.tests.annotations.Event;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

import com.amazonaws.xray.AWSXRay;
import com.amazonaws.xray.AWSXRayRecorderBuilder;
import com.amazonaws.xray.strategy.sampling.NoSamplingStrategy;

class InvokeTest {

  public InvokeTest() {
      AWSXRayRecorderBuilder builder = AWSXRayRecorderBuilder.standard();
      builder.withSamplingStrategy(new NoSamplingStrategy());
      AWSXRay.setGlobalRecorder(builder.build());
  }

  @ParameterizedTest
  @Event(value = "event.json", type = Map.class)
  void invokeTest(YoutubeCommentSearchDTO searchDTO) throws GeneralSecurityException, IOException {
      AWSXRay.beginSegment("blank-java-test");
      Context context = new TestContext();
      Handler handler = new Handler();
      CommentThreadListResponse result = handler.handleRequest(searchDTO, context);
      assertNotNull(result);
      AWSXRay.endSegment();
  }
}
