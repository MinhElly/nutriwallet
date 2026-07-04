package com.nutricash.api.config;

import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RuntimeConfigurationLogger implements ApplicationRunner {
    private final Environment environment;
    private final String datasourceUrl;
    private final String ddlAuto;
    private final String frontendUrl;

    public RuntimeConfigurationLogger(
            Environment environment,
            @Value("${spring.datasource.url}") String datasourceUrl,
            @Value("${spring.jpa.hibernate.ddl-auto}") String ddlAuto,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.environment = environment;
        this.datasourceUrl = datasourceUrl;
        this.ddlAuto = ddlAuto;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Runtime config: profiles={}, datasourceUrl={}, ddlAuto={}, frontendOrigins={}",
                Arrays.toString(environment.getActiveProfiles()), maskDatasourceUrl(datasourceUrl), ddlAuto, frontendUrl);
    }

    private String maskDatasourceUrl(String value) {
        return value.replaceAll("(?i)(password=)[^&]+", "$1***");
    }
}