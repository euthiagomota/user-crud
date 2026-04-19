package com.br.usermanager.user.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class BackupService {

    @Value("${db.name}")
    private String dbName;

    @Value("${db.user}")
    private String dbUser;

    @Value("${backup.dir}")
    private String backupDir;

//    private static final String DB_PASSWORD = System.getenv("DB_PASSWORD");

    public String realizarBackup() throws IOException, InterruptedException {
        System.out.println("BACKUP_DIR: " + backupDir);

        File backupDirectory = new File(backupDir);
        if (!backupDirectory.exists() && !backupDirectory.mkdirs()) {
            throw new RuntimeException("Nao foi possivel criar o diretorio de backup");
        }

        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String filePath = backupDir + "backup_" + timestamp + ".backup";

        ProcessBuilder processBuilder = new ProcessBuilder(
                "/usr/local/bin/pg_dump",
                "-U", dbUser,
                "-d", dbName,
                "-F", "c",
                "-f", filePath
        );

        processBuilder.environment().put("PGPASSWORD", getDbPassword());

        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getErrorStream())
        );

        BufferedReader outReader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
        );

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("[BACKUP] " + line);
        }

        while ((line = outReader.readLine()) != null) {
            System.out.println("[BACKUP-OUT] " + line);
        }

        int exitCode = process.waitFor();

        File out = new File(filePath);

        if (exitCode == 0 && out.exists() && out.length() > 0) {
            return "Backup realizado com sucesso: " + filePath;
        }

        throw new RuntimeException("Erro ao realizar backup. Arquivo nao foi gerado corretamente.");
    }

    public String realizarRestore(String filePath) throws IOException, InterruptedException {
        String fullFilePath = backupDir + filePath;
        Path backupDirPath = Path.of(backupDir).toAbsolutePath().normalize();
        Path restorePath = Path.of(fullFilePath).toAbsolutePath().normalize();

        if (!restorePath.startsWith(backupDirPath)) {
            throw new RuntimeException("Caminho invalido");
        }

        if (!restorePath.toFile().exists()) {
            throw new RuntimeException("Arquivo de backup nao encontrado");
        }

        ProcessBuilder processBuilder = new ProcessBuilder(
                "/usr/local/bin/pg_restore",
                "--clean",
                "--if-exists",
                "-U", dbUser,
                "-d", dbName,
                restorePath.toString()
        );

        processBuilder.environment().put("PGPASSWORD", getDbPassword());

        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getErrorStream())
        );

        String line;
        StringBuilder errorOutput = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            System.out.println("[RESTORE] " + line);
            errorOutput.append(line).append("\n");
        }

        int exitCode = process.waitFor();

        if (exitCode == 0) {
            return "Restore realizado com sucesso!";
        }

        String errorMsg = errorOutput.toString().isEmpty() ? 
                "Erro desconhecido ao realizar restore" : 
                errorOutput.toString();

        throw new RuntimeException("Erro ao realizar restore: " + errorMsg);
    }

    private String getDbPassword() {
        String password = System.getenv("DB_PASSWORD");

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Variavel de ambiente DB_PASSWORD nao configurada");
        }

        return password;
    }
}

