interface ApiResponse<T> {
  data: T
  message: string
  total?: number
  limit?: number
  offset?: number
  pages?: number
  [key: string]: any;
}

interface ApiError {
  error: string
  details: string
  timestamp: string
}

interface SignInResponse {
  data: {
    id: string;
    name: string;
    email: string;
    all_subscriptions: any[];
    created_at: string;
    updated_at: string;
  };
  token: string;
  message: string;
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("cuent-ai-token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("cuent-ai-token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("cuent-ai-token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
 console.log("=== INICIO DEBUG ===");
  console.log("URL:", url);
  console.log("Options:", options);
  console.log("Headers:", headers);
  
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return { data: null as T, message: "Success" }
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  // Authentication endpoints
  async signUp(data: { name: string; email: string; password: string }) {
    return this.request<{
      id: string
      name: string
      email: string
      all_subscriptions: any
      created_at: string
      updated_at: string
    }>("/api/v1/users/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async signIn(data: { email: string; password: string }) {
    return this.request<SignInResponse>("/api/v1/users/sign-in", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request<{
      id: string
      name: string
      email: string
      all_subscriptions: any[]
      created_at: string
      updated_at: string
    }>("/api/v1/users/profile")
  }

  async changePassword(data: {
    old_password: string
    new_password: string
    confirm_password: string
  }) {
    return this.request<{}>("/api/v1/users/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async getUserSubscription() {
    return this.request<{
      id: string
      total_Cuentokens: number
      start_date: string
      end_date: string
      subscription: any
      payments: any[]
      created_at: string
    }>("/api/v1/users/subscription")
  }

  // Project endpoints
  async getProjects(params?: { limit?: number; offset?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())
    if (params?.search) searchParams.append("search", params.search)

    const query = searchParams.toString()
    return this.request<
      Array<{
        id: string
        name: string
        description: string
        cuentokens: string
        state: string
        created_at: string
        updated_at: string
        deleted_at: string | null
      }>
    >(`/api/v1/projects${query ? `?${query}` : ""}`)
  }

  async getProject(id: string) {
    return this.request<{
      id: string
      name: string
      description: string
      cuentokens: string
      state: string
      scripts: Array<{
        id: string
        promt_tokens: number
        completion_tokens: number
        total_token: number
        total_cuentoken: number
        state: string
        text_entry: string
        processed_text: string
        mixed_audio: string
        mixed_media: string
        created_at: string
        updated_at: string
      }>
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>(`/api/v1/projects/${id}`)
  }

  async createProject(data: { name: string; description: string; user_id: string }) {
    return this.request<{
      id: string
      name: string
      description: string
      cuentokens: string
      state: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: { name: string; description: string }) {
    return this.request<{
      id: string
      name: string
      description: string
      cuentokens: string
      state: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }>(`/api/v1/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request<null>(`/api/v1/projects/${id}`, {
      method: "DELETE",
    })
  }

  // Script endpoints
  async getScripts(params?: { limit?: number; offset?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())
    if (params?.search) searchParams.append("search", params.search)

    const query = searchParams.toString()
    return this.request<
      Array<{
        id: string
        promt_tokens: number
        completion_tokens: number
        total_token: number
        total_cuentoken: number
        state: string
        text_entry: string
        processed_text: string
        mixed_audio: string
        mixed_media: string
        assets: any[]
        created_at: string
        updated_at: string
      }>
    >(`/api/v1/scripts${query ? `?${query}` : ""}`)
  }

  async getScript(id: string) {
    return this.request<{
      id: string
      promt_tokens: number
      completion_tokens: number
      total_token: number
      total_cuentoken: number
      state: string
      text_entry: string
      processed_text: string
      mixed_audio: string
      mixed_media: string
      assets: any[]
      created_at: string
      updated_at: string
    }>(`/api/v1/scripts/${id}`)
  }

  async getScriptsByProject(projectId: string) {
    return this.request<
      Array<{
        id: string
        promt_tokens: number
        completion_tokens: number
        total_token: number
        total_cuentoken: number
        state: string
        text_entry: string
        processed_text: string
        mixed_audio: string
        mixed_media: string
        assets: any[]
        created_at: string
        updated_at: string
      }>
    >(`/api/v1/scripts/project/${projectId}`)
  }

  async createScript(data: { text_entry: string; project_id: string }) {
    return this.request<{
      id: string
      promt_tokens: number
      completion_tokens: number
      total_token: number
      total_cuentoken: number
      state: string
      text_entry: string
      processed_text: string
      mixed_audio: string
      mixed_media: string
      assets: any[]
      created_at: string
      updated_at: string
    }>("/api/v1/scripts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createManualScript(data: {
    lines: Array<{ text: string; type: string }>
    project_id: string
  }) {
    console.log("Creating manual script with data:", data)
    return this.request<{
      id: string
      promt_tokens: number
      completion_tokens: number
      total_token: number
      total_cuentoken: number
      state: string
      text_entry: string
      processed_text: string
      mixed_audio: string
      mixed_media: string
      assets: any[]
      created_at: string
      updated_at: string
    }>("/api/v1/scripts/manual-create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async regenerateScript(id: string) {
    return this.request<{
      id: string
      promt_tokens: number
      completion_tokens: number
      total_token: number
      total_cuentoken: number
      state: string
      text_entry: string
      processed_text: string
      mixed_audio: string
      mixed_media: string
      assets: any[]
      created_at: string
      updated_at: string
    }>(`/api/v1/scripts/${id}/regenerate`, {
      method: "PATCH",
    })
  }

  async mixScriptAssets(id: string) {
    return this.request<{}>(`/api/v1/scripts/${id}/mixed`, {
      method: "POST",
    })
  }

  // Asset endpoints
  async getAssets(params?: { limit?: number; offset?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())
    if (params?.search) searchParams.append("search", params.search)

    const query = searchParams.toString()
    return this.request<
      Array<{
        id: string
        type: string
        video_url: string
        audio_url: string
        line: string
        audio_state: string
        video_state: string
        duration: number
        position: number
        meta_data: any[]
        created_at: string
        updated_at: string
      }>
    >(`/api/v1/assets${query ? `?${query}` : ""}`)
  }

  async getAsset(id: string) {
    return this.request<{
      id: string
      type: string
      video_url: string
      audio_url: string
      line: string
      audio_state: string
      video_state: string
      duration: number
      position: number
      meta_data: any[]
      created_at: string
      updated_at: string
    }>(`/api/v1/assets/${id}`)
  }

  async getAssetsByScript(scriptId: string) {
    return this.request<
      Array<{
        id: string
        type: string
        video_url: string
        audio_url: string
        line: string
        audio_state: string
        video_state: string
        duration: number
        position: number
        meta_data: any[]
        created_at: string
        updated_at: string
      }>
    >(`/api/v1/assets/${scriptId}/script`)
  }

  async generateAsset(id: string) {
    return this.request<{}>(`/api/v1/assets/${id}`, {
      method: "POST",
    })
  }

  async generateAllAssets(scriptId: string) {
    return this.request<any[]>(`/api/v1/assets/${scriptId}/generate_all`, {
      method: "POST",
    })
  }

  async regenerateAllAssets(scriptId: string) {
    return this.request<any[]>(`/api/v1/assets/${scriptId}/regenerate_all`, {
      method: "POST",
    })
  }

  async generateVideo(id: string, data: { key_words: string }) {
    return this.request<{}>(`/api/v1/assets/${id}/generate_video`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Subscription endpoints
  async getSubscriptionPlans(params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())

    const query = searchParams.toString()
    return this.request<
      Array<{
        id: string
        name: string
        description: string
        price: number
        currency: string
        interval: string
        features: any[]
        is_active: boolean
        created_at: string
        updated_at: string
      }>
    >(`/api/v1/subscription${query ? `?${query}` : ""}`)
  }

  async getSubscriptionPlan(id: string) {
    return this.request<{
      id: string
      name: string
      description: string
      price: number
      currency: string
      interval: string
      features: any[]
      is_active: boolean
      created_at: string
      updated_at: string
    }>(`/api/v1/subscription/${id}`)
  }
}

export const apiClient = new ApiClient()
