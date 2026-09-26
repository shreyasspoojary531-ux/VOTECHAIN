import { z } from 'zod';

export const createMockAadhaarBodySchema = z.object({
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  dateOfBirth: z.union([
    z.string().min(1, 'Date of birth is required'),
    z.number(),
    z.date(),
  ]),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').optional(),
  mobileNumber: z.string().trim().min(10, 'Mobile number must be at least 10 digits').optional(),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(300),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type CreateMockAadhaarBody = z.infer<typeof createMockAadhaarBodySchema>;
