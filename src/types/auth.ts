export type TargetExam =
  | 'UPSC_CSE'
  | 'SSC_CGL'
  | 'SSC_CHSL'
  | 'IBPS_PO'
  | 'IBPS_CLERK'
  | 'RRB_NTPC'
  | 'NDA_CDS'
  | 'STATE_PSC';

export const TARGET_EXAM_LABELS: Record<TargetExam, string> = {
  UPSC_CSE:   'UPSC Civil Services (CSE)',
  SSC_CGL:    'SSC CGL',
  SSC_CHSL:   'SSC CHSL',
  IBPS_PO:    'IBPS PO',
  IBPS_CLERK: 'IBPS Clerk',
  RRB_NTPC:   'RRB NTPC',
  NDA_CDS:    'NDA / CDS',
  STATE_PSC:  'State PSC',
};

export interface UserStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
  isActiveToday: boolean;
}

export interface UserAiUsage {
  used: number;
  remaining: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Backend returns snake_case or camelCase; accept both for safety
  createdAt?: string;
  created_at?: string;
  profile_picture_url?: string;
  target_exam?: TargetExam;
  targetExam?: TargetExam;
  exam_date?: string;
  optional_subject?: string;
  is_admin?: boolean;
  isAdmin?: boolean;
  streak?: UserStreak;
  aiUsage?: UserAiUsage;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
