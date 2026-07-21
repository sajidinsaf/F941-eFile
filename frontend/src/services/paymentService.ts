import api from './api';

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentConfig {
  publishableKey: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  filingCount: number;
  features: string[];
}

export const paymentService = {
  createCheckoutSession: async (filingId: string, planId: string): Promise<CheckoutSession> => {
    const response = await api.post<CheckoutSession>('/payments/checkout', {
      filingId,
      planId,
    });
    return response.data;
  },

  getConfig: async (): Promise<PaymentConfig> => {
    const response = await api.get<PaymentConfig>('/payments/config');
    return response.data;
  },

  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/payments/plans');
    return response.data;
  },
};
