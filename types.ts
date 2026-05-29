
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SMILE_PROGRAM = 'SMILE_PROGRAM',
  DESIGN_THINKING = 'DESIGN_THINKING',
  ASSESSMENT = 'ASSESSMENT',
  LESSON_PLANNER = 'LESSON_PLANNER',
  CONTENT_STUDIO = 'CONTENT_STUDIO',
  COLLABORATION = 'COLLABORATION',
  SELF_DEV = 'SELF_DEV',
  CONTENT_MANAGER = 'CONTENT_MANAGER' // New Admin View
}

export enum UserRole {
  GURU = 'Guru',
  FASILITATOR = 'Fasilitator',
  KEPALA_SEKOLAH = 'Kepala Sekolah',
  PENELITI = 'Peneliti',
  ADMIN = 'Admin'
}

// --- GAMIFICATION SYSTEM ---
export enum GamificationAction {
  LOGIN = 'LOGIN',
  // Learning
  COMPLETE_MODULE = 'COMPLETE_MODULE',
  SUBMIT_REFLECTION = 'SUBMIT_REFLECTION',
  // Creation
  CREATE_LESSON_PLAN = 'CREATE_LESSON_PLAN',
  GENERATE_QUIZ = 'GENERATE_QUIZ',
  GENERATE_LKPD = 'GENERATE_LKPD',
  // Innovation (Design Thinking)
  DT_EMPATHY = 'DT_EMPATHY',
  DT_IDEATE = 'DT_IDEATE',
  DT_PROTOTYPE = 'DT_PROTOTYPE',
  DT_TEST = 'DT_TEST',
  // Collaboration
  POST_DISCUSSION = 'POST_DISCUSSION',
  PEER_REVIEW = 'PEER_REVIEW',
  // Admin & Other
  CREATE_KOKURIKULER = 'CREATE_KOKURIKULER',
  ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
  PERSONA_CHECK = 'PERSONA_CHECK'
}

export const XP_VALUES: Record<GamificationAction, number> = {
  [GamificationAction.LOGIN]: 10,
  
  [GamificationAction.COMPLETE_MODULE]: 50,
  [GamificationAction.SUBMIT_REFLECTION]: 100,
  
  [GamificationAction.CREATE_LESSON_PLAN]: 150, // High effort
  [GamificationAction.GENERATE_LKPD]: 50,
  [GamificationAction.GENERATE_QUIZ]: 75,
  
  [GamificationAction.DT_EMPATHY]: 40,
  [GamificationAction.DT_IDEATE]: 40,
  [GamificationAction.DT_PROTOTYPE]: 50,
  [GamificationAction.DT_TEST]: 60,
  
  [GamificationAction.POST_DISCUSSION]: 30,
  [GamificationAction.PEER_REVIEW]: 50, // Incentivize helping others
  
  [GamificationAction.CREATE_KOKURIKULER]: 120,
  [GamificationAction.ASSESSMENT_COMPLETE]: 80,
  [GamificationAction.PERSONA_CHECK]: 25
};

// --- SHARED CONTEXT FOR INTEGRATION ---
export interface ContentGenerationContext {
  mapel: string;
  jenjang: string;
  kelas: string;
  topik: string;
  sourceContent: string; // The generated Lesson Plan content
}

// --- MASTERY PROGRESS TYPES (Gamification 2.0) ---

export enum MasteryLevel {
  EXPLORER = 'Explorer',
  INTEGRATOR = 'Integrator',
  DESIGNER = 'Designer',
  FACILITATOR = 'Facilitator',
  MENTOR = 'Mentor'
}

export enum EvidenceType {
  E1_DT = 'E1_DT', // Design Thinking Artifacts
  E2_RPP = 'E2_RPP', // RPP/Modul Ajar
  E3_ITEMBANK = 'E3_ITEMBANK', // Soal & Materi
  E4_IMPLEMENT = 'E4_IMPLEMENT', // Implementasi Kelas
  E5_FEEDBACK = 'E5_FEEDBACK', // Peer Feedback
  E6_TEST = 'E6_TEST' // Tes & Skala
}

