FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

CMD ["java", "-jar", "target/ecommerce-api-0.0.1-SNAPSHOT.jar"]