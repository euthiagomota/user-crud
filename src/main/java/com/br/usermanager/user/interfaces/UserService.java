package com.br.usermanager.user.interfaces;

import com.br.usermanager.user.dto.request.CreateUserRequestDTO;
import com.br.usermanager.user.dto.request.UpdateUserRequestDTO;
import com.br.usermanager.user.dto.response.UserResponseDTO;
import com.br.usermanager.user.dto.request.LoginDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {

    String login(LoginDTO dto);

    UserResponseDTO registerUser(CreateUserRequestDTO request);

    List<UserResponseDTO> registerUsers(List<CreateUserRequestDTO> requests);

    UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO request);

    void deleteUser(UUID id);

    UserResponseDTO getUserById(UUID id);

    Page<UserResponseDTO> getAllUsers(String name, String email, Pageable pageable);

}