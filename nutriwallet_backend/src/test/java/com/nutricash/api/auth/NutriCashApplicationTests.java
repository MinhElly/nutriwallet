package com.nutricash.api.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;

@SpringBootTest
class NutriCashApplicationTests {

    @MockitoBean
    private ConnectionFactory connectionFactory;

    @Test
    void contextLoads() {
    }
}
