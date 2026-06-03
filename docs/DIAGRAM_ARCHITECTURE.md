# Diagramme d'Architecture de Code (NestJS)

Ce diagramme représente l'organisation des modules, services et contrôleurs du projet.

```mermaid
classDiagram
    direction TB

    %% Modules Globaux
    class PrismaModule
    class CloudinaryModule

    %% Identity Module
    subgraph Identity
        class AuthModule
        class UserModule
        class AdminModule
    end

    %% Content Module
    subgraph Content
        class CategoryModule
        class ContinentModule
        class CountryModule
        class QuizModule
    end

    %% Gameplay Module
    subgraph Gameplay
        class GameModule
        class ProgressionModule
        class ChallengeModule
        class BattleModule
    end

    %% Engine Module
    subgraph Engine
        class RagModule
    end

    %% Social Module
    subgraph Social
        class FriendModule
    end

    %% Architecture Typique d'un Module (Exemple: Challenge)
    class ChallengeController {
        +create()
        +updateStatus()
        +findAll()
    }
    class ChallengeService {
        +create()
        +findAll()
    }
    class ChallengeTaskService {
        +handleExpiredChallenges()
        +handleStartedChallenges()
    }

    ChallengeModule *-- ChallengeController
    ChallengeModule *-- ChallengeService
    ChallengeModule *-- ChallengeTaskService
    
    %% Interactions Services
    ChallengeService ..> PrismaService : utilise
    ChallengeTaskService ..> PrismaService : utilise
    
    AuthService ..> UserService : utilise
    BattleService ..> PrismaService : utilise
    GameService ..> PrismaService : utilise
    
    %% Gateway
    class BattleGateway {
        +handleConnection()
        +onBattleAction()
    }
    BattleModule *-- BattleGateway

    %% Global Providers
    class PrismaService {
        <<Provider>>
        +onModuleInit()
        +query()
    }
    PrismaModule *-- PrismaService
```

### Couches de l'Architecture :

1.  **Controllers** : Gèrent les requêtes HTTP et renvoient les réponses.
2.  **Services** : Contiennent la logique métier (calculs, règles, validation complexe).
3.  **Gateways** : Gèrent les communications en temps réel via WebSockets (Socket.io).
4.  **Providers** : Fournissent des fonctionnalités globales (Accès base de données, Upload Cloudinary).
5.  **Modules** : Encapsulent et organisent les fonctionnalités par domaine.
