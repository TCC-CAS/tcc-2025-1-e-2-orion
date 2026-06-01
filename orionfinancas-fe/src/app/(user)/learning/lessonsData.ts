/** Tipagens compartilhadas entre a trilha de aprendizado e os quizzes API. Sem dados mockados. */

export type QuizQuestionType = "multipleChoice" | "matching" | "dragDrop";

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  options?: string[];
  leftColumn?: string[];
  rightColumn?: string[];
  correctOptionIndex?: number;
  correctMapping?: Record<string, string>;
}

export interface Quiz {
  _id: string;
  title: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id?: string;
  _id?: string;
  tituloLicao: string;
  conteudo: string;
  bulletPoints?: string[];
  imageUrl?: string;
  conteudoAdicional?: string;
}
