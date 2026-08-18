import { useState } from 'react'
import {
  Avatar,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input as ArcoInput,
  Message,
  Popconfirm,
  Radio,
  Select,
  Switch,
  Table,
  Tag,
  Timeline,
  TimePicker,
} from '@arco-design/web-react'
import {
  IconClockCircle,
  IconCode,
  IconDashboard,
  IconDelete,
  IconDownload,
  IconInfoCircle,
  IconLeft,
  IconLock,
  IconPlayArrow,
  IconPlus,
  IconPoweroff,
  IconShareInternal,
  IconTag,
  IconThunderbolt,
  IconUser,
} from '@arco-design/web-react/icon'
import { Button, Input, Modal, Tabs } from '../../../UI'
import type { AppExecutionLog, AppIOField, AppItem, AppTrigger } from '../types'
import { AppInteractiveDialogModal } from './AppInteractiveDialogModal'

interface AppDetailPageProps {
  app: AppItem
  activeTab?: string
  onBack: () => void
  onToggleInstall?: (app: AppItem) => void
  onToggleEnable?: (app: AppItem) => void
  onUpdateApp?: (app: AppItem) => void
  onRunApp?: (app: AppItem, values: Record<string, unknown>) => void
  onAddToWorkbench?: (app: AppItem) => void
  onRemoveFromWorkbench?: (app: AppItem) => void
  isInWorkbench?: boolean
}

const spaceLabels: Record<string, string> = {
  personal: '个人空间',
  public: '公共空间',
  rnd: '研发中心',
  jv: '合资企业',
}

function generateTriggerId() {
  return `trig-${Date.now()}`
}

