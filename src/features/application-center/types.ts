export type AppSpace = 'all' | 'personal' | 'public' | 'rnd' | 'jv'
export type AppRunStatus = 'running' | 'idle' | 'failed' | 'paused'

export interface AppIOField {
  key: string
  label: string
  type: 'text' | 'date' | 'select' | 'multiselect' | 'file' | 'number' | 'boolean'
  required: boolean
  defaultValue?: string | number | boolean
  options?: string[]
  description: string
}

export interface AppTrigger {
  id: string
  type: 'cron' | 'event' | 'webhook' | 'shortcut' | 'manual'
  name: string
  config: string
  enabled: boolean
}

export interface AppVersion {
  version: string
  releaseTime: string
  author: string
  changelog: string
}

export type LogComponentType = 'RPA' | 'Agent' | '数据库' | '后端' | '其他'

export interface AppExecutionStageLog {
  type: LogComponentType
  name?: string
  status?: 'success' | 'failed' | 'running'
  duration?: string
  logText: string
}

export interface AppExecutionLog {
  id: string
  startTime: string
  duration: string
  status: 'success' | 'failed' | 'running'
  triggerSource: string
  logText: string
  outputSummary: string
  stages?: AppExecutionStageLog[]
}

export interface AppPermissionMapping {
  spaces: string[]
  roles: { role: string; roleName: string; access: 'admin' | 'operator' | 'viewer' }[]
  tenantIds?: string[]
}

export interface AppItem {
  id: string
  name: string
  space: AppSpace
  spaceLabel: string
  category: string
  tag: string
  tags: string[]
  level: 'L1 原子能力' | 'L2 场景应用' | 'L3 执行系统'
  icon?: string
  accent?: string
  description: string
  backgroundDoc?: string
  requirementsDoc?: string
  featureDoc?: string
  usageDoc?: string
  developer: string
  developerEmail?: string
  isOfficial: boolean
  likes?: number
  installs?: number
  isInstalled: boolean
  isEnabled: boolean
  runStatus: AppRunStatus
  successRate: number
  runsCount?: number
  savedPersonDays: string
  costSaved: string
  lastRunResult: string
  lastRunTime?: string
  triggerText?: string
  triggers: AppTrigger[]
  inputs: AppIOField[]
  outputs: AppIOField[]
  versions: AppVersion[]
  logs: AppExecutionLog[]
  permissions: AppPermissionMapping
}
