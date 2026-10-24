import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  pricePaise: z.number().int().positive("Price must be positive"),
  originalPricePaise: z.number().int().positive().optional(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  pageCount: z.number().int().positive().optional(),
  language: z.string().default("English"),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
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
