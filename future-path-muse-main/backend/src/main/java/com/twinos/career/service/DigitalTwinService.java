package com.twinos.career.service;

import org.springframework.stereotype.Service;

import com.twinos.career.dto.DigitalTwinResponse;

@Service
public class DigitalTwinService {

    public DigitalTwinResponse buildTwin(Long userId) {

        return new DigitalTwinResponse(
                "Demo User",
                84,
                12,
                5,
                "Software Engineer"
        );
    }
}