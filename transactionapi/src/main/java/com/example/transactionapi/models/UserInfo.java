package com.example.transactionapi.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class UserInfo {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    private Integer finishedGames;

    private Integer wonGames;

    private Integer rating;



    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "userid", referencedColumnName = "id")
    private User user;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getFinishedGames() {
        return finishedGames;
    }

    public void setFinishedGames(Integer finishedGames) {
        this.finishedGames = finishedGames;
    }

    public Integer getWonGames() {
        return wonGames;
    }

    public void setWonGames(Integer wonGames) {
        this.wonGames = wonGames;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}


