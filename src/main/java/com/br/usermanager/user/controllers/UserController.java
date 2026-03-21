package com.br.usermanager.user.controllers;

import com.br.usermanager.user.interfaces.UserService;
import com.br.usermanager.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // CREATE
    @PostMapping
    public User createUser(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password
    ) {
        return userService.registerUser(name, email, password);
    }

    // READ ALL
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable UUID id,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password
    ) {
        return userService.updateUser(id, name, email, password);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }
}