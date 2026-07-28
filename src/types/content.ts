export interface Content {
  id: string;
  title: string;
  raw_text?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  contentId: string;
  summary: string;
  created_at: string;
}

export interface Topic {
  id: string;
  contentId: string;
  name: string;
}

export interface MCQ {
  id: string;
  contentId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  wrongOptionExplanations?: Record<string, string>;
}

export interface RevisionNote {
  id: string;
  contentId: string;
  title: string;
  content: string;
}

export interface Mnemonic {
  fact: string;
  mnemonic: string;
  type: string;
}
