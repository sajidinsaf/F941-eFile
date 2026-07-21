import api from './api';

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  tradeName?: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  efin?: string;
  etin?: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRequest {
  businessName: string;
  tradeName?: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  efin?: string;
  etin?: string;
  contactName: string;
  contactPhone: string;
}

export const profileService = {
  getProfile: async (): Promise<BusinessProfile> => {
    const response = await api.get<BusinessProfile>('/profile');
    return response.data;
  },

  createOrUpdateProfile: async (data: ProfileRequest): Promise<BusinessProfile> => {
    const response = await api.put<BusinessProfile>('/profile', data);
    return response.data;
  },
};
