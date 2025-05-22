"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { submitStyleAdvice, type StyleAdvisorFormState } from '@/app/advisor/actions';
import { Sparkles, Terminal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select

const initialState: StyleAdvisorFormState = {
  status: 'idle',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={pending}>
      {pending ? "Getting Advice..." : "Get Luxury Advice"} <Sparkles className="ml-2 h-5 w-5"/>
    </Button>
  );
}

export function AdvisorForm() {
  const [state, formAction, isPending] = useActionState(submitStyleAdvice, initialState);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Sparkles className="mr-3 h-8 w-8 text-accent" />
            Personal Luxury Advisor
          </CardTitle>
          <CardDescription>
            Tell us your preferences, and our AI will craft personalized advice for luxury watches, sneakers, apparel, and more.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Type Select */}
              <div className="space-y-2">
                 <Label htmlFor="itemType">Item Type</Label>
                 {/* We need Controller for Select with react-hook-form, but using basic form action here */}
                 {/* For simplicity with Server Actions, we'll use a native select or Shadcn Select w/o RHF Controller */}
                  <Select name="itemType">
                    <SelectTrigger id="itemType">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Watch">Watch</SelectItem>
                      <SelectItem value="Sneakers">Sneakers</SelectItem>
                      <SelectItem value="Handbag">Handbag</SelectItem>
                      <SelectItem value="Apparel">Apparel</SelectItem>
                      <SelectItem value="Accessory">Accessory</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                 {state.errors?.itemType && <p className="text-sm text-destructive">{state.errors.itemType.join(', ')}</p>}
              </div>

               <div className="space-y-2">
                <Label htmlFor="favoriteBrand">Favorite Luxury Brand</Label>
                <Input id="favoriteBrand" name="favoriteBrand" placeholder="e.g., Rolex, Gucci, Nike" />
                {state.errors?.favoriteBrand && <p className="text-sm text-destructive">{state.errors.favoriteBrand.join(', ')}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="favoriteColor">Preferred Color</Label>
                 <Input id="favoriteColor" name="favoriteColor" placeholder="e.g., Black, Gold, White" />
                 {state.errors?.favoriteColor && <p className="text-sm text-destructive">{state.errors.favoriteColor.join(', ')}</p>}
               </div>
               <div className="space-y-2">
                <Label htmlFor="preferredStyle">Preferred Style</Label>
                <Input id="preferredStyle" name="preferredStyle" placeholder="e.g., Classic, Streetwear, Minimalist" />
                {state.errors?.preferredStyle && <p className="text-sm text-destructive">{state.errors.preferredStyle.join(', ')}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intendedUseCase">Intended Use Case</Label>
              <Input id="intendedUseCase" name="intendedUseCase" placeholder="e.g., Everyday Wear, Special Event, Collecting" />
              {state.errors?.intendedUseCase && <p className="text-sm text-destructive">{state.errors.intendedUseCase.join(', ')}</p>}
            </div>

            {/* Optional Fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) <span className="text-muted-foreground text-xs">(Optional for apparel)</span></Label>
                <Input id="height" name="height" type="number" placeholder="e.g., 170" />
                {state.errors?.height && <p className="text-sm text-destructive">{state.errors.height.join(', ')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) <span className="text-muted-foreground text-xs">(Optional for apparel)</span></Label>
                <Input id="weight" name="weight" type="number" placeholder="e.g., 65" />
                {state.errors?.weight && <p className="text-sm text-destructive">{state.errors.weight.join(', ')}</p>}
              </div>
            </div>


            {state.errors?.general && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.errors.general.join(', ')}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPending}>
              {isPending ? "Getting Advice..." : "Get Luxury Advice"} <Sparkles className="ml-2 h-5 w-5"/>
            </Button>
          </CardFooter>
        </form>
      </Card>

      {state.status === 'success' && state.advice && (
        <Card className="mt-8 shadow-xl bg-secondary">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-accent" /> Your Personalized Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-foreground whitespace-pre-wrap">{state.advice}</p>
          </CardContent>
        </Card>
      )}
      {state.status === 'error' && state.message && !state.errors?.general && (
         <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Advice Generation Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
      )}
    </div>
  );
}
