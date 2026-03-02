export interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface WhoopRecoveryScore {
  user_calibrating?: boolean;
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage: number | null;
  skin_temp_celsius: number | null;
}

export interface WhoopRecovery {
  cycle_id: string | number;
  sleep_id: string | number;
  user_id?: number;
  score_state?: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score: WhoopRecoveryScore;
  created_at: string;
  updated_at: string;
}

export interface WhoopSleepScore {
  stage_summary: {
    total_in_bed_time_milli: number;
    total_awake_time_milli: number;
    total_light_sleep_time_milli: number;
    total_slow_wave_sleep_time_milli: number;
    total_rem_sleep_time_milli: number;
    sleep_cycle_count: number;
    disturbance_count: number;
  };
  sleep_needed: { baseline_milli: number; need_from_sleep_debt_milli: number };
  sleep_performance_percentage: number | null;
  sleep_efficiency_percentage: number | null;
  respiratory_rate: number | null;
}

export interface WhoopSleep {
  id: string | number;
  start: string;
  end: string;
  score: WhoopSleepScore;
  nap: boolean;
}

export interface WhoopCycle {
  id: string | number;
  start: string;
  end: string | null;
  score_state?: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  } | null;
}

export interface WhoopDayData {
  recovery: WhoopRecoveryScore | null;
  sleep: {
    performancePercent: number | null;
    totalSleepHours: number;
    efficiencyPercent: number | null;
  } | null;
  strain: number | null;
}

export interface DailyLog {
  date: string;
  whoopData: WhoopDayData;
  coachingResponse: string;
  sentAt: string;
  emailId: string;
}

export interface UserReply {
  text: string;
  receivedAt: string;
  rawSubject: string;
  isAgentReply?: boolean;
}

export interface CoachingContext {
  date: string;
  dayOfWeek: string;
  weekNumber: number;
  scheduledSession: TrainingDay;
  whoop: WhoopDayData;
  whoopRecoveryFallback?: boolean;
  yesterdayReplies: UserReply[];
  rollingContext: string;
  beauty?: BeautyDayResult;
}

export interface TrainingDay {
  type: "strength" | "flexibility" | "cardio" | "rest";
  focus: string;
  session: string;
  exercises?: string[];
  guidelines?: string[];
  conditional?: { if_fatigued: string; if_energized: string };
}

export type WeeklySchedule = Record<string, TrainingDay>;

// --- Beauty Types ---

export type RoutineType =
  | "morning_default"
  | "night_metacine"
  | "night_retinoid"
  | "night_bha"
  | "night_hydration_only"
  | "postcare";

export interface BeautyRoutine {
  name: RoutineType;
  label: string;
  steps: string[];
}

export interface Procedure {
  type: string;
  date: string;
  label: string;
  details?: string[];
  preCare?: {
    stopRetinoidDaysBefore: number;
    stopBhaDaysBefore: number;
  };
  postCare?: {
    daysAfter: number;
    steps: string[];
  };
}

export interface BeautyDayResult {
  date: string;
  morningRoutine: BeautyRoutine;
  eveningRoutine: BeautyRoutine;
  specialNotes: string[];
  upcomingProcedures: Array<{ procedure: Procedure; daysUntil: number }>;
  activePostCare: Array<{ procedure: Procedure; daysSince: number }>;
}

// --- Chat Types ---

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
