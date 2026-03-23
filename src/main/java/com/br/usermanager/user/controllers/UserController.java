package com.br.usermanager.user.controllers;

import com.br.usermanager.user.dto.request.CreateUserRequestDTO;
import com.br.usermanager.user.dto.request.UpdateUserRequestDTO;
import com.br.usermanager.user.dto.response.UserResponseDTO;
import com.br.usermanager.user.dto.request.LoginDTO;
import com.br.usermanager.user.interfaces.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginDTO request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<UserResponseDTO>> createUsers(
            @RequestBody List<@Valid CreateUserRequestDTO> requests
    ) {
        return ResponseEntity.status(201).body(userService.registerUsers(requests));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @Valid @RequestBody CreateUserRequestDTO request
    ) {
        return ResponseEntity
                .status(201)
                .body(userService.registerUser(request));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "") String email,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getAllUsers(name, email, pageable));
    }

    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequestDTO request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}