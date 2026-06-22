package com.twinos.career.service;

import com.twinos.career.dto.RoadmapMilestoneDto;
import com.twinos.career.dto.RoadmapResponse;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.dto.SkillGapResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoadmapService {

    private final SkillGapService skillGapService;

    public RoadmapService(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    public RoadmapResponse generateRoadmap(Long userId, Long targetRoleId) {
        SkillGapResponse gap = skillGapService.analyzeSkillGap(userId, targetRoleId);
        List<RoadmapMilestoneDto> milestones = buildMilestones(gap);

        return new RoadmapResponse(
                userId,
                targetRoleId,
                gap.targetRoleTitle(),
                milestones
        );
    }

    private List<RoadmapMilestoneDto> buildMilestones(SkillGapResponse gap) {
        List<SkillDto> missingSkills = gap.missingSkills();

        if (missingSkills.isEmpty()) {
            return List.of(new RoadmapMilestoneDto(
                    1,
                    "Role Ready",
                    "You have the core skills required for " + gap.targetRoleTitle() + ".",
                    gap.matchedSkills().stream().map(SkillDto::name).toList(),
                    List.of(
                            "Polish your portfolio with role-specific case studies",
                            "Schedule informational interviews with practitioners",
                            "Prepare for behavioral and technical interviews"
                    )
            ));
        }

        List<RoadmapMilestoneDto> milestones = new ArrayList<>();
        int chunkSize = Math.max(1, (int) Math.ceil(missingSkills.size() / 3.0));

        milestones.add(buildMilestone(
                1,
                "Foundation",
                "Close foundational skill gaps and establish a learning baseline.",
                missingSkills,
                0,
                chunkSize,
                List.of(
                        "Audit current skill graph against role requirements",
                        "Enroll in targeted courses for priority gaps",
                        "Ship one small project demonstrating new skills"
                )
        ));

        if (missingSkills.size() > chunkSize) {
            milestones.add(buildMilestone(
                    2,
                    "Application",
                    "Apply missing skills through projects and real-world practice.",
                    missingSkills,
                    chunkSize,
                    Math.min(chunkSize * 2, missingSkills.size()),
                    List.of(
                            "Lead a cross-functional initiative using new skills",
                            "Document outcomes in a portfolio write-up",
                            "Seek feedback from a mentor or peer reviewer"
                    )
            ));
        }

        if (missingSkills.size() > chunkSize * 2) {
            milestones.add(buildMilestone(
                    3,
                    "Signal",
                    "Build external evidence that you are ready for " + gap.targetRoleTitle() + ".",
                    missingSkills,
                    chunkSize * 2,
                    missingSkills.size(),
                    List.of(
                            "Publish or present work showcasing advanced skills",
                            "Contribute to open source or community projects",
                            "Update resume and LinkedIn with measurable outcomes"
                    )
            ));
        }

        milestones.add(new RoadmapMilestoneDto(
                milestones.size() + 1,
                "Transition",
                "Move from learning into interviews and role transition.",
                List.of(),
                List.of(
                        "Run weekly informational and practice interviews",
                        "Tailor applications to highlight matched skills: "
                                + String.join(", ", gap.matchedSkills().stream().map(SkillDto::name).toList()),
                        "Negotiate offers using demonstrated skill evidence"
                )
        ));

        return milestones;
    }

    private RoadmapMilestoneDto buildMilestone(
            int order,
            String title,
            String description,
            List<SkillDto> missingSkills,
            int fromIndex,
            int toIndex,
            List<String> actions
    ) {
        List<String> skills = missingSkills.subList(fromIndex, toIndex).stream()
                .map(SkillDto::name)
                .toList();

        return new RoadmapMilestoneDto(order, title, description, skills, actions);
    }
}
