
'use server';
/**
 * @fileOverview A chatbot flow to find luxury products based on user queries.
 *
 * - findProducts - A function that handles searching for products based on a user query.
 * - ProductFinderInput - The input type for the findProducts function.
 * - ProductFinderOutput - The return type for the findProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MOCK_PRODUCTS } from '@/data/products'; // Import mock product data
import type { Product } from '@/types';

// Prepare product data for the prompt (simple serialization)
// Updated to reflect new Product type with imageUrls
const productDataString = MOCK_PRODUCTS.map(p =>
  `- ID: ${p.id}, Name: ${p.name}, Brand: ${p.brand || 'N/A'}, Category: ${p.category}, Price: $${p.price.toFixed(2)}, Description: ${p.description}, Images: ${p.imageUrls.length} available ${p.videoUrl ? ', Video available' : ''}`
).join('\n');

const ProductFinderInputSchema = z.object({
  query: z.string().describe('The user\'s query about products.'),
});
export type ProductFinderInput = z.infer<typeof ProductFinderInputSchema>;

const ProductFinderOutputSchema = z.object({
  reply: z.string().describe('The chatbot\'s response to the user query, potentially listing products.'),
  foundProducts: z.array(z.object({
    id: z.string().describe('The ID of the found product.'),
    name: z.string().describe('The name of the found product.')
  })).optional().describe('A list of products found that match the query. Ensure id and name exactly match the provided product list.')
});
export type ProductFinderOutput = z.infer<typeof ProductFinderOutputSchema>;

export async function findProducts(input: ProductFinderInput): Promise<ProductFinderOutput> {
  return productFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productFinderPrompt',
  input: {schema: ProductFinderInputSchema},
  output: {schema: ProductFinderOutputSchema},
  prompt: `You are an AI assistant for Luxe Collective, a luxury goods boutique.
Your goal is to help users find products based on their descriptions.
You have access to the following product list. Base your answers ONLY on this list. Do not invent products or details.

Available Products:
${productDataString}

User Query: {{{query}}}

Analyze the user's query and identify any matching products from the list.
- If you find matching products:
    - In your textual 'reply', list their Name, Brand, and Price. Mention you found them in the collection.
    - Also, populate the 'foundProducts' structured field with an array, where each item contains the 'id' and 'name' of a matching product. Ensure the 'id' and 'name' exactly match the ones from the product list provided.
- If the query is too vague (e.g., "show me something nice"), provide a textual 'reply' asking for more details like category, brand, or style. Do not populate 'foundProducts'.
- If no products match the query, provide a textual 'reply' politely stating that you couldn't find matching items in the current collection based on their request. Do not populate 'foundProducts'.
- Keep your textual 'reply' concise and helpful.
`,
});

const productFinderFlow = ai.defineFlow(
  {
    name: 'productFinderFlow',
    inputSchema: ProductFinderInputSchema,
    outputSchema: ProductFinderOutputSchema,
  },
  async (input) => {
    // Here, we directly pass the query to the prompt which includes the product data.
    // For a larger dataset, a Tool calling a database/search service would be more appropriate.
    const { output } = await prompt(input);
    return output!;
  }
);

