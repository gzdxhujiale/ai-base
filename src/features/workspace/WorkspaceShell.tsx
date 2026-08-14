import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Avatar, Dropdown, Menu, Tooltip } from '@arco-design/web-react'
import {
  IconApps,
  IconBulb,
  IconCalendar,
  IconDashboard,
  IconDown,
  IconExperiment,
  IconHome,
  IconLeft,
  IconMenuFold,
  IconMenuUnfold,
  IconRobot,
  IconSearch,
  IconSettings,
  IconUser,
} from '@arco-design/web-react/icon'
import { Input } from '../../UI/Input'
import { Modal } from '../../UI/Modal'
import { AiAssistantDrawer } from '../../UI/AiAssistantDrawer'
import { ApplicationCenter } from '../application-center/ApplicationCenter'
import { useWorkspaceStore } from '../../stores/workspace-store'

type NavigationItem = {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  tone: string
}

const navItems: NavigationItem[] = [
  { id: 'workbench', label: '我的工作台', description: '聚合待办、日程与团队动态', icon: <IconHome />, tone: 'bg-blue-500' },
  { id: 'tasks', label: '任务中心', description: '管理任务进度与协作事项', icon: <IconCalendar />, tone: 'bg-violet-500' },
  { id: 'apps', label: '应用中心', description: '发现并使用企业应用', icon: <IconApps />, tone: 'bg-sky-500' },
  { id: 'map', label: '经营地图', description: '查看组织及业务全貌', icon: <IconDashboard />, tone: 'bg-emerald-500' },
  { id: 'insights', label: '经营洞察', description: '通过数据发现经营机会', icon: <IconBulb />, tone: 'bg-amber-500' },
  { id: 'ai', label: 'AI 升级', description: '用 AI 提升业务效率', icon: <IconRobot />, tone: 'bg-fuchsia-500' },
  { id: 'settings', label: '企业设置', description: '管理企业成员与基础配置', icon: <IconSettings />, tone: 'bg-slate-500' },
]

