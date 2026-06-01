# Orion Finanças - Backend

## Configuração do Banco de Dados

### Coleções Necessárias

#### 1. missions
Armazena as missões disponíveis no sistema.
- `title`: string
- `description`: string
- `frequency`: "DAILY" | "WEEKLY" | "ONCE"
- `targetCount`: number (quanto de 'actionTrigger' é necessário)
- `reward`: { xp: number, coins: number }
- `actionTrigger`: string (ex: "PERFECT_QUIZ", "DAILY_LOGIN")
- `createdAt`: date
- `updatedAt`: date

#### 2. user_missions
Rastreia o progresso individual de cada usuário em cada missão.
- `userId`: ObjectId (referência a users)
- `missionId`: ObjectId (referência a missions)
- `currentCount`: number (progresso atual)
- `status`: "IN_PROGRESS" | "COMPLETED" | "CLAIMED"
- `updatedAt`: date
- `claimedAt`: date (quando o usuário resgatou a recompensa)

### Endpoints de Missões

- `GET /api/missions`: Lista todas as missões (para Admin/User)
- `POST /api/missions`: Cria nova missão (para Admin)
- `PUT /api/missions/:id`: Atualiza missão (para Admin)
- `DELETE /api/missions/:id`: Deleta missão (para Admin)
- `GET /api/missions/user`: Lista missões com o progresso do usuário logado
- `POST /api/missions/claim`: Resgata a recompensa de uma missão completada (corpo: `{ missionId }`)

### Endpoints de Quizzes

- `GET /api/quizzes`: Lista todos os quizzes (para Admin/User)
- `POST /api/quizzes/complete`: Registra conclusão de um quiz e dispara gatilhos de missão (corpo: `{ quizId, score, totalQuestions }`)

## Status do Projeto - Missões

- [x] Backend: CRUD completo de Missões (Admin)
- [x] Backend: Serviço de progresso e resgate de recompensas (XP/Coins)
- [x] Backend: Gatilhos de missão (ex: PERFECT_QUIZ)
- [x] Backend: Scripts de seed e manutenção de campos (createdAt/updatedAt)
- [x] Frontend: Página de missões do usuário com carregamento de API
- [x] Frontend: Botão de resgate de recompensas integrado ao saldo
- [x] Frontend: Gestão administrativa de missões (CRUD completo)
- [x] Frontend: Integração com sidebar administrativa