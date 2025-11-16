// server/src/controllers/clientController.js
import { supabase } from "../config/supabase.js";

/*
  Notes:
  - Frontend expects `client.name` in some places. DB uses `full_name`.
    We return both `full_name` and an alias `name` so frontend works without changes.
  - getClientStats returns the nested `stats` object Dashboard expects:
      stats.clients.total, stats.clients.active, stats.clients.new_this_month
    plus lightweight placeholders for itineraries/revenue/bookings so the Dashboard code
    can read the expected structure.
*/

// ===========================
// Helper: map db client -> frontend shape
// ===========================
function mapClientRecord(rec) {
  if (!rec) return rec;
  return {
    ...rec,
    name: rec.name || rec.full_name || null, // alias for legacy frontend
    full_name: rec.full_name || rec.name || null,
  };
}

// ===========================
// GET ALL CLIENTS
// ===========================
export const getClients = async (req, res) => {
  try {
    const { limit, q } = req.query;







































































    const agencyId = req.user.agency_id;

    console.log('[CLIENT] Fetching clients - agency_id:', agencyId, 'limit:', limit, 'search:', q);

    let query = supabase
      .from("clients")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (limit) {
      const n = parseInt(limit, 10);
      if (!isNaN(n)) {
        query = query.limit(n);
        console.log('[CLIENT] Applied limit:', n);
      }
    }

    if (q) {
      // basic search by full_name or email
      query = query.ilike("full_name", `%${q}%`);
      console.log('[CLIENT] Applied search filter:', q);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CLIENT] Database error fetching clients:', error);
      throw error;
    }

    // Map each record to include `name` alias
    const clients = (data || []).map(mapClientRecord);

    console.log('[CLIENT] Successfully fetched', clients.length, 'clients');

    res.json({ success: true, clients });
  } catch (err) {
    console.error("[CLIENT] Get clients error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
};

// ===========================
// GET SINGLE CLIENT
// ===========================
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("clients")
      .select("*, itineraries(*), invoices(*)") // helpful embedding if relationships exist
      .eq("id", id)
      .eq("agency_id", req.user.agency_id)
      .single();

    if (error) throw error;

    res.json({ success: true, client: mapClientRecord(data) });
  } catch (err) {
    console.error("Get client error:", err);
    res.status(500).json({ error: "Failed to fetch client" });
  }
};

// ===========================
// CREATE CLIENT
// ===========================
export const createClient = async (req, res) => {
  try {
    console.log('[CLIENT] Creating new client with data:', JSON.stringify(req.body, null, 2));

    let {
      full_name,
      name,
      email,
      phone,
      interests,
      budget_range,
      notes,
      passport_number,
      date_of_birth,
      nationality,
      address,
      vip_status
    } = req.body;

    // accept both "full_name" and "name" from frontend
    full_name = full_name || name;

    console.log('[CLIENT] Parsed full_name:', full_name, 'email:', email);

    if (!full_name) {
      console.warn('[CLIENT] Validation failed - missing full_name');
      return res.status(400).json({ error: "Client name is required" });
    }

    const payload = {
      full_name,
      email: email || null,
      phone: phone || null,
      passport_number: passport_number || null,
      date_of_birth: date_of_birth || null,
      nationality: nationality || null,
      address: address || null,
      interests: interests || [],
      budget_range: budget_range || null,
      notes: notes || null,
      vip_status: vip_status === true || vip_status === "true" ? true : false,
      created_by: req.user.id,
      agency_id: req.user.agency_id,
      created_at: new Date().toISOString()
    };

    console.log('[CLIENT] Inserting payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[CLIENT] Database error:', error);
      throw error;
    }

    console.log('[CLIENT] Successfully created client:', data.id, 'name:', data.full_name);
    res.json({ success: true, client: mapClientRecord(data) });
  } catch (err) {
    console.error("[CLIENT] Create client error:", err.message, err.stack);
    // Return a helpful message for the frontend
    res.status(500).json({ error: "Failed to create client", details: err.message });
  }
};

// ===========================
// UPDATE CLIENT
// ===========================
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    if (updates.name && !updates.full_name) {
      updates.full_name = updates.name;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("agency_id", req.user.agency_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, client: mapClientRecord(data) });
  } catch (err) {
    console.error("Update client error:", err);
    res.status(500).json({ error: "Failed to update client" });
  }
};

// ===========================
// DELETE CLIENT
// ===========================
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("agency_id", req.user.agency_id);

    if (error) throw error;

    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    console.error("Delete client error:", err);
    res.status(500).json({ error: "Failed to delete client" });
  }
};

// ===========================
// CLIENT STATS (for Dashboard)
// ===========================
export const getClientStats = async (req, res) => {
  try {
    const agencyId = req.user.agency_id;
    console.log('[CLIENT] Fetching stats for agency_id:', agencyId);

    const { data: allClients, error: allErr } = await supabase
      .from("clients")
      .select("id, vip_status, created_at")
      .eq("agency_id", agencyId);

    if (allErr) {
      console.error('[CLIENT] Database error fetching stats:', allErr);
      throw allErr;
    }

    console.log('[CLIENT] Total clients found:', allClients?.length || 0);

    const total = (allClients || []).length;
    const active = (allClients || []).filter((c) => c.vip_status === true).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newThisMonth = (allClients || []).filter(c => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created >= thirtyDaysAgo;
    }).length;

    console.log('[CLIENT] Stats calculated - total:', total, 'active:', active, 'new_this_month:', newThisMonth);

    const stats = {
      clients: {
        total,
        active,
        new_this_month: newThisMonth
      },
      itineraries: { total: 0, draft: 0, confirmed: 0 },
      revenue: { total: 0, this_month: 0 },
      bookings: { total: 0, pending: 0 }
    };

    console.log('[CLIENT] Returning stats:', JSON.stringify(stats, null, 2));
    res.json({ success: true, stats });
  } catch (err) {
    console.error("[CLIENT] Client stats error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};
