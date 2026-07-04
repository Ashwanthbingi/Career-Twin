# Build stage
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAM=256m -XX:MaxRAMPercentage=70 -XX:InitialRAMPercentage=20 -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -Dspring.main.lazy-initialization=true"
ENTRYPOINT ["java", "-jar", "app.jar"]
