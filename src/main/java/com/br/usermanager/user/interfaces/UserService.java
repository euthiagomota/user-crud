package com.br.usermanager.user.interfaces;

import com.br.usermanager.user.dto.request.CreateUserRequestDTO;
import com.br.usermanager.user.dto.request.UpdateUserRequestDTO;
import com.br.usermanager.user.dto.response.UserResponseDTO;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponseDTO registerUser(CreateUserRequestDTO request);

    UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO request);

    void deleteUser(UUID id);

    UserResponseDTO getUserById(UUID id);

    List<UserResponseDTO> getAllUsers();
}