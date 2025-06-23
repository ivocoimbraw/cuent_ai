import { cookies } from "next/headers"
import { apiClient } from "@/lib/client"

// Function to get auth token from cookies server-side
export function getServerAuthToken(): string | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("cuent-ai-token")?.value
    return token || null
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

// Function to create an authenticated API client for server-side use
export function createServerApiClient(): typeof apiClient {
  const token = getServerAuthToken()
  
  if (token) {
    // Create a new instance with the token set
    const serverClient = Object.create(apiClient)
    serverClient.setToken(token)
    return serverClient
  }
  
  return apiClient
}

// Server-side data fetching functions with authentication
export async function getProjectsServer() {
  try {
    const serverClient = createServerApiClient()
    const response = await serverClient.getProjects()
    return response.data
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProjectServer(id: string) {
  try {
    const serverClient = createServerApiClient()
    const response = await serverClient.getProject(id)
    const project = response.data
    return project
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }
}

export async function getScriptServer(id: string) {
  try {
    const serverClient = createServerApiClient()
    const response = await serverClient.getScript(id)
    return response.data
  } catch (error) {
    console.error(`Error fetching script ${id}:`, error)
    return null
  }
}

export async function getAssetsByScriptServer(scriptId: string) {
  try {
    const serverClient = createServerApiClient()
    const response = await serverClient.getAssetsByScript(scriptId)
    return response.data.map((asset: any) => ({ ...asset, script_id: scriptId }))
  } catch (error) {
    console.error(`Error fetching assets for script ${scriptId}:`, error)
    return []
  }
}
