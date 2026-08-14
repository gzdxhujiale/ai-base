import { useEffect, useMemo, useState } from 'react'
import { Empty, Input as ArcoInput, Message, Select, Tag } from '@arco-design/web-react'
import {
  IconApps,
  IconArrowRight,
  IconClockCircle,
  IconDashboard,
  IconDownload,
  IconFile,
  IconPlayArrow,
  IconPlus,
  IconPublic,
  IconRobot,
  IconSearch,
  IconSound,
  IconTag,
  IconThunderbolt,
} from '@arco-design/web-react/icon'
import { Button, Tabs } from '../../UI'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { AppCreateModal } from './components/AppCreateModal'
import { AppDetailPage } from './components/AppDetailPage'
import { AppInteractiveDialogModal } from './components/AppInteractiveDialogModal'
import type { AppExecutionLog, AppItem, AppSpace } from './types'

const spaces: { key: AppSpace; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'personal', label: '个人空间' },
  { key: 'public', label: '公共空间' },
  { key: 'rnd', label: '研发中心' },
  { key: 'jv', label: '合资企业' },
]

const categories = [
  { label: '全部' },
  { label: '淘宝' },
  { label: '亚马逊' },
  { label: '跨境' },
  { label: '财务' },
  { label: '客服' },
  { label: '人事' },
  { label: '商品' },
  { label: '营销' },
]

const spaceKeyToLabel: Record<AppSpace, string> = {
  all: '全部',
  personal: '个人空间',
  public: '公共空间',
  rnd: '研发中心',
  jv: '合资企业',
}

const maturityColor: Record<string, 'orange' | 'arcoblue' | 'green'> = {
  'L1 原子能力': 'orange',
  'L2 场景应用': 'arcoblue',
  'L3 执行系统': 'green',
}

function generateLogId() {
  return `log-${Date.now().toString().slice(-4)}`
}

function generateAppId() {
  return `app-custom-${Date.now()}`
}

function generateAppTriggerId() {
  return `trig-${Date.now()}`
}

