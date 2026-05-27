package com.br.usermanager.infra.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;

@Service
public class LogService {

    private static final Logger log = LoggerFactory.getLogger(LogService.class);

    private final LogRepository logRepository;
    private final ObjectMapper objectMapper;

    public LogService(LogRepository logRepository, ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.objectMapper = objectMapper;
    }

    public void saveInfo(String loggerName, String method, Object payload, String httpMethod, String path, String principal) {
        save("INFO", loggerName, method, payload, null, httpMethod, path, principal);
    }

    public void saveError(String loggerName, String method, Object payload, Throwable ex, String httpMethod, String path, String principal) {
        save("ERROR", loggerName, method, payload, ex, httpMethod, path, principal);
    }

    private void save(String level, String loggerName, String method, Object payload, Throwable ex, String httpMethod, String path, String principal) {
        LogEntry entry = new LogEntry();
        entry.setTimestamp(Instant.now());
        entry.setLevel(level);
        entry.setLoggerName(loggerName);
        entry.setMethod(method);
        entry.setHttpMethod(httpMethod);
        entry.setPath(path);
        entry.setPrincipal(principal);

        if (payload != null) {
            try {
                entry.setPayload(objectMapper.writeValueAsString(payload));
            } catch (JsonProcessingException e) {
                entry.setPayload(payload.toString());
            }
        }

        if (ex != null) {
            entry.setException(ex.getClass().getName() + ": " + ex.getMessage());
        }

        try {
            logRepository.save(entry);
        } catch (Exception e) {
            // Fallback to console to avoid losing the original exception flow
            log.error("Failed to persist log entry: {}", e.getMessage(), e);
        }
    }
}

