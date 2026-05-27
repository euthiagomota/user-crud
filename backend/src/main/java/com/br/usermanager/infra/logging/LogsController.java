package com.br.usermanager.infra.logging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/logs")
public class LogsController {

    private final LogRepository logRepository;

    public LogsController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @GetMapping
    public ResponseEntity<Page<LogEntry>> listLogs(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "100") int size) {
        Page<LogEntry> logs = logRepository.findAll(PageRequest.of(page, size).withSort(org.springframework.data.domain.Sort.by("timestamp").descending()));
        return ResponseEntity.ok(logs);
    }
}