const initialApps: AppItem[] = [
  {
    id: 'app-tmall-complaint',
    name: '天猫商家被投诉数据获取',
    space: 'public',
    spaceLabel: '公共空间',
    category: '淘宝',
    tag: 'RPA自动化',
    tags: ['Agent', 'RPA自动化', '官方推荐'],
    level: 'L2 场景应用',
    icon: 'shopping',
    accent: 'from-rose-500 to-red-600',
    description:
      '登录天猫商家后台，自动抓取“待处理投诉数据”，提取关键信息，输出至本地 Excel 与分析看板。',
    backgroundDoc: `### 背景介绍\n天猫商家后台 - 我被投诉数据获取，业务人员需要登录查看各种投诉信息并进行处理。然而该投诉页面暂不支持数据导出功能，导致客户无法针对投诉数据进行归因分析，人工提取数据耗时高，效率低。`,
    requirementsDoc: `### 需求调研与分析\n1. **操作频率**：1 次/日\n2. **每次操作时长**：单条数据提取约 15s，每日平均 100+ 条\n3. **流程特点**：线性流程，重复性极高，涉及验证码后人机接管与文本规则提取`,
    featureDoc: `### 功能描述\n登录天猫商家后台，点击“首页-小儿提醒-待处理投诉数据”进入我被投诉页面，输入时间段查询投诉数据，挨个点击查询结果内每一条投诉数据，进入当前被投诉数据的处理进度页面，获取关键信息，最后写入本地 Excel 文件。`,
    usageDoc: `### 使用说明\n> **注意**：官方应用暂不支持二开服务，需要修改内容，请自行查看源码后修改。\n\n1. 点击“运行应用”，弹出**运行对话框**填写查询开始/结束时间、投诉原因。\n2. 确认存储 Excel 路径无误后点击确定。\n3. 系统将自动唤起浏览器并执行抓取任务。`,
    developer: '天猫数据组 (admin@bigdata)',
    developerEmail: 'admin@bigdata.com',
    isOfficial: true,
    likes: 10,
    installs: 1153,
    isInstalled: true,
    isEnabled: true,
    runStatus: 'idle',
    successRate: 98.5,
    runsCount: 1153,
    savedPersonDays: '45.2 人天',
    costSaved: '¥1,250',
    lastRunResult: '抓取完成 86 条投诉记录',
    lastRunTime: '2026-08-12 11:20:00',
    triggerText: '每天 09:00 自动运行',
    triggers: [
      { id: 'trig-1', type: 'cron', name: '定时每日抓取', config: '每天 09:00 自动运行', enabled: true },
      { id: 'trig-2', type: 'manual', name: '手动立即触发', config: '点击或快捷键 Shift+F5', enabled: true },
    ],
    inputs: [
      { key: 'startDate', label: '开始申请时间', type: 'date', required: true, defaultValue: '2026-08-01 00:00:00', description: '投诉数据查询的开始时间' },
      { key: 'endDate', label: '结束申请时间', type: 'date', required: true, defaultValue: '2026-08-12 23:59:59', description: '投诉数据查询的结束时间' },
      { key: 'reason', label: '请选择投诉原因', type: 'select', required: false, defaultValue: '全部', options: ['全部', '假冒伪劣', '延迟发货', '描述不符', '服务态度'], description: '按投诉类型进行筛选' },
      { key: 'status', label: '请选择投诉状态', type: 'select', required: false, defaultValue: '全部', options: ['全部', '待举证', '平台审核中', '已完结'], description: '过滤特定处理状态' },
      { key: 'savePath', label: '选择文件保存路径', type: 'file', required: true, defaultValue: 'C:/Exports/Tmall_Complaints.xlsx', description: '抓取结果输出的 Excel 路径' },
    ],
    outputs: [
      { key: 'excelFile', label: '生成 Excel 文件', type: 'file', required: true, description: '包含完整字段的投诉数据表' },
      { key: 'totalCount', label: '解析数据条数', type: 'number', required: true, description: '本次成功提取的记录数' },
    ],
    versions: [
      { version: '版本 7', releaseTime: '2026-08-05 17:34:02', author: 'admin@bigdata', changelog: '下一页的点击方式修改了，适应天猫新版 DOM 结构。' },
      { version: '版本 6', releaseTime: '2026-07-20 13:56:39', author: 'admin@bigdata', changelog: '修复弹窗拦截导致的流程卡顿元素问题。' },
      { version: '版本 1', releaseTime: '2026-01-10 14:36:03', author: 'admin@bigdata', changelog: '用户测试完成，正式上架官方应用。' },
    ],
    logs: [
      {
        id: 'log-101',
        startTime: '2026-08-12 11:20:00',
        duration: '14.8s',
        status: 'success',
        triggerSource: '定时任务',
        logText: '[11:20:00] 启动浏览器环境\n[11:20:03] 登录天猫商家后台成功\n[11:20:08] 检索到 86 条待处理投诉\n[11:20:14] 数据写入 C:/Exports/Tmall_Complaints.xlsx\n[11:20:15] 任务完成！',
        outputSummary: '成功生成 86 条投诉记录',
        stages: [
          {
            type: 'RPA',
            name: 'RPA 自动化流程',
            status: 'success',
            duration: '9.2s',
            logText: '[11:20:00] 启动 Chrome 无头浏览器环境 (PID: 9021)\n[11:20:03] 登录天猫商家后台成功 (Token 校验通过)\n[11:20:08] 检索到 86 条待处理投诉工单\n[11:20:09] 批量抓取投诉文本与订单详情完成',
          },
          {
            type: '数据库',
            name: '数据库写入与归档',
            status: 'success',
            duration: '5.6s',
            logText: '[11:20:10] 连接 MySQL 业务主库 (tmall_trade_db)\n[11:20:11] 执行批量插入: INSERT INTO complaint_records (86 rows)...\n[11:20:14] 写入成功，受影响行数: 86\n[11:20:15] 任务流水号 TX-88219 提交事务完成！',
          },
        ],
      },
    ],
    permissions: {
      spaces: ['public', 'rnd'],
      roles: [
        { role: 'super_admin', roleName: '超级管理员', access: 'admin' },
        { role: 'operator', roleName: '业务操作员', access: 'operator' },
        { role: 'viewer', roleName: '普通查看者', access: 'viewer' },
      ],
    },
  },
  {
    id: 'app-amazon-patrol',
    name: '亚马逊店铺绩效巡检',
    space: 'public',
    spaceLabel: '公共空间',
    category: '亚马逊',
    tag: '跨境电商',
    tags: ['Agent', '跨境电商', '官方'],
    level: 'L2 场景应用',
    icon: 'global',
    accent: 'from-amber-500 to-orange-600',
    description:
      '采集亚马逊店铺关键指标数据汇总 Excel，分区推送异常信息至钉钉/企微，助商家及时避险。',
    backgroundDoc: `### 背景介绍\n亚马逊 Seller Central 卖家中心界面分散，包含账户状况、ODR 订单缺陷率、迟发率、政策合规等多个独立模块。跨站点巡检耗费大量精力。`,
    requirementsDoc: `### 需求分析\n1. 自动轮询多站点账户健康指标。\n2. 超出阈值立刻通过 IM 机器人告警。`,
    featureDoc: `### 功能描述\n多账号登录 -> 抓取 Account Health 概览 -> 判断 ODR/LDR 是否触发预警 -> 导出巡检日报 -> IM 机器人推送。`,
    usageDoc: `### 使用说明\n配置店铺 API Token 或 RPA 登录凭据后，即可按设定时间定时巡检。`,
    developer: '跨境自动化团队',
    developerEmail: 'crossborder@corp.com',
    isOfficial: true,
    likes: 24,
    installs: 890,
    isInstalled: true,
    isEnabled: true,
    runStatus: 'idle',
    successRate: 99.1,
    runsCount: 3420,
    savedPersonDays: '120 人天',
    costSaved: '¥3,800',
    lastRunResult: '巡检 12 个站点，全量正常',
    lastRunTime: '2026-08-12 13:00:00',
    triggerText: '每 2 小时定时巡检',
    triggers: [{ id: 'trig-amz-1', type: 'cron', name: '每 2 小时巡检', config: '0 */2 * * *', enabled: true }],
    inputs: [
      { key: 'stores', label: '巡检店铺列表', type: 'text', required: true, defaultValue: 'US-Store-1, EU-Store-2', description: '输入需要巡检的店铺标识' },
      { key: 'odrThreshold', label: 'ODR 警戒线 (%)', type: 'number', required: true, defaultValue: 1.0, description: '订单缺陷率超过此设定值告警' },
    ],
    outputs: [{ key: 'report', label: '巡检报告 PDF', type: 'file', required: true, description: '多站点健康度的合规摘要' }],
    versions: [{ version: 'v2.1', releaseTime: '2026-07-10 10:00:00', author: 'crossborder', changelog: '支持日本站与中东站绩效抓取。' }],
    logs: [
      {
        id: 'log-amz-1',
        startTime: '2026-08-12 13:00:00',
        duration: '22s',
        status: 'success',
        triggerSource: '定时巡检',
        logText: '[13:00:00] 开始巡检 12 个站点...\n[13:00:22] 全部指标处于安全阈值内。',
        outputSummary: '巡检完成，状态正常',
        stages: [
          {
            type: 'Agent',
            name: 'Agent 智能诊断',
            status: 'success',
            duration: '12.4s',
            logText: '[13:00:00] 调度 Amazon Health Inspector Agent...\n[13:00:04] 正在分析 12 个站点 ODR 与迟发率指标\n[13:00:10] 经模型推理：各站点指标均在安全阈值 (1.0%) 范围内\n[13:00:12] 生成巡检诊断报告',
          },
          {
            type: '后端',
            name: '后端服务接口',
            status: 'success',
            duration: '4.8s',
            logText: '[13:00:13] POST /api/v2/crossborder/patrol/report (HTTP 200 OK)\n[13:00:15] 推送钉钉群机器人 Webhook\n[13:00:17] 消息发送成功 (msgId: dding-9921)',
          },
          {
            type: '数据库',
            name: '数据库记录',
            status: 'success',
            duration: '4.8s',
            logText: '[13:00:18] INSERT INTO patrol_daily_logs (sites_checked=12, status="healthy")\n[13:00:22] 归档完成',
          },
        ],
      },
    ],
    permissions: {
      spaces: ['public', 'jv'],
      roles: [
        { role: 'super_admin', roleName: '超级管理员', access: 'admin' },
        { role: 'operator', roleName: '业务操作员', access: 'operator' },
      ],
    },
  },
  {
    id: 'app-compete-monitor',
    name: '供应商与竞店上新监测',
    space: 'rnd',
    spaceLabel: '研发中心',
    category: '商品',
    tag: '竞品分析',
    tags: ['Agent', '竞品分析', '上新巡检'],
    level: 'L2 场景应用',
    icon: 'barChart',
    accent: 'from-blue-500 to-cyan-500',
    description: '自动监测目标竞店上新，完成聚合、分析并生成跟进建议与价格对比策略。',
    backgroundDoc: `### 背景与目的\n帮助商品开发与采购部门第一时间掌握行业主推款式与定价变动。`,
    requirementsDoc: `每日定时抓取指定店铺新品列表，对比已有 SKU。`,
    featureDoc: `抓取商品图文、主图、价格、销量趋势，基于大模型分析设计风格与卖点。`,
    usageDoc: `配置监测店铺 URL 列表，运行后生成分析报告。`,
    developer: '研发中心 AI组',
    developerEmail: 'rd-ai@corp.com',
    isOfficial: false,
    likes: 18,
    installs: 412,
    isInstalled: true,
    isEnabled: true,
    runStatus: 'idle',
    successRate: 97.8,
    runsCount: 186,
    savedPersonDays: '42.5 人天',
    costSaved: '¥980',
    lastRunResult: '发现 12 个同款跟进点',
    lastRunTime: '2026-08-12 08:00:00',
    triggerText: '每日 08:00 聚合早报',
    triggers: [{ id: 'trig-comp-1', type: 'cron', name: '每日早报', config: '0 8 * * *', enabled: true }],
    inputs: [{ key: 'targetUrls', label: '竞店地址', type: 'text', required: true, defaultValue: 'https://shop123.taobao.com', description: '监测的目标店铺首页' }],
    outputs: [{ key: 'insightSummary', label: '竞品情报摘要', type: 'text', required: true, description: 'AI 总结的流行趋势分析' }],
    versions: [{ version: 'v1.2', releaseTime: '2026-06-01 09:00:00', author: 'rd-ai', changelog: '增加样式标签大模型自动标注。' }],
    logs: [
      {
        id: 'log-comp-1',
        startTime: '2026-08-12 08:00:00',
        duration: '35s',
        status: 'success',
        triggerSource: '定时任务',
        logText: '[08:00:00] 正在请求竞店接口...\n[08:08:35] 完成趋势分析。',
        outputSummary: '解析 12 款新品',
        stages: [
          {
            type: 'RPA',
            name: 'RPA 爬虫采集',
            status: 'success',
            duration: '18.0s',
            logText: '[08:00:00] 启动爬虫 Worker 并发采集目标竞店商品页...\n[08:00:15] 成功解析 12 款新品列表与详情页数据',
          },
          {
            type: 'Agent',
            name: 'Agent 风格与卖点解析',
            status: 'success',
            duration: '10.5s',
            logText: '[08:00:16] 调用大模型提取新品风格标签与价格带分布...\n[08:00:25] 提取完成，生成 12 条竞品特征向量',
          },
          {
            type: '数据库',
            name: '数据库持久化',
            status: 'success',
            duration: '6.5s',
            logText: '[08:00:26] 批量更新 competitor_sku_pool 表\n[08:00:35] 写入完成，触发早报通知',
          },
        ],
      },
    ],
    permissions: {
      spaces: ['rnd'],
      roles: [
        { role: 'super_admin', roleName: '超级管理员', access: 'admin' },
        { role: 'operator', roleName: '业务操作员', access: 'operator' },
      ],
    },
  },
  {
    id: 'app-contract-audit',
    name: '合同审查专家',
    space: 'personal',
    spaceLabel: '个人空间',
    category: '财务',
    tag: '法务科技',
    tags: ['Agent', 'AI助手', '模板示例'],
    level: 'L2 场景应用',
    icon: 'file-text',
    accent: 'from-violet-500 to-purple-600',
    description: '上传合同文件，基于大模型自动进行合同条款合规审查、风险避坑提示与修改建议。',
    backgroundDoc: `### 背景\n法务与业务人员审批合同工作量大，容易遗漏履约风险或违约金陷阱。`,
    requirementsDoc: `支持 PDF/Word 文件上传，识别付款节点、免责声明与争议解决条款。`,
    featureDoc: `多维度法律模型对比，高亮高风险条款并给出替代建议。`,
    usageDoc: `直接拖拽合同文件至运行框，点击开始审查。`,
    developer: '法务科技部',
    developerEmail: 'legal-tech@corp.com',
    isOfficial: true,
    likes: 45,
    installs: 2100,
    isInstalled: false,
    isEnabled: false,
    runStatus: 'idle',
    successRate: 99.5,
    runsCount: 5400,
    savedPersonDays: '210 人天',
    costSaved: '¥8,500',
    lastRunResult: '未运行',
    lastRunTime: '--',
    triggerText: '文件上传手动触发',
    triggers: [{ id: 'trig-contract-1', type: 'manual', name: '手动点击运行', config: '文件上传触发', enabled: true }],
    inputs: [
      { key: 'contractFile', label: '上传合同文件', type: 'file', required: true, defaultValue: '', description: '支持 .pdf, .docx 格式文件' },
      { key: 'strictLevel', label: '审查严格度', type: 'select', required: true, defaultValue: '标准', options: ['宽松', '标准', '严格'], description: '风险合规偏好' },
    ],
    outputs: [{ key: 'riskReport', label: '风险审查诊断书', type: 'text', required: true, description: '包含风险清单与修改意见' }],
    versions: [{ version: 'v3.0', releaseTime: '2026-08-01 14:00:00', author: 'legal-tech', changelog: '升级新一代企业法务模型引擎。' }],
    logs: [],
    permissions: {
      spaces: ['personal', 'public'],
      roles: [
        { role: 'super_admin', roleName: '超级管理员', access: 'admin' },
        { role: 'operator', roleName: '业务操作员', access: 'operator' },
        { role: 'viewer', roleName: '查看者', access: 'viewer' },
      ],
    },
  },
  {
    id: 'app-voice-assistant',
    name: '智能语音指令助手',
    space: 'jv',
    spaceLabel: '合资企业',
    category: '客服',
    tag: '语音交互',
    tags: ['Agent', '语音交互', '客服'],
    level: 'L1 原子能力',
    icon: 'sound',
    accent: 'from-pink-500 to-rose-500',
    description: '长按 Space 空格键进行语音输入，松开即可发送语音指令，机器人回复自带语音合成。',
    backgroundDoc: `### 背景\n提高移动端与桌面端交互效率，解放双手。`,
    requirementsDoc: `低延迟语音识别 (ASR) 与合成 (TTS)。`,
    featureDoc: `支持实时流式识别与快捷指令触发。`,
    usageDoc: `按住快捷键说话即可。`,
    developer: 'AI 交互实验室',
    developerEmail: 'speech@corp.com',
    isOfficial: true,
    likes: 31,
    installs: 670,
    isInstalled: false,
    isEnabled: false,
    runStatus: 'idle',
    successRate: 96.2,
    runsCount: 1200,
    savedPersonDays: '15 人天',
    costSaved: '¥450',
    lastRunResult: '未运行',
    lastRunTime: '--',
    triggerText: '快捷键 Space 按住触发',
    triggers: [{ id: 'trig-voice-1', type: 'shortcut', name: '长按空格', config: 'Space Keydown', enabled: true }],
    inputs: [{ key: 'language', label: '识别语言', type: 'select', required: true, defaultValue: '中文普通话', options: ['中文普通话', '英语', '粤语'], description: '主音频采样语言' }],
    outputs: [{ key: 'textResult', label: '识别文本', type: 'text', required: true, description: '语音转出的文本' }],
    versions: [{ version: 'v1.0', releaseTime: '2026-05-10 11:00:00', author: 'speech', changelog: '首次上架。' }],
    logs: [],
    permissions: {
      spaces: ['jv', 'public'],
      roles: [{ role: 'super_admin', roleName: '超级管理员', access: 'admin' }],
    },
  },
  {
    id: 'app-recruiting',
    name: '招聘助手与简历智能匹配',
    space: 'public',
    spaceLabel: '公共空间',
    category: '人事',
    tag: 'HR/Agent',
    tags: ['HR/Agent', '大模型', '简历分析'],
    level: 'L2 场景应用',
    icon: 'robot',
    accent: 'from-emerald-500 to-teal-600',
    description: '上传 JD 与候选人简历，自动匹配岗位需求关键能力项并输出多维评价报告。',
    developer: '组织与人才中心',
    developerEmail: 'hr-tech@corp.com',
    isOfficial: false,
    likes: 12,
    installs: 430,
    isInstalled: true,
    isEnabled: true,
    runStatus: 'idle',
    successRate: 98.2,
    runsCount: 310,
    savedPersonDays: '36.8 人天',
    costSaved: '¥2,100',
    lastRunResult: '已解析匹配 32 份候选人简历',
    lastRunTime: '2026-08-11 15:30:00',
    triggerText: '定时或批量上传触发',
    triggers: [{ id: 'trig-rec-1', type: 'cron', name: '工作日晨报', config: '0 10 * * 1-5', enabled: true }],
    inputs: [
      { key: 'jdText', label: '岗位 JD 描述', type: 'text', required: true, defaultValue: '资深全栈前端架构师', description: '输入岗位要求' },
      { key: 'resumeFiles', label: '简历文件包', type: 'file', required: true, defaultValue: 'C:/Resumes/Candidates.zip', description: '候选人简历压缩包' },
    ],
    outputs: [{ key: 'matchReport', label: '人岗匹配打分表', type: 'file', required: true, description: '多维度匹配诊断报告' }],
    versions: [{ version: 'v1.5', releaseTime: '2026-07-20 10:00:00', author: 'hr-tech', changelog: '优化技术栈契合度加权算法。' }],
    logs: [
      {
        id: 'log-rec-1',
        startTime: '2026-08-11 15:30:00',
        duration: '18s',
        status: 'success',
        triggerSource: '手动触发',
        logText: '[15:30:00] 解析简历包完成\n[15:30:18] 成功生成 32 份匹配报告',
        outputSummary: '已匹配 32 份简历',
        stages: [
          {
            type: '后端',
            name: '后端文件解析',
            status: 'success',
            duration: '6.0s',
            logText: '[15:30:00] 解压 Candidates.zip 简历包 (32 份 PDF)\n[15:30:05] OCR 与文本结构化提取完成',
          },
          {
            type: 'Agent',
            name: 'Agent 人岗匹配打分',
            status: 'success',
            duration: '8.5s',
            logText: '[15:30:06] 基于岗位 JD 计算 32 份候选人多维匹配度...\n[15:30:14] 打分矩阵生成完成，平均匹配度 88.5%',
          },
          {
            type: '数据库',
            name: '数据库归档',
            status: 'success',
            duration: '3.5s',
            logText: '[15:30:15] 批量更新 hr_candidate_scores 表\n[15:30:18] 成功生成 32 份匹配报告',
          },
        ],
      },
    ],
    permissions: {
      spaces: ['public'],
      roles: [{ role: 'super_admin', roleName: '超级管理员', access: 'admin' }],
    },
  },
  {
    id: 'app-crossborder-ads',
    name: '跨境广告智能投放调价',
    space: 'jv',
    spaceLabel: '合资企业',
    category: '跨境',
    tag: '智能调价',
    tags: ['跨境', '广告ROI', '自动化'],
    level: 'L3 执行系统',
    icon: 'thunderbolt',
    accent: 'from-cyan-500 to-blue-600',
    description: '基于实时 ACOS 和转化率指标，自动动态调整亚马逊与独立站广告关键词出价。',
    developer: '跨境增长团队',
    developerEmail: 'growth@corp.com',
    isOfficial: false,
    likes: 8,
    installs: 210,
    isInstalled: false,
    isEnabled: false,
    runStatus: 'idle',
    successRate: 95.8,
    runsCount: 150,
    savedPersonDays: '88.0 人天',
    costSaved: '¥5,600',
    lastRunResult: '未运行',
    lastRunTime: '--',
    triggerText: '实时数据流监测',
    triggers: [{ id: 'trig-ad-1', type: 'event', name: 'ACOS 波动告警', config: 'ACOS > 35%', enabled: true }],
    inputs: [
      { key: 'campaignId', label: '广告活动 ID', type: 'text', required: true, defaultValue: 'CAMP-9921', description: '投放活动编号' },
      { key: 'targetAcos', label: '目标 ACOS (%)', type: 'number', required: true, defaultValue: 25, description: '期望的支出销售比率' },
    ],
    outputs: [{ key: 'bidLogs', label: '调价记录明细', type: 'text', required: true, description: '出价变更日志' }],
    versions: [{ version: 'v2.0', releaseTime: '2026-06-15 11:00:00', author: 'growth', changelog: '接入深度强化学习调价引擎。' }],
    logs: [],
    permissions: {
      spaces: ['jv'],
      roles: [{ role: 'super_admin', roleName: '超级管理员', access: 'admin' }],
    },
  },
  {
    id: 'app-marketing-copy',
    name: '多平台电商营销文案生成',
    space: 'personal',
    spaceLabel: '个人空间',
    category: '营销',
    tag: '内容生成',
    tags: ['文案创作', '多渠道投放', 'AIGC'],
    level: 'L1 原子能力',
    icon: 'tag',
    accent: 'from-orange-500 to-amber-500',
    description: '输入产品卖点，一键生成适配小红书、抖音、淘宝详情页等不同平台风格的爆款文案。',
    developer: '内容创意工坊',
    developerEmail: 'creative@corp.com',
    isOfficial: true,
    likes: 56,
    installs: 1890,
    isInstalled: true,
    isEnabled: true,
    runStatus: 'idle',
    successRate: 99.0,
    runsCount: 4200,
    savedPersonDays: '24.5 人天',
    costSaved: '¥800',
    lastRunResult: '今日已生成 48 篇营销文案',
    lastRunTime: '2026-08-12 09:15:00',
    triggerText: '表单实时生成',
    triggers: [{ id: 'trig-copy-1', type: 'manual', name: '点击实时生成', config: '表单提交触发', enabled: true }],
    inputs: [
      { key: 'productName', label: '产品名称与品类', type: 'text', required: true, defaultValue: '夏季透气冰丝速干 T 恤', description: '输入商品基本信息' },
      { key: 'features', label: '核心卖点提炼', type: 'text', required: true, defaultValue: '凉感降温、抗菌防臭、微弹修身', description: '突出差异化卖点' },
      { key: 'channel', label: '目标推广平台', type: 'select', required: true, defaultValue: '小红书', options: ['小红书', '抖音', '淘宝详情页', '微信朋友圈'], description: '文案风格适配渠道' },
    ],
    outputs: [{ key: 'copyText', label: '生成文案内容', type: 'text', required: true, description: '多套文案候选' }],
    versions: [{ version: 'v1.1', releaseTime: '2026-08-01 16:00:00', author: 'creative', changelog: '新增小红书爆款 Emoji 排版模板。' }],
    logs: [
      {
        id: 'log-copy-1',
        startTime: '2026-08-12 09:15:00',
        duration: '3.2s',
        status: 'success',
        triggerSource: '手动生成',
        logText: '[09:15:00] 解析商品卖点...\n[09:15:03] 生成 3 篇小红书风格文案。',
        outputSummary: '成功生成 3 篇文案',
        stages: [
          {
            type: 'Agent',
            name: 'Agent 文案生成',
            status: 'success',
            duration: '2.4s',
            logText: '[09:15:00] 加载小红书爆款文案 Prompt 模板\n[09:15:01] 模型推理生成 3 套差异化卖点文案与 Emoji 排版',
          },
          {
            type: '后端',
            name: '后端格式校验',
            status: 'success',
            duration: '0.8s',
            logText: '[09:15:02] 文案格式校验与敏感词过滤通过\n[09:15:03] 组装 JSON 响应返回客户端',
          },
        ],
      },
    ],
    permissions: {
      spaces: ['personal'],
      roles: [{ role: 'super_admin', roleName: '超级管理员', access: 'admin' }],
    },
  },
]