export interface RubricScore {
  quality: number; // 0-100
  completeness: number; // 0-100
  impact: number; // 0-100
  finalScore: number; // Calculated weighted average
  level: 0 | 1 | 2 | 3 | 4; // 0-4 Scale
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  dateSubmitted: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'NEEDS_REVISION' | 'APPROVED';
  rubric?: RubricScore;
  feedback?: string;
}

export interface MasteryProfile {
  level: MasteryLevel;
  overallScore: number; // 0-100
  clusterScores: {
    A: number; // Literasi Numerasi (15%)
    B: number; // Pedagogi (15%)
    C: number; // Asesmen (50%)
    D: number; // Pengembangan Diri (20%)
  };
  evidenceHistory: Evidence[];
}

export interface NextBestAction {
  id: string;
  title: string;
  description: string;
  reason: string;
  actionLabel: string;
  targetView: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// --------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: TeacherProfile;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

export interface TeacherProfile {
  id: string;
  name: string;
  school: string;
  subject: string;
  xpPoints: number;
  level: string; // Legacy simple level
  mastery?: MasteryProfile; // New Mastery Profile
  badges: Badge[];
  // Extended Profile
  experienceYears?: string;
  curriculum?: string;
  persona?: TeacherPersonaResult;
  role?: UserRole; // Added Role for persistence
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: Date;
  unlocked: boolean;
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  type: 'COURSE' | 'TASK' | 'QUIZ' | 'PROJECT';
  xpReward: number;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: Comment[];
  isAiGenerated?: boolean;
  timestamp: Date;
  type: 'DISCUSSION' | 'PEER_REVIEW';
  attachments?: string[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  rating?: number; // 1-5 stars for peer review
}

export interface GeneratedContent {
  title: string;
  content: string;
  type: 'RPP' | 'QUIZ' | 'MATERIAL';
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface LearningMaterialResult {
  summary: string;
  quiz: QuizItem[];
  flashcards: Flashcard[];
  glossary: GlossaryItem[];
}

export interface TeacherPersonaResult {
  persona_result: string;
  confidence_score: string;
  ui_recommendation: string;
  reasoning: string;
}

export interface ValidationCriteria {
  criteria: string;
  score: number; // 1-4
  comment: string;
}

export interface LessonPlanValidationResult {
  scores: ValidationCriteria[];
  feedback: {
    star1: string;
    star2: string;
    wish: string;
  };
}

// --- SMILE Specific Types ---

export enum SmilePhase {
  IN1 = 'IN-1 (Tatap Muka)',
  ON = 'ON (Praktik Mandiri)',
  IN2 = 'IN-2 (Refleksi & Presentasi)'
}

export enum SmileCluster {
  A = 'Cluster A (Literasi Numerasi)',
  B = 'Cluster B (Pedagogi)',
  C = 'Cluster C (Asesmen)',
  D = 'Cluster D (Pengembangan Diri)'
}

export interface SmileModule {
  id: string;
  code: string; // e.g., "A.1"
  title: string;
  description: string;
  phase: SmilePhase;
  cluster: SmileCluster;
  durationJP: number;
  status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED';
  videoUrl?: string;
}

// --- LMS Content Types (Shared) ---
export interface LmsActivity {
  id: string;
  code: string;
  title: string;
  type: 'VIDEO' | 'MATERIAL' | 'QUIZ' | 'ASSIGNMENT' | 'FORUM' | 'LINK' | 'SURVEY' | 'CHECKLIST' | 'MEETING';
  duration: string; // e.g., "10 menit"
  description: string;
  videoUrl?: string; // Optional
  fileUrl?: string; // Optional for PDF/Docs
  quizData?: QuizItem[]; // Optional for Interactive Quiz
}

export interface LmsModule {
  id: string;
  title: string;
  activities: LmsActivity[];
}

export interface DesignThinkingArtifact {
  stage: 'EMPATHIZE' | 'DEFINE' | 'IDEATE' | 'PROTOTYPE' | 'TEST';
  content: any;
  lastUpdated: Date;
}

export interface AssessmentScore {
  type: 'PRE_TEST' | 'POST_TEST' | 'ATTITUDE' | 'RUBRIC';
  score: number;
  maxScore: number;
  date: Date;
  details?: string;
}

// --- Question Generator Types ---

export interface QuestionRequest {
  userType: string;
  language: string;
  jenjang: string;
  kelas: string;
  mapel: string;
  kurikulum: string;
  semester: string;
  topik: string;
  subElemen?: string;
  uploadedFileContent?: string;
  uploadedFileName?: string;
  kompetensiMode: string;
  kompetensiManual?: string;
  answerKeyDetail: string;
  
