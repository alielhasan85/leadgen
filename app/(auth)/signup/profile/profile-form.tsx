// apps/platform/app/[locale]/(auth)/signup/profile/profile-form.tsx
'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { BUSINESS_TYPES, COUNTRIES } from '@menumize/utils';
import { profileSchema, type ProfileSchema } from '@/lib/validators/user.validator';
import { finishOnboardingAction } from '@/lib/actions/auth/onboarding.actions';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@menumize/ui';

export default function ProfileForm({
  initialValues = { name: '', phone: '', businessName: '' },
}: {
  initialValues?: Partial<ProfileSchema>;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('auth.profile');
  const tConstants = useTranslations('constants');
  const locale = useLocale();

  const defaultCountryCode = COUNTRIES.find((c) => c.code === 'QA')?.code ?? COUNTRIES[0].code;

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialValues.name ?? '',
      phone: initialValues.phone ?? '',
      businessName: initialValues.businessName ?? '',
      businessType: BUSINESS_TYPES[0].value,
      countryCode: initialValues.countryCode ?? defaultCountryCode,
    },
    mode: 'onTouched',
  });

  const onSubmit = (values: ProfileSchema) => {
    startTransition(async () => {
      try {
        // Server action should normalize:
        //   phone -> phoneE164 + phoneCountry
        await finishOnboardingAction(values, locale);
      } catch (err) {
        console.error(err);
        toast(
          t('error', {
            fallback: 'There was an error saving your profile. Please try again or sign in again.',
          }),
        );
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-center">
            {t('title', { fallback: 'Welcome to Menumize' })}
          </CardTitle>
          <CardDescription className="text-center">
            {t('subtitle', { fallback: 'Tell us about yourself. What is your name?' })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name', { fallback: 'Name' })}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('namePlaceholder', { fallback: 'Your name' })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone (raw input; server will normalize) */}
              <FormField
                control={form.control}
                name="phone"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('phone', { fallback: 'Phone Number' })}</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="phone"
                        render={({ field: { onChange, value } }) => (
                          <PhoneInput
                            // Use current country selection as the default for the phone picker
                            defaultCountry={(form.watch('countryCode') || 'QA').toLowerCase()}
                            preferredCountries={['qa', 'sa', 'ae', 'lb', 'tr']}
                            forceDialCode
                            value={value || ''}
                            onChange={(v) => onChange(v)}
                            className="w-full"
                            inputClassName="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-xs"
                            inputProps={{
                              id: 'phone',
                              name: 'phone',
                              autoComplete: 'tel',
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business name */}
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('businessName', { fallback: 'Business Name' })}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('businessNamePlaceholder', {
                          fallback: 'Your business name',
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business type */}
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('businessType', { fallback: 'Business Type' })}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((bt) => (
                            <SelectItem key={bt.value} value={bt.value}>
                              {tConstants(bt.translationKey, { fallback: bt.value })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country (ISO-2) */}
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country', { fallback: 'Country' })}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {tConstants(c.translationKey, { fallback: c.code })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending
                    ? t('submitting', { fallback: 'Submitting...' })
                    : t('submit', { fallback: 'Start Free Trial' })}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
