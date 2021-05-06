package com.example.transactionapi.controllers;

import com.example.transactionapi.config.JwtTokenProvider;
import com.example.transactionapi.models.Role;
import com.example.transactionapi.models.User;
import com.example.transactionapi.repository.RoleRepository;
import com.example.transactionapi.repository.UserRepository;
import org.codehaus.jettison.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController{
    private Logger logger = LoggerFactory.getLogger(UserController.class);

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    public UserController(UserRepository userRepository, RoleRepository roleRepository,JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/allusers")
    public ResponseEntity<Page<User>> findAll(Pageable pageable) {
        return new ResponseEntity<>(userRepository.findAllByOrderByIdDesc(pageable), HttpStatus.OK);
    }

    public ResponseEntity<User> findByID(Integer id) {
        return new ResponseEntity<>(userRepository.findById(id).get(), HttpStatus.OK);
    }
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/register")
    public ResponseEntity<String> save(@RequestBody User user) {
        User search = userRepository.findByEmail(user.getEmail());
        JSONObject jsonObject = new JSONObject();
        try {
            if (search == null) {
                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                String encodedPassword = passwordEncoder.encode(user.getPassword());
                user.setPassword(encodedPassword);
                Role role = roleRepository.findById(2).get();
                user.setRole(role);
                userRepository.save(user);
            }else{
                jsonObject.put("message","User with this email has");
            }
        }catch (Exception e){
            logger.error(e.getMessage());
        }

        return new ResponseEntity<>(jsonObject.toString(), HttpStatus.OK);
    }

}
