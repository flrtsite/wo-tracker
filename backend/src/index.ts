import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import * as jwtSigner from 'jsonwebtoken';
import { db } from './db';
import { adminApp } from './admin-routes';
import { sets, exercises, workoutTemplates, templateExercises, userSchedules } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret30days';
const CORRECT_PIN = process.env.APP_PIN || '1234';

app.use('*', cors());
app.route('/api/admin', adminApp);

app.post('/api/data/sync', async (c) => {
  const data = await c.req.json();
  console.log("Received sync data sets length:", data.sets?.length);
  if (data.sets && data.sets.length > 0) {
    try {
      // Postgres needs Date objects for timestamp
      const mappedSets = data.sets.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }));
      await db.insert(sets).values(mappedSets).onConflictDoNothing();
      return c.json({ success: true, syncedCount: mappedSets.length });
    } catch (err) {
      console.error(err);
      return c.json({ error: 'Failed to sync sets' }, 500);
    }
  }
  return c.json({ success: true, syncedCount: 0 });
});

// Sync Down Endpoint (Sends all reference data to frontend for offline use)
app.get('/api/data/sync-down', async (c) => {
  try {
    const allTemplates = await db.query.workoutTemplates.findMany();
    const allExercises = await db.query.exercises.findMany();
    const allTemplateExercises = await db.query.templateExercises.findMany();
    const allSchedules = await db.query.userSchedules.findMany();
    const allSets = await db.query.sets.findMany();
    
    return c.json({
      templates: allTemplates,
      exercises: allExercises,
      templateExercises: allTemplateExercises,
      schedules: allSchedules,
      sets: allSets
    });
  } catch (error) {
    return c.json({ error: 'Failed to sync down data' }, 500);
  }
});

// "Copy Last" Feature Endpoint
// Fetches the last set for a specific exercise
app.get('/api/data/exercises/:id/last-set', async (c) => {
  const exerciseId = c.req.param('id');
  
  try {
    const lastSet = await db.query.sets.findFirst({
      where: eq(sets.exerciseId, exerciseId),
      orderBy: [desc(sets.createdAt)],
    });
    
    return c.json(lastSet || null);
  } catch (error) {
    return c.json({ error: 'Failed to fetch last set' }, 500);
  }
});

// Setup Endpoint to insert mock exercises and templates
app.post('/api/setup', async (c) => {
  try {
    const existing = await db.query.exercises.findMany();
    if (existing.length > 0) {
      return c.json({ message: 'Data already exists!' });
    }

    // 1. Insert mock exercises
    const newExercises = await db.insert(exercises).values([
      { name: 'Static Bike', trackingType: 'duration' },
      { name: 'Bench Press', trackingType: 'reps' },
      { name: 'Incline Dumbbell Press', trackingType: 'reps' },
      { name: 'Cable Crossover', trackingType: 'reps' },
      { name: 'Tricep Pushdown', trackingType: 'reps' },
      { name: 'Overhead Extension', trackingType: 'reps' }
    ]).returning();

    // 2. Insert Template "Upper A"
    const [template] = await db.insert(workoutTemplates).values({
      name: 'Upper A',
      description: 'Chest & Triceps Focus'
    }).returning();

    // 3. Link Exercises to Template
    await db.insert(templateExercises).values([
      { templateId: template.id, exerciseId: newExercises[0].id, groupType: 'warmup', orderIndex: 1 },
      { templateId: template.id, exerciseId: newExercises[1].id, groupType: 'main', orderIndex: 2 },
      { templateId: template.id, exerciseId: newExercises[2].id, groupType: 'main', orderIndex: 3 },
      { templateId: template.id, exerciseId: newExercises[3].id, groupType: 'main', orderIndex: 4 },
      { templateId: template.id, exerciseId: newExercises[4].id, groupType: 'main', orderIndex: 5 },
      { templateId: template.id, exerciseId: newExercises[5].id, groupType: 'main', orderIndex: 6 }
    ]);

    // 4. Schedule it for Monday (1)
    await db.insert(userSchedules).values({
      dayOfWeek: 1, // 1 = Monday
      templateId: template.id
    });

    return c.json({ success: true, message: 'Template Upper A created and scheduled for Monday!' });
  } catch (error) {
    return c.json({ error: 'Failed to insert data' }, 500);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
