package com.example.transactionapi.controllers;

import com.example.transactionapi.config.JwtTokenProvider;
import com.example.transactionapi.models.AuthRequest;
import com.example.transactionapi.models.User;
import com.example.transactionapi.repository.UserRepository;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthorizationResource {

    @Autowired
    private JwtTokenProvider jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/")
    public String welcome() {
        return "Welcome!";
    }

    @PostMapping("/authenticate")
    public String generateToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
        JSONObject jsonObject = new JSONObject();
        User user = userRepository.findByEmail(authRequest.getEmail());
        jsonObject.put("token", jwtUtil.generateToken(authRequest.getEmail(), userRepository.findByEmail(authRequest.getEmail()).getRole()));
        jsonObject.put("email",user.getEmail());
        jsonObject.put("role",user.getRole().getName());
        jsonObject.put("id",user.getId());
        return jsonObject.toString();
    }

    @PostMapping("/change")
    public String generateToken(@RequestBody User user) throws Exception {
        User chnage = userRepository.findById(user.getId()).get();
        JSONObject jsonObject = new JSONObject();
        if (chnage==null){
            jsonObject.put("message", "User not found");
        }else{
            jsonObject.put("message", "Password changed successfuly");
        }
        return jsonObject.toString();
    }
}
