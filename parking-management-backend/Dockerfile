#Stage 1: build
FROM maven:3.9.9-amazoncorretto-21-alpine AS build

WORKDIR /app
# Copy pom.xml riêng trước để tận dụng cache Docker 
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Sau đó mới copy source code
COPY src ./src

#Build source code với maven
RUN mvn package -DskipTests

#Stage 2: runtime
FROM amazoncorretto:21.0.6-alpine3.21

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV LANG=C.UTF-8
ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]