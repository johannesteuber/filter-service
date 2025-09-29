'use server'

import { Json } from '@/types/types'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function writeJsonLog(data: Json, filename?: string) {
  try {
    // Get the project root directory
    const projectRoot = process.cwd()
    const logsDir = join(projectRoot, 'logs')
    
    // Create logs directory if it doesn't exist
    await mkdir(logsDir, { recursive: true })
    
    // Generate filename with timestamp if not provided
    const logFilename = filename || `log-${Date.now()}.json`
    const filePath = join(logsDir, logFilename)
    
    // Write JSON data to file
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    
    return { 
      success: true, 
      path: filePath,
      message: `Log written to ${logFilename}` 
    }
  } catch (error) {
    console.error('Error writing log file:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
