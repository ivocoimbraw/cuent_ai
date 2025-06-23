export interface Project {
  id: string
  name: string
  description: string
  cuentokens: string
  state: string
  scripts?: any[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Script {
  id: string
  text_entry: string
  state: string
  position?: number
  assets: Asset[]
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  type: "TTS" | "SFX"
  video_url?: string
  audio_url?: string
  line: string
  audio_state: "PENDING" | "PROCESSING" | "FINISHED" | "ERROR"
  video_state: "PENDING" | "PROCESSING" | "FINISHED" | "ERROR"
  duration?: number
  position: number
  meta_data: any[]
  script_id?: string
  created_at: string
  updated_at: string
}
