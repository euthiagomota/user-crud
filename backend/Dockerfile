# ===== BUILD =====
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# instala utilitário pra corrigir CRLF do Windows
RUN apt-get update && \
    apt-get install -y dos2unix && \
    rm -rf /var/lib/apt/lists/*

# copia arquivos do Gradle primeiro (cache melhor)
COPY gradlew ./
COPY build.gradle ./
COPY settings.gradle ./
COPY gradle ./gradle

# corrige quebra de linha + permissão
RUN dos2unix gradlew && chmod +x gradlew

# baixa dependências
RUN ./gradlew --no-daemon dependencies || true

# código fonte
COPY src ./src

# gera jar
RUN ./gradlew --no-daemon clean bootJar -x test


# ===== RUNTIME =====
FROM eclipse-temurin:17-jre

# postgres client
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]