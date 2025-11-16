# Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CRM APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React)                      │  │
│  ├─────────────────────────────────���────────────────────────┤  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐  │  │
│  │  │  Clients Page   │  │  Itineraries Page            │  │  │
│  │  │                 │  │                              │  │  │
│  │  │ • View Clients  │  │ • Create Itinerary Dialog    │  │  │
│  │  │ • Add Client    │  │ • List Itineraries           │  │  │
│  │  │ • View Itins    │  │ • AI Builder                 │  │  │
│  │  └────────┬────────┘  └──────────────┬───────────────┘  │  │
│  │           │                          │                  │  │
│  │           └──────────────┬───────────┘                  │  │
│  │                          │                              │  │
│  │                    ┌─────▼──────┐                       │  │
│  │                    │  Logger    │                       │  │
│  │                    │  Utility   │                       │  │
│  │                    └─────┬──────┘                       │  │
│  │                          │                              │  │
│  │                    ┌─────▼──────┐                       │  │
│  │                    │  API Client│                       │  │
│  │                    │  (axios)   │                       │  │
│  │                    └─────┬──────┘                       │  │
│  │                          │                              │  │
│  └──────────────────────────┼──────────────────────────────┘  │
│                             │                                 │
│                    HTTP/REST API                              │
│                             │                                 │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                    BACKEND (Node.js)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              API Routes                          │   │  │
│  │  │                                                  │   │  │
│  │  │  POST   /clients          → createClient        │   │  │
│  │  │  GET    /clients          → getClients          │   │  │
│  │  │  POST   /itineraries      → createItinerary     │   │  │
│  │  │  GET    /itineraries      → getItineraries      │   │  │
│  │  │  GET    /itineraries?client_id=X → filtered     │   │  │
│  │  └──────────────┬───────────────────────────────────┘   │  │
│  │                 │                                        │  │
│  │  ┌──────────────▼───────────────────────────────────┐   │  │
│  │  │           Controllers                            │   │  │
│  │  │                                                  │   │  │
│  │  │  ┌─────────────────────────────────────────┐    │   │  │
│  │  │  │  Client Controller                      │    │   │  │
│  │  │  │  • getClients()                         │    │   │  │
│  │  │  │  • createClient()                       │    │   │  │
│  │  │  │  • [+ Logging]                          │    │   │  │
│  │  │  └─────────────────────────────────────────┘    │   │  │
│  │  │                                                  │   │  │
│  │  │  ┌─────────────────────────────────────────┐    │   │  │
│  │  │  │  Itinerary Controller                   │    │   │  │
│  │  │  │  • createItinerary()                    │    │   │  │
│  │  │  │  • getItineraries()                     │    │   │  │
│  │  │  │  • [+ client_id validation]             │    │   │  │
│  │  │  │  • [+ Logging]                          │    │   │  │
│  │  │  └─────────────────────────────────────────┘    │   │  │
│  │  └──────────────┬───────────────────────────────────┘   │  │
│  │                 │                                        │  │
│  │  ┌──────────────▼───────────────────────────────────┐   │  │
│  │  │           Logger Utility                         │   │  │
│  │  │                                                  │   │  │
│  │  │  • Structured logging                           │   │  │
│  │  │  • Timestamps                                   │   │  │
│  │  │  • Color-coded output                           │   │  │
│  │  │  • Context prefixes                             │   │  │
│  │  └──────────────┬─────────���─────────────────────────┘   │  │
│  │                 │                                        │  │
│  │  ┌──────────────▼───────────────────────────────────┐   │  │
│  │  │           Supabase Client                        │   │  │
│  │  │                                                  │   │  │
│  │  │  • Database queries                             │   │  │
│  │  │  • Authentication                               │   │  │
│  │  └──────────────┬───────────────────────────────────┘   │  │
│  │                 │                                        │  │
│  └─────────────────┼────────────────────────────────────────┘  │
│                    │                                            │
│                    │ PostgreSQL                                 │
│                    │                                            │
│  ┌─────────────────▼────────────────────────────────────────┐  │
│  │              DATABASE (Supabase)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │  │
│  │  │  clients table   │  │  itineraries table           │ │  │
│  │  │                  │  │                              │ │  │
│  │  │ • id (PK)        │  │ • id (PK)                    │ │  │
│  │  │ • full_name      │  │ • title                      │ │  │
│  │  │ • email          │  │ • destination                │ │  │
│  │  │ • phone          │  │ • client_id (FK) ◄──────────┼┼─┤  │
│  │  ��� • agency_id      │  │ • agency_id                  │ │  │
│  │  │ • created_at     │  │ • created_at                 │ │  │
│  │  └──────────────────┘  │ • [+ other fields]           │ │  │
│  │                        └──────────────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Creating Itinerary with Client

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                             ��
│                                                                 │
│  1. User selects client from dropdown                           │
│  2. User fills in itinerary details                             │
│  3. User clicks "Create Itinerary"                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: CreateItineraryDialog                    │
│                                                                 │
│  handleSubmit() {                                               │
│    console.log('[CREATE_ITINERARY] Submitting form...')         │
│                                                                 │
│    const payload = {                                            │
│      title: "Paris Adventure",                                  │
│      destination: "Paris, France",                              │
│      client_id: "550e8400-e29b-41d4-a716-446655440000",        │
│      travelers: 2,                                              │
│      budget: 5000,                                              │
│      status: 'draft'                                            │
│    }                                                            │
│                                                                 │
│    console.log('[CREATE_ITINERARY] Final payload:', payload)    │
│    api.post('/itineraries', payload)                            │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP REQUEST                                 │
│                                                                 │
│  POST /api/itineraries                                          │
│  Content-Type: application/json                                 │
│  Authorization: Bearer <token>                                  │
│                                                                 │
│  {                                                              │
│    "title": "Paris Adventure",                                  │
│    "destination": "Paris, France",                              │
│    "client_id": "550e8400-e29b-41d4-a716-446655440000",        │
│    "travelers": 2,                                              │
│    "budget": 5000,                                              │
│    "status": "draft"                                            │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           BACKEND: itineraryController.createItinerary()        │
│                                                                 │
│  console.log('[ITINERARY] Creating manual itinerary...')        │
│                                                                 │
│  const {                                                        │
│    title,                                                       │
│    destination,                                                 │
│    client_id,  // "550e8400-e29b-41d4-a716-446655440000"       │
│    ...                                                          │
│  } = req.body                                                   │
│                                                                 │
│  console.log('[ITINERARY] Parsed fields - client_id:', client_id)
│                                                                 │
│  // ✅ KEY FIX: Convert empty string to null                   │
│  const finalClientId = client_id && client_id.trim() !== ''    │
│    ? client_id                                                  │
│    : null                                                       │
│                                                                 │
│  console.log('[ITINERARY] Final client_id:', finalClientId)     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────��────────────┐
│              DATABASE: INSERT Operation                         │
│                                                                 │
│  console.log('[ITINERARY] Inserting record...')                 │
│                                                                 │
│  INSERT INTO itineraries (                                      │
│    title,                                                       │
│    destination,                                                 │
│    client_id,  -- "550e8400-e29b-41d4-a716-446655440000"       │
│    agency_id,                                                   │
│    created_by,                                                  │
│    status,                                                      │
│    created_at                                                   │
│  ) VALUES (...)                                                 │
│                                                                 │
│  RETURNING *                                                    │
└────────────────────────┬──────────────────────────────���─────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE: Record Created                           │
│                                                                 │
│  {                                                              │
│    id: "660e8400-e29b-41d4-a716-446655440001",                │
│    title: "Paris Adventure",                                    │
│    destination: "Paris, France",                                │
│    client_id: "550e8400-e29b-41d4-a716-446655440000",         │
│    agency_id: "...",                                            │
│    status: "draft",                                             │
│    created_at: "2024-01-15T10:30:45.456Z"                      │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           BACKEND: Response Sent                                │
│                                                                 ��
│  console.log('[ITINERARY] Successfully created:', data.id)      │
│                                                                 │
│  res.status(201).json({                                         │
│    success: true,                                               │
│    itinerary: data                                              │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: Response Received                        │
│                                                                 │
│  onSuccess() {                                                  │
│    console.log('[CREATE_ITINERARY] Success')                    │
│    toast.success('Itinerary created successfully')              │
│    queryClient.invalidateQueries(['itineraries'])               │
│    onClose()  // Close dialog                                   │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES                                    │
│                                                                 │
│  ✅ Toast notification: "Itinerary created successfully"        │
│  ✅ Dialog closes                                               │
│  ✅ Itinerary appears in list                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Viewing Client Itineraries

```
┌────���────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                             │
│                                                                 │
│  User clicks "View Itineraries" button on client row            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: Clients Page                             │
│                                                                 │
│  handleViewItineraries(client) {                                │
│    console.log('[CLIENTS] Viewing itineraries for:', client.id) │
│                                                                 │
│    setSelectedClient(client)                                    │
│    setShowItinerariesModal(true)                                │
│                                                                 │
│    console.log('[CLIENTS] Fetching with client_id:', client.id) │
│    api.get(`/itineraries?client_id=${client.id}`)               │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP REQUEST                                 │
│                                                                 │
│  GET /api/itineraries?client_id=550e8400-e29b-41d4-a716-...    │
│  Authorization: Bearer <token>                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│        BACKEND: itineraryController.getItineraries()            │
│                                                                 │
│  const clientId = req.query.client_id                           │
│  console.log('[ITINERARY] Fetching - client_id:', clientId)     │
│                                                                 │
│  let query = supabase                                           │
│    .from('itineraries')                                         │
│    .select('*')                                                 │
│    .eq('agency_id', req.user.agency_id)                         │
│                                                                 │
│  if (clientId) {                                                │
│    console.log('[ITINERARY] Filtering by client_id:', clientId) │
│    query = query.eq('client_id', clientId)  // ✅ KEY FILTER   │
│  }                                                              │
│                                                                 │
│  const { data } = await query                                   │
│  console.log('[ITINERARY] Fetched', data.length, 'itineraries') │
└────────────────────────┬──────────────��─────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE: SELECT Query                             │
│                                                                 │
│  SELECT *                                                       │
│  FROM itineraries                                               │
│  WHERE agency_id = '...'                                        │
│    AND client_id = '550e8400-e29b-41d4-a716-446655440000'      │
│  ORDER BY created_at DESC                                       │
│                                                                 │
│  Result: 3 itineraries found                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌───────────��─────────────────────────────────────────────────────┐
│              BACKEND: Response Sent                             │
│                                                                 │
│  res.json({                                                     │
│    success: true,                                               │
│    itineraries: [                                               │
│      {                                                          │
│        id: "660e8400-e29b-41d4-a716-446655440001",             │
│        title: "Paris Adventure",                                │
│        destination: "Paris, France",                            │
│        client_id: "550e8400-e29b-41d4-a716-446655440000",      │
│        ...                                                      │
│      },                                                         │
│      { ... },                                                   │
│      { ... }                                                    │
│    ]                                                            │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: Response Received                        │
│                                                                 │
│  console.log('[CLIENTS] Received itineraries:', data.length)    │
│  console.log('[CLIENTS] Itineraries data:', data)               │
│                                                                 │
│  setClientItineraries(data)                                     │
│  // Modal re-renders with itineraries                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌──────────��──────────────────────────────────────────────────────┐
│                    USER SEES                                    │
│                                                                 │
│  Modal opens showing:                                           │
│  ✅ "Itineraries for John Doe"                                  │
│  ✅ 3 itineraries listed:                                       │
│     • Paris Adventure - Paris, France - 5 days - draft          │
│     • Tokyo Trip - Tokyo, Japan - 7 days - draft                │
│     • NYC Weekend - New York, USA - 3 days - confirmed          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Logging Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGGING SYSTEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Logger Utility (Backend)                    │  │
│  │                                                          │  │
│  │  class Logger {                                          │  │
│  │    log(level, message, data)                             │  │
│  │    debug(message, data)                                  │  │
│  │    info(message, data)                                   │  │
│  │    warn(message, data)                                   │  │
│  │    error(message, error)                                 │  │
│  │  }                                                       │  │
│  │                                                          │  │
│  │  Instances:                                              │  │
│  │  • clientLogger                                          │  │
│  │  • itineraryLogger                                       │  │
│  │  • authLogger                                            │  │
│  │  • databaseLogger                                        │  │
│  │  • apiLogger                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Logger Utility (Frontend)                   │  │
│  │                                                          │  │
│  │  class Logger {                                          │  │
│  │    log(level, message, data)                             │  │
│  │    debug(message, data)                                  │  │
│  │    info(message, data)                                   │  │
│  │    warn(message, data)                                   │  │
│  │    error(message, error)                                 │  │
│  │    group(label)                                          │  │
│  │    table(data)                                           │  │
│  │  }                                                       │  │
│  │                                                          │  │
│  │  Instances:                                              │  │
│  │  • appLogger                                             │  │
│  │  • clientLogger                                          │  │
│  │  • itineraryLogger                                       │  │
│  │  • apiLogger                                             │  │
│  │  • authLogger                                            │  │
│  │  • dashboardLogger                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Log Output                                  │  │
│  │                                                          │  │
│  │  Backend (Terminal):                                     │  │
│  │  [2024-01-15T10:30:45.123Z] [ITINERARY] [INFO] Message  │  │
│  │  (with ANSI color codes)                                 │  │
│  │                                                          │  │
│  │  Frontend (Browser Console):                             │  │
│  │  [2024-01-15T10:30:45.123Z] [ITINERARY] [INFO] Message  │  │
│  │  (with CSS color styling)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Relevant Parts)

```
┌─────────────────────────────────────────────────���───────────────┐
│                    CLIENTS TABLE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Column Name      │ Type      │ Constraints                     │
│  ─────────────────┼───────────┼─────────────────────────────    │
│  id               │ UUID      │ PRIMARY KEY                     │
│  full_name        │ VARCHAR   │ NOT NULL                        │
│  email            │ VARCHAR   │ NOT NULL                        │
│  phone            │ VARCHAR   │ NULLABLE                        │
│  agency_id        │ UUID      │ NOT NULL, FOREIGN KEY           │
│  created_at       │ TIMESTAMP │ NOT NULL                        │
│  updated_at       │ TIMESTAMP │ NULLABLE                        │
│                                                                 │
└───────��─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ITINERARIES TABLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Column Name      │ Type      │ Constraints                     │
│  ─────────────────┼───────────┼─────────────────────────────    │
│  id               │ UUID      │ PRIMARY KEY                     │
│  title            │ VARCHAR   │ NOT NULL                        │
│  destination      │ VARCHAR   │ NOT NULL                        │
│  client_id        │ UUID      │ NULLABLE, FOREIGN KEY ──────┐   │
│  agency_id        │ UUID      │ NOT NULL, FOREIGN KEY       │   │
│  status           │ VARCHAR   │ DEFAULT 'draft'             │   │
│  created_at       │ TIMESTAMP │ NOT NULL                    │   │
│  updated_at       │ TIMESTAMP │ NULLABLE                    │   │
│                                                             │   │
│  ┌───────────────────────────────────────────────────────┘   │
│  │                                                            │
│  └──► REFERENCES clients(id)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  One Client ──────────────────► Many Itineraries               │
│                                                                 │
│  clients.id = itineraries.client_id                            │
│                                                                 │
│  Example:                                                       │
│  Client: John Doe (id: 550e8400-...)                           │
│    ├─ Itinerary: Paris Adventure (client_id: 550e8400-...)     │
│    ├─ Itinerary: Tokyo Trip (client_id: 550e8400-...)          │
│    └─ Itinerary: NYC Weekend (client_id: 550e8400-...)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIO                               │
│                                                                 │
│  User tries to create itinerary without required fields         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌────────────���────────────────────────────────────────────────────┐
│              FRONTEND: Form Validation                          │
│                                                                 │
│  if (!title || !destination) {                                  │
│    console.log('[CREATE_ITINERARY] Validation failed')          │
│    toast.error('Title and destination are required')            │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: Validation Check                          │
│                                                                 │
│  if (!title || !destination) {                                  │
│    console.warn('[ITINERARY] Validation failed')                │
│    return res.status(400).json({                                │
│      error: 'title and destination are required'                │
│    })                                                           │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: Error Handling                           │
│                                                                 │
│  onError: (error) => {                                          │
│    console.error('[CREATE_ITINERARY] Error:', error)            │
│    toast.error(error.response?.data?.error)                     │
│  }                                                              │
└──────────────────��─────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES                                    │
│                                                                 │
│  ❌ Toast notification: "Title and destination are required"    │
│  ❌ Form remains open for correction                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

This architecture ensures:
- ✅ **Proper Data Linking** - client_id correctly stored and filtered
- ✅ **Complete Visibility** - All operations logged with context
- ✅ **Error Tracking** - Errors logged with full details
- ✅ **Data Integrity** - Foreign key relationships maintained
- ✅ **Easy Debugging** - Structured logs for quick issue identification
