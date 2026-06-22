package com.twinos.career.controller;

import com.twinos.career.entity.JobRole;
import com.twinos.career.entity.User;
import com.twinos.career.repository.JobRoleRepository;
import com.twinos.career.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    private User user;
    private JobRole targetRole;

    @BeforeEach
    void setUp() {
        user = userRepository.findAll().stream()
                .filter(existing -> "demo@twinos.app".equals(existing.getEmail()))
                .findFirst()
                .orElseThrow();
        targetRole = jobRoleRepository.findAll().stream()
                .filter(role -> "Software Engineer".equals(role.getTitle()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void resumeUploadExtractsSkills() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                createResumePdf()
        );

        mockMvc.perform(multipart("/api/resume/upload")
                        .file(file)
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedSkillCount", greaterThan(0)))
                .andExpect(jsonPath("$.detectedSkills", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.refresh.status").value("REFRESHED"))
                .andExpect(jsonPath("$.refresh.careerMatchCount", greaterThan(0)))
                .andExpect(jsonPath("$.refresh.roadmapMilestoneCount", greaterThan(0)));
    }

    @Test
    void careerMatchReturnsRankedRoles() throws Exception {
        mockMvc.perform(get("/api/career-match").param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].matchScore").exists())
                .andExpect(jsonPath("$[0].title").exists());
    }

    @Test
    void skillGapReturnsMatchedAndMissingSkills() throws Exception {
        mockMvc.perform(get("/api/skill-gap")
                        .param("userId", user.getId().toString())
                        .param("targetRoleId", targetRole.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchedSkills").isArray())
                .andExpect(jsonPath("$.missingSkills").isArray())
                .andExpect(jsonPath("$.recommendations", hasSize(greaterThan(0))));
    }

    @Test
    void roadmapReturnsOrderedMilestones() throws Exception {
        mockMvc.perform(get("/api/roadmap")
                        .param("userId", user.getId().toString())
                        .param("targetRoleId", targetRole.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milestones", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.milestones[0].order").value(1));
    }

    @Test
    void skillValidationReturnsEvidenceBasedConfidence() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                createResumePdf()
        );

        mockMvc.perform(multipart("/api/resume/upload")
                        .file(file)
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/skills/validated")
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].skill").exists())
                .andExpect(jsonPath("$[0].confidence").exists())
                .andExpect(jsonPath("$[0].sources").isArray())
                .andExpect(jsonPath("$[0].evidence").isArray());

        mockMvc.perform(get("/api/skills/confidence-summary")
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.highConfidence").exists())
                .andExpect(jsonPath("$.mediumConfidence").exists())
                .andExpect(jsonPath("$.lowConfidence").exists());
    }

    @Test
    void getCurrentResumeReturns404WhenMissing() throws Exception {
        mockMvc.perform(get("/api/resume").param("userId", user.getId().toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCurrentResumeReturnsStoredMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                createResumePdf()
        );

        mockMvc.perform(multipart("/api/resume/replace")
                        .file(file)
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/resume").param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalFilename").value("resume.pdf"))
                .andExpect(jsonPath("$.detectedSkillCount", greaterThan(0)));
    }

    @Test
    void skillValidationsEndpointReturnsValidatedSkills() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                createResumePdf()
        );

        mockMvc.perform(multipart("/api/resume/replace")
                        .file(file)
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/skill-validations")
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[0].skill").exists());
    }

    @Test
    void digitalTwinReflectsPersistedResumeFlag() throws Exception {
        mockMvc.perform(get("/api/digital-twin").param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasResume").value(false));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                createResumePdf()
        );

        mockMvc.perform(multipart("/api/resume/replace")
                        .file(file)
                        .param("userId", user.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/digital-twin").param("userId", user.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasResume").value(true))
                .andExpect(jsonPath("$.userName").exists())
                .andExpect(jsonPath("$.lastUpdatedAt").exists());
    }

    private byte[] createResumePdf() throws Exception {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(font, 12);
                content.newLineAtOffset(50, 700);
                content.showText("Skills: Java, JavaScript, SQL, Systems Design, DevOps, React");
                content.endText();
            }

            document.save(output);
            return output.toByteArray();
        }
    }
}
