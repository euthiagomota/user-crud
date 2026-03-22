package com.br.usermanager.user.services;

import com.br.usermanager.user.interfaces.UserService;
import com.br.usermanager.user.model.User;
import com.br.usermanager.user.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(String name, String email, String password) {

        // 1. validação básica
        if (name == null || email == null || password == null) {
            throw new RuntimeException("Dados inválidos");
        }

        // 2. VERIFICAR SE EMAIL JÁ EXISTE
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado");
        }

        // 3. criar usuário
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);

        // 4. salvar no banco
        return userRepository.save(user);
    }

    @Override
    public User updateUser(UUID id, String name, String email, String password) {

        User user = getUserById(id);

        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    @Override
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}