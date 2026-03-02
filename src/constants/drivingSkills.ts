/**
 * GDS Driving School — Driving Skills & Skill Levels
 * =====================================================
 *
 * Complete list of driving skills and assessment levels used
 * by instructors when giving lesson feedback to students.
 * Matches the web application's FeedbackModal exactly.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillFeedback = {
  skill: string;
  rating: number;
};

export type FeedbackAction = 'submit' | 'cancel' | 'lesson_cancelled';

export type SkillLevelDef = {
  value: number;
  label: string;
  description: string;
  color: string;
};

// ─── Driving Skills ───────────────────────────────────────────────────────────

export const DRIVING_SKILLS: readonly string[] = [
  'Vehicle Safety Checks',
  'Cockpit Drill',
  'Precautions',
  'Ancillary Controls',
  'Hand signals',
  'Mirrors (Use of mirrors)',
  'Steering',
  'Accelerator',
  'Clutch',
  'Gears',
  'Footbrake',
  'Parking Brake',
  'Move off',
  'Change direction',
  'Speed Control',
  'Change speed',
  'Signalling',
  'Positioning',
  'Approach speed',
  'Observation',
  'Awareness & Planning',
  'T-Junctions',
  'Turning Left',
  'Turning Right',
  'Crossroads',
  'Meeting traffic',
  'Overtaking',
  'Pedestrian Crossings',
  'Clearance',
  'Following Distance',
  'Roundabouts',
  'Mini Roundabouts',
  'Spiral Roundabouts',
  'Road Markings',
  'Signs',
  'Traffic Controllers',
  'Anticipation',
  'Use of Speed',
  'Parking Bay (Forward)',
  'Parking Bay (Reverse)',
  'Park On The Right',
  'Parallel Park',
  '3 Point Turn',
  'Reverse around a Corner',
  'Emergency Stop',
  'Dual Carriageways',
  'Slip Roads',
  'Motorways',
  'Country Roads',
  'Adverse Weather & Visibility',
  'Vulnerable Road Users',
  'Eco Driving',
  'Independent Driving / Navigation',
] as const;

// ─── Skill Levels ─────────────────────────────────────────────────────────────

export const SKILL_LEVELS: readonly SkillLevelDef[] = [
  {
    value: 1,
    label: 'Introduced',
    description: 'Skill introduced for the first time',
    color: '#FF453A',
  },
  {
    value: 2,
    label: 'Guided',
    description: 'Guided practice required',
    color: '#FF9F0A',
  },
  {
    value: 3,
    label: 'Prompted',
    description: 'Occasional prompts required',
    color: '#FFD700',
  },
  {
    value: 4,
    label: 'Light Prompts',
    description: 'Minimal prompts required',
    color: '#00D4FF',
  },
  {
    value: 5,
    label: 'Independent',
    description: 'Can perform without assistance',
    color: '#30D158',
  },
] as const;
