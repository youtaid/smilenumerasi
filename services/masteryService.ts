

import { Evidence, EvidenceType, MasteryLevel, MasteryProfile, RubricScore, NextBestAction } from "../types";

// Mock Data for Initial State
export const INITIAL_MASTERY_PROFILE: MasteryProfile = {
  level: MasteryLevel.EXPLORER,
  overallScore: 35,
  clusterScores: {
    A: 60, // Readiness
    B: 40, // Mindset/Pedagogi
    C: 25, // Asesmen (Needs Work - Priority)
    D: 50  // Self Dev
  },
  evidenceHistory: [
    {
        id: 'ev-1', type: EvidenceType.E1_DT, title: 'Empathy Map & POV', dateSubmitted: new Date('2024-02-01'), status: 'APPROVED',
        rubric: { quality: 80, completeness: 100, impact: 0, finalScore: 86, level: 3 }
    },
    {
        id: 'ev-2', type: EvidenceType.E6_TEST, title: 'Pre-Test Numerasi', dateSubmitted: new Date('2024-02-02'), status: 'APPROVED',
        rubric: { quality: 0, completeness: 100, impact: 0, finalScore: 100, level: 4 } // Test logic differs
    }
  ]
};

// --- LOGIC 1: SCORE CALCULATION (From PDF Section 6) ---
export const calculateEvidenceScore = (type: EvidenceType, q: number, c: number, i: number): number => {
    let wQ = 0, wC = 0, wI = 0;

    switch (type) {
        case EvidenceType.E1_DT: wQ=0.7; wC=0.3; wI=0; break;
        case EvidenceType.E2_RPP: wQ=0.7; wC=0.2; wI=0.1; break;
        case EvidenceType.E3_ITEMBANK: wQ=0.6; wC=0.3; wI=0.1; break;
        case EvidenceType.E4_IMPLEMENT: wQ=0.5; wC=0.1; wI=0.4; break;
        case EvidenceType.E5_FEEDBACK: wQ=0.8; wC=0.2; wI=0; break;
        case EvidenceType.E6_TEST: wQ=0; wC=1.0; wI=0; break;
    }

    return Math.round((q * wQ) + (c * wC) + (i * wI));
};

export const convertRubricToScore = (level: 0 | 1 | 2 | 3 | 4): number => {
    switch(level) {
        case 0: return 0;
        case 1: return 25;
        case 2: return 50;
        case 3: return 75;
        case 4: return 100;
        default: return 0;
    }
};

// --- LOGIC 2: NEXT BEST ACTION (From PDF Section 12) ---

export const getNextBestAction = (profile: MasteryProfile): NextBestAction => {
    // Rule 1: Cluster C Priority (Gap Analysis)
    if (profile.clusterScores.C < 50) {
        return {
            id: 'nba-c-boost',
            title: 'Perbaiki Kualitas Asesmen',
            description: 'Skor Cluster C (Asesmen) Anda masih di bawah standar. Buat dan validasi 1 set soal numerasi.',
            reason: 'Gap kompetensi terbesar di Asesmen.',
            actionLabel: 'Buka Studio Soal',
            targetView: 'CONTENT_STUDIO',
            priority: 'HIGH'
        };
    }

    // Rule 2: Gate to Integrator
    const hasRPP = profile.evidenceHistory.some(e => e.type === EvidenceType.E2_RPP && e.status === 'APPROVED');
    if (profile.level === MasteryLevel.EXPLORER && !hasRPP) {
        return {
            id: 'nba-gate-integrator',
            title: 'Misi Integrator: Upload RPP',
            description: 'Untuk naik ke level Integrator, Anda wajib memiliki 1 RPP Terintegrasi Numerasi yang valid.',
            reason: 'Syarat wajib kenaikan level.',
            actionLabel: 'Buat RPP Sekarang',
            targetView: 'LESSON_PLANNER',
            priority: 'HIGH'
        };
    }

    // Rule 3: Implementation (Impact)
    const hasImplement = profile.evidenceHistory.some(e => e.type === EvidenceType.E4_IMPLEMENT);
    if (profile.level === MasteryLevel.INTEGRATOR && !hasImplement) {
        return {
            id: 'nba-impact',
            title: 'Implementasi Kelas',
            description: 'RPP Anda sudah bagus. Sekarang saatnya praktikkan di kelas dan unggah bukti dampaknya.',
            reason: 'Fase ON (Praktik Mandiri) membutuhkan bukti implementasi.',
            actionLabel: 'Upload Bukti',
            targetView: 'ASSESSMENT',
            priority: 'MEDIUM'
        };
    }

    // Default Fallback
    return {
        id: 'nba-collab',
        title: 'Bantu Rekan Sejawat',
        description: 'Berikan review konstruktif pada karya rekan lain untuk poin Cluster D.',
        reason: 'Menjaga keaktifan komunitas (Social Loop).',
        actionLabel: 'Lihat Karya',
        targetView: 'COLLABORATION',
        priority: 'LOW'
    };
};

// --- LOGIC 3: CLUSTER & OVERALL CALCULATION (From PDF Section 8) ---
export const calculateOverallMastery = (clusters: {A:number, B:number, C:number, D:number}): number => {
    // Bobot: A: 15%, B: 15%, C: 50%, D: 20%
    return Math.round(
        (clusters.A * 0.15) + 
        (clusters.B * 0.15) + 
        (clusters.C * 0.50) + 
        (clusters.D * 0.20)
    );
};