import { apiClient } from "@/lib/client"

// Type transformations
function transformAsset(data: any) {
  return {
    ...data,
    type: data.type as "TTS" | "SFX",
    audio_state: data.audio_state as "PENDING" | "PROCESSING" | "FINISHED" | "ERROR",
    video_state: data.video_state as "PENDING" | "PROCESSING" | "FINISHED" | "ERROR"
  }
}

function transformScript(data: any) {
  return {
    ...data,
    state: data.state as "PENDING" | "PROCESSING" | "FINISHED" | "ERROR",
    assets: data.assets?.map((asset: any) => transformAsset(asset)) || []
  }
}

// Server-side data fetching functions
export async function getProjects() {
  try {
    console.log("Petición a getProjects")
      const response = await apiClient.getProjects()
      return response.data
    } catch (error) {
        console.error("Error fetching projects:", error)
        return []
    }
}

export async function getProject(id: string) {
    try {
    console.log("Petición a getProjects")
    const response = await apiClient.getProject(id)
    const project = response.data
    // Transform scripts if they exist
    if (project.scripts) {
      project.scripts = project.scripts.map((script: any) => transformScript(script))
    }
    return project
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }
}

export async function getScript(id: string) {
  try {
    const response = await apiClient.getScript(id)
    return transformScript(response.data)
  } catch (error) {
    console.error(`Error fetching script ${id}:`, error)
    return null
  }
}

export async function getAssetsByScript(scriptId: string) {
  try {
    const response = await apiClient.getAssetsByScript(scriptId)
    return response.data.map((asset: any) => transformAsset({ ...asset, script_id: scriptId }))
  } catch (error) {
    console.error(`Error fetching assets for script ${scriptId}:`, error)
    return []
  }
}

// Client-side action functions
export async function createProject(data: { name: string; description: string; user_id: string }) {
  try {
    const response = await apiClient.createProject(data)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al crear proyecto" }
  }
}

export async function generateAsset(assetId: string) {
  try {
    await apiClient.generateAsset(assetId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al generar asset" }
  }
}

export async function generateVideo(assetId: string, keywords: string) {
  try {
    await apiClient.generateVideo(assetId, { key_words: keywords })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al generar video" }
  }
}

export async function regenerateAllAssets(scriptId: string) {
  try {
    await apiClient.regenerateAllAssets(scriptId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al regenerar assets" }
  }
}

export async function mixScriptAssets(scriptId: string) {
  try {
    await apiClient.mixScriptAssets(scriptId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al mezclar assets" }
  }
}

// Script creation functions
export async function createScript(data: { text_entry: string; project_id: string }) {
  try {
    const response = await apiClient.createScript(data)
    return { success: true, data: transformScript(response.data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al crear script" }
  }
}

export async function createManualScript(data: { lines: Array<{ text: string; type: string }>; project_id: string }) {
  try {
    const response = await apiClient.createManualScript(data)
    return { success: true, data: transformScript(response.data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al crear script manual" }
  }
}

export async function updateProject(id: string, data: { name: string; description: string }) {
  try {
    const response = await apiClient.updateProject(id, data)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al actualizar proyecto" }
  }
}

export async function deleteProject(id: string) {
  try {
    await apiClient.deleteProject(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar proyecto" }
  }
}

// Subscription functions
export async function getSubscriptionPlans() {
  try {
    const response = await apiClient.getSubscriptionPlans()
    return response.data
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return []
  }
}

export async function getUserSubscription() {
  try {
    const response = await apiClient.getUserSubscription()
    return response.data
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return null
  }
}
