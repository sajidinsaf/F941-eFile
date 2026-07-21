import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Send, Calculator, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { filingService, type Filing, type Form941Data } from '@/services/filingService';

// Tax rates
const SS_RATE = 0.062; // 6.2% employer share
const MEDICARE_RATE = 0.0145; // 1.45% employer share
const ADDITIONAL_MEDICARE_RATE = 0.009; // 0.9% employee-only

const form941Schema = z.object({
  ein: z.string().min(1, 'EIN is required'),
  businessName: z.string().min(1, 'Business name is required'),
  tradeName: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  numberOfEmployees: z.coerce.number().min(0),
  wagesTipsCompensation: z.coerce.number().min(0),
  federalIncomeTaxWithheld: z.coerce.number().min(0),
  socialSecurityWages: z.coerce.number().min(0),
  socialSecurityTax: z.coerce.number().min(0),
  socialSecurityTips: z.coerce.number().min(0),
  socialSecurityTipsTax: z.coerce.number().min(0),
  medicareWages: z.coerce.number().min(0),
  medicareTax: z.coerce.number().min(0),
  additionalMedicareWages: z.coerce.number().min(0),
  additionalMedicareTax: z.coerce.number().min(0),
  totalTaxBeforeAdjustments: z.coerce.number(),
  adjustmentFractionsOfCents: z.coerce.number(),
  adjustmentSickPay: z.coerce.number(),
  adjustmentTipsGroupLife: z.coerce.number(),
  totalTaxAfterAdjustments: z.coerce.number(),
  totalDeposits: z.coerce.number().min(0),
  balanceDue: z.coerce.number(),
  overpayment: z.coerce.number(),
  depositSchedule: z.enum(['MONTHLY', 'SEMIWEEKLY']),
  monthlyLiabilityMonth1: z.coerce.number().min(0),
  monthlyLiabilityMonth2: z.coerce.number().min(0),
  monthlyLiabilityMonth3: z.coerce.number().min(0),
  totalLiabilityForQuarter: z.coerce.number(),
  isBusinessClosed: z.boolean(),
  isSeasonalEmployer: z.boolean(),
  thirdPartyDesignee: z.boolean(),
  designeeName: z.string().optional().or(z.literal('')),
  designeePhone: z.string().optional().or(z.literal('')),
  designeePin: z.string().optional().or(z.literal('')),
  signerName: z.string().min(1, 'Signer name is required'),
  signerTitle: z.string().min(1, 'Signer title is required'),
  signerPhone: z.string().min(1, 'Signer phone is required'),
  signatureDate: z.string().min(1, 'Signature date is required'),
  signerPin: z.string().optional().or(z.literal('')),
});

type Form941FormData = z.infer<typeof form941Schema>;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const SectionHeader = ({
  title,
  subtitle,
  isOpen,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-4 px-1 border-b-2 border-primary-200"
  >
    <div className="text-left">
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {isOpen ? (
      <ChevronUp className="h-5 w-5 text-gray-400" />
    ) : (
      <ChevronDown className="h-5 w-5 text-gray-400" />
    )}
  </button>
);

const CurrencyField = ({
  label,
  lineNumber,
  id,
  register: reg,
  error,
  readOnly = false,
  value,
  helpText,
}: {
  label: string;
  lineNumber?: string;
  id: string;
  register: ReturnType<typeof useForm<Form941FormData>>['register'];
  error?: string;
  readOnly?: boolean;
  value?: number;
  helpText?: string;
}) => (
  <div className="grid grid-cols-12 gap-4 items-start py-2">
    <div className="col-span-7 sm:col-span-8">
      <label htmlFor={id} className="text-sm text-gray-700 flex items-start">
        {lineNumber && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mr-2 mt-0.5 shrink-0">
            {lineNumber}
          </span>
        )}
        <span>
          {label}
          {helpText && <span className="block text-xs text-gray-400 mt-0.5">{helpText}</span>}
        </span>
      </label>
    </div>
    <div className="col-span-5 sm:col-span-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          id={id}
          type="number"
          step="0.01"
          readOnly={readOnly}
          className={`input-field pl-7 text-right ${readOnly ? 'bg-gray-50 text-gray-600' : ''} ${error ? 'border-red-500' : ''}`}
          value={readOnly && value !== undefined ? value.toFixed(2) : undefined}
          {...(readOnly ? {} : reg(id as keyof Form941FormData, { valueAsNumber: true }))}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  </div>
);

