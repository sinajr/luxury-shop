
"use client";

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import * as z from 'zod';
import { updateShippingAddress, type AddressFormState } from '@/app/profile/actions';

// Client-side Zod schema for validation (should match server-side)
const ClientAddressSchema = z.object({
  street: z.string().min(3, "Street address is required (min 3 chars).").max(200),
  city: z.string().min(1, "City is required.").max(100),
  state: z.string().min(1, "State/Province is required.").max(100),
  zip: z.string().min(3, "ZIP/Postal code is required.").max(20),
  country: z.string().min(1, "Country is required.").max(100),
  isDefault: z.boolean().optional(),
  idToken: z.string().min(1, "Authentication token is required."),
});
type ClientAddressFormValues = z.infer<typeof ClientAddressSchema>;

const initialAddressFormState: AddressFormState = {
  status: 'idle',
  message: null,
  errors: {},
  fieldErrors: [],
  toastMessage: undefined,
};

interface AddressFormProps {
  onSaveSuccess: (message?: string) => void;
  addressToEdit: Address;
}

export function AddressForm({ onSaveSuccess, addressToEdit }: AddressFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [idToken, setIdToken] = useState<string | null>(null);
  const [clientFormErrors, setClientFormErrors] = useState<z.ZodIssue[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Bind the addressId to the server action
  const boundUpdateShippingAddress = updateShippingAddress.bind(null, addressToEdit.id);
  const [serverState, formAction, isPending] = useActionState(boundUpdateShippingAddress, initialAddressFormState);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken).catch(err => {
        console.error("AddressForm: Error fetching ID token:", err);
        setGeneralError("Failed to get authentication token. Please try again.");
        toast({ title: "Authentication Error", description: "Could not fetch session token.", variant: "destructive"});
      });
    }
  }, [user, toast]);
  
  useEffect(() => {
    setClientFormErrors([]);
    setGeneralError(null);
  }, [addressToEdit]);

  useEffect(() => {
    if (serverState.status === 'success') {
      toast({ title: "Success", description: serverState.toastMessage || serverState.message || "Address updated." });
      onSaveSuccess(serverState.toastMessage || serverState.message);
    } else if (serverState.status === 'error') {
      if (serverState.fieldErrors && serverState.fieldErrors.length > 0) {
        setClientFormErrors(serverState.fieldErrors);
        const errorMessage = serverState.message || "Please correct the highlighted fields (server validation).";
        setGeneralError(errorMessage);
        // Toast is handled by the server action itself or a general message below
      } else {
        const errorMessage = serverState.message || "Failed to update address.";
        setGeneralError(errorMessage);
        // Toast for general server errors
        toast({ title: "Error Updating Address", description: errorMessage, variant: "destructive" });
      }
      // If FIREBASE_SERVICE_ACCOUNT_JSON error, serverState.message will contain specific guidance
      if (serverState.message?.includes("FIREBASE_SERVICE_ACCOUNT_JSON")) {
         setGeneralError(serverState.message); // Display critical error more prominently
      }
    }
  }, [serverState, toast, onSaveSuccess]);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setClientFormErrors([]);
    setGeneralError(null);

    if (!user) {
      setGeneralError("You must be logged in to update an address.");
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      event.preventDefault(); // Prevent form submission
      return;
    }
    if (!idToken) {
      setGeneralError("Authentication token is not ready. Please wait a moment and try again.");
      toast({ title: "Authentication Error", description: "Session token not ready.", variant: "destructive" });
      event.preventDefault(); // Prevent form submission
      return;
    }

    const formData = new FormData(event.currentTarget);
    const dataToValidate: ClientAddressFormValues = {
      street: formData.get('street') as string || '',
      city: formData.get('city') as string || '',
      state: formData.get('state') as string || '',
      zip: formData.get('zip') as string || '',
      country: formData.get('country') as string || '',
      isDefault: formData.get('isDefault') === 'on',
      idToken: idToken,
    };
    console.log("AddressForm (Edit): Data for client validation:", dataToValidate);

    const clientValidationResult = ClientAddressSchema.safeParse(dataToValidate);

    if (!clientValidationResult.success) {
      console.error("AddressForm (Edit): Client-side validation FAILED.", clientValidationResult.error.flatten().fieldErrors);
      setClientFormErrors(clientValidationResult.error.errors);
      setGeneralError("Please correct the highlighted fields before saving.");
      toast({
        title: "Form Input Error (Client-Side)",
        description: "Please correct the highlighted fields before saving.",
        variant: "destructive",
      });
      event.preventDefault(); // Prevent form submission if client-side validation fails
      return; 
    }
    
    console.log("AddressForm (Edit): Client-side validation PASSED. Submitting to Server Action via form's action prop...");
    // DO NOT call formAction(formData) here. Let the form's action prop handle it.
  };
  
  const getErrorForField = (fieldName: keyof Omit<ClientAddressFormValues, 'idToken'>): string | undefined => {
    const error = clientFormErrors.find(err => err.path.includes(fieldName));
    return error?.message;
  };

  return (
    // Pass formAction to the form's `action` prop
    <form onSubmit={handleSubmit} action={formAction} className="space-y-4 py-4">
      <input type="hidden" name="idToken" value={idToken || ''} />
      
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input 
          id="street" 
          name="street" 
          placeholder="123 Main St, Apt 4B" 
          defaultValue={addressToEdit?.street || ''}
          disabled={isPending || !idToken} 
          aria-invalid={!!getErrorForField('street')}
          aria-describedby={getErrorForField('street') ? 'street-error' : undefined}
        />
        {getErrorForField('street') && <p id="street-error" className="text-sm text-destructive mt-1">{getErrorForField('street')}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            placeholder="Anytown" 
            defaultValue={addressToEdit?.city || ''}
            disabled={isPending || !idToken} 
            aria-invalid={!!getErrorForField('city')}
            aria-describedby={getErrorForField('city') ? 'city-error' : undefined}
          />
          {getErrorForField('city') && <p id="city-error" className="text-sm text-destructive mt-1">{getErrorForField('city')}</p>}
        </div>
        <div>
          <Label htmlFor="state">State / Province</Label>
          <Input 
            id="state" 
            name="state" 
            placeholder="CA" 
            defaultValue={addressToEdit?.state || ''}
            disabled={isPending || !idToken}
            aria-invalid={!!getErrorForField('state')}
            aria-describedby={getErrorForField('state') ? 'state-error' : undefined}
          />
          {getErrorForField('state') && <p id="state-error" className="text-sm text-destructive mt-1">{getErrorForField('state')}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zip">ZIP / Postal Code</Label>
          <Input 
            id="zip" 
            name="zip" 
            placeholder="90210" 
            defaultValue={addressToEdit?.zip || ''}
            disabled={isPending || !idToken} 
            aria-invalid={!!getErrorForField('zip')}
            aria-describedby={getErrorForField('zip') ? 'zip-error' : undefined}
          />
          {getErrorForField('zip') && <p id="zip-error" className="text-sm text-destructive mt-1">{getErrorForField('zip')}</p>}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            name="country" 
            placeholder="USA" 
            defaultValue={addressToEdit?.country || ''}
            disabled={isPending || !idToken}
            aria-invalid={!!getErrorForField('country')}
            aria-describedby={getErrorForField('country') ? 'country-error' : undefined}
          />
          {getErrorForField('country') && <p id="country-error" className="text-sm text-destructive mt-1">{getErrorForField('country')}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isDefault" 
          name="isDefault" 
          defaultChecked={addressToEdit?.isDefault || false}
          disabled={isPending || !idToken} 
        />
        <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Set as default shipping address
        </Label>
      </div>

      {(generalError || (serverState.status === 'error' && serverState.message?.includes("FIREBASE_SERVICE_ACCOUNT_JSON"))) && (
         <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {generalError || serverState.message}
          </AlertDescription>
        </Alert>
      )}
       {serverState.status === 'error' && !serverState.message?.includes("FIREBASE_SERVICE_ACCOUNT_JSON") && !clientFormErrors.length && !generalError && (
         <Alert variant="destructive" className="mt-4">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{serverState.message || "An unexpected error occurred on the server."}</AlertDescription>
         </Alert>
       )}
      
      <Button type="submit" className="w-full" disabled={isPending || !user || !idToken}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Updating..." : "Update Address"}
      </Button>
      {(!user || !idToken) && !isPending && <p className="text-xs text-destructive text-center mt-2">You must be logged in and session ready to update an address.</p>}
    </form>
  );
}

