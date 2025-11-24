import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/client';
import { useAuth } from './AuthContext';

const BrandingContext = createContext();

export function BrandingProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const [branding, setBranding] = useState({
        company_name: 'Triponic B2B',
        logo_url: '',
        plan: 'Free Tier',
        isLoading: true
    });

    const fetchBranding = async () => {
        if (authLoading || !user) {
            setBranding(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            const res = await api.get('/settings');
            const data = res.data?.settings || {};
            setBranding({
                company_name: data.company_name || 'Triponic B2B',
                logo_url: data.logo_url || '',
                plan: 'Pro Plan',
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch branding settings:', error);
            setBranding(prev => ({ ...prev, isLoading: false }));
        }
    };

    useEffect(() => {
        fetchBranding();
    }, [user, authLoading]);

    const updateBranding = (newSettings) => {
        setBranding(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    return (
        <BrandingContext.Provider value={{ ...branding, updateBranding, refreshBranding: fetchBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};
