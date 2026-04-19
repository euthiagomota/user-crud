package com.br.usermanager.user.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class BackupService {

    @Value("${DB_NAME:appdb}")
    private String dbName;

    @Value("${DB_USER:appuser}")
    private String dbUser;

    @Value("${DB_PASSWORD:apppass}")
    private String dbPassword;

    @Value("${BACKUP_DIR:/backups}")
    private String backupDir;

    public String realizarBackup() throws IOException, InterruptedException {

        File backupDirectory = new File(backupDir);
        if (!backupDirectory.exists() && !backupDirectory.mkdirs()) {
            throw new RuntimeException("Nao foi possivel criar o diretorio de backup");
        }

        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String fileName = "backup_" + timestamp + ".sql";
        String filePath = backupDir + "/" + fileName;

        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump",
                "-h", "db",
                "-U", dbUser,
                "-d", dbName,
                "-f", filePath
        );

        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process process = pb.start();
        int exitCode = process.waitFor();

        File out = new File(filePath);
        if (exitCode == 0 && out.exists() && out.length() > 0) {
            return "Backup realizado com sucesso: " + fileName;
        }

        throw new RuntimeException("Erro ao realizar backup");
    }

    public String realizarRestore(String fileName) throws IOException, InterruptedException {

        Path backupDirPath = Path.of(backupDir).toAbsolutePath().normalize();
        Path restorePath = Path.of(backupDir, fileName).toAbsolutePath().normalize();

        if (!restorePath.startsWith(backupDirPath)) {
            throw new RuntimeException("Caminho invalido");
        }

        if (!restorePath.toFile().exists()) {
            throw new RuntimeException("Arquivo de backup nao encontrado");
        }

        // ✅ RESTORE CORRETO PARA ARQUIVO .SQL
        ProcessBuilder pb = new ProcessBuilder(
                "psql",
                "-h", "db",
                "-U", dbUser,
                "-d", dbName,
                "-f", restorePath.toString()
        );

        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode == 0) {
            return "Restore realizado com sucesso!";
        }

        throw new RuntimeException("Erro ao realizar restore");
    }
}
