# Diagramme de Base de Données (ERD)

Ce diagramme représente la structure des tables et leurs relations définies dans le fichier `prisma/schema.prisma`.

```mermaid
erDiagram
    USER ||--o{ BATTLE : "battlesAsUser1 / battlesAsUser2"
    USER ||--o{ BATTLE : "battlesWon"
    USER ||--o{ GAMES : plays
    USER ||--o{ TOKEN : owns
    USER ||--o{ USER_CATEGORY : has_scores
    USER ||--o| USER_PROPRIETY : has
    USER ||--o| USER_LEVEL : reaches
    USER ||--o{ USER_RANK_OFFLINE : ranked_in
    USER ||--o{ USER_RANK_ONLINE : ranked_in
    USER ||--o{ GAME_SESSION : starts
    USER ||--o| USER_STAT : has
    USER ||--o{ FRIENDSHIP : "sends/receives" \
    USER ||--o{ BATTLE_INVITE : "sends/receives"
    USER ||--o{ CHALLENGE_USER : participates

    CHALLENGE ||--o{ CHALLENGE_USER : "includes_users"

    COUNTRY ||--o{ QUIZ : "contains_questions"
    COUNTRY ||--o{ GAMES : "game_location"
    COUNTRY ||--o{ USER_PROPRIETY : "is_native_to"
    
    CONTINENT ||--o{ COUNTRY : "groups"

    CATEGORY ||--o{ GAMES : "game_type"
    CATEGORY ||--o{ QUIZ : "quiz_type"
    CATEGORY ||--o{ USER_CATEGORY : "user_performance"

    GAME_SESSION ||--o{ GAME_SESSION_QUESTION : "contains"
    QUIZ ||--o{ GAME_SESSION_QUESTION : "is_asked_in"

    RANKED ||--o{ USER_RANK_OFFLINE : "defines"
    RANKED ||--o{ USER_RANK_ONLINE : "defines"

    USER {
        string id PK
        string username
        string email
        string password
        date dateOfBirth
        boolean isActivate
        string color
        usertype userType
    }

    CHALLENGE {
        string id PK
        string description
        datetime startAt
        datetime endAt
        challenge_status status
        int score
        boolean isPublic
    }

    BATTLE {
        string id PK
        string user1Id FK
        string user2Id FK
        string winnerId FK
        datetime battleStartAt
        datetime battleEndAt
    }

    QUIZ {
        string id PK
        string categoryId FK
        string countryId FK
        string question
        string answer
        difficulty difficulty
    }
```

### Légende :
- **PK** : Primary Key (Clé Primaire)
- **FK** : Foreign Key (Clé Étrangère)
- **||--o{** : Relation Un-à-Plusieurs (One-to-Many)
- **||--o|** : Relation Un-à-Un (One-to-One)
