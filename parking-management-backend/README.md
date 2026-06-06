# Parking Management System Backend

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.9-green.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![Redis](https://img.shields.io/badge/Redis-latest-red.svg)
![Docker](https://img.shields.io/badge/Docker-latest-blue.svg)

A comprehensive backend solution for managing parking operations, vehicle tracking, and revenue management.

## Overview

This project provides a complete backend implementation for a Parking Management System, designed to handle vehicle entry/exit, monthly subscriptions, staff management, reporting, and payment processing.

## Technology Stack

- **Java 21**
- **Spring Boot 3.3.9**
- **Spring Security** with JWT Authentication
- **Spring Data JPA**
- **Redis** (token blacklisting and caching)
- **MySQL** (production database)
- **Hibernate** ORM
- **MapStruct** (object mapping)
- **Project Lombok**
- **Docker & Docker Compose**

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, STAFF)
- Secure logout with token blacklisting

### Parking Management
- Vehicle entry/exit registration
- Multiple vehicle type support
- Dynamic fee calculation based on:
  - Vehicle type
  - Time of day (day/night rates)
  - Duration
  - Subscription status

### Monthly Registration
- Subscription management for regular customers
- Specialized flows for students and lecturers
- Automatic expiration handling

### Staff Management
- Complete CRUD operations
- Profile management

### Payment & Reporting
- Payment tracking and processing
- Missing vehicle reports
- Revenue statistics
- Traffic analysis

## Project Structure

```
src/main/java/com/group1/parking_management/
├── configuration/     # Application configs, Redis, JWT setup
├── controller/        # REST API endpoints
├── dto/               # Data Transfer Objects
│   ├── request/       # API request models
│   └── response/      # API response models
├── entity/            # Domain models/database entities
├── exception/         # Custom exceptions and global handler
├── mapper/            # Entity-DTO conversion
├── repository/        # Data access layer
├── security/          # Authentication, JWT filters
├── service/           # Business logic
│   └── impl/          # Service implementations
└── util/              # Utility classes
```

## Key Endpoints

### Authentication
```
POST /api/auth/login              # Authenticate user
POST /api/auth/logout             # Logout and blacklist token
PUT  /api/auth/change-password    # Update password
GET  /api/auth/my-info            # Current user information
```

### Admin Operations
```
GET|POST|PUT /api/admin/staffs          # Staff management
GET          /api/statistic/revenue     # Revenue statistics
GET          /api/statistic/traffic     # Traffic analysis
GET /api/monthly-cards/active           # Get all active monthly cards 
GET /api/monthly-cards/expire           # Get all expired monthly cards
GET /api/missing-reports                # Get all missing reports
```

### Parking Operations
```
POST /api/parking/entry      # Register vehicle entry
POST /api/parking/exit       # Process vehicle exit
GET  /api/parking/records    # Current parking records
```

### Monthly Registration
```
POST /api/monthly-cards      # Create registration
GET  /api/monthly-cards      # View registrations
```

## Setup & Installation

### Method 1: Traditional Setup

#### Prerequisites
- Java 21+
- Maven
- MySQL Database
- Redis Server

#### Configuration
1. Clone the repository:
```bash
git clone <repository-url>
cd parking-management-backend
```

2. Configure application properties:
   - Development: Edit application-dev.yaml
   - Production: Set environment variables as below

Required environment variables:
```
DB_URL               # Database connection URL
DB_USERNAME          # Database username
DB_PASSWORD          # Database password
REDIS_HOST           # Redis server host
REDIS_PORT           # Redis server port
JWT_ISSUER           # JWT issuer URI
JWT_SECRET           # Secret key for JWT signing
JWT_VALID_DURATION   # JWT token validity period
```

3. Build and run:
```bash
mvn clean install
mvn spring-boot:run -Dspring.profiles.active=dev
```

### Method 2: Docker Setup

#### Prerequisites
- Docker
- Docker Compose

#### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd parking-management-backend
```

2. Build and start all services:
```bash
docker-compose up --build
```

3. Start in detached mode (background):
```bash
docker-compose up -d --build
```

4. View logs:
```bash
docker-compose logs -f
```

5. Stop all services:
```bash
docker-compose down
```

6. Stop and remove volumes:
```bash
docker-compose down -v
```

#### Docker Environment
The Docker setup includes:
- Spring Boot application
- MySQL 8.0 database
- Redis 7.0 server

All containers are connected via a Docker network and properly configured to work together. The application container depends on MySQL and Redis being healthy before starting.

#### Database Connection in Docker
MySQL database is accessible:
- Within containers: mysql:3306
- From host machine: localhost:3308
- Username: root
- Password: password
- Database name: parking_management

#### Redis Connection in Docker
Redis is accessible:
- Within containers: redis:6379
- From host machine: localhost:6379

### Initial Setup
The application automatically initializes:
- Default admin (username: `admin`, password: `admin`)
- Vehicle types
- Default pricing
- 1000 parking cards

## Security Notes
- **IMPORTANT**: Change default admin password after first login
- All passwords are BCrypt encrypted
- JWT tokens are validated against Redis blacklist

## Development Notes
- Standardized API response format
- Domain-specific error codes
- JSR-380 request validation
- Comprehensive exception handling
- Docker ready for development and production

## Contributors
- Hoang Phi Long
...