// server/src/controllers/itineraryController.js
import { supabase } from '../config/supabase.js';
import { getModel } from '../config/gemini.js';

/**
 * Generate itinerary (AI) -> saves both structured JSON (ai_generated_json)
 * and plain text content (ai_generated_content). Links to client_id.
 */
export const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      duration,
      budget,
      interests,
      travelers,
      accommodation_type,
      client_id,
      start_date,
      end_date
    } = req.body;

    if (!destination || !duration) {
      return res.status(400).json({ error: 'destination and duration are required' });
    }

    // Optional fetch client for personalization
    let client = null;
    if (client_id) {
      const { data: cdata, error: cerr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', client_id)
        .single();
      if (cerr) console.warn('Client load warning:', cerr);
      client = cdata || null;
    }

    // Build a JSON-output prompt (we instruct model to return JSON)
    const daysNum = parseInt((String(duration).match(/\d+/) || [duration])[0] || 1, 10);

    const model = getModel('gemini-2.5-flash-lite');

    const intentPrompt = `
You are an expert travel planner. Produce a DAY-WISE itinerary as valid JSON ONLY.

Input:
- destination: ${destination}
- duration_days: ${daysNum}
- travelers: ${travelers || 1}
- interests: ${Array.isArray(interests) ? interests.join(', ') : interests || 'general'}
- budget: ${budget || 'moderate'}
- accommodation: ${accommodation_type || 'hotel'}
- client: ${client ? JSON.stringify({ name: client.full_name, notes: client.notes || '' }) : 'none'}
- dates: ${start_date || ''} to ${end_date || ''}

Return ONLY JSON with the following structure:

{
  "title": "Short title",
  "summary": "50-80 word welcome",
  "destination": "City, Country",
  "duration": ${daysNum},
  "estimated_total_cost": "string or number",
  "flights": {...} (optional),
  "hotel": {...} (optional),
  "daily": [
     {
       "day": 1,
       "date": "YYYY-MM-DD (if available)",
       "title": "Day title",
       "morning": "text",
       "afternoon": "text",
       "evening": "text",
       "activities": ["list", "of", "activities"],
       "meals": { "breakfast": "", "lunch": "", "dinner": "" },
       "transport": "text",
       "notes": "text"
     }
  ],
  "travel_tips": [".."],
  "local_cuisine": [".."]
}

Create realistic activities and approximate costs per day. Keep JSON strictly valid.
Generate ${daysNum} days.
`;

    const result = await model.generateContent(intentPrompt);
    const raw = (await result.response).text();

    let parsedJson = null;
    try {
      parsedJson = JSON.parse(raw);
    } catch (err) {
      // If model returned text (not strict json), attempt to extract JSON substring
      const jsonMatch = raw.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsedJson = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          parsedJson = null;
        }
      }
    }

    // Fallback: if parsing failed, save raw text into content and synthesize a simple JSON
    let aiJSON = parsedJson;
    if (!aiJSON) {
      aiJSON = {
        title: `${destination} ${duration}-day itinerary`,
        summary: raw.slice(0, 300),
        destination,
        duration: daysNum,
        daily: [
          { day: 1, title: 'Plan', morning: raw.slice(0, 200), afternoon: '', evening: '', activities: [], meals: {}, notes: '' }
        ],
        travel_tips: [],
        local_cuisine: []
      };
    }

    const record = {
      destination,
      duration: daysNum,
      budget: budget || null,
      travelers: travelers || 1,
      interests: interests || [],
      accommodation_type: accommodation_type || null,
      ai_generated_content: typeof raw === 'string' ? raw : JSON.stringify(raw),
      ai_generated_json: aiJSON,
      client_id: client_id || null,
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: req.user.id,
      agency_id: req.user.agency_id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('itineraries')
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, itinerary: data });
  } catch (err) {
    console.error('Error generating itinerary:', err);
    return res.status(500).json({ error: 'Failed to generate itinerary', details: err.message });
  }
};

/**
 * Get all itineraries (embedded client, created_by user profile)
 * Supports ?limit=5
 */
export const getItineraries = async (req, res) => {
  console.log('getItineraries called for agency:', req.user.agency_id);
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const clientId = req.query.clientId;

    let query = supabase
      .from('itineraries')
      .select('*')
      .eq('agency_id', req.user.agency_id)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (limit) query = query.limit(limit);

    const { data: itineraries, error } = await query;
    if (error) throw error;

    if (!itineraries || itineraries.length === 0) {
      return res.json({ success: true, itineraries: [] });
    }

    // Manual join for clients
    const clientIds = [...new Set(itineraries.map(i => i.client_id).filter(Boolean))];
    const { data: clients } = await supabase
      .from('clients')
      .select('id, full_name, email, phone')
      .in('id', clientIds);

    const clientMap = (clients || []).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    // Manual join for users
    const userIds = [...new Set(itineraries.map(i => i.created_by).filter(Boolean))];
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);

    const userMap = (users || []).reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    // Merge
    const enriched = itineraries.map(i => ({
      ...i,
      client: clientMap[i.client_id] || null,
      created_by_user: userMap[i.created_by] || null
    }));

    return res.json({ success: true, itineraries: enriched });
  } catch (err) {
    console.error('Error fetching itineraries:', err);
    return res.status(500).json({ error: 'Failed to fetch itineraries', details: err.message });
  }
};

/**
 * Get single itinerary by id
 */
export const getItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('itineraries')
      .select(`
        *,
        client:clients (*),
        created_by_user:users (id, name, email)
      `)
      .eq('id', id)
      .eq('agency_id', req.user.agency_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Itinerary not found' });

    return res.json({ success: true, itinerary: data });
  } catch (err) {
    console.error('Error fetching itinerary:', err);
    return res.status(500).json({ error: 'Failed to fetch itinerary', details: err.message });
  }
};

/**
 * Update itinerary
 */
export const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    delete updates.agency_id;
    delete updates.created_by;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('itineraries')
      .update(updates)
      .eq('id', id)
      .eq('agency_id', req.user.agency_id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, itinerary: data });
  } catch (err) {
    console.error('Error updating itinerary:', err);
    return res.status(500).json({ error: 'Failed to update itinerary', details: err.message });
  }
};

/**
 * Delete itinerary
 */
export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)
      .eq('agency_id', req.user.agency_id);

    if (error) throw error;
    return res.json({ success: true, message: 'Itinerary deleted' });
  } catch (err) {
    console.error('Error deleting itinerary:', err);
    return res.status(500).json({ error: 'Failed to delete itinerary', details: err.message });
  }
};