export function AppDetailPage({
  app,
  activeTab: initialTab = 'overview',
  onBack,
  onToggleInstall,
  onToggleEnable,
  onUpdateApp,
  onRunApp,
  onAddToWorkbench,
  onRemoveFromWorkbench,
  isInWorkbench = false,
}: AppDetailPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [interactiveModalVisible, setInteractiveModalVisible] = useState(false)
  const [selectedLogDetail, setSelectedLogDetail] = useState<AppExecutionLog | null>(null)
  const [logDrawerVisible, setLogDrawerVisible] = useState(false)

  // Sub-modal: Trigger
  const [addTriggerModalVisible, setAddTriggerModalVisible] = useState(false)
  const [editingTriggerId, setEditingTriggerId] = useState<string | null>(null)
  const [newTriggerName, setNewTriggerName] = useState('')
  const [newTriggerType, setNewTriggerType] = useState<'cron' | 'event' | 'webhook'>('cron')
  const [newTriggerConfig, setNewTriggerConfig] = useState('')
  const [cronFrequency, setCronFrequency] = useState<'daily' | 'workday' | 'hourly' | 'weekly' | 'custom'>('daily')
  const [cronTime, setCronTime] = useState<string>('09:00')
  const [activeLogStageFilter, setActiveLogStageFilter] = useState<string>('all')

  const handleCronChange = (time: string, freq: 'daily' | 'workday' | 'hourly' | 'weekly' | 'custom') => {
    setCronTime(time)
    setCronFrequency(freq)
    const [h = '09', m = '00'] = (time || '09:00').split(':')
    const hour = parseInt(h, 10).toString()
    const min = parseInt(m, 10).toString()
    if (freq === 'daily') {
      setNewTriggerConfig(`${min} ${hour} * * *`)
    } else if (freq === 'workday') {
      setNewTriggerConfig(`${min} ${hour} * * 1-5`)
    } else if (freq === 'weekly') {
      setNewTriggerConfig(`${min} ${hour} * * 1`)
    } else if (freq === 'hourly') {
      setNewTriggerConfig(`${min} * * * *`)
    }
  }

  // Sub-modal: Input Field
  const [inputFieldModalVisible, setInputFieldModalVisible] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [inputFieldForm, setInputFieldForm] = useState<AppIOField>({
    key: '',
    label: '',
    type: 'text',
    required: false,
    defaultValue: '',
    description: '',
  })

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    Message.success({ content: '应用链接已复制到剪贴板，可分享给同组成员' })
  }

  const handleViewLogDetail = (log: AppExecutionLog) => {
    setSelectedLogDetail(log)
    setActiveLogStageFilter('all')
    setLogDrawerVisible(true)
  }

  const handleOpenAddTrigger = () => {
    setEditingTriggerId(null)
    setNewTriggerName('')
    setNewTriggerType('cron')
    setCronFrequency('daily')
    setCronTime('09:00')
    setNewTriggerConfig('0 9 * * *')
    setAddTriggerModalVisible(true)
  }

  const handleOpenEditTrigger = (trig: AppTrigger) => {
    setEditingTriggerId(trig.id)
    setNewTriggerName(trig.name)
    const type = trig.type === 'cron' || trig.type === 'event' || trig.type === 'webhook' ? trig.type : 'cron'
    setNewTriggerType(type)
    setNewTriggerConfig(trig.config)
    if (type === 'cron') {
      const parts = trig.config.trim().split(/\s+/)
      if (parts.length >= 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        const m = parts[0].padStart(2, '0')
        const h = parts[1].padStart(2, '0')
        setCronTime(`${h}:${m}`)
        if (parts[4] === '1-5') {
          setCronFrequency('workday')
        } else if (parts[4] === '1') {
          setCronFrequency('weekly')
        } else if (parts[1] === '*') {
          setCronFrequency('hourly')
        } else {
          setCronFrequency('daily')
        }
      } else {
        setCronFrequency('custom')
        setCronTime('09:00')
      }
    }
    setAddTriggerModalVisible(true)
  }

  const handleSaveTrigger = () => {
    if (!newTriggerName.trim()) {
      Message.warning({ content: '请输入触发器名称' })
      return
    }
    if (editingTriggerId) {
      const updated = {
        ...app,
        triggers: app.triggers.map((t) =>
          t.id === editingTriggerId
            ? {
                ...t,
                name: newTriggerName.trim(),
                type: newTriggerType,
                config: newTriggerConfig.trim() || '默认调度配置',
              }
            : t,
        ),
      }
      onUpdateApp?.(updated)
      Message.success({ content: '触发器配置已更新' })
    } else {
      const updated = {
        ...app,
        triggers: [
          ...app.triggers,
          {
            id: generateTriggerId(),
            name: newTriggerName.trim(),
            type: newTriggerType,
            config: newTriggerConfig.trim() || '默认调度配置',
            enabled: true,
          },
        ],
      }
      onUpdateApp?.(updated)
      Message.success({ content: '触发器添加成功' })
    }
    setAddTriggerModalVisible(false)
    setEditingTriggerId(null)
    setNewTriggerName('')
    setNewTriggerConfig('')
  }

  const handleToggleTrigger = (triggerId: string, enabled: boolean) => {
    const updated = {
      ...app,
      triggers: app.triggers.map((t) => (t.id === triggerId ? { ...t, enabled } : t)),
    }
    onUpdateApp?.(updated)
  }

  const handleDeleteTrigger = (triggerId: string) => {
    const updated = {
      ...app,
      triggers: app.triggers.filter((t) => t.id !== triggerId),
    }
    onUpdateApp?.(updated)
    Message.success({ content: '触发器已删除' })
  }

  const getTriggerTypeMeta = (type: string) => {
    switch (type) {
      case 'cron':
        return {
          icon: <IconClockCircle />,
          label: '定时 Cron',
          color: 'arcoblue' as const,
          bgClass: 'bg-blue-50 text-[#165dff]',
          modeText: '定时轮询调度',
        }
      case 'event':
        return {
          icon: <IconThunderbolt />,
          label: '业务事件',
          color: 'gold' as const,
          bgClass: 'bg-amber-50 text-amber-600',
          modeText: '事件驱动监听',
        }
      case 'webhook':
        return {
          icon: <IconCode />,
          label: 'Webhook',
          color: 'purple' as const,
          bgClass: 'bg-purple-50 text-purple-600',
          modeText: 'HTTP 回调调用',
        }
      case 'shortcut':
        return {
          icon: <IconTag />,
          label: '快捷交互',
          color: 'cyan' as const,
          bgClass: 'bg-sky-50 text-sky-600',
          modeText: '快捷键触发',
        }
      default:
        return {
          icon: <IconPlayArrow />,
          label: '手动触发',
          color: 'green' as const,
          bgClass: 'bg-emerald-50 text-emerald-600',
          modeText: '操作员手动运行',
        }
    }
  }

  const handleOpenAddField = () => {
    setEditingFieldIndex(null)
    setInputFieldForm({
      key: '',
      label: '',
      type: 'text',
      required: false,
      defaultValue: '',
      description: '',
    })
    setInputFieldModalVisible(true)
  }

  const handleOpenEditField = (index: number) => {
    const item = app.inputs[index]
    if (!item) return
    setEditingFieldIndex(index)
    setInputFieldForm({ ...item })
    setInputFieldModalVisible(true)
  }

  const handleDeleteField = (index: number) => {
    const item = app.inputs[index]
    const updated = {
      ...app,
      inputs: app.inputs.filter((_, i) => i !== index),
    }
    onUpdateApp?.(updated)
    Message.success({ content: `已删除输入字段 [${item?.label || item?.key}]` })
  }

  const handleSaveField = () => {
    if (!inputFieldForm.key.trim() || !inputFieldForm.label.trim()) {
      Message.warning({ content: '请填写字段 Key 和显示名称' })
      return
    }
    let newInputs: AppIOField[]
    if (editingFieldIndex !== null) {
      newInputs = app.inputs.map((f, i) => (i === editingFieldIndex ? { ...inputFieldForm } : f))
      Message.success({ content: `输入字段 [${inputFieldForm.label}] 配置更新成功！` })
    } else {
      newInputs = [...app.inputs, { ...inputFieldForm }]
      Message.success({ content: `新增输入配置字段 [${inputFieldForm.label}] 成功！` })
    }
    onUpdateApp?.({ ...app, inputs: newInputs })
    setInputFieldModalVisible(false)
  }

  return (
    <div className="space-y-4">
      {/* 1. Top App Info Header Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight text-slate-900">{app.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Tag size="small">{app.level}</Tag>
              <Tag color="purple" size="small">{app.category}</Tag>
              <Tag color="green" size="small">{spaceLabels[app.space] || app.spaceLabel}</Tag>
              <span className="text-xs text-slate-400 ml-1">更新时间: {app.lastRunTime || '2026-08-12 11:20:00'}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 flex-wrap">
            <Button
              type="secondary"
              icon={<IconLeft />}
              className="!rounded-[2px]"
              onClick={onBack}
            >
              返回应用列表
            </Button>

            <Button type="secondary" icon={<IconShareInternal />} className="!rounded-[2px]" onClick={handleShare}>
              分享
            </Button>

            <Button
              type={isInWorkbench ? 'secondary' : 'primary'}
              status={isInWorkbench ? 'danger' : undefined}
              icon={isInWorkbench ? <IconDelete /> : <IconPlus />}
              className="!rounded-[2px]"
              onClick={() => isInWorkbench ? onRemoveFromWorkbench?.(app) : onAddToWorkbench?.(app)}
            >
              {isInWorkbench ? '从工作台移除' : '加入工作台'}
            </Button>

            {!app.isInstalled ? (
              <Button
                type="primary"
                icon={<IconDownload />}
                className="!rounded-[2px] !bg-rose-500 hover:!bg-rose-600 !px-5"
                onClick={() => onToggleInstall?.(app)}
              >
                获取应用
              </Button>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<IconPlayArrow />}
                  className="!rounded-[2px] !bg-emerald-600 hover:!bg-emerald-700 !px-4"
                  onClick={() => setInteractiveModalVisible(true)}
                >
                  运行
                </Button>

                <Button
                  type={app.isEnabled ? 'secondary' : 'primary'}
                  status={app.isEnabled ? 'warning' : 'success'}
                  icon={<IconPoweroff />}
                  className="!rounded-[2px]"
                  onClick={() => onToggleEnable?.(app)}
                >
                  {app.isEnabled ? '暂停服务' : '启用应用'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. App Metric Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">平均成功率</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <IconDashboard className="text-base" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{app.successRate}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">累计节省工时</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <IconClockCircle className="text-base" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{app.savedPersonDays}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">累计节省成本</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <IconTag className="text-base" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{app.costSaved}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">最近执行结果</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#165dff]">
              <IconThunderbolt className="text-base" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="truncate text-base font-bold text-slate-900" title={app.lastRunResult || '执行正常'}>
              {app.lastRunResult || '执行正常'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Card with 6 Tabs */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          type="line"
          size="default"
          className="app-detail-tabs mb-4"
        >
          <Tabs.TabPane key="overview" title="应用概览与说明" />
          <Tabs.TabPane key="config" title="输入输出配置" />
          <Tabs.TabPane key="triggers" title="触发器配置" />
          <Tabs.TabPane key="status_logs" title="运行日志" />
          <Tabs.TabPane key="versions" title="版本历史演进" />
          <Tabs.TabPane key="permissions" title="权限配置" />
        </Tabs>

        {/* Tab 1: Overview & Docs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <IconInfoCircle className="text-[#165dff]" /> 使用说明与架构说明
                </h3>
                <div className="whitespace-pre-wrap text-xs leading-6 text-slate-600">
                  {app.usageDoc ||
                    '1. 点击“运行应用”，弹出运行对话框填写参数。\n2. 确认存储路径与选项后点击确定。\n3. 系统将自动唤起引擎并执行抓取与自动化分析。'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
                <h3 className="mb-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-900">
                  背景介绍
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {app.backgroundDoc ||
                    '针对日常企业重复度高、耗时费力的数据归集与业务流转痛点，通过标准化 RPA 与大模型 Agent 结合，实现自动化的全流程托管。'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
                <h3 className="mb-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-900">
                  需求调研与特点
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {app.requirementsDoc ||
                    '1. 操作频率：高频周期性执行\n2. 效率提升：大幅削减人工提取与手工核对成本\n3. 流程特点：支持定时触发与手动人机交互接管'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
                <h3 className="mb-2 border-b border-slate-100 pb-2 text-base font-bold text-slate-900">
                  核心功能描述
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {app.featureDoc ||
                    '提供参数化输入、多站点巡检抓取、智能合规校验、格式化 Excel/PDF 输出与企微/钉钉实时预警推送。'}
                </div>
              </div>
            </div>

            {/* Right Meta Info Panel */}
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div>
                  <span className="mb-1 block text-xs text-slate-400">开发者/研发团队</span>
                  <div className="flex items-center gap-2">
                    <Avatar size={28} className="bg-blue-100 text-[#165dff]">
                      <IconUser />
                    </Avatar>
                    <div>
                      <span className="block text-xs font-semibold text-slate-800">{app.developer}</span>
                      <span className="block text-[11px] text-slate-400">
                        {app.developerEmail || 'support@corp.com'}
                      </span>
                    </div>
                  </div>
                </div>

                <Divider className="!my-2" />

                <div>
                  <span className="mb-1 block text-xs text-slate-400">包含标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((t) => (
                      <Tag key={t} size="small" color="arcoblue">
                        {t}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Divider className="!my-2" />

                <div>
                  <span className="mb-1 block text-xs text-slate-400">所属空间</span>
                  <Tag color="green" size="small">
                    {spaceLabels[app.space] || app.spaceLabel}
                  </Tag>
                </div>

                <Divider className="!my-2" />

                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="rounded-lg border border-slate-100 bg-white p-2">
                    <span className="block text-[11px] text-slate-400">点赞好评</span>
                    <strong className="text-sm text-slate-800">👍 {app.likes ?? 18}</strong>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-2">
                    <span className="block text-[11px] text-slate-400">获取安装</span>
                    <strong className="text-sm text-slate-800">📥 {app.installs ?? 850}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Config & Input/Output Schema */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <span className="size-2 rounded-full bg-blue-500" /> 输入参数表 (Input Schema)
                </h4>
                <Button
                  type="primary"
                  size="small"
                  icon={<IconPlus />}
                  className="!rounded-[2px]"
                  onClick={handleOpenAddField}
                >
                  新增配置字段
                </Button>
              </div>

              <Table
                data={app.inputs}
                pagination={false}
                size="small"
                border
                rowKey="key"
                columns={[
                  { title: '字段 Key', dataIndex: 'key', width: 140 },
                  { title: '显示名称', dataIndex: 'label', width: 150 },
                  {
                    title: '控件类型',
                    dataIndex: 'type',
                    width: 110,
                    render: (_, record) => <Tag size="small" color="purple">{record.type}</Tag>,
                  },
                  {
                    title: '必填',
                    dataIndex: 'required',
                    width: 75,
                    render: (_, record) => (
                      <span className={record.required ? 'font-bold text-rose-600' : 'text-slate-400'}>
                        {record.required ? '是' : '否'}
                      </span>
                    ),
                  },
                  {
                    title: '默认值',
                    dataIndex: 'defaultValue',
                    width: 150,
                    render: (_, record) => (
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                        {String(record.defaultValue ?? '--')}
                      </code>
                    ),
                  },
                  { title: '字段说明', dataIndex: 'description' },
                  {
                    title: '操作',
                    width: 120,
                    align: 'center',
                    render: (_, __, index) => (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="text"
                          size="mini"
                          className="!text-blue-600"
                          onClick={() => handleOpenEditField(index)}
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title="确定要删除此输入参数字段吗？"
                          onOk={() => handleDeleteField(index)}
                        >
                          <Button type="text" size="mini" status="danger">
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <span className="size-2 rounded-full bg-emerald-500" /> 输出参数表 (Output Schema)
                </h4>
              </div>
              <Table
                data={app.outputs}
                pagination={false}
                size="small"
                border
                rowKey="key"
                columns={[
                  { title: '输出 Key', dataIndex: 'key', width: 160 },
                  { title: '输出名称', dataIndex: 'label', width: 180 },
                  {
                    title: '数据类型',
                    dataIndex: 'type',
                    width: 120,
                    render: (_, record) => <Tag size="small" color="green">{record.type}</Tag>,
                  },
                  { title: '输出描述', dataIndex: 'description' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Triggers Configuration */}
        {activeTab === 'triggers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">应用触发器管理</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  支持配置定时调度 (Cron)、业务事件监听、Webhook 回调与快捷交互，可按需启停和测试触发。
                </p>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<IconPlus />}
                className="!rounded-[2px] shrink-0"
                onClick={handleOpenAddTrigger}
              >
                新增触发器
              </Button>
            </div>

            {app.triggers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                暂无配置触发器，点击右上角“新增触发器”进行配置
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {app.triggers.map((trig) => {
                  const meta = getTriggerTypeMeta(trig.type)
                  return (
                    <div
                      key={trig.id}
                      className={`flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md ${
                        trig.enabled
                          ? 'border-slate-200/90 bg-white hover:border-blue-200'
                          : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-2xs ${meta.bgClass}`}>
                              {meta.icon}
                            </span>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-bold text-slate-800" title={trig.name}>
                                {trig.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-1.5">
                                <Tag size="small" color={meta.color}>
                                  {meta.label}
                                </Tag>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {trig.enabled ? '启用' : '暂停'}
                            </span>
                            <Switch
                              checked={trig.enabled}
                              size="small"
                              onChange={(checked) => handleToggleTrigger(trig.id, checked)}
                            />
                          </div>
                        </div>

                        {/* Expression Box */}
                        <div className="my-3 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
                          <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-medium text-slate-600">调度规则 / 监听参数</span>
                            <span className="font-mono text-[10px]">{trig.id}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <code className="truncate rounded border border-slate-200/70 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 shadow-2xs">
                              {trig.config}
                            </code>
                            <span className="shrink-0 text-[11px] text-slate-400 font-sans">
                              {meta.modeText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${
                              trig.enabled ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-xs text-slate-500">
                            {trig.enabled ? '状态活跃' : '已停用'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="text"
                            size="mini"
                            className="!text-slate-600 hover:!text-[#165dff] !px-1.5"
                            onClick={() => handleOpenEditTrigger(trig)}
                          >
                            配置
                          </Button>
                          <Button
                            type="text"
                            size="mini"
                            className="!text-[#165dff] !px-1.5"
                            onClick={() => {
                              Message.info({ content: `正在测试执行触发器: ${trig.name}` })
                              setInteractiveModalVisible(true)
                            }}
                          >
                            测试触发
                          </Button>
                          <Popconfirm
                            title="确定要删除此触发器吗？"
                            onOk={() => handleDeleteTrigger(trig.id)}
                            okText="删除"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              status="danger"
                              size="mini"
                              className="!px-1.5"
                              icon={<IconDelete />}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Status & Logs */}
        {activeTab === 'status_logs' && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">历史运行日志</h4>
            </div>

            <Table
              data={app.logs}
              pagination={{ pageSize: 5 }}
              size="small"
              border
              rowKey="id"
              columns={[
                { title: '日志 ID', dataIndex: 'id', width: 110 },
                {
                  title: '执行链路',
                  width: 170,
                  render: (_, record) => {
                    const stages = record.stages || []
                    if (stages.length === 0) {
                      return <span className="text-xs text-slate-400">单节点</span>
                    }
                    const colorMap: Record<string, string> = {
                      RPA: 'blue',
                      Agent: 'purple',
                      数据库: 'gold',
                      后端: 'cyan',
                      其他: 'gray',
                    }
                    return (
                      <div className="flex flex-wrap items-center gap-1">
                        {stages.map((st, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Tag size="small" color={colorMap[st.type] || 'arcoblue'} className="!px-1.5 !text-[11px]">
                              {st.type}
                            </Tag>
                            {i < stages.length - 1 && <span className="text-[10px] text-slate-300">→</span>}
                          </div>
                        ))}
                      </div>
                    )
                  },
                },
                { title: '开始时间', dataIndex: 'startTime', width: 170 },
                { title: '耗时', dataIndex: 'duration', width: 90 },
                { title: '触发来源', dataIndex: 'triggerSource', width: 130 },
                {
                  title: '运行结果',
                  dataIndex: 'status',
                  width: 100,
                  render: (_, record) => (
                    <Tag
                      size="small"
                      color={
                        record.status === 'success'
                          ? 'green'
                          : record.status === 'running'
                            ? 'arcoblue'
                            : 'red'
                      }
                    >
                      {record.status === 'success'
                        ? '成功'
                        : record.status === 'running'
                          ? '运行中'
                          : '失败'}
                    </Tag>
                  ),
                },
                { title: '输出摘要', dataIndex: 'outputSummary' },
                {
                  title: '操作',
                  width: 90,
                  render: (_, record) => (
                    <Button
                      type="text"
                      size="mini"
                      className="!text-[#165dff]"
                      onClick={() => handleViewLogDetail(record)}
                    >
                      日志详情
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* Tab 5: Version History */}
        {activeTab === 'versions' && (
          <div className="space-y-4 py-2 pr-2">
            <h3 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
              版本演进与 Changelog
            </h3>
            <Timeline mode="left">
              {app.versions.map((ver) => (
                <Timeline.Item key={ver.version} label={ver.releaseTime}>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{ver.version}</span>
                        <Tag size="small" color="blue">
                          发布者: {ver.author}
                        </Tag>
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{ver.changelog}</p>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}

        {/* Tab 6: Permissions */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <IconLock className="text-[#165dff]" /> 空间映射与角色权限规则 (RBAC)
              </h3>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  发布空间归属
                </label>
                <Checkbox.Group
                  value={app.permissions.spaces}
                  className="flex gap-4"
                  onChange={(checked) =>
                    onUpdateApp?.({
                      ...app,
                      permissions: { ...app.permissions, spaces: checked as string[] },
                    })
                  }
                >
                  <Checkbox value="personal">个人空间</Checkbox>
                  <Checkbox value="public">公共空间</Checkbox>
                  <Checkbox value="rnd">研发中心</Checkbox>
                  <Checkbox value="jv">合资企业</Checkbox>
                </Checkbox.Group>
              </div>

              <Divider />

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  角色权限映射矩阵
                </label>
                <Table
                  data={app.permissions.roles}
                  pagination={false}
                  size="small"
                  border
                  rowKey="role"
                  columns={[
                    { title: '角色 key', dataIndex: 'role', width: 180 },
                    { title: '角色名称', dataIndex: 'roleName', width: 200 },
                    {
                      title: '操作权限等级',
                      dataIndex: 'access',
                      render: (_, record) => (
                        <Select
                          value={record.access}
                          size="small"
                          className="w-36 minimal-radius !rounded-[2px]"
                          onChange={(val) => {
                            const newRoles = app.permissions.roles.map((r) =>
                              r.role === record.role
                                ? { ...r, access: val as 'admin' | 'operator' | 'viewer' }
                                : r,
                            )
                            onUpdateApp?.({
                              ...app,
                              permissions: { ...app.permissions, roles: newRoles },
                            })
                          }}
                        >
                          <Select.Option value="admin">管理员 (全部权限)</Select.Option>
                          <Select.Option value="operator">操作员 (可执行配置)</Select.Option>
                          <Select.Option value="viewer">查看者 (仅读取)</Select.Option>
                        </Select>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub Drawer: Log Details */}
      <Drawer
        visible={logDrawerVisible}
        width={640}
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <span className="font-bold text-slate-800">运行日志详情</span>
            {selectedLogDetail && (
              <span className="font-mono text-xs text-slate-400">流水号: {selectedLogDetail.id}</span>
            )}
          </div>
        }
        footer={null}
        onCancel={() => {
          setLogDrawerVisible(false)
          setActiveLogStageFilter('all')
        }}
      >
        {selectedLogDetail && (
          <div className="space-y-4">
            {/* Stage Filter Buttons if multiple stages exist */}
            {selectedLogDetail.stages && selectedLogDetail.stages.length > 0 && (
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveLogStageFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${
                      activeLogStageFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全部链路 ({selectedLogDetail.stages.length} 个节点)
                  </button>
                  {selectedLogDetail.stages.map((stage, idx) => {
                    const typeColor =
                      stage.type === 'RPA'
                        ? 'blue'
                        : stage.type === 'Agent'
                          ? 'purple'
                          : stage.type === '数据库'
                            ? 'gold'
                            : stage.type === '后端'
                              ? 'cyan'
                              : 'gray'
                    const isSelected = activeLogStageFilter === stage.type
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveLogStageFilter(stage.type)}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#165dff] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Tag size="small" color={isSelected ? 'arcoblue' : typeColor} className="!border-0 !px-1.5 !text-[10px] !leading-4">
                          {stage.type}
                        </Tag>
                        <span>{stage.name || stage.type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stage Logs List */}
            {selectedLogDetail.stages && selectedLogDetail.stages.length > 0 ? (
              <div className="space-y-4">
                {selectedLogDetail.stages
                  .filter((stage) => activeLogStageFilter === 'all' || stage.type === activeLogStageFilter)
                  .map((stage, idx) => {
                    const typeColor =
                      stage.type === 'RPA'
                        ? 'blue'
                        : stage.type === 'Agent'
                          ? 'purple'
                          : stage.type === '数据库'
                            ? 'gold'
                            : stage.type === '后端'
                              ? 'cyan'
                              : 'gray'
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
                          <div className="flex items-center gap-2">
                            <Tag size="small" color={typeColor}>
                              {stage.type}
                            </Tag>
                            <span className="text-xs font-bold text-slate-800">
                              {stage.name || `${stage.type} 执行日志`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            {stage.duration && <span>耗时: {stage.duration}</span>}
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                        <div className="overflow-x-auto whitespace-pre-wrap bg-slate-900 p-4 font-mono text-xs leading-6 text-slate-200">
                          {stage.logText}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-3.5 py-2.5">
                  <span className="text-xs font-bold text-slate-800">控制台执行日志</span>
                  <span className="text-[11px] font-mono text-slate-400">{selectedLogDetail.duration}</span>
                </div>
                <div className="overflow-x-auto whitespace-pre-wrap bg-slate-900 p-4 font-mono text-xs leading-6 text-slate-200">
                  {selectedLogDetail.logText}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Sub Modal: Add/Edit Trigger */}
      <Modal
        visible={addTriggerModalVisible}
        title={editingTriggerId ? '配置触发器' : '添加新触发器'}
        onCancel={() => {
          setAddTriggerModalVisible(false)
          setEditingTriggerId(null)
        }}
        onOk={handleSaveTrigger}
      >
        <Form layout="vertical">
          <Form.Item label="触发器名称" required>
            <Input
              value={newTriggerName}
              placeholder="例如：工作日下班定时轮询"
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => setNewTriggerName(val)}
            />
          </Form.Item>

          <Form.Item label="触发器类型">
            <Select
              value={newTriggerType}
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => {
                const type = val as 'cron' | 'event' | 'webhook'
                setNewTriggerType(type)
                if (type === 'cron') {
                  handleCronChange(cronTime, cronFrequency)
                } else if (type === 'event') {
                  setNewTriggerConfig('ORDER_PAYMENT_SUCCESS')
                } else {
                  setNewTriggerConfig('/api/v1/webhook/orders')
                }
              }}
            >
              <Select.Option value="cron">定时 Cron (定时调度)</Select.Option>
              <Select.Option value="event">业务事件监听</Select.Option>
              <Select.Option value="webhook">Webhook 回调</Select.Option>
            </Select>
          </Form.Item>

          {/* Conditional Time Picker & Frequency for Cron */}
          {newTriggerType === 'cron' && (
            <>
              <Form.Item label="调度执行周期">
                <Radio.Group
                  type="button"
                  value={cronFrequency}
                  onChange={(val) => handleCronChange(cronTime, val)}
                  className="minimal-radius !rounded-[2px]"
                >
                  <Radio value="daily">每天</Radio>
                  <Radio value="workday">工作日 (周一至周五)</Radio>
                  <Radio value="weekly">每周一</Radio>
                  <Radio value="hourly">每小时</Radio>
                  <Radio value="custom">自定义</Radio>
                </Radio.Group>
              </Form.Item>

              {cronFrequency !== 'hourly' && cronFrequency !== 'custom' && (
                <Form.Item label="定时执行时间" required>
                  <TimePicker
                    format="HH:mm"
                    value={cronTime}
                    onChange={(timeStr) => handleCronChange(timeStr || '09:00', cronFrequency)}
                    className="w-full minimal-radius !rounded-[2px]"
                    placeholder="选择具体时间 (如 09:30)"
                  />
                </Form.Item>
              )}
            </>
          )}

          <Form.Item
            label={
              newTriggerType === 'cron'
                ? 'Cron 规则表达式'
                : newTriggerType === 'event'
                  ? '业务监听事件名称'
                  : 'Webhook 回调路径 / URL'
            }
            required
          >
            <Input
              value={newTriggerConfig}
              placeholder={
                newTriggerType === 'cron'
                  ? '例如：0 9 * * *'
                  : newTriggerType === 'event'
                    ? '例如：ORDER_PAYMENT_SUCCESS'
                    : '例如：/api/v1/webhook/orders'
              }
              className="minimal-radius !rounded-[2px] font-mono"
              onChange={(val) => setNewTriggerConfig(val)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sub Modal: Add/Edit Input Field */}
      <Modal
        visible={inputFieldModalVisible}
        title={editingFieldIndex !== null ? '编辑输入参数配置字段' : '新增输入参数配置字段'}
        onCancel={() => setInputFieldModalVisible(false)}
        onOk={handleSaveField}
      >
        <Form layout="vertical">
          <Form.Item label="字段 Key" required>
            <Input
              value={inputFieldForm.key}
              placeholder="例如：start_date"
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, key: val }))}
            />
          </Form.Item>

          <Form.Item label="显示名称" required>
            <Input
              value={inputFieldForm.label}
              placeholder="例如：检索开始时间"
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, label: val }))}
            />
          </Form.Item>

          <Form.Item label="控件类型">
            <Select
              value={inputFieldForm.type}
              className="minimal-radius !rounded-[2px] w-full"
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, type: val }))}
            >
              <Select.Option value="text">单行文本 (text)</Select.Option>
              <Select.Option value="date">日期时间 (date)</Select.Option>
              <Select.Option value="select">下拉单选 (select)</Select.Option>
              <Select.Option value="multiselect">下拉多选 (multiselect)</Select.Option>
              <Select.Option value="file">文件路径 (file)</Select.Option>
              <Select.Option value="number">数字输入 (number)</Select.Option>
              <Select.Option value="boolean">开关布尔 (boolean)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="是否必填">
            <Radio.Group
              type="button"
              value={inputFieldForm.required}
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, required: val }))}
            >
              <Radio value={true}>必填</Radio>
              <Radio value={false}>选填</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="默认初始值">
            <Input
              value={String(inputFieldForm.defaultValue ?? '')}
              placeholder="请输入参数默认初始值..."
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, defaultValue: val }))}
            />
          </Form.Item>

          <Form.Item label="字段功能说明">
            <ArcoInput.TextArea
              value={inputFieldForm.description}
              placeholder="请输入对该参数字段的使用解释或格式要求..."
              className="minimal-radius !rounded-[2px]"
              onChange={(val) => setInputFieldForm((prev) => ({ ...prev, description: val }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sub Dialog: Interactive Run Dialog */}
      <AppInteractiveDialogModal
        visible={interactiveModalVisible}
        app={app}
        onClose={() => setInteractiveModalVisible(false)}
        onRun={(targetApp, values) => onRunApp?.(targetApp, values)}
      />
    </div>
  )
}
