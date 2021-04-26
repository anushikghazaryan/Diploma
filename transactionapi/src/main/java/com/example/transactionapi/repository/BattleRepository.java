package com.example.transactionapi.repository;


import com.example.transactionapi.models.Battle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BattleRepository extends JpaRepository<Battle, Integer> {

    Page<Battle> findAllByOrderByIdDesc(Pageable pageable);
}
