'use server';

/**
 * @fileOverview Provides personalized luxury style advice based on user preferences.
 *
 * - getStyleAdvice - A function that generates personalized luxury style advice.
 * - StyleAdvisorInput - The input type for the getStyleAdvice function.
 * - StyleAdvisorOutput - The return type for the getStyleAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleAdvisorInputSchema = z.object({
  favoriteColor: z
    .string()
    .describe('The user\'s preferred color for clothing or accessories.'),
  favoriteBrand: z
    .string()
    .describe('The user\'s favorite luxury brand (e.g., Rolex, Gucci, Nike, Adidas, Patek Philippe).'),
  // Height and weight might be less relevant for watches/sneakers, but keep for apparel context.
  height: z
    .number()
    .optional()
    .describe('The user\'s height in centimeters (optional, mainly for apparel).'),
  weight: z
    .number()
    .optional()
    .describe('The user\'s weight in kilograms (optional, mainly for apparel).'),
  itemType: z
    .string()
    .describe('The type of item the user is interested in (e.g., Watch, Sneakers, Handbag, Apparel).'), // Added item type
  intendedUseCase: z
    .string()
    .describe('The intended use case or occasion (e.g., Everyday Wear, Special Event, Collecting, Sport).'), // Renamed field
  preferredStyle: z
    .string()
    .describe('The user\'s preferred style (e.g., Classic, Streetwear, Minimalist, Sporty, Elegant).'),
});
export type StyleAdvisorInput = z.infer<typeof StyleAdvisorInputSchema>;

const StyleAdvisorOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Personalized luxury style advice focusing on the specified item type, brands, and preferences.'
    ),
});
export type StyleAdvisorOutput = z.infer<typeof StyleAdvisorOutputSchema>;

export async function getStyleAdvice(input: StyleAdvisorInput): Promise<StyleAdvisorOutput> {
  return styleAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleAdvisorPrompt',
  input: {schema: StyleAdvisorInputSchema},
  output: {schema: StyleAdvisorOutputSchema},
  prompt: `You are a personal advisor for a luxury goods boutique specializing in watches, high-end sneakers, designer apparel, and accessories.

  Based on the user\'s preferences, desired item type, and intended use case, provide personalized style advice.

  User Preferences:
  - Item Type of Interest: {{{itemType}}}
  - Favorite Color: {{{favoriteColor}}}
  - Favorite Luxury Brand: {{{favoriteBrand}}}
  {{#if height}}- Height (cm): {{{height}}}{{/if}}
  {{#if weight}}- Weight (kg): {{{weight}}}{{/if}}
  - Intended Use Case: {{{intendedUseCase}}}
  - Preferred Style: {{{preferredStyle}}}

  Provide detailed recommendations for the specified item type ({{{itemType}}}).
  Suggest specific models or pieces from the user's favorite brand ({{{favoriteBrand}}}) or similar luxury brands (like Rolex, Patek Philippe, Audemars Piguet for watches; Nike, Adidas, Balenciaga, Gucci for sneakers; Gucci, Prada, Hermès for bags/apparel) that fit the user's style and intended use.
  If suggesting apparel, consider body type if height/weight are provided.
  Explain why the suggestions are suitable.
  Mention current trends if relevant.
  `,
});

const styleAdvisorFlow = ai.defineFlow(
  {
    name: 'styleAdvisorFlow',
    inputSchema: StyleAdvisorInputSchema,
    outputSchema: StyleAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
