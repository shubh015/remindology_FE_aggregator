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

export interface PrelimsFact {
  label: string;
  value: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface CAKeyFeature {
  heading: string;
  content: string;
}

export interface EnrichedData {
  whyInNews?: string;
  keyFeatures?: CAKeyFeature[];
  prelimsFacts?: PrelimsFact[];
  keyTerms?: KeyTerm[];
  mainsAngles?: string[];
  wayForward?: string[];
  constitutionalProvisions?: string[];
  syllabusDetail?: string;
}

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
  enrichedData?: EnrichedData;
  practiceQuestions?: PracticeQuestion[];
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
  extractedText?: string;
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

// ── MCQ Analytics ─────────────────────────────────────────────────

export interface McqAnalyticsOverall {
  totalAttempted: number;
  totalCorrect: number;
  accuracyPct: number;
  avgTimeSecs: number;
}

export interface McqAnalyticsByPaper {
  paper: string;
  total: number;
  correct: number;
  accuracyPct: number;
}

export interface McqAnalyticsByTopic {
  topic: string;
  total: number;
  correct: number;
  accuracyPct: number;
}

export interface McqAnalyticsTrend {
  date: string;
  total: number;
  correct: number;
  accuracyPct: number;
}

export interface McqAnalyticsArea {
  topic: string;
  accuracyPct: number;
}

export interface McqAnalytics {
  overall: McqAnalyticsOverall;
  byPaper: McqAnalyticsByPaper[];
  byTopic: McqAnalyticsByTopic[];
  trend: McqAnalyticsTrend[];
  weakAreas: McqAnalyticsArea[];
  strongAreas: McqAnalyticsArea[];
}

export interface MainsAnalyticsTrend {
  date: string;
  score: number;
  outOf: number;
  pct: number;
  topic: string;
}

export interface MainsAnalyticsByTopic {
  topic: string;
  count: number;
  avgPct: number;
}

export interface MainsAnalytics {
  totalAnswers: number;
  avgPct: number;
  bestPct: number;
  totalTimeMins: number;
  improvementPct: number | null;
  trend: MainsAnalyticsTrend[];
  byTopic: MainsAnalyticsByTopic[];
  weakAreas: string[];
  strongAreas: string[];
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

// ── Revision Trail ────────────────────────────────────────────────

export type NoteSection = 'PRELIMS_FACT' | 'KEY_POINT' | 'KEY_TERM' | 'MAINS_ANGLE' | 'WAY_FORWARD';

export interface SavedNote {
  id: string;
  articleId: string;
  articleTitle: string;
  noteText: string;
  sourceSection: NoteSection;
  gsPaperTag?: string;
  savedAt: string;
  revisedAt?: string | null;
  revisionCount?: number;
  nextDueAt: string;
  isDue: boolean;
}

// ── General Studies ───────────────────────────────────────────────

export interface GSSubject {
  id: string;
  slug: string;
  name: string;
  gsPaperTag: string;
  displayOrder: number;
}

export interface GSCategory {
  id: string;
  subjectId: string;
  slug: string;
  name: string;
  displayOrder: number;
}

export interface GSSection {
  heading: string;
  content: string;
}

export interface GSFaq {
  question: string;
  answer: string;
}

export interface GSArticle {
  id: string;
  subjectId: string;
  categoryId: string | null;
  slug: string;
  title: string;
  rawContent: string;
  status: 'draft' | 'published';
  summary: string;
  keyPoints: string[];
  sections: GSSection[];
  mainsAngles: string[];
  faqs: GSFaq[];
  gsPaperTags: string[];
  topicTags: string[];
  readTimeMins: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GSCreateArticleInput {
  subjectSlug: string;
  categorySlug?: string;
  title: string;
  rawContent: string;
}

export interface GSUpdateArticleInput {
  title?: string;
  rawContent?: string;
}

export type PlaceCategory =
  | 'border-dispute' | 'defence' | 'disaster' | 'summit-visit'
  | 'environment-wildlife' | 'heritage-culture' | 'economy-infra' | 'other';

export interface PlaceInNews {
  id: string;
  name: string;
  context: string;
  category: PlaceCategory;
  newsDate: string;              // YYYY-MM-DD
  lat: number | null;
  lng: number | null;
  currentAffairId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceInNewsCreateInput {
  name: string;
  context: string;
  category: PlaceCategory;
  newsDate: string;
}

export interface PlaceInNewsUpdateInput {
  context?: string;
  category?: PlaceCategory;
  lat?: number;
  lng?: number;
}

// The /map endpoint filters out unresolved places server-side, so lat/lng
// are guaranteed here — the map component never has to handle a null pin.
export interface PlaceInNewsMapPoint extends Omit<PlaceInNews, 'lat' | 'lng'> {
  lat: number;
  lng: number;
}
