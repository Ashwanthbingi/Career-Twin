package com.twinos.career.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

@Configuration
public class RagServiceConfig {

    @Value("${twinos.rag.service-url:http://localhost:8000}")
    private String ragServiceUrl;

    @Bean
    public WebClient ragWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(60)) // 60s read timeout for slow LLM calls
                .option(io.netty.channel.ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000); // 30s connection timeout

        return WebClient.builder()
                .baseUrl(ragServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
