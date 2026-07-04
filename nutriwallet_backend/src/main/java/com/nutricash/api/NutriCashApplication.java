package com.nutricash.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NutriCashApplication {

    public static void main(String[] args) {
        SpringApplication.run(NutriCashApplication.class, args);
    }
}
