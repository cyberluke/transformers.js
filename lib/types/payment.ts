import { z } from "zod";

// Frontend request schéma (z subscription-plans.tsx)
export const frontendPaymentSchema = z.object({
  planId: z.string().min(1, "ID plánu je povinné"),
  billingInfo: z.object({
    firstName: z.string().min(1, "Jméno je povinné"),
    lastName: z.string().min(1, "Příjmení je povinné"),
    email: z.string().email("Neplatný formát emailu"),
    company: z.string().optional(),
    address: z.string().min(1, "Adresa je povinná"),
    city: z.string().min(1, "Město je povinné"),
    postalCode: z.string().min(1, "PSČ je povinné"),
    country: z.string().min(1, "Země je povinná"),
    vatNumber: z.string().optional(),
  }),
});

// Payment finish webhook schéma (z externího serveru)
export const paymentFinishWebhookSchema = z.object({
  order_id: z.string(),
  detail: z.string(), // JSON string který se bude parsovat
  apiKey: z.string(),
});

// Typy
export type FrontendPaymentRequest = z.infer<typeof frontendPaymentSchema>;
export type PaymentFinishWebhook = z.infer<typeof paymentFinishWebhookSchema>;