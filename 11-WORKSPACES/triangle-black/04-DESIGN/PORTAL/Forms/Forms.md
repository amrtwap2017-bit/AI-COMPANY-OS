# Forms — Form Patterns

All forms use **React Hook Form** for state management and **Zod** for schema validation.

## Stack

| Library            | Purpose                          |
| ------------------ | -------------------------------- |
| eact-hook-form  | Form state, dirty tracking       |
| @hookform/resolvers | Zod resolver integration     |
| zod              | Schema definition + validation   |
| zod-i18n         | Localized validation messages    |

## Form Pattern Template

`	ypescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

const bookingSchema = z.object({
  propertyId: z.string().uuid(),
  guestId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(100),
  children: z.number().int().min(0).max(50).default(0),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const t = useTranslations('bookings.form');
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { adults: 1, children: 0 },
  });

  const onSubmit = async (data: BookingFormData) => {
    // mutation
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField label={t('property')} error={form.formState.errors.propertyId}>
        <Select {...form.register('propertyId')}>
          <option value="">{t('selectProperty')}</option>
          {/* options */}
        </Select>
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
`

## FormField Wrapper

`	ypescript
// src/components/forms/form-field.tsx
interface FormFieldProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
`

## Form Validation Rules

| Pattern         | Zod Schema                              |
| --------------- | --------------------------------------- |
| Required text   | z.string().min(1, 'Required')         |
| Email           | z.string().email('Invalid email')     |
| UUID            | z.string().uuid('Invalid ID')         |
| Future date     | z.string().refine(d => new Date(d) > new Date()) |
| Positive number | z.number().positive()                 |
| Phone           | z.string().regex(/^\+?[\d\s-]{7,15}$/) |
| Enum            | z.enum(['ACTIVE', 'INACTIVE'])        |

## Form List

| Form               | Schema File                  | Fields                                           |
| ------------------ | ---------------------------- | ------------------------------------------------ |
| LoginForm          | uth.schema.ts             | email, password                                  |
| RegisterForm       | uth.schema.ts             | name, email, password, confirmPassword           |
| BookingForm        | ooking.schema.ts          | propertyId, guestId, checkIn, checkOut, adults, children, addons |
| PropertyForm       | property.schema.ts         | name, type, address, maxGuests, baseRate, amenities |
| GuestForm          | guest.schema.ts            | firstName, lastName, email, phone, nationality, idDocument |
| UserForm           | uth.schema.ts             | name, email, role, propertyAssignments           |
| SettingsForm       | settings.schema.ts         | language, theme, notifications                   |

## Submission States

| State          | UI Behavior                                   |
| -------------- | --------------------------------------------- |
| Idle           | Form ready for input                          |
| Submitting     | Button disabled + spinner, fields disabled    |
| Success        | Toast notification, form reset or redirect    |
| Error          | Inline error messages, toast for server errors|
