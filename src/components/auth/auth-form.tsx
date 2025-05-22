
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import type { AuthError } from 'firebase/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRY_CODES } from '@/data/country-codes';

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  phoneCountryCode: z.string().min(1, { message: "Country code is required." }).regex(/^\+\d{1,3}$/, { message: "Invalid country code format (e.g. +1)"}),
  phoneNumber: z.string().min(7, { message: "Phone number must be at least 7 digits." }).regex(/^\d{7,15}$/, { message: "Phone number must contain only digits."}),
  street: z.string().min(3, { message: "Street address is required (min 3 chars)." }).max(200),
  city: z.string().min(1, { message: "City is required." }).max(100),
  state: z.string().min(1, { message: "State/Province is required." }).max(100),
  zip: z.string().min(3, { message: "ZIP/Postal code is required." }).max(20),
  country: z.string().min(1, { message: "Country for address is required." }).max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

export function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneCountryCode: '',
      phoneNumber: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      await signUpWithEmail(values);
      toast({
        title: "Congratulations!",
        description: "Your account has been successfully created. Welcome to Elite Stuff Trade!"
      });
      setTimeout(() => { // Added timeout for better UI experience
        router.push('/profile');
      }, 500);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        toast({
          title: "Sign Up Failed",
          description: "This email is already registered. Please sign in or use a different email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: authError.message || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(values);
      toast({ title: "Signed In", description: "Welcome back to Elite Stuff Trade!" });
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      toast({ title: "Sign In Failed", description: authError.message || "Invalid credentials or an unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 md:py-12 min-h-screen relative">
       <div className="absolute inset-0 -z-10">
       </div>
      <Tabs defaultValue="signin" className="w-full max-w-4xl relative z-10"> {/* Wider for signup, login will be constrained */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card className="shadow-xl w-full max-w-md mx-auto"> {/* Constrain login card */}
            <CardHeader className="p-4">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Welcome Back</CardTitle>
              <CardDescription className="text-sm md:text-base">Sign in to access your account and explore luxury goods.</CardDescription>
            </CardHeader>
            <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
              <CardContent className="space-y-2 p-4">
                <div className="space-y-1">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" placeholder="you@example.com" {...signInForm.register("email")} />
                  {signInForm.formState.errors.email && <p className="text-sm text-destructive mt-0.5">{signInForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" placeholder="••••••••" {...signInForm.register("password")} />
                  {signInForm.formState.errors.password && <p className="text-sm text-destructive mt-0.5">{signInForm.formState.errors.password.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="shadow-xl w-full"> {/* Signup card uses full width of Tabs */}
            <CardHeader className="p-4">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Create Account</CardTitle>
              <CardDescription className="text-sm md:text-base">Join Elite Stuff Trade to discover exclusive items.</CardDescription>
            </CardHeader>
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4"> {/* Reduced gap-y */}
                
                <fieldset className="space-y-2 p-3 border rounded-md md:col-span-1"> {/* Reduced space-y */}
                  <legend className="text-lg font-medium text-foreground px-1">Personal Information</legend>
                  <div className="space-y-0.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" {...signUpForm.register("firstName")} />
                      {signUpForm.formState.errors.firstName && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-0.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" {...signUpForm.register("lastName")} />
                      {signUpForm.formState.errors.lastName && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.lastName.message}</p>}
                  </div>
                </fieldset>

                <fieldset className="space-y-2 p-3 border rounded-md md:col-span-1"> {/* Reduced space-y */}
                  <legend className="text-lg font-medium text-foreground px-1">Contact Information</legend>
                  <div className="space-y-0.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" {...signUpForm.register("email")} />
                    {signUpForm.formState.errors.email && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 items-start"> {/* Reduced gap-x */}
                    <div className="space-y-0.5 col-span-1">
                      <Label htmlFor="phoneCountryCode">Country Code</Label> {/* Changed label */}
                      <Controller
                        name="phoneCountryCode"
                        control={signUpForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} >
                            <SelectTrigger id="phoneCountryCode" aria-label="Country code">
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_CODES.map(country => (
                                <SelectItem key={country.iso} value={country.code}>
                                  {`${country.code} (${country.name})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {signUpForm.formState.errors.phoneCountryCode && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.phoneCountryCode.message}</p>}
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input id="phoneNumber" type="tel" placeholder="1234567890" {...signUpForm.register("phoneNumber")} />
                      {signUpForm.formState.errors.phoneNumber && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.phoneNumber.message}</p>}
                    </div>
                  </div>
                </fieldset>
                
                <fieldset className="space-y-2 p-3 border rounded-md md:col-span-2"> {/* Reduced space-y */}
                  <legend className="text-lg font-medium text-foreground px-1">Default Shipping Address</legend>
                  <div className="space-y-0.5">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" placeholder="123 Luxury Lane" {...signUpForm.register("street")} />
                    {signUpForm.formState.errors.street && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Reduced gap */}
                    <div className="space-y-0.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Beverly Hills" {...signUpForm.register("city")} />
                      {signUpForm.formState.errors.city && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" placeholder="CA" {...signUpForm.register("state")} />
                      {signUpForm.formState.errors.state && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.state.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Reduced gap */}
                    <div className="space-y-0.5">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" placeholder="90210" {...signUpForm.register("zip")} />
                      {signUpForm.formState.errors.zip && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.zip.message}</p>}
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="USA" {...signUpForm.register("country")} />
                      {signUpForm.formState.errors.country && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.country.message}</p>}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-2 p-3 border rounded-md md:col-span-2"> {/* Reduced space-y */}
                  <legend className="text-lg font-medium text-foreground px-1">Password</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Reduced gap */}
                    <div className="space-y-0.5">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" placeholder="••••••••" {...signUpForm.register("password")} />
                        {signUpForm.formState.errors.password && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.password.message}</p>}
                    </div>
                    <div className="space-y-0.5">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" {...signUpForm.register("confirmPassword")} />
                        {signUpForm.formState.errors.confirmPassword && <p className="text-sm text-destructive mt-0.5">{signUpForm.formState.errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                </fieldset>

              </CardContent>
              <CardFooter className="p-4">
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
