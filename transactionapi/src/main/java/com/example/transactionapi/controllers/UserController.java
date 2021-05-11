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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    private Logger logger = LoggerFactory.getLogger(UserController.class);

    private UserRepository userRepository;
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;

    public UserController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/allusers")
    public ResponseEntity<Page<User>> findAll(Pageable pageable) {
        return new ResponseEntity<>(userRepository.findAll(pageable), HttpStatus.OK);
    }

//    @GetMapping("/userinfo")
//    public ResponseEntity<User> findByID(@RequestBody Integer id) {
//        return new ResponseEntity<>(userRepository.findById(id).get(), HttpStatus.OK);
//    }

    @PostMapping("/rating")
    public HttpStatus increse(@RequestBody Integer id) {
        User user = userRepository.findById(id).get();
        user.setRating(user.getRating() + 100);
//        userRepository.delete(user);
        userRepository.save(user);

        return HttpStatus.OK;
    }

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
                user.setRating(0);
                userRepository.save(user);

                // my code
                try {
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
                    );
                } catch (Exception ex) {
                    System.out.println(ex.getMessage());
                }

//                User user = userRepository.findByEmail(authRequest.getEmail());
                jsonObject.put("token", jwtUtil.generateToken(user.getEmail(), userRepository.findByEmail(user.getEmail()).getRole()));
                jsonObject.put("email", user.getEmail());
                jsonObject.put("role", user.getRole().getName());
                jsonObject.put("id", user.getId());
//                return jsonObject.toString();

            } else {
                jsonObject.put("message", "User with this email has account");
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

        return new ResponseEntity<>(jsonObject.toString(), HttpStatus.OK);
    }

}
