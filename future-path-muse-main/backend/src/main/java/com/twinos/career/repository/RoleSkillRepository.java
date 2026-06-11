package com.twinos.career.repository;

import com.twinos.career.entity.RoleSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoleSkillRepository extends JpaRepository<RoleSkill, Long> {

    List<RoleSkill> findByRoleId(Long roleId);

    @Query("SELECT rs.skill.id FROM RoleSkill rs WHERE rs.role.id = :roleId")
    List<Long> findSkillIdsByRoleId(@Param("roleId") Long roleId);
}
