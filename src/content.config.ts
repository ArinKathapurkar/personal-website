import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    year: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    stack: z.array(z.string()),
    role: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/now' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(['building', 'reading', 'exploring']),
    blurb: z.string(),
    link: z.string().optional(),
  }),
});

export const collections = { projects, now };
