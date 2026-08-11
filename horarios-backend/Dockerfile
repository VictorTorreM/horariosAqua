# Etapa 1: compilar el proyecto con Maven (esta imagen no se publica,
# solo se usa para generar el .jar)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: imagen final, mucho más ligera — solo lleva un JRE (no el JDK
# completo ni Maven) y el .jar ya compilado de la etapa anterior.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
