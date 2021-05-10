package com.example.transactionapi.models;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.Set;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
public class Role {
    @Id
    @GeneratedValue
    private Integer id;
    @Version
    private Long version;
    private String name;
    @UpdateTimestamp
    private Date dateCreated;


    public Role() {
    }

    public String getName() {
        return name;
    }

}