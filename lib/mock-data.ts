export const mockLoginResponse = {
  data: {
    id: "user-123",
    name: "María García",
    email: "maria@example.com",
    all_subscriptions: [
      {
        total_Cuentokens: 525,
        Subscription: { name: "Free", cuent_tokens: 1000 },
      },
      {
        total_Cuentokens: 3925,
        Subscription: { name: "Standard", cuent_tokens: 5000 },
      },
    ],
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  message: "User authenticated",
}

export const mockProjects = [
  {
    id: "proj-1",
    name: "El Bosque Mágico",
    description: "Un cuento sobre aventuras en un bosque encantado",
    user_id: "user-123",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "proj-2",
    name: "La Princesa Valiente",
    description: "Historia de una princesa que salva su reino",
    user_id: "user-123",
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-10T14:20:00Z",
  },
]

// Mock assets with sample audio and video URLs for testing
export const mockAssets = [
  {
    id: "asset-1",
    type: "TTS" as const,
    line: "Había una vez, en un bosque muy lejano, una pequeña niña llamada Luna.",
    audio_state: "FINISHED" as const,
    video_state: "FINISHED" as const,
    audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    duration: 3.5,
    position: 1,
    meta_data: [],
    script_id: "script-1",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "asset-2",
    type: "SFX" as const,
    line: "Sonido del viento susurrando entre los árboles",
    audio_state: "FINISHED" as const,
    video_state: "PENDING" as const,
    audio_url: "https://www.soundjay.com/misc/sounds/wind.mp3",
    duration: 2.8,
    position: 2,
    meta_data: [],
    script_id: "script-1",
    created_at: "2024-01-15T10:32:00Z",
    updated_at: "2024-01-15T10:32:00Z",
  },
  {
    id: "asset-3",
    type: "TTS" as const,
    line: "Luna caminó por el sendero mágico, siguiendo las luces brillantes.",
    audio_state: "PROCESSING" as const,
    video_state: "PENDING" as const,
    duration: 4.2,
    position: 3,
    meta_data: [],
    script_id: "script-1",
    created_at: "2024-01-15T10:35:00Z",
    updated_at: "2024-01-15T10:35:00Z",
  },
]

export const subscriptionPlans = [
  {
    name: "Free",
    tokens: 1000,
    price: 0,
    features: ["1,000 Cuent-tokens", "Proyectos básicos", "Soporte por email"],
  },
  {
    name: "Standard",
    tokens: 5000,
    price: 9.99,
    features: ["5,000 Cuent-tokens", "Proyectos ilimitados", "Soporte prioritario", "Exportación avanzada"],
  },
  {
    name: "Pro",
    tokens: 25000,
    price: 29.99,
    features: ["25,000 Cuent-tokens", "Colaboración en equipo", "API access", "Análisis avanzado"],
  },
  {
    name: "Enterprise",
    tokens: 100000,
    price: 99.99,
    features: ["100,000 Cuent-tokens", "Soporte dedicado", "Integración personalizada", "SLA garantizado"],
  },
]
