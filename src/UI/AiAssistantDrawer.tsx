import { Drawer, Empty } from '@arco-design/web-react'
import { IconRobot, IconSend } from '@arco-design/web-react/icon'
import { useState } from 'react'
import { Button } from './Button'

type AiAssistantDrawerProps = {
  visible: boolean
  onClose: () => void
}

const suggestions = ['帮我汇总本周待办', '生成经营周报框架', '分析当前任务风险']

export function AiAssistantDrawer({ visible, onClose }: AiAssistantDrawerProps) {
  const [prompt, setPrompt] = useState('')

  return (
    <Drawer
      visible={visible}
      onCancel={onClose}
      title={<span className="flex items-center gap-2 text-base font-semibold text-slate-800"><span className="grid size-7 place-items-center rounded-lg bg-[#eff5ff] text-[#165dff]"><IconRobot /></span>企业 AI</span>}
      footer={null}
      width={440}
      className="ai-assistant-drawer"
    >
      <div className="flex h-full flex-col px-1 pb-1">
        <div className="flex-1 pt-5">
          <Empty description="开始一段新的企业 AI 对话" />
          <div className="mt-10">
            <p className="mb-3 text-xs font-medium text-slate-400">你可以这样问</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => setPrompt(suggestion)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-[#b9cdfd] hover:bg-[#f7faff] hover:text-[#165dff]">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入问题，企业 AI 将为你提供帮助" rows={3} className="block w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-xs text-slate-400">Enter 发送 · Shift + Enter 换行</span>
            <Button type="primary" shape="circle" size="small" disabled={!prompt.trim()} aria-label="发送问题"><IconSend /></Button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
