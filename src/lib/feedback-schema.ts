import { z } from "zod";

export const SERVICES = [
  "Online Banking",
  "Mobile App",
  "Branch Service",
  "ATM Service",
  "Customer Support",
  "Loan Service",
] as const;

export const feedbackSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Please enter a valid email").max(255),
  account_number: z.string().trim().max(40).optional().or(z.literal("")),
  rating: z.number().int().min(1, "Please rate your experience").max(5),
  services_used: z.array(z.string()),
  feedback_comment: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters")
    .max(1000, "Maximum 1000 characters"),
  consent_given: z.boolean(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
