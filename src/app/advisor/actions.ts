"use server";

import { getStyleAdvice, type StyleAdvisorInput, type StyleAdvisorOutput } from '@/ai/flows/style-advisor';
import { z } from 'zod';

const StyleAdvisorFormSchema = z.object({
  favoriteColor: z.string().min(1, "Favorite color is required."),
  favoriteBrand: z.string().min(1, "Favorite brand is required."),
  height: z.coerce.number().min(50, "Height must be at least 50cm.").max(300, "Height cannot exceed 300cm.").optional(), // Made optional
  weight: z.coerce.number().min(20, "Weight must be at least 20kg.").max(300, "Weight cannot exceed 300kg.").optional(), // Made optional
  itemType: z.string().min(1, "Item type is required."), // Added item type
  intendedUseCase: z.string().min(1, "Intended use case is required."), // Renamed field
  preferredStyle: z.string().min(1, "Preferred style is required."),
});

export type StyleAdvisorFormState = {
  message?: string | null;
  advice?: string | null;
  errors?: {
    favoriteColor?: string[];
    favoriteBrand?:string[];
    height?: string[];
    weight?: string[];
    itemType?: string[]; // Added item type errors
    intendedUseCase?: string[]; // Renamed field errors
    preferredStyle?: string[];
    general?: string[];
  };
  status: 'idle' | 'loading' | 'success' | 'error';
};

export async function submitStyleAdvice(
  prevState: StyleAdvisorFormState,
  formData: FormData
): Promise<StyleAdvisorFormState> {

  const validatedFields = StyleAdvisorFormSchema.safeParse({
    favoriteColor: formData.get('favoriteColor'),
    favoriteBrand: formData.get('favoriteBrand'),
    height: formData.get('height') || undefined, // Handle optional number coercion
    weight: formData.get('weight') || undefined, // Handle optional number coercion
    itemType: formData.get('itemType'), // Added item type
    intendedUseCase: formData.get('intendedUseCase'), // Renamed field
    preferredStyle: formData.get('preferredStyle'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
      status: 'error',
    };
  }

  // Filter out undefined optional fields before passing to the AI flow
  const inputData: StyleAdvisorInput = Object.fromEntries(
      Object.entries(validatedFields.data).filter(([_, v]) => v !== undefined)
    ) as StyleAdvisorInput;


  try {
    const result: StyleAdvisorOutput = await getStyleAdvice(inputData);
    return {
      message: "Style advice generated successfully!",
      advice: result.advice,
      status: 'success',
    };
  } catch (error) {
    console.error("Error getting style advice:", error);
    return {
      message: "Failed to get style advice. Please try again later.",
      errors: { general: ["An unexpected error occurred."] },
      status: 'error',
    };
  }
}
