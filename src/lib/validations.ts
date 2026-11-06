import { z } from "zod";

const COMMON_PASSWORDS = ["password","password123","welcome1","welcome123","123456","12345678","qwerty","abc123","letmein","admin","iloveyou","monkey","dragon","master","sunshine"];
const HAS_SEQUENCE = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/i;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter (A-Z)")
  .regex(/[a-z]/, "Include at least one lowercase letter (a-z)")
  .regex(/[0-9]/, "Include at least one number (0-9)")
  .regex(/[@#$%!*^&()_\-+=\[\]{};':",./<>?]/, "Include at least one special character (@, #, $, %, !, *)")
  .refine((pw) => !HAS_SEQUENCE.test(pw), "Avoid sequential letters or numbers (e.g. 1234, abcd, qwerty)")
  .refine((pw) => !COMMON_PASSWORDS.includes(pw.toLowerCase()), "This password is too common. Choose a more unique one.");

export const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  acceptTerms: z.literal(true, { error: "You must accept the terms" }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  couponCode: z.string().optional(),
  acceptPolicies: z.literal(true, { error: "You must accept the policies" }),
});

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  priceRupees: z.number().positive("Price must be positive"),
  originalPriceRupees: z.number().positive().optional(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  seriesId: z.string().nullable().optional(),
  seriesOrder: z.number().int().nullable().optional(),
  pageCount: z.number().int().positive().optional(),
  language: z.string().default("English"),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const seriesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["percent", "flat"]),
  discountValue: z.number().positive(),
  expiresAt: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  enabled: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type SeriesInput = z.infer<typeof seriesSchema>;
