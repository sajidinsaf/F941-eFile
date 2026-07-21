import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FilePlus, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { filingService } from '@/services/filingService';

const currentYear = new Date().getFullYear();

const newFilingSchema = z.object({
  taxYear: z.coerce.number().min(2020).max(currentYear + 1),
  quarter: z.coerce.number().min(1).max(4),
});

type NewFilingFormData = z.infer<typeof newFilingSchema>;

const NewFilingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewFilingFormData>({
    resolver: zodResolver(newFilingSchema),
    defaultValues: {
      taxYear: currentYear,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    },
  });

  const onSubmit = async (data: NewFilingFormData) => {
    setIsLoading(true);
    try {
      const filing = await filingService.create(data);
      toast.success('Filing created successfully!');
      navigate(`/filings/${filing.id}/form941`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create filing');
    } finally {
      setIsLoading(false);
    }
  };

  const quarterLabels: Record<number, string> = {
    1: 'Q1 (January - March)',
    2: 'Q2 (April - June)',
    3: 'Q3 (July - September)',
    4: 'Q4 (October - December)',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <FilePlus className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-navy-900">New Form 941 Filing</h1>
            <p className="text-sm text-gray-500">
              Select the tax year and quarter for your new filing.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="taxYear" className="input-label">
              Tax Year
            </label>
            <select
              id="taxYear"
              className={`input-field ${errors.taxYear ? 'border-red-500' : ''}`}
              {...register('taxYear')}
            >
              {Array.from({ length: 6 }, (_, i) => currentYear - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.taxYear && <p className="input-error">{errors.taxYear.message}</p>}
          </div>

          <div>
            <label htmlFor="quarter" className="input-label">
              Quarter
            </label>
            <select
              id="quarter"
              className={`input-field ${errors.quarter ? 'border-red-500' : ''}`}
              {...register('quarter')}
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  {quarterLabels[q]}
                </option>
              ))}
            </select>
            {errors.quarter && <p className="input-error">{errors.quarter.message}</p>}
          </div>

          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>1. A draft filing will be created for the selected period.</li>
              <li>2. You will be taken to the Form 941 data entry page.</li>
              <li>3. Fill in your quarterly payroll tax information.</li>
              <li>4. Review, save, and submit when ready.</li>
            </ul>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size={20} />
            ) : (
              <>
                Create Filing & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewFilingPage;
