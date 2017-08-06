package org.project36.qualopt.repository;

import org.project36.qualopt.domain.Study;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * Spring Data JPA repository for the Study entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StudyRepository extends JpaRepository<Study,Long> {

    @Query("select study from Study study where study.user.login = ?#{principal.username}")
    List<Study> findByUserIsCurrentUser();
    
    @Query("select distinct study from Study study left join fetch study.participants")
    List<Study> findAllWithEagerRelationships();

    @Query("select study from Study study left join fetch study.participants where study.id =:id")
    Study findOneWithEagerRelationships(@Param("id") Long id);
    
}
