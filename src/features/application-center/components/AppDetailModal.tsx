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
} from '@arco-design/web-react'
import {
  IconClockCircle,
  IconCode,
  IconDownload,
  IconInfoCircle,
  IconLock,
  IconPlayArrow,
  IconPlus,
  IconPoweroff,
  IconShareInternal,
  IconThunderbolt,
  IconUser,
} from '@arco-design/web-react/icon'
import { Button, Input, Modal, Tabs } from '../../../UI'
import type { AppExecutionLog, AppIOField, AppItem } from '../types'
import { AppInteractiveDialogModal } from './AppInteractiveDialogModal'

interface AppDetailModalProps {
  visible: boolean
  app: AppItem | null
  activeTab?: string
  onClose: () => void
  onToggleInstall?: (app: AppItem) => void
  onToggleEnable?: (app: AppItem) => void
  onUpdateApp?: (app: AppItem) => void
  onRunApp?: (app: AppItem, values: Record<string, unknown>) => void
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

export function AppDetailModal({
  visible,
  app,
  activeTab: initialTab = 'overview',
  onClose,
  onToggleInstall,
  onToggleEnable,
  onUpdateApp,
  onRunApp,
}: AppDetailModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [interactiveModalVisible, setInteractiveModalVisible] = useState(false)
  const [selectedLogDetail, setSelectedLogDetail] = useState<AppExecutionLog | null>(null)
  const [logDrawerVisible, setLogDrawerVisible] = useState(false)

  // Sub-modal: Trigger
  const [addTriggerModalVisible, setAddTriggerModalVisible] = useState(false)
  const [newTriggerName, setNewTriggerName] = useState('')
  const [newTriggerType, setNewTriggerType] = useState<'cron' | 'event' | 'webhook'>('cron')
  const [newTriggerConfig, setNewTriggerConfig] = useState('')

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

  if (!app) return null

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    Message.success({ content: '应用链接已复制到剪贴板，可分享给同组成员' })
  }

  const handleViewLogDetail = (log: AppExecutionLog) => {
    setSelectedLogDetail(log)
    setLogDrawerVisible(true)
  }

