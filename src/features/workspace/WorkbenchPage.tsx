import { Card, Progress, Tag } from '@arco-design/web-react'
import {
  IconArrowRight,
  IconCheckCircle,
  IconClockCircle,
  IconCommon,
  IconExclamationCircle,
  IconFile,
  IconPlus,
  IconRobot,
  IconThunderbolt,
} from '@arco-design/web-react/icon'
import { Button } from '../../UI/Button'
import type { DemoRole } from '../../stores/knowledge-store'
import { useWorkspaceStore } from '../../stores/workspace-store'

type WorkbenchPageProps = {
  role: DemoRole
  onNavigate: (pageId: string) => void
  onOpenAi: () => void
  onOpenApp: (appId: string) => void
}

type RoleContent = {
  greeting: string
  focus: string
  brief: string
  metrics: Array<{ label: string; value: string; change: string; positive?: boolean }>
  priorities: Array<{ title: string; detail: string; status: string; tone: 'warning' | 'danger' | 'processing' }>
  actions: Array<{ title: string; description: string; icon: React.ReactNode; pageId: string; color: string }>
}

const roleContent: Record<DemoRole, RoleContent> = {
  owner: {
    greeting: '早上好，林川',
    focus: '今天有 3 项经营事项需要你关注',
    brief: '本周核心目标整体按计划推进。华东区域回款进度低于节奏，建议在周四经营例会前确认资源支持方案。',
    metrics: [
      { label: '本月回款达成', value: '72.4%', change: '较目标 -4.6%' },
      { label: '重点项目健康度', value: '86', change: '较上周 +3', positive: true },
      { label: '待决策事项', value: '3', change: '2 项临近截止' },
    ],
    priorities: [
      { title: '确认华东区域回款保障方案', detail: '回款节奏较计划落后 4.6%，影响本月经营目标。', status: '需决策', tone: 'danger' },
      { title: '验收客户增长专项阶段成果', detail: '跨部门任务已完成，等待经营侧确认下一阶段投入。', status: '待验收', tone: 'warning' },
      { title: '关注供应交付风险', detail: '2 个重点项目的关键节点进入预警区间。', status: '有风险', tone: 'warning' },
    ],
    actions: [
      { title: '经营地图', description: '查看区域与项目全貌', icon: <IconCommon />, pageId: 'map', color: 'bg-emerald-50 text-emerald-600' },
      { title: '经营洞察', description: '分析指标与异常', icon: <IconThunderbolt />, pageId: 'insights', color: 'bg-amber-50 text-amber-600' },
      { title: '任务中心', description: '跟进重大事项', icon: <IconCheckCircle />, pageId: 'tasks', color: 'bg-violet-50 text-violet-600' },
    ],
  },
  manager: {
    greeting: '早上好，陈墨',
    focus: '产品部有 5 项事项需要协调推进',
    brief: '本周部门目标推进平稳，需求评审排期存在冲突。2 项任务接近截止，建议优先协调研发与设计资源。',
    metrics: [
      { label: '部门目标进度', value: '68%', change: '按计划推进', positive: true },
      { label: '进行中任务', value: '24', change: '5 项需关注' },
      { label: '待验收事项', value: '4', change: '本周新增 2 项' },
    ],
    priorities: [
      { title: '协调需求评审排期冲突', detail: '两个重点需求占用了同一批评审资源。', status: '待协调', tone: 'warning' },
      { title: '验收移动端改版交付物', detail: '任务已提交，验收标准与附件已齐全。', status: '待验收', tone: 'processing' },
      { title: '处理客户反馈阻断项', detail: '问题已超过预期处理时长，需要明确负责人。', status: '已阻断', tone: 'danger' },
    ],
    actions: [
      { title: '任务中心', description: '查看团队任务与验收', icon: <IconCheckCircle />, pageId: 'tasks', color: 'bg-violet-50 text-violet-600' },
      { title: '知识库', description: '查找规范与项目资料', icon: <IconFile />, pageId: 'knowledge', color: 'bg-indigo-50 text-indigo-600' },
      { title: '应用中心', description: '进入常用工作应用', icon: <IconPlus />, pageId: 'apps', color: 'bg-sky-50 text-sky-600' },
    ],
  },
  employee: {
    greeting: '早上好，周宁',
    focus: '今天有 4 项任务等待你推进',
    brief: '你的本周任务完成度为 60%。优先完成移动端改版验收准备，并补充客户反馈问题的处理记录。',
    metrics: [
      { label: '我的任务完成度', value: '60%', change: '本周已完成 6 项', positive: true },
      { label: '今日待办', value: '4', change: '1 项今天截止' },
      { label: '等待协作', value: '2', change: '需同步上下游' },
    ],
    priorities: [
      { title: '完善移动端改版验收材料', detail: '今天 16:00 截止，完成标准与历史评审意见可查看。', status: '今天截止', tone: 'danger' },
      { title: '更新客户反馈处理记录', detail: '需要补充已验证的处理结果与复现信息。', status: '待处理', tone: 'warning' },
      { title: '参与增长专项需求评审', detail: '会议将在下午 14:30 开始，已关联需求说明。', status: '待参加', tone: 'processing' },
    ],
    actions: [
      { title: '我的任务', description: '执行、反馈与协作', icon: <IconCheckCircle />, pageId: 'tasks', color: 'bg-violet-50 text-violet-600' },
      { title: '知识库', description: '查找任务背景与规范', icon: <IconFile />, pageId: 'knowledge', color: 'bg-indigo-50 text-indigo-600' },
      { title: '应用中心', description: '打开常用业务应用', icon: <IconPlus />, pageId: 'apps', color: 'bg-sky-50 text-sky-600' },
    ],
  },
}

