package com.nutricash.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nutriCashOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("NutriCashAI API")
                        .version("v1")
                        .description("Meal, nutrition, food expense and chatbot management API"));
    }
}
