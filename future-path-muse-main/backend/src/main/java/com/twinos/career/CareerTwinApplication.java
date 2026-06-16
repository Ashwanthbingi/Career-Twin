package com.twinos.career;

import com.twinos.career.config.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class CareerTwinApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerTwinApplication.class, args);
    }
}