const Form941Page = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filing, setFiling] = useState<Filing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    part1: true,
    part2: true,
    part3: true,
    part4: true,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Form941FormData>({
    resolver: zodResolver(form941Schema),
    defaultValues: {
      numberOfEmployees: 0,
      wagesTipsCompensation: 0,
      federalIncomeTaxWithheld: 0,
      socialSecurityWages: 0,
      socialSecurityTax: 0,
      socialSecurityTips: 0,
      socialSecurityTipsTax: 0,
      medicareWages: 0,
      medicareTax: 0,
      additionalMedicareWages: 0,
      additionalMedicareTax: 0,
      totalTaxBeforeAdjustments: 0,
      adjustmentFractionsOfCents: 0,
      adjustmentSickPay: 0,
      adjustmentTipsGroupLife: 0,
      totalTaxAfterAdjustments: 0,
      totalDeposits: 0,
      balanceDue: 0,
      overpayment: 0,
      depositSchedule: 'MONTHLY',
      monthlyLiabilityMonth1: 0,
      monthlyLiabilityMonth2: 0,
      monthlyLiabilityMonth3: 0,
      totalLiabilityForQuarter: 0,
      isBusinessClosed: false,
      isSeasonalEmployer: false,
      thirdPartyDesignee: false,
      signatureDate: new Date().toISOString().split('T')[0],
    },
  });

  // Watch fields for auto-calculation
  const watchedFields = useWatch({ control });

  // Auto-calculate derived fields
  const autoCalculate = useCallback(() => {
    const ssWages = Number(watchedFields.socialSecurityWages) || 0;
    const ssTips = Number(watchedFields.socialSecurityTips) || 0;
    const medicareWages = Number(watchedFields.medicareWages) || 0;
    const additionalMedicareWages = Number(watchedFields.additionalMedicareWages) || 0;
    const fitWithheld = Number(watchedFields.federalIncomeTaxWithheld) || 0;

    // Social Security tax = wages * 12.4% (employer + employee share)
    const ssTax = round2(ssWages * SS_RATE * 2);
    const ssTipsTax = round2(ssTips * SS_RATE * 2);
    // Medicare tax = wages * 2.9% (employer + employee share)
    const medTax = round2(medicareWages * MEDICARE_RATE * 2);
    // Additional Medicare tax = 0.9% (employee only)
    const addlMedTax = round2(additionalMedicareWages * ADDITIONAL_MEDICARE_RATE);

    setValue('socialSecurityTax', ssTax);
    setValue('socialSecurityTipsTax', ssTipsTax);
    setValue('medicareTax', medTax);
    setValue('additionalMedicareTax', addlMedTax);

    // Total tax before adjustments
    const totalBefore = round2(fitWithheld + ssTax + ssTipsTax + medTax + addlMedTax);
    setValue('totalTaxBeforeAdjustments', totalBefore);

    // Total tax after adjustments
    const adjFractions = Number(watchedFields.adjustmentFractionsOfCents) || 0;
    const adjSickPay = Number(watchedFields.adjustmentSickPay) || 0;
    const adjTips = Number(watchedFields.adjustmentTipsGroupLife) || 0;
    const totalAfter = round2(totalBefore + adjFractions + adjSickPay + adjTips);
    setValue('totalTaxAfterAdjustments', totalAfter);

    // Balance due or overpayment
    const totalDeposits = Number(watchedFields.totalDeposits) || 0;
    const diff = round2(totalAfter - totalDeposits);
    if (diff > 0) {
      setValue('balanceDue', diff);
      setValue('overpayment', 0);
    } else {
      setValue('balanceDue', 0);
      setValue('overpayment', Math.abs(diff));
    }

    // Monthly liability total
    const m1 = Number(watchedFields.monthlyLiabilityMonth1) || 0;
    const m2 = Number(watchedFields.monthlyLiabilityMonth2) || 0;
    const m3 = Number(watchedFields.monthlyLiabilityMonth3) || 0;
    setValue('totalLiabilityForQuarter', round2(m1 + m2 + m3));
  }, [watchedFields, setValue]);

  useEffect(() => {
    autoCalculate();
  }, [autoCalculate]);

  useEffect(() => {
    const fetchFiling = async () => {
      if (!id) return;
      try {
        const data = await filingService.getById(id);
        setFiling(data);
        if (data.formData) {
          reset(data.formData as Form941FormData);
        }
      } catch {
        toast.error('Failed to load filing');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiling();
  }, [id, navigate, reset]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const saveDraft = async (data: Form941FormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await filingService.update(id, data as unknown as Partial<Form941Data>);
      setFiling(updated);
      toast.success('Draft saved successfully!');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const submitFiling = async (data: Form941FormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await filingService.update(id, data as unknown as Partial<Form941Data>);
      const submitted = await filingService.submitToMef(id);
      setFiling(submitted);
      toast.success('Filing submitted successfully!');
      navigate(`/filings/${id}/payment`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit filing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size={40} text="Loading Form 941..." />
      </div>
    );
  }

  const isReadOnly = filing?.status === 'SUBMITTED' || filing?.status === 'ACCEPTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Form 941 - {filing?.taxYear} Q{filing?.quarter}
            </h1>
            <p className="text-sm text-gray-500">
              Employer&apos;s Quarterly Federal Tax Return
            </p>
          </div>
        </div>
        {filing && (
          <div className="mt-2 sm:mt-0">
            <StatusBadge status={filing.status} />
          </div>
        )}
      </div>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            This filing has been submitted and cannot be edited.
          </p>
        </div>
      )}

      <form className="space-y-6">
        {/* PART 1: Quarterly Computation */}
        <div className="card">
          <SectionHeader
            title="Part 1: Answer these questions for this quarter"
            subtitle="Compute your tax liability"
            isOpen={openSections.part1}
            onToggle={() => toggleSection('part1')}
          />

          {openSections.part1 && (
            <div className="mt-4 space-y-1">
              {/* Business Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <label htmlFor="ein" className="input-label">EIN</label>
                  <input
                    id="ein"
                    type="text"
                    readOnly={isReadOnly}
                    className={`input-field ${errors.ein ? 'border-red-500' : ''}`}
                    placeholder="XX-XXXXXXX"
                    {...register('ein')}
                  />
                  {errors.ein && <p className="input-error">{errors.ein.message}</p>}
                </div>
                <div>
                  <label htmlFor="businessName" className="input-label">Business Name</label>
                  <input
                    id="businessName"
                    type="text"
                    readOnly={isReadOnly}
                    className={`input-field ${errors.businessName ? 'border-red-500' : ''}`}
                    {...register('businessName')}
                  />
                  {errors.businessName && <p className="input-error">{errors.businessName.message}</p>}
                </div>
                <div>
                  <label htmlFor="tradeName" className="input-label">Trade Name (DBA)</label>
                  <input
                    id="tradeName"
                    type="text"
                    readOnly={isReadOnly}
                    className="input-field"
                    {...register('tradeName')}
                  />
                </div>
                <div>
                  <label htmlFor="address" className="input-label">Address</label>
                  <input
                    id="address"
                    type="text"
                    readOnly={isReadOnly}
                    className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                    {...register('address')}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="input-label">City</label>
                  <input id="city" type="text" readOnly={isReadOnly} className="input-field" {...register('city')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="input-label">State</label>
                    <select id="state" disabled={isReadOnly} className="input-field" {...register('state')}>
                      <option value="">Select</option>
                      {US_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="input-label">ZIP</label>
                    <input id="zipCode" type="text" readOnly={isReadOnly} className="input-field" {...register('zipCode')} />
                  </div>
                </div>
              </div>

              {/* Line 1: Number of employees */}
              <div className="grid grid-cols-12 gap-4 items-center py-2">
                <div className="col-span-7 sm:col-span-8">
                  <label htmlFor="numberOfEmployees" className="text-sm text-gray-700 flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mr-2 shrink-0">1</span>
                    Number of employees who received wages, tips, or other compensation
                  </label>
                </div>
                <div className="col-span-5 sm:col-span-4">
                  <input
                    id="numberOfEmployees"
                    type="number"
                    readOnly={isReadOnly}
                    className={`input-field text-right ${errors.numberOfEmployees ? 'border-red-500' : ''}`}
                    {...register('numberOfEmployees', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Line 2: Wages */}
              <CurrencyField
                label="Wages, tips, and other compensation"
                lineNumber="2"
                id="wagesTipsCompensation"
                register={register}
                error={errors.wagesTipsCompensation?.message}
              />

              {/* Line 3: Federal income tax withheld */}
              <CurrencyField
                label="Federal income tax withheld from wages, tips, and other compensation"
                lineNumber="3"
                id="federalIncomeTaxWithheld"
                register={register}
                error={errors.federalIncomeTaxWithheld?.message}
              />

              {/* Line 4: If no wages subject to SS/Medicare... info line */}
              <div className="py-2 px-1">
                <p className="text-sm text-gray-500 italic">
                  Line 4: If no wages, tips, and other compensation are subject to social security or Medicare tax, check and go to line 6.
                </p>
              </div>

              {/* Line 5a: Social Security wages */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Column 1: Taxable Wages & Tips | Column 2: Tax Due (auto-calculated)
                </p>

                <CurrencyField
                  label="Taxable social security wages"
                  lineNumber="5a"
                  id="socialSecurityWages"
                  register={register}
                  helpText={`Tax: ${((SS_RATE * 2) * 100).toFixed(1)}% = $${(((Number(watchedFields.socialSecurityWages) || 0) * SS_RATE * 2)).toFixed(2)}`}
                />
                <CurrencyField
                  label="Social security tax on wages"
                  lineNumber=""
                  id="socialSecurityTax"
                  register={register}
                  readOnly
                  value={Number(watchedFields.socialSecurityTax) || 0}
                />

                <CurrencyField
                  label="Taxable social security tips"
                  lineNumber="5b"
                  id="socialSecurityTips"
                  register={register}
                  helpText={`Tax: ${((SS_RATE * 2) * 100).toFixed(1)}% = $${(((Number(watchedFields.socialSecurityTips) || 0) * SS_RATE * 2)).toFixed(2)}`}
                />
                <CurrencyField
                  label="Social security tax on tips"
                  lineNumber=""
                  id="socialSecurityTipsTax"
                  register={register}
                  readOnly
                  value={Number(watchedFields.socialSecurityTipsTax) || 0}
                />

                <CurrencyField
                  label="Taxable Medicare wages & tips"
                  lineNumber="5c"
                  id="medicareWages"
                  register={register}
                  helpText={`Tax: ${((MEDICARE_RATE * 2) * 100).toFixed(1)}% = $${(((Number(watchedFields.medicareWages) || 0) * MEDICARE_RATE * 2)).toFixed(2)}`}
                />
                <CurrencyField
                  label="Medicare tax"
                  lineNumber=""
                  id="medicareTax"
                  register={register}
                  readOnly
                  value={Number(watchedFields.medicareTax) || 0}
                />

                <CurrencyField
                  label="Wages & tips subject to Additional Medicare Tax withholding"
                  lineNumber="5d"
                  id="additionalMedicareWages"
                  register={register}
                  helpText={`Tax: ${(ADDITIONAL_MEDICARE_RATE * 100).toFixed(1)}% = $${(((Number(watchedFields.additionalMedicareWages) || 0) * ADDITIONAL_MEDICARE_RATE)).toFixed(2)}`}
                />
                <CurrencyField
                  label="Additional Medicare Tax"
                  lineNumber=""
                  id="additionalMedicareTax"
                  register={register}
                  readOnly
                  value={Number(watchedFields.additionalMedicareTax) || 0}
                />
              </div>

              {/* Line 6: Total taxes before adjustments */}
              <div className="border-t-2 border-primary-100 pt-2">
                <CurrencyField
                  label="Total taxes before adjustments (lines 3 + 5a + 5b + 5c + 5d)"
                  lineNumber="6"
                  id="totalTaxBeforeAdjustments"
                  register={register}
                  readOnly
                  value={Number(watchedFields.totalTaxBeforeAdjustments) || 0}
                />
              </div>

              {/* Lines 7-9: Adjustments */}
              <div className="bg-amber-50 rounded-lg p-4 space-y-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                  Adjustments
                </p>
                <CurrencyField
                  label="Current quarter's adjustment for fractions of cents"
                  lineNumber="7"
                  id="adjustmentFractionsOfCents"
                  register={register}
                />
                <CurrencyField
                  label="Current quarter's adjustment for sick pay"
                  lineNumber="8"
                  id="adjustmentSickPay"
                  register={register}
                />
                <CurrencyField
                  label="Current quarter's adjustments for tips and group-term life insurance"
                  lineNumber="9"
                  id="adjustmentTipsGroupLife"
                  register={register}
                />
              </div>

              {/* Line 10: Total taxes after adjustments */}
              <CurrencyField
                label="Total taxes after adjustments (line 6 + lines 7 through 9)"
                lineNumber="10"
                id="totalTaxAfterAdjustments"
                register={register}
                readOnly
                value={Number(watchedFields.totalTaxAfterAdjustments) || 0}
              />

              {/* Line 11: Total deposits */}
              <CurrencyField
                label="Qualified small business payroll tax credit for increasing research activities"
                lineNumber="11"
                id="totalDeposits"
                register={register}
                helpText="Total deposits for this quarter, including overpayment applied from prior quarter"
              />

              {/* Line 12-13: Balance due / Overpayment */}
              <div className="border-t-2 border-primary-100 pt-2 space-y-1">
                <CurrencyField
                  label="Total deposits for this quarter"
                  lineNumber="11"
                  id="totalDeposits"
                  register={register}
                />

                <div className="flex items-center py-3 px-1 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold mr-2 shrink-0">
                        14
                      </span>
                      <span className="text-sm font-medium text-gray-700">Balance Due</span>
                    </div>
                    <p className="text-2xl font-bold text-navy-900 mt-1">
                      ${(Number(watchedFields.balanceDue) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2 shrink-0">
                        15
                      </span>
                      <span className="text-sm font-medium text-gray-700">Overpayment</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600 mt-1">
                      ${(Number(watchedFields.overpayment) || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PART 2: Deposit Schedule */}
        <div className="card">
          <SectionHeader
            title="Part 2: Tell us about your deposit schedule and tax liability for this quarter"
            isOpen={openSections.part2}
            onToggle={() => toggleSection('part2')}
          />

          {openSections.part2 && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="input-label">Deposit Schedule</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="MONTHLY"
                      disabled={isReadOnly}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      {...register('depositSchedule')}
                    />
                    <span className="text-sm text-gray-700">Monthly depositor</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="SEMIWEEKLY"
                      disabled={isReadOnly}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      {...register('depositSchedule')}
                    />
                    <span className="text-sm text-gray-700">Semiweekly depositor</span>
                  </label>
                </div>
              </div>

              {watchedFields.depositSchedule === 'MONTHLY' && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Monthly Tax Liability (complete if you are a monthly depositor)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="monthlyLiabilityMonth1" className="input-label">Month 1</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          id="monthlyLiabilityMonth1"
                          type="number"
                          step="0.01"
                          readOnly={isReadOnly}
                          className="input-field pl-7 text-right"
                          {...register('monthlyLiabilityMonth1', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="monthlyLiabilityMonth2" className="input-label">Month 2</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          id="monthlyLiabilityMonth2"
                          type="number"
                          step="0.01"
                          readOnly={isReadOnly}
                          className="input-field pl-7 text-right"
                          {...register('monthlyLiabilityMonth2', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="monthlyLiabilityMonth3" className="input-label">Month 3</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          id="monthlyLiabilityMonth3"
                          type="number"
                          step="0.01"
                          readOnly={isReadOnly}
                          className="input-field pl-7 text-right"
                          {...register('monthlyLiabilityMonth3', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Total Liability for Quarter</span>
                    <span className="text-lg font-bold text-navy-900">
                      ${(Number(watchedFields.totalLiabilityForQuarter) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {watchedFields.depositSchedule === 'SEMIWEEKLY' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    You were a semiweekly schedule depositor for any part of this quarter. Complete Schedule B (Form 941) and attach it to this form. Your total liability must equal line 10.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PART 3: Business Info */}
        <div className="card">
          <SectionHeader
            title="Part 3: Tell us about your business"
            isOpen={openSections.part3}
            onToggle={() => toggleSection('part3')}
          />

          {openSections.part3 && (
            <div className="mt-4 space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  {...register('isBusinessClosed')}
                />
                <span className="text-sm text-gray-700">
                  If your business has closed or you stopped paying wages, check here and enter the final date you paid wages.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  {...register('isSeasonalEmployer')}
                />
                <span className="text-sm text-gray-700">
                  If you are a seasonal employer and you do not have to file a return for every quarter of the year, check here.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* PART 4: Third-Party Designee & Signature */}
        <div className="card">
          <SectionHeader
            title="Part 4: May we speak with your third-party designee?"
            isOpen={openSections.part4}
            onToggle={() => toggleSection('part4')}
          />

          {openSections.part4 && (
            <div className="mt-4 space-y-6">
              {/* Third-Party Designee */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    {...register('thirdPartyDesignee')}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Yes, I want to allow a third-party designee to discuss this return with the IRS
                  </span>
                </label>

                {watchedFields.thirdPartyDesignee && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
                    <div>
                      <label htmlFor="designeeName" className="input-label">Designee Name</label>
                      <input
                        id="designeeName"
                        type="text"
                        readOnly={isReadOnly}
                        className="input-field"
                        {...register('designeeName')}
                      />
                    </div>
                    <div>
                      <label htmlFor="designeePhone" className="input-label">Phone</label>
                      <input
                        id="designeePhone"
                        type="tel"
                        readOnly={isReadOnly}
                        className="input-field"
                        {...register('designeePhone')}
                      />
                    </div>
                    <div>
                      <label htmlFor="designeePin" className="input-label">PIN (5 digits)</label>
                      <input
                        id="designeePin"
                        type="text"
                        maxLength={5}
                        readOnly={isReadOnly}
                        className="input-field"
                        {...register('designeePin')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-semibold text-navy-900 mb-4">
                  Sign Here - Under penalties of perjury
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Under penalties of perjury, I declare that I have examined this return, including accompanying schedules and statements, and to the best of my knowledge and belief, it is true, correct, and complete.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signerName" className="input-label">Name (Print)</label>
                    <input
                      id="signerName"
                      type="text"
                      readOnly={isReadOnly}
                      className={`input-field ${errors.signerName ? 'border-red-500' : ''}`}
                      {...register('signerName')}
                    />
                    {errors.signerName && <p className="input-error">{errors.signerName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="signerTitle" className="input-label">Title</label>
                    <input
                      id="signerTitle"
                      type="text"
                      readOnly={isReadOnly}
                      className={`input-field ${errors.signerTitle ? 'border-red-500' : ''}`}
                      {...register('signerTitle')}
                    />
                    {errors.signerTitle && <p className="input-error">{errors.signerTitle.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="signerPhone" className="input-label">Phone</label>
                    <input
                      id="signerPhone"
                      type="tel"
                      readOnly={isReadOnly}
                      className={`input-field ${errors.signerPhone ? 'border-red-500' : ''}`}
                      {...register('signerPhone')}
                    />
                    {errors.signerPhone && <p className="input-error">{errors.signerPhone.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="signatureDate" className="input-label">Date</label>
                    <input
                      id="signatureDate"
                      type="date"
                      readOnly={isReadOnly}
                      className={`input-field ${errors.signatureDate ? 'border-red-500' : ''}`}
                      {...register('signatureDate')}
                    />
                    {errors.signatureDate && <p className="input-error">{errors.signatureDate.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="signerPin" className="input-label">PIN (optional)</label>
                    <input
                      id="signerPin"
                      type="text"
                      maxLength={10}
                      readOnly={isReadOnly}
                      className="input-field"
                      {...register('signerPin')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSubmit(saveDraft)}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoadingSpinner size={20} />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit(submitFiling)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size={20} />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit to IRS
                </>
              )}
            </button>
          </div>
        )}

        {/* Auto-calculation info */}
        <div className="flex items-center justify-center text-xs text-gray-400 gap-1 pb-4">
          <Calculator className="h-3 w-3" />
          <span>Tax amounts are auto-calculated. SS: {(SS_RATE * 2 * 100).toFixed(1)}% | Medicare: {(MEDICARE_RATE * 2 * 100).toFixed(1)}% | Additional Medicare: {(ADDITIONAL_MEDICARE_RATE * 100).toFixed(1)}%</span>
        </div>
      </form>
    </div>
  );
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default Form941Page;
