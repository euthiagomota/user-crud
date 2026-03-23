package com.br.usermanager.user.services;

import com.br.usermanager.user.dto.request.CreateUserRequestDTO;
import com.br.usermanager.user.dto.request.UpdateUserRequestDTO;
import com.br.usermanager.user.dto.response.UserResponseDTO;
import com.br.usermanager.user.dto.request.LoginDTO;
import com.br.usermanager.user.interfaces.UserService;
import com.br.usermanager.user.model.User;
import com.br.usermanager.user.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserServiceImp(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public String login(LoginDTO dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.senha(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        return "Login realizado com sucesso";
    }

    @Override
    public UserResponseDTO registerUser(CreateUserRequestDTO request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email já cadastrado");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Override
    public List<UserResponseDTO> registerUsers(List<CreateUserRequestDTO> requests) {
        return requests.stream().map(request -> {
            if (userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Email já cadastrado: " + request.email());
            }

            User user = new User();
            user.setName(request.name());
            user.setEmail(request.email());
            user.setPassword(passwordEncoder.encode(request.password()));

            return UserResponseDTO.fromEntity(userRepository.save(user));
        }).toList();
    }

    @Override
    public UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO request) {

        User user = findUserById(id);

        if (!user.getEmail().equals(request.email()) &&
                userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email já cadastrado");
        }

        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Override
    public void deleteUser(UUID id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    @Override
    public UserResponseDTO getUserById(UUID id) {
        return UserResponseDTO.fromEntity(findUserById(id));
    }

    @Override
    public Page<UserResponseDTO> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable)
                .map(UserResponseDTO::fromEntity);
    }

    private User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
//
//    @Override
//    public String createTestUser(LoginDTO dto) {
//        if (userRepository.existsByEmail(dto.email())) {
//            return "Usuario com este email ja existe";
//        }
//
//        User user = new User();
//        user.setName("Teste");
//        user.setEmail(dto.email());
//        user.setPassword(passwordEncoder.encode(dto.senha()));
//
//        userRepository.save(user);
//
//        return "Usuário criado com sucesso";
//    }
}