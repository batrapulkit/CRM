// server/src/controllers/aiController.js
import { getModel } from '../config/gemini.js';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../../debug.log');

function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
}

/* simplified system prompt */
const SYSTEM_PROMPT = `You are TONO, Triponic B2B's AI assistant. Be helpful, professional, and concise.
Capabilities: Create itineraries, invoices, answer app questions.
If the user asks to create something, I handle automation. You just acknowledge it friendly.
IMPORTANT: Speak naturally. Do NOT return JSON.`;

/* intent detection uses model to parse user message into fields */
async function detectIntent(message) {
  logToFile(`Detecting intent for: ${message}`);
  const model = getModel();

  const prompt = `
Extract fields from the message:
"${message}"

Return ONLY JSON:
{ 
  "intent": "itinerary|edit_itinerary|invoice|booking|proposal|general", 
  "client_name": "string|null", 
  "destination": "string|null", 
  "duration": "string|null", 
  "dates": "string|null", 
  "itinerary_id": "string|null",
  "edit_instruction": "string|null",
  "invoice_amount": "number|null",
  "invoice_description": "string|null"
}

Note: Use "itinerary" for creating new trips.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const usage = response.usageMetadata;
  if (usage) {
    console.log(`Token Usage (Intent): P=${usage.promptTokenCount} R=${usage.candidatesTokenCount} T=${usage.totalTokenCount}`);
    logToFile(`Token Usage (Intent): ${JSON.stringify(usage)}`);
  }
  const raw = response.text().trim();
  try {
    // Clean up markdown code blocks if present
    const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanRaw);
  } catch (err) {
    // fallback safe default
    return { intent: 'general', client_name: null, destination: null, duration: null, dates: null };
  }
}

/* create a day-wise itinerary via model (returns JSON object or fallback text) */
async function createDayWiseItinerary({ destination, duration, interests, travelers, budget, client }) {
  const model = getModel();
  const daysNum = parseInt((String(duration).match(/\d+/) || [duration])[0] || 1, 10);
  const clientLocation = client.address || "unknown"; // Assuming address contains city or we default

  const prompt = `You are an AI travel planner. Generate a complete trip itinerary.

Trip Details:
- Destination: ${destination}
- Duration: ${daysNum} days
- Travelers: ${travelers || 1}
- Budget: ${budget || 'moderate'}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : interests || 'general'}
- User City: ${clientLocation}
- Currency: USD

Return ONLY valid JSON:

{
  "content": "Welcome message (50-80 words)",
  "detailedPlan": {
    "destination": "${destination}",
    "description": "Description (40-60 words)",
    "thumbnail": "Landmark name",
    "duration": "${daysNum} days",
    "travelers": ${travelers || 1},
    "budget": "${budget || 'moderate'}",
    "interest": "${Array.isArray(interests) ? interests.join(', ') : interests || 'general'}",
    "totalCost": "Estimated cost range",
    "flights": { "departure": "${clientLocation}", "price": "$XXX", "airline": "Name", "duration": "X hours" },
    "hotel": { "name": "Hotel name", "location": "Area", "price": "$XXX/night", "rating": 4.5, "amenities": ["WiFi", "Breakfast"] },
    "dailyPlan": [
      {
        "day": 1,
        "title": "Day title",
        "description": "Brief description",
        "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4"],
        "activitiesDescription": ["Detail 1 (30-40 words)", "Detail 2", "Detail 3", "Detail 4"],
        "travelTips": ["Tip 1", "Tip 2"],
        "meals": { "breakfast": "Suggestion", "lunch": "Suggestion", "dinner": "Suggestion" },
        "notes": "Notes",
        "image": "Landmark",
        "weather": "Weather",
        "transport": "Transport"
      }
    ],
    "weather": { "temp": "XX-XX°C", "condition": "Condition", "recommendation": "What to pack" }
  },
  "suggestions": ["Tip 1", "Tip 2", "Tip 3"]
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const usage = response.usageMetadata;
  if (usage) {
    console.log(`Token Usage (Itinerary Gen): P=${usage.promptTokenCount} R=${usage.candidatesTokenCount} T=${usage.totalTokenCount}`);
    logToFile(`Token Usage (Itinerary Gen): ${JSON.stringify(usage)}`);
  }
  const raw = response.text();
  // parse attempt
  try {
    const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanRaw);
  } catch (err) {
    const match = raw.match(/(\{[\s\S]*\})/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (_) { /* continue */ }
    }
    // fallback to a simple object with raw text in first day
    return {
      content: raw.slice(0, 200),
      detailedPlan: {
        destination,
        duration: `${daysNum} days`,
        dailyPlan: [{ day: 1, title: 'Day 1', description: raw.slice(0, 200), activities: [], meals: {}, notes: '' }]
      }
    };
  }
}

