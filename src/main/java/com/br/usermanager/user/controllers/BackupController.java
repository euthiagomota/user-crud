package com.br.usermanager.user.controllers;

import com.br.usermanager.user.services.BackupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @PostMapping("/backup")
    public ResponseEntity<String> backup() throws IOException, InterruptedException {
        String result = backupService.realizarBackup();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/restore")
    public ResponseEntity<String> restore(@RequestParam String fileName) throws IOException, InterruptedException {
        String result = backupService.realizarRestore(fileName);
        return ResponseEntity.ok(result);
    }
}

