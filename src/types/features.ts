// ── Weak Zone Radar ───────────────────────────────────────────────

export type WeakZoneLabel = 'Critical' | 'Weak' | 'Needs Practice' | 'Good';

export interface WeakZone {
  topicName: string;
  totalAttempts: number;
  wrongCount: number;
  wrongRatePct: number;
  label: WeakZoneLabel;
}

// ── Daily Challenge ───────────────────────────────────────────────

export interface ChallengeMCQ {
  id: string;
  question: string;
  options: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface DailyChallenge {
  challengeId: string;
  date: string;
  alreadyCompleted: boolean;
  score: number | null;
  mcqs: ChallengeMCQ[];
}

export interface ChallengeResult {
  mcqId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  wrongOptionExplanations?: Record<string, string>;
}

export interface ChallengeSubmitResponse {
  score: number;
  total: number;
  results: ChallengeResult[];
}

// ── Current Affairs ───────────────────────────────────────────────

export interface CurrentAffairsArticle {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  publishedDate: string;
  summary: string;
  keyFacts: string[];
  gsPaperTags: string[];
  topicTags: string[];
  mainsAngle: string;
  examRelevance: Record<string, boolean>;
}

// ── Mains Answer Writing ──────────────────────────────────────────

export interface MainsQuestion {
  id: string;
  question_text: string;
  marks: number;
  word_limit: number;
  topic_tag: string;
  source: string;
}

export interface EvalBreakdown {
  introduction: { score: number; feedback: string };
  bodyDepth:    { score: number; feedback: string };
  coverage:     { score: number; feedback: string };
  examples:     { score: number; feedback: string };
  conclusion:   { score: number; feedback: string };
}

export interface MainsEvaluation {
  totalScore: number;
  breakdown: EvalBreakdown;
  keyStrengths: string[];
  criticalGaps: string[];
  missingKeywords: string[];
  improvedOutline: string;
}

export interface MainsSubmitResponse {
  score: number;
  outOf: number;
  wordCount: number;
  evaluation: MainsEvaluation;
}

export interface MyMainsAnswer {
  id: string;
  questionId: string;
  answerText: string;
  score: number;
  outOf: number;
  wordCount: number;
  submittedAt: string;
}

// ── Study Plan ────────────────────────────────────────────────────

export type StudyActivity =
  | 'flashcards'
  | 'mcq_practice'
  | 'answer_writing'
  | 'current_affairs'
  | 'mock_test';

export interface StudyPlanDay {
  day: number;
  primaryTopic: string;
  revisionTopic: string;
  activity: StudyActivity;
  tip: string;
}

export interface StudyPlan {
  examDate: string;
  daysRemaining: number;
  examType: string;
  weakTopicsCount: number;
  plan: StudyPlanDay[];
}
