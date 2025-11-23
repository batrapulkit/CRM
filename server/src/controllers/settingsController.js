// server/src/controllers/settingsController.js
import { supabase } from '../config/supabase.js';

// Get organization settings
export const getSettings = async (req, res) => {
    try {
        const { data: agency, error } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', req.user.agency_id)
            .single();

        if (error) throw error;

        // Return settings from agency record
        const settings = {
            organization: {
                company_name: agency.agency_name || '',
                contact_email: agency.contact_email || '',
                contact_phone: agency.contact_phone || '',
                website: agency.website || '',
                address: agency.address || ''
            },
            notifications: {
                email: true,
                usage: true,
                billing: true,
                updates: false
            }
        };

        res.json({ success: true, settings });

    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
};

// Update organization settings
export const updateSettings = async (req, res) => {
    try {
        const { organization } = req.body;

        // Update agency record with organization settings
        if (organization) {
            const updateData = {
                updated_at: new Date().toISOString()
            };

            // Only update fields that exist in the database
            if (organization.company_name) updateData.agency_name = organization.company_name;
            if (organization.contact_email) updateData.contact_email = organization.contact_email;
            if (organization.contact_phone) updateData.contact_phone = organization.contact_phone;
            if (organization.website) updateData.website = organization.website;
            if (organization.address) updateData.address = organization.address;
            if (organization.logo_url) updateData.logo_url = organization.logo_url;

            const { error } = await supabase
                .from('agencies')
                .update(updateData)
                .eq('id', req.user.agency_id);

            if (error) throw error;
        }

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });

    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
};
