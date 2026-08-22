import { pgTable, uuid, timestamp, varchar, integer, numeric, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -------------------------------------------------------------
// EXISTING CORE TABLES
// -------------------------------------------------------------
export const dailyPlans = pgTable('daily_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  trackingType: varchar('tracking_type', { length: 50 }).notNull().default('weight_reps'), // 'weight_reps' or 'duration'
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyPlanId: uuid('daily_plan_id').references(() => dailyPlans.id),
  templateId: uuid('template_id'), // Will reference workoutTemplates dynamically if used
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'),
});

export const sessionGroups = pgTable('session_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutSessionId: uuid('workout_session_id').references(() => workoutSessions.id).notNull(),
  groupName: varchar('group_name', { length: 255 }).notNull(),
  orderIndex: integer('order_index').notNull(),
});

export const sets = pgTable('sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionGroupId: varchar('session_group_id', { length: 255 }).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  setNumber: integer('set_number').notNull(),
  weightKg: numeric('weight_kg'), // nullable for duration sets
  reps: integer('reps'), // nullable for duration sets
  durationSec: integer('duration_sec'), // for duration sets
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// -------------------------------------------------------------
// NEW TABLES FOR ADMIN (TEMPLATES & SCHEDULES)
// -------------------------------------------------------------

export const workoutTemplates = pgTable('workout_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(), // e.g. "Upper A"
  description: varchar('description', { length: 500 }),
});

export const templateExercises = pgTable('template_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => workoutTemplates.id).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  groupType: varchar('group_type', { length: 50 }).notNull(), // 'warmup' or 'main'
  orderIndex: integer('order_index').notNull(), // e.g. 1, 2, 3...
  targetReps: integer('target_reps'),
});

export const userSchedules = pgTable('user_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  templateId: uuid('template_id').references(() => workoutTemplates.id).notNull(),
});

// -------------------------------------------------------------
// RELATIONS (For Drizzle Studio Dropdowns)
// -------------------------------------------------------------

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  template: one(workoutTemplates, {
    fields: [templateExercises.templateId],
    references: [workoutTemplates.id],
  }),
  exercise: one(exercises, {
    fields: [templateExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const userSchedulesRelations = relations(userSchedules, ({ one }) => ({
  template: one(workoutTemplates, {
    fields: [userSchedules.templateId],
    references: [workoutTemplates.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  dailyPlan: one(dailyPlans, {
    fields: [workoutSessions.dailyPlanId],
    references: [dailyPlans.id],
  }),
  groups: many(sessionGroups),
}));

export const sessionGroupsRelations = relations(sessionGroups, ({ one, many }) => ({
  session: one(workoutSessions, {
    fields: [sessionGroups.workoutSessionId],
    references: [workoutSessions.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [sets.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ many }) => ({
  templateExercises: many(templateExercises),
  schedules: many(userSchedules),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  templateExercises: many(templateExercises),
  sets: many(sets),
}));
