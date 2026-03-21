package com.br.usermanager.user.services;

import com.br.usermanager.user.interfaces.UserService;
import com.br.usermanager.user.model.User;

import java.util.List;
import java.util.UUID;

public class UserServiceImp implements UserService {
    @Override
    public User registerUser(String name, String email, String password) {
        return null;
    }

    @Override
    public User updateUser(UUID id, String name, String email, String password) {
        return null;
    }

    @Override
    public void deleteUser(UUID id) {

    }

    @Override
    public User getUserById(UUID id) {
        return null;
    }

    @Override
    public List<User> getAllUsers() {
        return List.of();
    }
}
