export type TargetExam =
  | 'UPSC_CSE'
  | 'SSC_CGL'
  | 'SSC_CHSL'
  | 'STATE_PSC';

export const TARGET_EXAM_LABELS: Record<TargetExam, string> = {
  UPSC_CSE:  'UPSC Civil Services',
  SSC_CGL:   'SSC CGL',
  SSC_CHSL:  'SSC CHSL',
  STATE_PSC: 'State PSC',
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  target_exam?: TargetExam;
  exam_date?: string;
  optional_subject?: string;
  is_admin?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
