package com.nutricash.api.ai;

import com.nutricash.api.ai.controller.AiConsoleController;
import com.nutricash.api.ai.dto.*;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.common.enums.AiLogEvaluationStatus;
import com.nutricash.api.common.exception.AppException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.security.test.context.support.WithMockUser;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = {
    "app.security.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:nutricash_test;DB_CLOSE_DELAY=-1;MODE=MySQL"
})
@WithMockUser(roles = "ADMIN")
class AiConsoleControllerTest {

    @MockitoBean
    private ConnectionFactory connectionFactory;

    @Autowired
    private AiConsoleController aiConsoleController;

    @Test
    void testGetStats() {
        ApiResponse<AiConsoleStatsResponse> response = aiConsoleController.getStats();
        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNotNull();
        assertThat(response.data().totalRequestsToday()).isZero();
        assertThat(response.data().successRate()).isEqualTo(100.0);
    }

    @Test
    void testGetPerformanceChart() {
        ApiResponse<List<AiConsolePerformanceItem>> response = aiConsoleController.getPerformanceChart();
        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNotNull();
    }

    @Test
    void testGetLogsForReview() {
        ApiResponse<List<AiConsoleLogResponse>> response = aiConsoleController.getLogsForReview();
        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNotNull();
    }

    @Test
    void testEvaluateLogNotFound() {
        AiLogEvaluationRequest request = new AiLogEvaluationRequest(AiLogEvaluationStatus.CORRECT);
        assertThatThrownBy(() -> aiConsoleController.evaluateLog(9999L, request))
                .isInstanceOf(AppException.class);
    }

    @Test
    void testRetrainModel() {
        ApiResponse<Void> response = aiConsoleController.retrainModel();
        assertThat(response.success()).isTrue();
    }
}