/* Edit an existing itinerary using LLM */
async function editItinerary(currentJson, instruction) {
  const model = getModel();
  const prompt = `
You are an expert travel planner.
I have an existing itinerary JSON:
${JSON.stringify(currentJson, null, 2)}

User Instruction: "${instruction}"

Please modify the JSON to reflect the user's instruction.
Ensure the structure remains EXACTLY the same.
Return ONLY the modified valid JSON.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const usage = response.usageMetadata;
  if (usage) {
    console.log(`Token Usage (Edit): P=${usage.promptTokenCount} R=${usage.candidatesTokenCount} T=${usage.totalTokenCount}`);
    logToFile(`Token Usage (Edit): ${JSON.stringify(usage)}`);
  }
  const raw = response.text();
  try {
    const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanRaw);
  } catch (err) {
    console.error('Failed to parse edited JSON', err);
    return null;
  }
}

/* MAIN chat endpoint — will auto-create itineraries when intent says so */
export const chatWithAI = async (req, res) => {
  try {
    const { message, conversation_history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const intentData = await detectIntent(message);
    const { intent, client_name, destination, duration, edit_instruction, invoice_amount, invoice_description } = intentData;

    // Normalize intent
    const normalizedIntent = (intent === 'create_itinerary' || intent === 'plan_trip') ? 'itinerary' : intent;

    // --- CREATE ITINERARY ---
    if (normalizedIntent === 'itinerary' && client_name) {
      // find client with partial match
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .ilike('full_name', `%${client_name}%`)
        .eq('agency_id', req.user.agency_id);

      if (!clients || clients.length === 0) {
        return res.json({ success: true, response: `I couldn't find a client named "${client_name}". Please check the name or create the client first.` });
      }
      const client = clients[0];

      if (!destination || !duration) {
        return res.json({ success: true, response: 'Please provide both destination and duration to create the itinerary. For example: "Create a 5 day trip to Paris for John Doe"' });
      }

      let aiJson;
      let aiText;

      // 1. Check if we already have an itinerary for this destination in this agency
      const { data: existingItineraries } = await supabase
        .from('itineraries')
        .select('*')
        .ilike('destination', destination) // exact or case-insensitive match
        .eq('agency_id', req.user.agency_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingItineraries && existingItineraries.length > 0) {
        // REUSE EXISTING
        const existing = existingItineraries[0];
        console.log(`Found existing itinerary for ${destination}, reusing ID: ${existing.id}`);
        aiJson = existing.ai_generated_json;
        aiText = existing.ai_generated_content;
      } else {
        // GENERATE NEW
        try {
          aiJson = await createDayWiseItinerary({ destination, duration, interests: client.interests, travelers: 1, budget: client.budget_range, client });
          aiText = aiJson.content || (aiJson.detailedPlan && aiJson.detailedPlan.description) || "Itinerary created.";
        } catch (genError) {
          console.error("AI Generation Error:", genError);
          return res.json({ success: true, response: "I'm sorry, I encountered an error while generating the itinerary plan. Please try again." });
        }
      }

      // Map the new structure to the DB fields
      // aiJson has { content, detailedPlan: { ... } }
      // We store the whole thing in ai_generated_json
      // And use content or detailedPlan.description for ai_generated_content

      // aiText is already set above

      // save to DB
      const { data: saved, error } = await supabase
        .from('itineraries')
        .insert({
          destination,
          duration: aiJson.detailedPlan?.duration ? parseInt(aiJson.detailedPlan.duration) : parseInt((String(duration).match(/\d+/) || [duration])[0] || 1, 10),
          ai_generated_content: aiText,
          ai_generated_json: aiJson, // Store the full new structure
          client_id: client.id,
          agency_id: req.user.agency_id,
          created_by: req.user.id,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // success response
      return res.json({
        success: true,
        action: 'itinerary_created',
        itinerary_id: saved.id,
        response: `Itinerary created for ${client.full_name}. Destination: ${destination}.`,
        raw: aiJson
      });
    }

    // --- CREATE INVOICE ---
    if (intent === 'invoice' && client_name && invoice_amount) {
      // find client
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .ilike('full_name', `%${client_name}%`)
        .eq('agency_id', req.user.agency_id);

      if (!clients || clients.length === 0) {
        return res.json({ success: true, response: `I couldn't find client similar to "${client_name}" to create an invoice.` });
      }
      const client = clients[0];
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          agency_id: req.user.agency_id,
          client_id: client.id,
          total: parseFloat(invoice_amount),
          status: 'draft',
          invoice_number: invoiceNumber,
          created_by: req.user.id,
          created_at: new Date().toISOString(),
          notes: invoice_description || 'AI Generated Invoice',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Due in 7 days default
        })
        .select()
        .single();

      if (error) {
        console.error("AI Invoice creation error:", error);
        return res.json({ success: true, response: "I encountered an error creating the invoice." });
      }

      return res.json({
        success: true,
        action: 'invoice_created',
        invoice_id: invoice.id,
        response: `Invoice #${invoiceNumber} created for ${client.full_name} for $${invoice_amount}.`
      });
    }

    // fallback: simple chat mode (short)
    const model = getModel();
    let historyString = '';
    // Enforce server-side limit: last 6 messages max
    const recentHistory = (conversation_history || []).slice(-6);
    recentHistory.forEach(m => historyString += `${m.role.toUpperCase()}: ${m.content}\n`);

    const prompt = SYSTEM_PROMPT + '\n\n' + historyString + `USER: ${message}\nTONO:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 150, // Limit response length for speed/cost
        temperature: 0.7,
      }
    });
    const response = await result.response;
    const usage = response.usageMetadata;
    if (usage) {
      console.log(`Token Usage (Chat): P=${usage.promptTokenCount} R=${usage.candidatesTokenCount} T=${usage.totalTokenCount}`);
      logToFile(`Token Usage (Chat): ${JSON.stringify(usage)}`);
    }
    const reply = response.text();

    // save conversation (best-effort)
    try {
      await supabase.from('ai_conversations').insert({
        user_id: req.user.id,
        agency_id: req.user.agency_id,
        ai_response: reply,
        created_at: new Date().toISOString()
      });
    } catch (dberr) { console.warn('AI conv save failed', dberr); }

    // Include usage in response if available
    // const usage = (await result.response).usageMetadata; 
    // We log usage server-side but do NOT send it to client/agency
    return res.json({ success: true, response: reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('AI controller error:', err);
    logToFile(`AI controller error: ${err.message}\n${err.stack}`);

    if (err.message && err.message.includes('429')) {
      return res.json({ success: true, response: "I'm currently experiencing high traffic (Quota Exceeded). Please try again in a minute." });
    }

    return res.status(500).json({ error: 'AI processing failed', details: err.message });
  }
};
