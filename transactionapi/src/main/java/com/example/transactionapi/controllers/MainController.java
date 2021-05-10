package com.example.transactionapi.controllers;


import com.example.transactionapi.models.Battle;
import com.example.transactionapi.repository.BattleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/")
@CrossOrigin(origins = "*")
public class MainController{
    @Autowired
    private BattleRepository battleRepository;

    @GetMapping("/allbattles")
    public ResponseEntity<Page<Battle>> findAll(Pageable pageable) {
        return new ResponseEntity<>(battleRepository.findAllByOrderByIdDesc(pageable), HttpStatus.OK);
    }
}