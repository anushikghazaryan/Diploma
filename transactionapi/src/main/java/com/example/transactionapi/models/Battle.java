package com.example.transactionapi.models;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Battle {
    @Id
    private Long id;
    private String name;
    private int status;
    private Long senderid;
    private Long receiverid;
    private int senderbal;
    private int receiverbal;

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Long getSenderid() {
        return senderid;
    }

    public void setSenderid(Long senderid) {
        this.senderid = senderid;
    }

    public Long getReceiverid() {
        return receiverid;
    }

    public void setReceiverid(Long receiverid) {
        this.receiverid = receiverid;
    }

    public int getSenderbal() {
        return senderbal;
    }

    public void setSenderbal(int senderbal) {
        this.senderbal = senderbal;
    }

    public int getReceiverbal() {
        return receiverbal;
    }

    public void setReceiverbal(int receiverbal) {
        this.receiverbal = receiverbal;
    }
}