function ContentPlaceholder({ item }: { item: NavigationItem }) {
  return (
    <section className="flex min-h-full items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-xl text-center">
        <div className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${item.tone} text-3xl text-white shadow-lg shadow-slate-200`}>
          {item.icon}
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">{item.label}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{item.description}</p>
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 text-left">
          {['待处理事项', '本周动态', '快速操作'].map((label, index) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4">
              <span className="text-xs text-slate-400">0{index + 1}</span>
              <p className="mt-2 text-sm font-medium text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WorkspaceShell() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const pageId = (params as { pageId?: string }).pageId ?? 'workbench'
  const current = useMemo(() => navItems.find((item) => item.id === pageId) ?? navItems[0], [pageId])
  const { isSidebarCollapsed, commandOpen, aiDrawerOpen, toggleSidebar, setCommandOpen, setAiDrawerOpen } = useWorkspaceStore()
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setCommandOpen])

  const goTo = (id: string) => navigate({ to: id === 'workbench' ? '/' : '/$pageId', params: id === 'workbench' ? {} : { pageId: id } })

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-800">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="返回我的工作台">
          <span className="grid size-8 place-items-center rounded-lg bg-[#165dff] text-sm font-bold tracking-tight text-white shadow-sm shadow-blue-200">Q</span>
          <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:block">临川</span>
        </Link>
        <span className="hidden h-5 w-px bg-slate-200 sm:block" />
        <Dropdown droplist={<Menu><Menu.Item key="a">临川科技有限公司</Menu.Item><Menu.Item key="b">创新实验室</Menu.Item></Menu>} position="bl">
          <button className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:flex">
            当前企业 <IconDown className="text-xs" />
          </button>
        </Dropdown>
        <div className="mx-auto hidden w-full max-w-md lg:block">
          <Input
            value={searchValue}
            onChange={setSearchValue}
            placeholder="搜索应用、任务或成员"
            prefix={<IconSearch className="text-slate-400" />}
            suffix={<kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd>}
            onFocus={() => setCommandOpen(true)}
          />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Tooltip content="全局搜索 (⌘ K)"><button onClick={() => setCommandOpen(true)} className="grid size-9 place-items-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden" aria-label="打开搜索"><IconSearch /></button></Tooltip>
          <Tooltip content="询问企业 AI"><button onClick={() => setAiDrawerOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg bg-[#eff5ff] px-3 text-sm font-medium text-[#165dff] transition hover:bg-[#e1edff] sm:flex"><IconExperiment /> 问企业 AI</button></Tooltip>
          <Dropdown droplist={<Menu><Menu.Item key="profile">个人资料</Menu.Item><Menu.Item key="logout">退出登录</Menu.Item></Menu>} position="br">
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-50"><Avatar size={30} style={{ backgroundColor: '#e8f1ff', color: '#165dff' }}><IconUser /></Avatar><span className="hidden text-sm font-medium text-slate-700 sm:block">用户</span><IconDown className="hidden text-xs text-slate-400 sm:block" /></button>
          </Dropdown>
        </div>
      </header>

      <div className="min-h-[calc(100vh-4rem)]">
        <aside className={`fixed bottom-0 left-0 top-16 z-10 hidden overflow-y-auto border-r border-slate-200/80 bg-white transition-[width] duration-200 md:block ${isSidebarCollapsed ? 'w-[72px]' : 'w-60'}`}>
          <nav className="px-3 pt-4" aria-label="主导航">
            {navItems.map((item, index) => (
              <div key={item.id} className={index === navItems.length - 1 ? 'mt-4 border-t border-slate-100 pt-4' : ''}>
                <Tooltip content={item.label} position="right" disabled={!isSidebarCollapsed}>
                  <button onClick={() => goTo(item.id)} className={`group flex h-11 w-full items-center rounded-lg text-sm transition ${current.id === item.id ? 'bg-[#eff5ff] font-medium text-[#165dff]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'}`}>
                    <span className={`text-lg ${current.id === item.id ? 'text-[#165dff]' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </Tooltip>
              </div>
            ))}
          </nav>
        </aside>

        <section className={`min-w-0 transition-[margin] duration-200 md:ml-60 ${isSidebarCollapsed ? 'md:ml-[72px]' : ''}`}>
          <div className="flex h-14 items-center border-b border-slate-200/80 bg-white px-5 sm:px-8"><Tooltip content={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}><button onClick={toggleSidebar} className="mr-3 hidden grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:grid" aria-label="切换侧边栏">{isSidebarCollapsed ? <IconMenuUnfold /> : <IconMenuFold />}</button></Tooltip><span className="text-sm text-slate-400">企业工作台</span><IconLeft className="mx-2 rotate-180 text-xs text-slate-300" /><span className="text-sm font-medium text-slate-700">{current.label}</span></div>
          {current.id === 'apps' ? <ApplicationCenter /> : <ContentPlaceholder item={current} />}
        </section>
      </div>

      <Modal visible={commandOpen} footer={null} title={null} closable={false} onCancel={() => setCommandOpen(false)} className="command-modal" style={{ width: 560 }}>
        <div className="p-1"><Input autoFocus value={searchValue} onChange={setSearchValue} prefix={<IconSearch className="text-slate-400" />} placeholder="搜索应用、任务或成员" className="command-input" /><p className="px-3 pb-2 pt-4 text-xs font-medium text-slate-400">快速访问</p>{navItems.filter((item) => item.label.includes(searchValue) || !searchValue).slice(0, 5).map((item) => <button key={item.id} onClick={() => { goTo(item.id); setCommandOpen(false) }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"><span className={`grid size-8 place-items-center rounded-lg ${item.tone} text-white`}>{item.icon}</span><span><span className="block text-sm font-medium text-slate-700">{item.label}</span><span className="block text-xs text-slate-400">{item.description}</span></span></button>)}</div>
      </Modal>
      <AiAssistantDrawer visible={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </main>
  )
}
