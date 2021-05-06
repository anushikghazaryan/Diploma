package com.example.transactionapi.repository;

import com.example.transactionapi.models.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {
    @Query("FROM UserInfo WHERE id=:user_id")
    UserInfo findByID(@Param("user_id") Integer id);
}