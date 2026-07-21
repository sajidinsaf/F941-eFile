import api from './api';

export interface Filing {
  id: string;
  userId: string;
  taxYear: number;
  quarter: number;
  status: 'DRAFT' | 'VALIDATED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  formData: Form941Data | null;
  submissionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Form941Data {
  ein: string;
  businessName: string;
  tradeName?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  numberOfEmployees: number;
  wagesTipsCompensation: number;
  federalIncomeTaxWithheld: number;
  socialSecurityWages: number;
  socialSecurityTax: number;
  socialSecurityTips: number;
  socialSecurityTipsTax: number;
  medicareWages: number;
  medicareTax: number;
  additionalMedicareWages: number;
  additionalMedicareTax: number;
  totalTaxBeforeAdjustments: number;
  adjustmentFractionsOfCents: number;
  adjustmentSickPay: number;
  adjustmentTipsGroupLife: number;
  totalTaxAfterAdjustments: number;
  totalDeposits: number;
  balanceDue: number;
  overpayment: number;
  depositSchedule: 'MONTHLY' | 'SEMIWEEKLY';
  monthlyLiabilityMonth1: number;
  monthlyLiabilityMonth2: number;
  monthlyLiabilityMonth3: number;
  totalLiabilityForQuarter: number;
  isBusinessClosed: boolean;
  isSeasonalEmployer: boolean;
  thirdPartyDesignee: boolean;
  designeeName?: string;
  designeePhone?: string;
  designeePin?: string;
  signerName: string;
  signerTitle: string;
  signerPhone: string;
  signatureDate: string;
  signerPin?: string;
}

export interface FilingListResponse {
  filings: Filing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateFilingRequest {
  businessProfileId: number;
  taxYear: number;
  quarter: number;
}

export const filingService = {
  create: async (data: CreateFilingRequest): Promise<Filing> => {
    const response = await api.post<Filing>('/filings', data);
    return response.data;
  },

  list: async (page = 1, pageSize = 10): Promise<FilingListResponse> => {
    const response = await api.get<FilingListResponse>('/filings', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Filing> => {
    const response = await api.get<Filing>(`/filings/${id}`);
    return response.data;
  },

  update: async (id: string, formData: Partial<Form941Data>): Promise<Filing> => {
    const response = await api.put<Filing>(`/filings/${id}`, { formData });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/filings/${id}`);
  },

  submitToMef: async (id: string): Promise<Filing> => {
    const response = await api.post<Filing>(`/filings/${id}/submit`);
    return response.data;
  },

  checkStatus: async (id: string): Promise<Filing> => {
    const response = await api.get<Filing>(`/filings/${id}/status`);
    return response.data;
  },
};
