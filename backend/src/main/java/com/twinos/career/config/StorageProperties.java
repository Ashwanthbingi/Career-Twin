package com.twinos.career.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "twinos.storage")
public class StorageProperties {

    private String resumeDir = "./data/resumes";

    public String getResumeDir() {
        return resumeDir;
    }

    public void setResumeDir(String resumeDir) {
        this.resumeDir = resumeDir;
    }
}
