package com.twinos.career.repository;

import com.twinos.career.entity.RagAnalysisCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface RagAnalysisCacheRepository extends JpaRepository<RagAnalysisCache, Long> {
    
    Optional<RagAnalysisCache> findByUserIdAndAnalysisTypeAndCacheKeyAndExpiresAtAfter(
            Long userId, String analysisType, String cacheKey, Instant now);

    void deleteByUserIdAndAnalysisTypeAndCacheKey(Long userId, String analysisType, String cacheKey);

    @Modifying
    @Query("DELETE FROM RagAnalysisCache r WHERE r.expiresAt < ?1")
    void deleteExpired(Instant now);
}
