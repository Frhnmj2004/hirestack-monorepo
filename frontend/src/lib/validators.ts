import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createJobSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    department: z.string().min(2, 'Department is required'),
    location: z.string().min(2, 'Location is required'),
    description: z.string().min(50, 'Please provide a detailed description (min 50 chars)'),
});
