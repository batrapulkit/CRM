import { supabase } from '../config/supabase.js';

export async function getInvoices(req, res) {
  try {
    const { clientId } = req.query;

    // --- ADOPT ORPHANED INVOICES ---
    try {
      await supabase
        .from("invoices")
        .update({ agency_id: req.user.agency_id })
        .eq("created_by", req.user.id)
        .is("agency_id", null);
    } catch (err) {
      console.error("Invoice adoption error:", err);
    }
    // -------------------------------

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('agency_id', req.user.agency_id)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Manual join for clients
    const enriched = await Promise.all((data || []).map(async (invoice) => {
      if (invoice.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('id', invoice.client_id)
          .single();
        return { ...invoice, client };
      }
      return invoice;
    }));

    res.json({ success: true, invoices: enriched });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export const createInvoice = async (req, res) => {
  try {
    console.log('Creating invoice with body:', req.body);
    const { client_id, total, notes, due_date } = req.body;

    if (!client_id || !total) {
      console.error('Missing required fields: client_id or total');
      return res.status(400).json({ error: 'Client and Total are required' });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        agency_id: req.user.agency_id,
        client_id,
        total: parseFloat(total),
        status: 'draft',
        invoice_number: invoiceNumber,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        notes,
        due_date
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating invoice:', error);
      throw error;
    }

    console.log('Invoice created successfully:', invoice);
    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Error in createInvoice:', error);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export async function updateInvoice(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('invoices')
      .update(req.body)
      .eq('id', id)
      .eq('agency_id', req.user.agency_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
}

export async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('agency_id', req.user.agency_id);

    if (error) throw error;
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
}

export async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(*), itineraries(*)')
      .eq('id', id)
      .eq('agency_id', req.user.agency_id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
}