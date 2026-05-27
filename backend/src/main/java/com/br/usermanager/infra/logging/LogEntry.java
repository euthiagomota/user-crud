package com.br.usermanager.infra.logging;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "logs")
@NoArgsConstructor
@Getter
@Setter
public class LogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(nullable = false)
    private String level;

    private String loggerName;

    private String method;

    @Column(columnDefinition = "text")
    private String payload;

    @Column(columnDefinition = "text")
    private String exception;

    private String httpMethod;

    private String path;

    private String principal;
}

