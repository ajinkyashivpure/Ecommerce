package test.test.controller;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import test.test.config.JwtUtil;
import test.test.entity.LoginRequest;
import test.test.entity.LoginResponse;
import test.test.entity.User;
import test.test.entity.UserDTO;
import test.test.exception.ErrorResponse;
import test.test.repository.UserRepository;
import test.test.service.UserService;

import java.util.ArrayList;

@RestController
@RequestMapping("/test/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/test")
    public String test() {
        return "test";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("User already registered, please login"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(new ArrayList<>())
                .build();

        // Generate JWT
        String token = jwtUtil.generateToken(userDetails);
        UserDTO userDTO = new UserDTO(user);

        // Return response with token
        return ResponseEntity.ok(new LoginResponse(token,userDTO));


    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> dashboard(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            if (email != null) {
                return ResponseEntity.ok("Welcome to the dashboard, " + email + "!");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired t.");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access.");
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            try {
                // Extract email and validate old token
                String email = jwtUtil.extractEmail(oldToken);
                UserDetails userDetails = userService.loadUserByUsername(email);

                if (jwtUtil.isTokenValid(oldToken, userDetails)) {
                    // Generate new token
                    String newToken = jwtUtil.refreshToken(oldToken);

                    // Get user details for response
                    User user = userService.findByEmail(email);
                    UserDTO userDTO = new UserDTO(user);  // Convert to DTO

                    // Return both token and user in response
                    LoginResponse response = new LoginResponse(newToken, userDTO);
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Authorization header not found");
    }

}