  jenisSoal: string[];
  jumlahPerJenis: Record<string, number>;
  jumlah: number;
  jumlahOpsi: number;
  
  enableImageMode: boolean;
  imageQuantity: number;
  
  gayaBahasa: string;
  useStimulus: boolean;
  jenisStimulus?: string;
  soalPerStimulus?: number;
  
  level: string;
  distribusiMode: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: QuestionRequest;
  content: string;
}

export type RefineActionType = 'ANALYSIS' | 'AUDIT' | 'KISI_KISI' | 'SIMILARITY' | 'CONVERT_AKM' | 'CONVERT_ESSAY' | 'LEVEL_UP';

// --- Kokurikuler Types ---

export enum DocumentType {
  PROGRAM = 'PROGRAM',
  RENCANA = 'RENCANA',
  LAPORAN = 'LAPORAN',
  EVALUASI = 'EVALUASI',
  MONITORING = 'MONITORING',
  KEGIATAN_WAJIB = 'KEGIATAN_WAJIB',
  PARENTING = 'PARENTING'
}

export enum SchoolType {
  UMUM = 'UMUM',
  MADRASAH = 'MADRASAH'
}

export interface KokurikulerFormData {
  schoolName: string;
  schoolType: SchoolType;
  documentType: DocumentType;
  academicYear: string;
  headmaster: string;
  coordinator: string;
  theme: string;
  activityName: string;
  targetAudience: string;
  date: string;
  venue: string;
  frequency: string;
  activityCategory: string;
  generalGoal: string;
  specificGoal: string;
  successIndicators: string;
  flow: string;
  resources: string;
  attachmentDescription: string;
  paiElement: string;
  notes: string;
}

// --- Deep Learning Module Generator Types (NEW) ---

export enum SchoolMode {
  UMUM = 'SEKOLAH UMUM',
  MADRASAH = 'MADRASAH'
}

export interface ModuleRequest {
  mode: SchoolMode | null;
  
  // STEP 1: Identitas
  satuanPendidikan: string;
  namaGuru: string;
  mataPelajaran: string;
  jenjang: string;
  fase: string;
  kelas: string;
  semester: string;
  tahunPelajaran: string;
  alokasiWaktuJP: string;
  jumlahPertemuan: string;
  
  // STEP 2: Kondisi Peserta Didik
  pengetahuanAwal: string;
  minatBelajar: string;
  latarBelakang: string;

  // STEP 3: Karakteristik Materi
  topik: string;
  domainNumerasi: string; // NEW
  konteksNumerasi: string; // NEW
  levelKognitif: string; // NEW
  konteksNyata: string; // PjBL/PBL Context

  // Administrasi
  namaKepalaSekolah: string;
  nipGuru: string;
  nipKepalaSekolah: string;
  tanggal: string;

  // Referensi Tambahan
  uploadedFileContent?: string;
  uploadedFileName?: string;
}

export interface LKPDRequest {
  pertemuanKe: string;
  durasiMenit: string;
  fokusKemampuan: string[];
}

export type StepValidation = {
  isValid: boolean;
  missingFields: string[];
};
