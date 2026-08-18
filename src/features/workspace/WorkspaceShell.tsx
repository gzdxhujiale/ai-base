import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Avatar, Dropdown, Menu, Tooltip } from '@arco-design/web-react'
import {
  IconApps,
  IconBook,
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
import { KnowledgeSpace } from '../knowledge/KnowledgeSpace'
import { EnterpriseSettings } from '../enterprise-settings/EnterpriseSettings'
import { WorkbenchPage } from './WorkbenchPage'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { roleLabels, useKnowledgeStore } from '../../stores/knowledge-store'

type NavigationItem = {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  tone: string
}

const navItems: NavigationItem[] = [
  { id: 'workbench', label: '我的工作台', description: '聚合角色待办、简报与工作入口', icon: <IconHome />, tone: 'bg-blue-500' },
  { id: 'tasks', label: '任务中心', description: '管理任务进度与协作事项', icon: <IconCalendar />, tone: 'bg-violet-500' },
  { id: 'apps', label: '应用中心', description: '发现并使用企业应用', icon: <IconApps />, tone: 'bg-sky-500' },
  { id: 'knowledge', label: '知识库', description: '构建与共享企业领域知识库', icon: <IconBook />, tone: 'bg-indigo-500' },
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
  const { role, setRole } = useKnowledgeStore()
  const visibleNavItems = navItems
  const current = useMemo(() => visibleNavItems.find((item) => item.id === pageId) ?? navItems[0], [pageId, visibleNavItems])
  const {
    isSidebarCollapsed,
    commandOpen,
    aiDrawerOpen,
    activeAppDetailName,
    activeAppDetailBack,
    toggleSidebar,
    setCommandOpen,
    setAiDrawerOpen,
    setActiveAppDetail,
    setPendingWorkbenchAppId,
  } = useWorkspaceStore()
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

  const goTo = (id: string) => {
    setActiveAppDetail(null)
    navigate({ to: id === 'workbench' ? '/' : '/$pageId', params: id === 'workbench' ? {} : { pageId: id } })
  }

  const switchRole = (nextRole: typeof role) => {
    setRole(nextRole)
  }

  const openWorkbenchApp = (appId: string) => {
    setPendingWorkbenchAppId(appId)
    goTo('apps')
  }

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[#f6f8fb] text-slate-800">
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 sm:px-6">
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
          <Dropdown droplist={<Menu>
            <Menu.Item key="profile">个人资料</Menu.Item>
            <Menu.Item key="divider" disabled>切换角色</Menu.Item>
            {(['employee', 'manager', 'owner'] as const).map((item) => <Menu.Item key={item} onClick={() => switchRole(item)} disabled={role === item}>{roleLabels[item]}{role === item ? '（当前）' : ''}</Menu.Item>)}
            <Menu.Item key="logout">退出登录</Menu.Item>
          </Menu>} position="br">
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-50"><Avatar size={30} style={{ backgroundColor: '#e8f1ff', color: '#165dff' }}><IconUser /></Avatar><span className="hidden text-sm font-medium text-slate-700 sm:block">{roleLabels[role]}</span><IconDown className="hidden text-xs text-slate-400 sm:block" /></button>
          </Dropdown>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 h-[calc(100vh-4rem)] w-full overflow-hidden">
        <aside className={`shrink-0 self-stretch flex flex-col justify-between border-r border-slate-200/80 bg-white transition-[width] duration-200 ${isSidebarCollapsed ? 'w-[72px]' : 'w-60'}`}>
          <nav className="flex-1 overflow-y-auto px-3 pt-4 space-y-1" aria-label="主导航">
            {visibleNavItems.filter((item) => item.id !== 'settings').map((item) => (
              <div key={item.id}>
                <Tooltip content={item.label} position="right" disabled={!isSidebarCollapsed}>
                  <button onClick={() => goTo(item.id)} className={`group flex h-11 w-full items-center rounded-lg text-sm transition ${current.id === item.id ? 'bg-[#eff5ff] font-medium text-[#165dff]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'}`}>
                    <span className={`text-lg ${current.id === item.id ? 'text-[#165dff]' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </Tooltip>
              </div>
            ))}
          </nav>

          {/* Bottom Settings Nav Section */}
          {visibleNavItems.find((item) => item.id === 'settings') && (
            <div className="border-t border-slate-100 p-3" aria-label="底部导航">
              {(() => {
                const settingsItem = visibleNavItems.find((item) => item.id === 'settings')!
                return (
                  <Tooltip content={settingsItem.label} position="right" disabled={!isSidebarCollapsed}>
                    <button onClick={() => goTo(settingsItem.id)} className={`group flex h-11 w-full items-center rounded-lg text-sm transition ${current.id === settingsItem.id ? 'bg-[#eff5ff] font-medium text-[#165dff]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'}`}>
                      <span className={`text-lg ${current.id === settingsItem.id ? 'text-[#165dff]' : 'text-slate-400 group-hover:text-slate-600'}`}>{settingsItem.icon}</span>
                      {!isSidebarCollapsed && <span>{settingsItem.label}</span>}
                    </button>
                  </Tooltip>
                )
              })()}
            </div>
          )}
        </aside>

        <section className="flex flex-1 min-w-0 h-full flex-col overflow-hidden">
          <div className="z-10 flex h-14 shrink-0 items-center border-b border-slate-200/80 bg-white px-5 sm:px-8">
            <Tooltip content={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}>
              <button onClick={toggleSidebar} className="mr-3 hidden grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:grid" aria-label="切换侧边栏">
                {isSidebarCollapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              </button>
            </Tooltip>
            {current.id === 'apps' && activeAppDetailName ? (
              <>
                <button
                  type="button"
                  onClick={() => activeAppDetailBack?.()}
                  className="cursor-pointer text-sm font-medium text-slate-500 hover:text-[#165dff] transition"
                >
                  {current.label}
                </button>
                <IconLeft className="mx-2 rotate-180 text-xs text-slate-300" />
                <span className="text-sm font-semibold text-slate-800 truncate max-w-[320px]">
                  {activeAppDetailName}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-800">{current.label}</span>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {current.id === 'workbench' ? <WorkbenchPage role={role} onNavigate={goTo} onOpenAi={() => setAiDrawerOpen(true)} onOpenApp={openWorkbenchApp} /> : current.id === 'apps' ? <ApplicationCenter /> : current.id === 'knowledge' ? <KnowledgeSpace /> : current.id === 'settings' ? <EnterpriseSettings onOpenKnowledge={() => goTo('knowledge')} /> : <ContentPlaceholder item={current} />}
          </div>
        </section>
      </div>

      <Modal visible={commandOpen} footer={null} title={null} closable={false} onCancel={() => setCommandOpen(false)} className="command-modal" style={{ width: 560 }}>
        <div className="p-1"><Input autoFocus value={searchValue} onChange={setSearchValue} prefix={<IconSearch className="text-slate-400" />} placeholder="搜索应用、任务或成员" className="command-input" /><p className="px-3 pb-2 pt-4 text-xs font-medium text-slate-400">快速访问</p>{visibleNavItems.filter((item) => item.label.includes(searchValue) || !searchValue).slice(0, 5).map((item) => <button key={item.id} onClick={() => { goTo(item.id); setCommandOpen(false) }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"><span className={`grid size-8 place-items-center rounded-lg ${item.tone} text-white`}>{item.icon}</span><span><span className="block text-sm font-medium text-slate-700">{item.label}</span><span className="block text-xs text-slate-400">{item.description}</span></span></button>)}</div>
      </Modal>
      <AiAssistantDrawer visible={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </main>
  )
}
