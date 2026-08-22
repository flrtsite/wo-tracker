import { Hono } from 'hono';
import { db } from './db';
import { exercises, workoutTemplates, templateExercises } from './db/schema';
import { eq } from 'drizzle-orm';

export const adminApp = new Hono();

adminApp.get('/exercises', async (c) => {
  const all = await db.query.exercises.findMany();
  return c.json(all);
});

adminApp.post('/exercises', async (c) => {
  const body = await c.req.json();
  const res = await db.insert(exercises).values(body).returning();
  return c.json(res[0]);
});

adminApp.put('/exercises/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const res = await db.update(exercises).set(body).where(eq(exercises.id, id)).returning();
  return c.json(res[0]);
});

adminApp.delete('/exercises/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(exercises).where(eq(exercises.id, id));
  return c.json({ success: true });
});

adminApp.get('/templates', async (c) => {
  const all = await db.query.workoutTemplates.findMany();
  return c.json(all);
});

adminApp.post('/templates', async (c) => {
  const body = await c.req.json();
  const res = await db.insert(workoutTemplates).values(body).returning();
  return c.json(res[0]);
});

adminApp.get('/template-exercises', async (c) => {
  const all = await db.query.templateExercises.findMany({
    with: { exercise: true, template: true }
  });
  return c.json(all);
});

adminApp.post('/template-exercises', async (c) => {
  const body = await c.req.json();
  const res = await db.insert(templateExercises).values(body).returning();
  return c.json(res[0]);
});

adminApp.put('/template-exercises/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const res = await db.update(templateExercises)
    .set(body)
    .where(eq(templateExercises.id, id))
    .returning();
  return c.json(res[0]);
});

adminApp.delete('/template-exercises/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(templateExercises).where(eq(templateExercises.id, id));
  return c.json({ success: true });
});
