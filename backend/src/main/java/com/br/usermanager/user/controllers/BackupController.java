package com.br.usermanager.user.controllers;

import com.br.usermanager.user.dto.request.ScheduleBackupDTO;
import com.br.usermanager.user.services.BackupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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

    @PostMapping("/backup/schedule")
    public ResponseEntity<String> scheduleBackup(@Valid @RequestBody ScheduleBackupDTO request) {
        String result = backupService.agendarBackup(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/backup/status")
    public ResponseEntity<String> backupStatus() {
        return ResponseEntity.ok(backupService.getStatus());
    }

    @GetMapping("/backup/list")
    public ResponseEntity<List<String>> listBackups() {
        List<String> backups = backupService.listarBackups();
        return ResponseEntity.ok(backups);
    }

    @PostMapping("/restore")
    public ResponseEntity<String> restore(@RequestParam String fileName) throws IOException, InterruptedException {
        String result = backupService.realizarRestore(fileName);
        return ResponseEntity.ok(result);
    }
}
