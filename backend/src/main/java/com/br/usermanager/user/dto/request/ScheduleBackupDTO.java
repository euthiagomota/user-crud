package com.br.usermanager.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ScheduleBackupDTO(
        @NotBlank(message = "Frequencia e obrigatoria")
        String frequencia,

        @NotBlank(message = "Horario de inicio e obrigatorio")
        String horarioInicio
) {
}
