import api from './api';

export interface MefSubmissionResult {
  submissionId: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface MefStatusResult {
  submissionId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  message: string;
  errors?: string[];
  timestamp: string;
}

export const mefService = {
  submitFiling: async (filingId: string): Promise<MefSubmissionResult> => {
    const response = await api.post<MefSubmissionResult>(`/mef/submit/${filingId}`);
    return response.data;
  },

  checkStatus: async (submissionId: string): Promise<MefStatusResult> => {
    const response = await api.get<MefStatusResult>(`/mef/status/${submissionId}`);
    return response.data;
  },
};