const tagColor = { warning: 'orange', danger: 'red', processing: 'arcoblue' } as const

export function WorkbenchPage({ role, onNavigate, onOpenAi, onOpenApp }: WorkbenchPageProps) {
  const content = roleContent[role]
  const workbenchApps = useWorkspaceStore((state) => state.workbenchApps)

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{content.greeting}</h1>
          <p className="mt-1 text-sm text-slate-500">{content.focus}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" icon={<IconRobot />} onClick={onOpenAi}>问 AI，帮我梳理</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
        <Card bordered={false} className="workbench-brief overflow-hidden" bodyStyle={{ padding: 0 }}>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#165dff] via-[#2469ff] to-[#4f86ff] px-5 py-5 text-white sm:px-6">
            <div className="absolute -right-12 -top-14 size-48 rounded-full border-[20px] border-white/10" />
            <div className="relative flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-lg"><IconRobot /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold">AI 工作简报</h2></div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">{content.brief}</p>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-blue-100">
              <span>基于：任务、指标、业务记录</span>
              <button onClick={() => onNavigate('insights')} className="inline-flex items-center gap-1 font-medium text-white hover:text-blue-100">查看来源 <IconArrowRight /></button>
            </div>
          </div>
          <div className="grid divide-x divide-slate-100 sm:grid-cols-3">
            {content.metrics.map((metric) => <div key={metric.label} className="px-5 py-4 sm:px-6"><p className="text-xs text-slate-500">{metric.label}</p><p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-800">{metric.value}</p><p className={`mt-1 text-xs ${metric.positive ? 'text-emerald-600' : 'text-amber-600'}`}>{metric.change}</p></div>)}
          </div>
        </Card>

        <Card bordered={false} className="workbench-card" bodyStyle={{ padding: 0 }}>
          <div className="flex items-center justify-between px-5 pb-2 pt-4"><div><h2 className="text-base font-semibold text-slate-800">本周进度</h2><p className="mt-0.5 text-xs text-slate-400">事项执行情况</p></div><span className="text-sm font-semibold text-[#165dff]">68%</span></div>
          <div className="px-5 pb-4"><Progress percent={68} showText={false} strokeWidth={7} color="#165dff" /><div className="mt-4 grid grid-cols-3 text-center text-xs"><div><p className="text-lg font-semibold text-slate-700">18</p><span className="text-slate-400">已完成</span></div><div className="border-x border-slate-100"><p className="text-lg font-semibold text-slate-700">9</p><span className="text-slate-400">进行中</span></div><div><p className="text-lg font-semibold text-red-500">2</p><span className="text-slate-400">有风险</span></div></div></div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
        <Card bordered={false} className="workbench-card" bodyStyle={{ padding: 0 }}>
          <div className="flex items-center justify-between px-5 pb-3 pt-4"><div><h2 className="text-base font-semibold text-slate-800">优先处理</h2><p className="mt-0.5 text-xs text-slate-400">点击进入任务或业务详情</p></div><button onClick={() => onNavigate('tasks')} className="text-sm font-medium text-[#165dff] hover:text-blue-700">全部事项</button></div>
          <div className="divide-y divide-slate-100">
            {content.priorities.map((item) => <button key={item.title} onClick={() => onNavigate('tasks')} className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${item.tone === 'danger' ? 'bg-red-50 text-red-500' : item.tone === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-[#165dff]'}`}><IconExclamationCircle /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-700">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.detail}</span></span><Tag color={tagColor[item.tone]} className="shrink-0">{item.status}</Tag><IconArrowRight className="mt-2 shrink-0 text-slate-300" /></button>)}
          </div>
        </Card>

        <div className="space-y-5">
          <Card bordered={false} className="workbench-card" bodyStyle={{ padding: 0 }}>
            <div className="flex items-center justify-between px-5 pb-3 pt-4"><div><h2 className="text-base font-semibold text-slate-800">常用工作入口</h2><p className="mt-0.5 text-xs text-slate-400">按工作习惯聚合</p></div><button onClick={() => onNavigate('apps')} className="text-[#165dff]" aria-label="管理工作入口"><IconPlus /></button></div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">{content.actions.map((action) => <button key={action.title} onClick={() => onNavigate(action.pageId)} className="rounded-lg p-3 text-center transition hover:bg-slate-50"><span className={`mx-auto grid size-9 place-items-center rounded-lg text-lg ${action.color}`}>{action.icon}</span><span className="mt-2 block text-xs font-medium text-slate-700">{action.title}</span><span className="mt-1 block text-[11px] leading-4 text-slate-400">{action.description}</span></button>)}{workbenchApps.map((app) => <button key={app.id} onClick={() => onOpenApp(app.id)} className="rounded-lg p-3 text-center transition hover:bg-slate-50"><span className="mx-auto grid size-9 place-items-center rounded-lg bg-sky-50 text-sm font-semibold text-sky-600">{app.name.slice(0, 1)}</span><span className="mt-2 block truncate text-xs font-medium text-slate-700">{app.name}</span><span className="mt-1 block truncate text-[11px] leading-4 text-slate-400">{app.lastRunResult}</span></button>)}</div>
          </Card>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><IconClockCircle className="text-slate-400" /><span>最后更新：2026-08-18 09:30</span><span className="ml-auto hidden sm:block">任务责任、状态、验收与执行统一由任务中心管理</span></div>
    </section>
  )
}
