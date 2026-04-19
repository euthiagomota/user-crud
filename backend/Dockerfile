FROM eclipse-temurin:17-jdk

# ✅ Instala cliente PostgreSQL (pg_dump / pg_restore)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN chmod +x gradlew
RUN ./gradlew clean bootJar

EXPOSE 8080
CMD ["java", "-jar", "build/libs/usermanager-0.0.1-SNAPSHOT.jar"]
