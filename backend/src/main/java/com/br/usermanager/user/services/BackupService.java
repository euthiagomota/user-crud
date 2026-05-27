package com.br.usermanager.user.services;

import com.br.usermanager.user.dto.request.ScheduleBackupDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    @Value("${DB_NAME:appdb}")
    private String dbName;

    @Value("${DB_USER:appuser}")
    private String dbUser;

    @Value("${DB_PASSWORD:apppass}")
    private String dbPassword;

    @Value("${BACKUP_DIR:/backups}")
    private String backupDir;

    private TaskScheduler taskScheduler;
    private ScheduledFuture<?> tarefaAgendada;

    // Status do último backup agendado
    private String ultimoStatus = "Nenhum backup agendado";
    private String ultimoHorario = null;

    @PostConstruct
    public void init() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("backup-agendado-");
        scheduler.setErrorHandler(t -> log.error("=== ERRO NO SCHEDULER: {} ===", t.getMessage(), t));
        scheduler.initialize();
        this.taskScheduler = scheduler;
        log.info("TaskScheduler de backup inicializado");
    }

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

        // Lê a saída do processo para diagnóstico
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            log.error("pg_dump falhou com código {}: {}", exitCode, output);
            throw new RuntimeException("pg_dump falhou (código " + exitCode + "): " + output);
        }

        File out = new File(filePath);
        if (out.exists() && out.length() > 0) {
            return "Backup realizado com sucesso: " + fileName;
        }

        throw new RuntimeException("Arquivo de backup vazio ou não criado");
    }

    public String agendarBackup(ScheduleBackupDTO dto) {

        Instant horarioInicio;
        try {
            horarioInicio = Instant.parse(dto.horarioInicio());
        } catch (Exception e) {
            throw new RuntimeException("Formato de data/hora invalido. Esperado formato ISO UTC");
        }

        if (horarioInicio.isBefore(Instant.now())) {
            throw new RuntimeException("O horario de inicio deve ser no futuro");
        }

        // Calcula intervalo de repetição
        Duration intervalo;
        String descricaoFrequencia;

        switch (dto.frequencia()) {
            case "diario":
                intervalo = Duration.ofDays(1);
                descricaoFrequencia = "diária";
                break;
            case "semanal":
                intervalo = Duration.ofDays(7);
                descricaoFrequencia = "semanal";
                break;
            case "mensal":
                intervalo = Duration.ofDays(30);
                descricaoFrequencia = "mensal (a cada 30 dias)";
                break;
            default:
                throw new RuntimeException("Frequencia invalida. Use: diario, semanal ou mensal");
        }

        // Cancela agendamento anterior se existir
        if (tarefaAgendada != null && !tarefaAgendada.isCancelled()) {
            tarefaAgendada.cancel(false);
            log.info("Agendamento anterior cancelado");
        }

        // Agenda com Spring TaskScheduler
        tarefaAgendada = taskScheduler.scheduleAtFixedRate(() -> {
            try {
                log.info("=== BACKUP AGENDADO INICIADO ===");
                String resultado = realizarBackup();
                ultimoStatus = "Sucesso: " + resultado;
                ultimoHorario = Instant.now().toString();
                log.info("=== BACKUP AGENDADO CONCLUIDO: {} ===", resultado);
            } catch (Throwable e) {
                ultimoStatus = "Erro: " + e.getMessage();
                ultimoHorario = Instant.now().toString();
                log.error("=== ERRO NO BACKUP AGENDADO: {} ===", e.getMessage(), e);
            }
        }, horarioInicio, intervalo);

        String horarioFormatado = horarioInicio
                .atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        ultimoStatus = "Agendado - próximo em: " + horarioFormatado;

        log.info("Backup agendado com frequencia {} a partir de {}", descricaoFrequencia, horarioFormatado);

        return String.format(
                "Backup agendado com sucesso! Frequencia: %s. Proximo backup em: %s",
                descricaoFrequencia,
                horarioFormatado
        );
    }

    public String getStatus() {
        return ultimoStatus + (ultimoHorario != null ? " (última execução: " + ultimoHorario + ")" : "");
    }

    public List<String> listarBackups() {
        File backupDirectory = new File(backupDir);
        if (!backupDirectory.exists() || !backupDirectory.isDirectory()) {
            return Collections.emptyList();
        }

        File[] sqlFiles = backupDirectory.listFiles((dir, name) -> name.endsWith(".sql"));
        if (sqlFiles == null || sqlFiles.length == 0) {
            return Collections.emptyList();
        }

        // Ordena pelo mais recente primeiro (lastModified descendente)
        return Arrays.stream(sqlFiles)
                .sorted((a, b) -> Long.compare(b.lastModified(), a.lastModified()))
                .map(File::getName)
                .collect(Collectors.toList());
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
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode == 0) {
            return "Restore realizado com sucesso!";
        }

        throw new RuntimeException("Erro ao realizar restore: " + output);
    }
}
