package com.example.transactionapi.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Game {
    private Long id;
    private Long battleid;
    private Long userid;
    private int pointx;
    private int pointy;

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    public Long getId() {
        return id;
    }

    public Long getBattleid() {
        return battleid;
    }

    public void setBattleid(Long battleid) {
        this.battleid = battleid;
    }

    public Long getUserid() {
        return userid;
    }

    public void setUserid(Long userid) {
        this.userid = userid;
    }

    public int getPointx() {
        return pointx;
    }

    public void setPointx(int pointx) {
        this.pointx = pointx;
    }

    public int getPointy() {
        return pointy;
    }

    public void setPointy(int pointy) {
        this.pointy = pointy;
    }
}
