import Dexie, { type Table } from 'dexie';

export interface SetRecord {
  id: string;
  sessionGroupId: string;
  exerciseId: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  createdAt: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
}

export interface ExerciseRecord {
  id: string;
  name: string;
  trackingType: 'weight_reps' | 'duration';
}

export interface TemplateExerciseRecord {
  id: string;
  templateId: string;
  exerciseId: string;
  groupType: string;
  orderIndex: number;
  targetReps?: number;
}

export interface ScheduleRecord {
  id: string;
  dayOfWeek: number;
  templateId: string;
}

export class WorkoutDatabase extends Dexie {
  sets!: Table<SetRecord>;
  templates!: Table<TemplateRecord>;
  exercises!: Table<ExerciseRecord>;
  templateExercises!: Table<TemplateExerciseRecord>;
  schedules!: Table<ScheduleRecord>;

  constructor() {
    super('WorkoutTrackerDB');
    this.version(2).stores({
      sets: 'id, sessionGroupId, exerciseId, createdAt',
      templates: 'id',
      exercises: 'id',
      templateExercises: 'id, templateId',
      schedules: 'id, dayOfWeek'
    });
  }
}

export const db = new WorkoutDatabase();