  const handleAddTrigger = () => {
    if (!newTriggerName.trim()) {
      Message.warning({ content: '请输入触发器名称' })
      return
    }
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
    setAddTriggerModalVisible(false)
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
    <Modal
      visible={visible}
      footer={null}
      unmountOnExit
      style={{ width: 1100 }}
      className="shadow-2xl rounded-2xl overflow-hidden app-detail-modal"
      onCancel={onClose}
      title={
        <div className="flex w-full flex-col gap-3 py-1 pr-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold leading-tight text-slate-900">{app.name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Tag size="small">{app.level}</Tag>
              <Tag color="purple" size="small">{app.category}</Tag>
              <Tag color="green" size="small">{spaceLabels[app.space] || app.spaceLabel}</Tag>
              <span className="text-xs text-slate-400 ml-1">更新时间: {app.lastRunTime || '2026-08-12 11:20:00'}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="secondary" icon={<IconShareInternal />} className="!rounded-[2px]" onClick={handleShare}>
              分享
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
      }
    >
      <div className="flex min-h-[580px] flex-col space-y-4">
        {/* App Metric Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <span className="text-xs text-slate-500">平均成功率</span>
            <strong className="mt-1 block text-lg font-bold text-slate-900">{app.successRate}%</strong>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <span className="text-xs text-slate-500">累计节省工时</span>
            <strong className="mt-1 block text-lg font-bold text-slate-900">{app.savedPersonDays}</strong>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <span className="text-xs text-slate-500">累计节省成本</span>
            <strong className="mt-1 block text-lg font-bold text-slate-900">{app.costSaved}</strong>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <span className="text-xs text-slate-500">最近执行结果</span>
            <strong className="mt-1 block truncate text-sm font-bold text-slate-900" title={app.lastRunResult || '执行正常'}>
              {app.lastRunResult || '执行正常'}
            </strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          type="line"
          size="default"
          className="app-detail-tabs mb-4"
        >
          <Tabs.TabPane key="overview" title="应用概览与说明" />
          <Tabs.TabPane key="config" title="输入输出配置与交互框" />
          <Tabs.TabPane key="triggers" title="触发器配置" />
          <Tabs.TabPane key="status_logs" title="运行状态与日志统计" />
          <Tabs.TabPane key="versions" title="版本历史演进" />
          <Tabs.TabPane key="permissions" title="租户与空间权限映射" />
        </Tabs>

        {/* Tab 1: Overview & Docs */}
        {activeTab === 'overview' && (
          <div className="grid flex-1 grid-cols-3 gap-6">
            <div className="col-span-2 max-h-[520px] space-y-5 overflow-y-auto pr-2">
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
          <div className="max-h-[520px] space-y-6 overflow-y-auto pr-1">
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
          <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">应用触发器管理</h3>
                <p className="text-xs text-slate-500">
                  支持配置定时调度 (Cron)、业务事件监听、Webhook 回调与快捷键。
                </p>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<IconPlus />}
                className="!rounded-lg"
                onClick={() => setAddTriggerModalVisible(true)}
              >
                新增触发器
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {app.triggers.map((trig) => (
                <div
                  key={trig.id}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-[#165dff]">
                      {trig.type === 'cron' ? (
                        <IconClockCircle />
                      ) : trig.type === 'event' ? (
                        <IconThunderbolt />
                      ) : (
                        <IconCode />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{trig.name}</span>
                        <Tag size="small" color="arcoblue">
                          {trig.type}
                        </Tag>
                      </div>
                      <p className="mt-1 inline-block rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-500">
                        {trig.config}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={trig.enabled}
                    size="small"
                    onChange={(checked) => handleToggleTrigger(trig.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Status & Logs */}
        {activeTab === 'status_logs' && (
          <div className="max-h-[520px] space-y-6 overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 block text-xs text-slate-400">当前运行状态</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      app.runStatus === 'running'
                        ? 'animate-pulse bg-emerald-500'
                        : app.runStatus === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <strong className="text-base font-bold capitalize text-slate-900">
                    {app.runStatus}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 block text-xs text-slate-400">成功率</span>
                <strong className="text-xl font-bold text-emerald-600">{app.successRate}%</strong>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 block text-xs text-slate-400">累计节省时间</span>
                <strong className="text-xl font-bold text-slate-900">{app.savedPersonDays}</strong>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 block text-xs text-slate-400">运行成本/节省</span>
                <strong className="text-xl font-bold text-slate-900">{app.costSaved}</strong>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">历史运行日志 (Execution Logs)</h4>
                <Button
                  type="secondary"
                  size="mini"
                  onClick={() => setInteractiveModalVisible(true)}
                >
                  手动测试运行一次
                </Button>
              </div>

              <Table
                data={app.logs}
                pagination={{ pageSize: 5 }}
                size="small"
                border
                rowKey="id"
                columns={[
                  { title: '日志 ID', dataIndex: 'id', width: 100 },
                  { title: '开始时间', dataIndex: 'startTime', width: 170 },
                  { title: '耗时', dataIndex: 'duration', width: 90 },
                  { title: '触发来源', dataIndex: 'triggerSource', width: 140 },
                  {
                    title: '运行结果',
                    dataIndex: 'status',
                    width: 110,
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
          </div>
        )}

        {/* Tab 5: Version History */}
        {activeTab === 'versions' && (
          <div className="max-h-[520px] space-y-4 overflow-y-auto py-2 pr-2">
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
          <div className="max-h-[520px] space-y-6 overflow-y-auto pr-1">
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
        width={500}
        title="运行日志详情"
        footer={null}
        onCancel={() => setLogDrawerVisible(false)}
      >
        {selectedLogDetail && (
          <div className="space-y-4">
            <div className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-4 font-mono text-xs leading-6 text-slate-200">
              {selectedLogDetail.logText}
            </div>
          </div>
        )}
      </Drawer>

      {/* Sub Modal: Add Trigger */}
      <Modal
        visible={addTriggerModalVisible}
        title="添加新触发器"
        onCancel={() => setAddTriggerModalVisible(false)}
        onOk={handleAddTrigger}
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
              onChange={(val) => setNewTriggerType(val)}
            >
              <Select.Option value="cron">定时 Cron</Select.Option>
              <Select.Option value="event">业务事件监听</Select.Option>
              <Select.Option value="webhook">Webhook 回调</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="规则表达式 / 事件描述">
            <Input
              value={newTriggerConfig}
              placeholder="0 18 * * 1-5 或 订单支付成功事件"
              className="minimal-radius !rounded-[2px]"
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
    </Modal>
  )
}
