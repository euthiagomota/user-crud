package com.br.usermanager.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(min = 2, max = 120, message = "Nome deve ter entre 2 e 120 caracteres")
        String name,

        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        @Size(max = 255, message = "Email deve ter no maximo 255 caracteres")
        String email,

        @Size(max = 100, message = "Senha deve ter no maximo 100 caracteres")
        String password
) {
}