export function ApplicationCenter() {
  const [activeSpace, setActiveSpace] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [filterStatus, setFilterStatus] = useState<'all' | 'installed' | 'available'>('all')
  const [searchText, setSearchText] = useState<string>('')

  // View mode and modals state
  const [apps, setApps] = useState<AppItem[]>(initialApps)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null)
  const [activeTabInDetail, setActiveTabInDetail] = useState('overview')

  const [interactiveModalVisible, setInteractiveModalVisible] = useState(false)
  const [interactiveApp, setInteractiveApp] = useState<AppItem | null>(null)

  const { setActiveAppDetail } = useWorkspaceStore()

  useEffect(() => {
    return () => {
      setActiveAppDetail(null)
    }
  }, [setActiveAppDetail])

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // 1. Space filter
      const matchesSpace = activeSpace === 'all' || app.space === activeSpace

      // 2. Category filter
      const matchesCategory = activeCategory === '全部' || app.category === activeCategory

      // 3. Status filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'installed' && app.isInstalled) ||
        (filterStatus === 'available' && !app.isInstalled)

      // 4. Search filter
      const search = searchText.trim().toLowerCase()
      const matchesSearch =
        !search ||
        `${app.name} ${app.description} ${app.category} ${app.spaceLabel} ${app.tags.join(' ')} ${app.developer}`
          .toLowerCase()
          .includes(search)

      return matchesSpace && matchesCategory && matchesStatus && matchesSearch
    })
  }, [apps, activeSpace, activeCategory, filterStatus, searchText])

  const installedCount = useMemo(() => apps.filter((app) => app.isInstalled).length, [apps])

  const totalSavedPersonDays = useMemo(() => {
    const total = apps.reduce((acc, app) => acc + (parseFloat(app.savedPersonDays) || 0), 0)
    return total.toFixed(1)
  }, [apps])

  const handleOpenDetail = (app: AppItem, tab = 'overview') => {
    setSelectedApp(app)
    setActiveTabInDetail(tab)
    setViewMode('detail')
    setActiveAppDetail(app.name, () => {
      setViewMode('list')
      setActiveAppDetail(null)
    })
  }

  const handleBackToList = () => {
    setViewMode('list')
    setActiveAppDetail(null)
  }

  const handleOpenInteractive = (app: AppItem) => {
    if (!app.isInstalled) {
      Message.info({ content: `请先点击“获取”安装应用 [${app.name}]` })
      return
    }
    setInteractiveApp(app)
    setInteractiveModalVisible(true)
  }

  const handleToggleInstall = (app: AppItem) => {
    const isNowInstalled = !app.isInstalled
    const updated = {
      ...app,
      isInstalled: isNowInstalled,
      isEnabled: isNowInstalled,
      installs: (app.installs || 0) + (isNowInstalled ? 1 : -1),
    }
    setApps((prev) => prev.map((item) => (item.id === app.id ? updated : item)))
    if (selectedApp?.id === app.id) {
      setSelectedApp(updated)
    }
    Message.success({
      content: isNowInstalled ? `已成功获取 [${app.name}]！` : `已卸载 [${app.name}]`,
    })
  }

  const handleToggleEnable = (app: AppItem) => {
    const updated = { ...app, isEnabled: !app.isEnabled }
    setApps((prev) => prev.map((item) => (item.id === app.id ? updated : item)))
    if (selectedApp?.id === app.id) {
      setSelectedApp(updated)
    }
    Message.info({
      content: updated.isEnabled ? `应用 [${app.name}] 已启用` : `应用 [${app.name}] 已暂停使用`,
    })
  }

  const handleUpdateApp = (updatedApp: AppItem) => {
    setApps((prev) => prev.map((item) => (item.id === updatedApp.id ? updatedApp : item)))
    if (selectedApp?.id === updatedApp.id) {
      setSelectedApp(updatedApp)
    }
  }

  const handleRunAppNow = (targetApp: AppItem, inputValues: Record<string, unknown>) => {
    const nowStr = new Date().toLocaleString()
    const logId = generateLogId()

    const newLog: AppExecutionLog = {
      id: logId,
      startTime: nowStr,
      duration: '正在计算...',
      status: 'running',
      triggerSource: '手动运行对话框',
      logText: `[${nowStr}] 交互框传参: ${JSON.stringify(inputValues)}\n[${nowStr}] 唤起自动化执行引擎...\n[${nowStr}] 正在处理业务逻辑中...`,
      outputSummary: '运行中',
      stages: [
        {
          type: 'RPA',
          name: 'RPA 交互执行',
          status: 'running',
          duration: '执行中...',
          logText: `[${nowStr}] 接收前端表单入参: ${JSON.stringify(inputValues)}\n[${nowStr}] 正在调度 RPA 执行器...`,
        },
        {
          type: '数据库',
          name: '数据库写入',
          status: 'running',
          duration: '等待就绪',
          logText: `[${nowStr}] 等待 RPA 执行输出后开始事务持久化...`,
        },
      ],
    }

    const runningApp: AppItem = {
      ...targetApp,
      runStatus: 'running',
      logs: [newLog, ...targetApp.logs],
    }

    handleUpdateApp(runningApp)

    // Simulate completion after 2.5s
    setTimeout(() => {
      const completedLog: AppExecutionLog = {
        ...newLog,
        status: 'success',
        duration: '2.6s',
        logText: `${newLog.logText}\n[${new Date().toLocaleString()}] 执行成功！返回结果与参数写回完毕。`,
        outputSummary: '本次模拟执行成功',
        stages: [
          {
            type: 'RPA',
            name: 'RPA 交互执行',
            status: 'success',
            duration: '1.8s',
            logText: `[${nowStr}] 接收前端表单入参: ${JSON.stringify(inputValues)}\n[${nowStr}] 调度 RPA 执行器完成，流程正常结束`,
          },
          {
            type: '数据库',
            name: '数据库写入',
            status: 'success',
            duration: '0.8s',
            logText: `[${nowStr}] 事务提交完成，更新主表与运行日志表成功。`,
          },
        ],
      }

      setApps((currentApps) =>
        currentApps.map((a) => {
          if (a.id !== targetApp.id) return a
          const updatedLogs = a.logs.map((l) => (l.id === logId ? completedLog : l))
          const updated: AppItem = {
            ...a,
            runStatus: 'idle',
            runsCount: (a.runsCount || 0) + 1,
            lastRunTime: nowStr,
            lastRunResult: '已完成本次交互执行',
            logs: updatedLogs,
          }
          if (selectedApp?.id === a.id) {
            setSelectedApp(updated)
          }
          return updated
        }),
      )
    }, 2500)
  }

  const handleCreateApp = (newApp: Partial<AppItem>, openDetail = true) => {
    const spaceKey = newApp.space || 'personal'
    const fullApp: AppItem = {
      id: generateAppId(),
      name: newApp.name || '新建自动化应用',
      space: spaceKey,
      spaceLabel: spaceKeyToLabel[spaceKey] || '个人空间',
      category: newApp.category || '营销',
      tag: newApp.tag || '自定义',
      tags: newApp.tags || ['自建应用'],
      level: newApp.level || 'L2 场景应用',
      icon: newApp.icon || 'robot',
      accent: newApp.accent || 'from-[#165dff] to-[#7b61ff]',
      description: newApp.description || '用户新建的自动化场景应用',
      backgroundDoc: '### 背景介绍\n用户新建的自动化流程。',
      requirementsDoc: '### 需求调研\n按需自定义配置。',
      featureDoc: '### 功能描述\n支持参数输入与自动化输出。',
      usageDoc: '### 使用说明\n点击运行按钮填写参数即可执行。',
      developer: '当前用户',
      developerEmail: 'user@corp.com',
      isOfficial: false,
      likes: 1,
      installs: 1,
      isInstalled: true,
      isEnabled: true,
      runStatus: 'idle',
      successRate: 100,
      runsCount: 0,
      savedPersonDays: '0 人天',
      costSaved: '¥0',
      lastRunResult: '就绪未运行',
      lastRunTime: '--',
      triggerText: '手动触发',
      triggers: [{ id: generateAppTriggerId(), type: 'manual', name: '手动触发', config: '点击运行', enabled: true }],
      inputs: [{ key: 'input_param', label: '默认输入参数', type: 'text', required: true, defaultValue: '测试文本', description: '参数说明' }],
      outputs: [{ key: 'output_param', label: '默认输出结果', type: 'text', required: true, description: '输出结果说明' }],
      versions: [{ version: 'v1.0.0', releaseTime: new Date().toLocaleString(), author: '当前用户', changelog: '首次创建应用' }],
      logs: [],
      permissions: {
        spaces: [spaceKey],
        roles: [
          { role: 'super_admin', roleName: '超级管理员', access: 'admin' },
          { role: 'operator', roleName: '业务操作员', access: 'operator' },
        ],
      },
    }

    setApps((prev) => [fullApp, ...prev])
    setActiveSpace('all')
    setActiveCategory('全部')

    if (openDetail) {
      handleOpenDetail(fullApp, 'overview')
    }
  }

  const renderIcon = (icon?: string) => {
    switch (icon) {
      case 'shopping':
        return <IconTag />
      case 'global':
        return <IconPublic />
      case 'sound':
        return <IconSound />
      case 'barChart':
        return <IconDashboard />
      case 'thunderbolt':
        return <IconThunderbolt />
      case 'file-text':
        return <IconFile />
      default:
        return <IconRobot />
    }
  }

  if (viewMode === 'detail' && selectedApp) {
    return (
      <section className="min-h-full bg-[#f5f7fa] px-4 pb-10 pt-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          <AppDetailPage
            app={selectedApp}
            activeTab={activeTabInDetail}
            onBack={handleBackToList}
            onToggleInstall={handleToggleInstall}
            onToggleEnable={handleToggleEnable}
            onUpdateApp={handleUpdateApp}
            onRunApp={handleRunAppNow}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-full bg-[#f5f7fa] px-4 pb-10 pt-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        {/* 1. Pure Metric Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {/* Card 1: 已安装应用 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">已安装应用</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#165dff]">
                <IconApps className="text-base" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{installedCount}</span>
              <span className="text-xs text-slate-400">个</span>
            </div>
          </div>

          {/* Card 2: 正在运行实例 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">正在运行实例</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <IconThunderbolt className="text-base" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-600">
                {apps.filter((a) => a.runStatus === 'running').length}
              </span>
              <span className="text-xs text-slate-400">个</span>
            </div>
          </div>

          {/* Card 3: 累计节省工时 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">累计节省工时</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <IconClockCircle className="text-base" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{totalSavedPersonDays}</span>
              <span className="text-xs text-slate-400">人天</span>
            </div>
          </div>

          {/* Card 4: 平均成功率 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">平均成功率</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <IconDashboard className="text-base" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">98.6%</span>
            </div>
          </div>
        </div>

        {/* 2. Space Selector Tabs & Search Bar */}
        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center min-w-0">
              <Tabs
                activeTab={activeSpace}
                onChange={setActiveSpace}
                type="capsule"
                size="default"
                className="app-center-tabs overflow-x-auto"
              >
                {spaces.map((space) => (
                  <Tabs.TabPane key={space.key} title={space.label} />
                ))}
              </Tabs>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <ArcoInput
                value={searchText}
                onChange={(val) => setSearchText(val)}
                allowClear
                placeholder="搜索 RPA、Agent 或应用名称..."
                prefix={<IconSearch className="text-slate-400" />}
                className="w-full sm:w-[260px] minimal-radius !rounded-[2px]"
              />
            </div>
          </div>
        </div>

        {/* 3. Dimension Select Filters & Create App Bar */}
        <section className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
              {/* Filter 1: 业务维度 */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-600 shrink-0">业务维度:</span>
                <Select
                  value={activeCategory}
                  onChange={setActiveCategory}
                  style={{ width: 220 }}
                  className="minimal-radius !rounded-[2px]"
                  size="default"
                >
                  {categories.map((category) => (
                    <Select.Option key={category.label} value={category.label}>
                      {category.label === '全部' ? '全部业务' : category.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Filter 2: 应用状态 */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-600 shrink-0">应用状态:</span>
                <Select
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  style={{ width: 180 }}
                  className="minimal-radius !rounded-[2px]"
                  size="default"
                >
                  <Select.Option value="all">全部应用</Select.Option>
                  <Select.Option value="installed">已安装</Select.Option>
                  <Select.Option value="available">可获取</Select.Option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="primary"
                size="default"
                icon={<IconPlus />}
                className="!rounded-[2px]"
                onClick={() => setCreateModalVisible(true)}
              >
                创建应用
              </Button>
            </div>
          </div>
        </section>

        {/* 4. Applications Grid List */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((app) => (
            <article
              key={app.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
            >
              <div>
                <div className="p-5">
                  {/* Header Row */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-[#165dff]">
                        {renderIcon(app.icon)}
                      </span>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-slate-900">
                          {app.name}
                        </h2>

                        <div className="mt-1 flex flex-wrap gap-1">
                          <Tag size="small" color={maturityColor[app.level] || 'arcoblue'}>{app.level}</Tag>
                          <Tag size="small" color="purple">{app.category}</Tag>
                          <Tag size="small" color="gray">{app.spaceLabel}</Tag>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="min-h-11 text-xs leading-5 text-slate-500 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Trigger / Last Result Card */}
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1 truncate text-slate-500">
                        <IconClockCircle className="shrink-0" />
                        {app.triggerText || '未设置触发机制'}
                      </span>
                      <span className="shrink-0 font-medium text-slate-700">{app.lastRunResult}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Action Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                <div className="flex items-center gap-2">
                  {!app.isInstalled ? (
                    <Button
                      type="primary"
                      size="small"
                      icon={<IconDownload />}
                      className="!rounded-lg !bg-rose-500 hover:!bg-rose-600 !px-4"
                      onClick={() => handleToggleInstall(app)}
                    >
                      获取
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      icon={<IconPlayArrow />}
                      className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-700 !px-3"
                      onClick={() => handleOpenInteractive(app)}
                    >
                      运行
                    </Button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDetail(app, 'overview')}
                  className="inline-flex items-center gap-1 text-xs text-[#165dff] hover:underline"
                >
                  查看详情 <IconArrowRight />
                </button>
              </div>
            </article>
          ))}

          {/* Empty State */}
          {filteredApps.length === 0 && (
            <Empty
              className="col-span-full rounded-2xl border border-slate-200 bg-white py-16"
              description="没有符合条件的应用，可尝试切换筛选维度或在顶部创建新应用"
            />
          )}
        </section>

        {/* 5. Modals & Drawers */}
        <AppCreateModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreateApp={handleCreateApp}
        />

        <AppInteractiveDialogModal
          visible={interactiveModalVisible}
          app={interactiveApp}
          onClose={() => setInteractiveModalVisible(false)}
          onRun={handleRunAppNow}
        />
      </div>
    </section>
  )
}


