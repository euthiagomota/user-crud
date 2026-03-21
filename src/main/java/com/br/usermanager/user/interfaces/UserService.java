package com.br.usermanager.user.interfaces;

import com.br.usermanager.user.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    User registerUser(String name, String email, String password);

    User updateUser(UUID id, String name, String email, String password);

    void deleteUser(UUID id);

    User getUserById(UUID id);

    List<User> getAllUsers();
}