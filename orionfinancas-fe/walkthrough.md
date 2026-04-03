# Walkthrough: Mission Functionality

I have successfully connected the frontend "Learning" trail and "Quizzes" to the backend mission system. Actions like completing an lesson or finishing a quiz now trigger mission progress automatically.

## Changes Made

### Backend (`orionfinancas-be`)
- **[NEW] [lessonsController.js](file:///c:/Users/Regui/source/repos/orionfinancas-be/controllers/lessonsController.js)**: Handles lesson completion tracking in `user_lesson_progress`.
- **[NEW] [trailsController.js](file:///c:/Users/Regui/source/repos/orionfinancas-be/controllers/trailsController.js)**: Provides real data from the `content_trails` collection.
- **[MODIFY] [quizzesController.js](file:///c:/Users/Regui/source/repos/orionfinancas-be/controllers/quizzesController.js)**: Now uses the real `quizzes` collection and saves attempts to `user_quiz_attempts`.
- **[MODIFY] [index.js](file:///c:/Users/Regui/source/repos/orionfinancas-be/index.js)**: Registered new routes: `/api/lessons`, `/api/quizzes`, and `/api/trails`.

### Frontend (`orionfinancas-fe`)
- **[MODIFY] [Learning Page](file:///c:/Users/Regui/source/repos/orionfinancas-fe/src/app/(user)/learning/page.tsx)**:
  - Replaced mock `MODULOS` with dynamic data from the backend.
  - Implemented real state management for lesson progress.
  - Connected "Próximo" (Next) and "Finalizar Quiz" (Finish Quiz) buttons to the backend APIs.

---

## How to Verify

1. **Start the Backend**:
   - Ensure the server is running on port 5000.
2. **Access the Learning Path**:
   - Go to the "Aprendizado" (Learning) section in the app.
   - You should see your modules being loaded from the database.
3. **Complete an Lesson**:
   - Click on a module and then on an lesson.
   - Read through and click "Próximo".
   - Check the "Missões" page; you should see progress in missions like "Primeiros Passos" (Complete 1 lesson).
4. **Complete a Quiz**:
   - Finish an lesson that has a quiz.
   - Complete the quiz.
   - Progress should be tracked for quiz-related missions.

---

## Technical Details

- **Lesson Progress**: Stored in `user_lesson_progress`.
- **Quiz Attempts**: Stored in `user_quiz_attempts`.
- **Mission Triggers**: `COMPLETE_LESSON`, `COMPLETE_QUIZ`, `PERFECT_QUIZ`.
