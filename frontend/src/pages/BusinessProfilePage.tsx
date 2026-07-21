import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Building2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { profileService } from '@/services/profileService';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const profileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100),
  tradeName: z.string().max(100).optional().or(z.literal('')),
  ein: z
    .string()
    .min(1, 'EIN is required')
    .regex(/^\d{2}-?\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number'),
  efin: z.string().max(6).optional().or(z.literal('')),
  etin: z.string().max(8).optional().or(z.literal('')),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactPhone: z
    .string()
    .min(1, 'Contact phone is required')
    .regex(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const BusinessProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        reset({
          businessName: profile.businessName,
          tradeName: profile.tradeName || '',
          ein: profile.ein,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          phone: profile.phone,
          efin: profile.efin || '',
          etin: profile.etin || '',
          contactName: profile.contactName,
          contactPhone: profile.contactPhone,
        });
      } catch {
        // Profile doesn't exist yet, that's fine
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await profileService.createOrUpdateProfile({
        ...data,
        tradeName: data.tradeName || undefined,
        efin: data.efin || undefined,
        etin: data.etin || undefined,
      });
      toast.success('Business profile saved successfully!');
      reset(data);
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size={40} text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Business Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your business information for Form 941 filings.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Business Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="businessName" className="input-label">
                Business Name (Legal Name)
              </label>
              <input
                id="businessName"
                type="text"
                className={`input-field ${errors.businessName ? 'border-red-500' : ''}`}
                {...register('businessName')}
              />
              {errors.businessName && <p className="input-error">{errors.businessName.message}</p>}
            </div>

            <div>
              <label htmlFor="tradeName" className="input-label">
                Trade Name (DBA)
              </label>
              <input
                id="tradeName"
                type="text"
                className="input-field"
                placeholder="Optional"
                {...register('tradeName')}
              />
            </div>

            <div>
              <label htmlFor="ein" className="input-label">
                Employer Identification Number (EIN)
              </label>
              <input
                id="ein"
                type="text"
                className={`input-field ${errors.ein ? 'border-red-500' : ''}`}
                placeholder="XX-XXXXXXX"
                {...register('ein')}
              />
              {errors.ein && <p className="input-error">{errors.ein.message}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Business Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address" className="input-label">
                Street Address
              </label>
              <input
                id="address"
                type="text"
                className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                {...register('address')}
              />
              {errors.address && <p className="input-error">{errors.address.message}</p>}
            </div>

            <div>
              <label htmlFor="city" className="input-label">
                City
              </label>
              <input
                id="city"
                type="text"
                className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                {...register('city')}
              />
              {errors.city && <p className="input-error">{errors.city.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="input-label">
                  State
                </label>
                <select
                  id="state"
                  className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                  {...register('state')}
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="input-error">{errors.state.message}</p>}
              </div>

              <div>
                <label htmlFor="zipCode" className="input-label">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
                  placeholder="XXXXX"
                  {...register('zipCode')}
                />
                {errors.zipCode && <p className="input-error">{errors.zipCode.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="input-label">
                Business Phone
              </label>
              <input
                id="phone"
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(XXX) XXX-XXXX"
                {...register('phone')}
              />
              {errors.phone && <p className="input-error">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* E-File Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">E-File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="efin" className="input-label">
                EFIN (Electronic Filing Identification Number)
              </label>
              <input
                id="efin"
                type="text"
                className="input-field"
                placeholder="Optional"
                {...register('efin')}
              />
            </div>

            <div>
              <label htmlFor="etin" className="input-label">
                ETIN (Electronic Transmitter Identification Number)
              </label>
              <input
                id="etin"
                type="text"
                className="input-field"
                placeholder="Optional"
                {...register('etin')}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="input-label">
                Contact Name
              </label>
              <input
                id="contactName"
                type="text"
                className={`input-field ${errors.contactName ? 'border-red-500' : ''}`}
                {...register('contactName')}
              />
              {errors.contactName && <p className="input-error">{errors.contactName.message}</p>}
            </div>

            <div>
              <label htmlFor="contactPhone" className="input-label">
                Contact Phone
              </label>
              <input
                id="contactPhone"
                type="tel"
                className={`input-field ${errors.contactPhone ? 'border-red-500' : ''}`}
                placeholder="(XXX) XXX-XXXX"
                {...register('contactPhone')}
              />
              {errors.contactPhone && (
                <p className="input-error">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSaving || !isDirty}>
            {isSaving ? (
              <LoadingSpinner size={20} />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfilePage;
