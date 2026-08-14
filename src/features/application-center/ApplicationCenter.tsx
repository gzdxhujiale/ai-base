import { useMemo, useState } from 'react'
import { Form, Input as ArcoInput, Select, Tabs, Tag } from '@arco-design/web-react'
import {
  IconApps,
  IconCheckCircle,
  IconClockCircle,
  IconPlus,
  IconRobot,
  IconThunderbolt,
} from '@arco-design/web-react/icon'
import { Button } from '../../UI/Button'
import { Input } from '../../UI/Input'
import { Modal } from '../../UI/Modal'

type Application = {
  id: string
  name: string
  description: string
  tag: string
  space: string
  business: string
  level: string
}

const spaceTabs = ['全部', '个人空间', '公共空间', '研发中心', '客服中心']
const businessTabs = ['全部', '淘宝', '快手', '抖音', '拼多多', '人事', '财务']

const templates: Application[] = [
  { id: 'recruiting', name: '招聘助手', description: '上传 JD 与简历，自动匹配岗位需求并输出评价多维报告。', tag: 'HR/Agent', space: '公共空间', business: '人事', level: 'L2 场景应用' },
  { id: 'contract', name: '合同审查专家', description: '上传合同文件，自动进行合规审查、风险识别与修改建议。', tag: '法务AI', space: '公共空间', business: '财务', level: 'L2 场景应用' },
  { id: 'voice', name: '智能语音助手', description: '按住 Space 空格键语音输入，自动抓取指令并返回结果。', tag: '语音/RPA', space: '个人空间', business: '淘宝', level: 'L1 原子能力' },
  { id: 'excel', name: '模板生成表格', description: '上传 Excel 模板，自动提取表头与补全字段并生成新报表。', tag: '数据/Excel', space: '研发中心', business: '财务', level: 'L2 场景应用' },
  { id: 'knowledge', name: '知识库问答机器人', description: '引用关联知识库内容，根据用户问题深度检索解答。', tag: 'Agent', space: '客服中心', business: '人事', level: 'L3 智能应用' },
  { id: 'store', name: '竞店上新巡检', description: '每日自动定时抓取竞店商品更新，生成对比情报。', tag: '电商/抓取', space: '研发中心', business: '抖音', level: 'L2 场景应用' },
]

const metrics = [
  { label: '已安装应用', value: '28', hint: '个应用', icon: <IconApps /> },
  { label: '正在运行实例', value: '16', hint: '个实例', icon: <IconRobot /> },
  { label: '累计节省工时', value: '1,284', hint: '小时', icon: <IconClockCircle /> },
  { label: '平均成功率', value: '96.8', hint: '%', icon: <IconCheckCircle /> },
]

export function ApplicationCenter() {
  const [space, setSpace] = useState('全部')
  const [business, setBusiness] = useState('全部')
  const [createOpen, setCreateOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'template' | 'blank'>('template')
  const [apps, setApps] = useState(templates)
  const [form] = Form.useForm()

  const filteredApps = useMemo(
    () => apps.filter((app) => (space === '全部' || app.space === space) && (business === '全部' || app.business === business)),
    [apps, business, space],
  )

  const closeCreate = () => {
    setCreateOpen(false)
    form.resetFields()
  }

  const createBlankApplication = async () => {
    try {
      const values = await form.validate()
      const application: Application = {
        id: `custom-${Date.now()}`,
        name: values.name as string,
        description: (values.description as string) || '尚未添加应用描述。',
        tag: '自定义',
        space: values.space as string,
        business: values.business as string,
        level: values.level as string,
      }
      setApps((current) => [application, ...current])
      setSpace('全部')
      setBusiness('全部')
      closeCreate()
    } catch {
      // Arco 表单会在字段旁展示校验提示。
    }
  }

  const createFromTemplate = (template: Application) => {
    setApps((current) => (current.some((app) => app.id === template.id) ? current : [template, ...current]))
    setSpace('全部')
    setBusiness('全部')
    closeCreate()
  }

  return (
    <section className="min-h-full px-5 py-6 sm:px-8 sm:py-7">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">应用中心</h1>
            <p className="mt-1 text-sm text-slate-500">统一管理和创建企业应用</p>
          </div>
          <Button type="primary" icon={<IconPlus />} onClick={() => setCreateOpen(true)}>创建应用</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(31,35,41,0.03)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{metric.label}</span>
                <span className="grid size-8 place-items-center rounded-lg bg-[#eff5ff] text-base text-[#165dff]">{metric.icon}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">{metric.value}<span className="ml-1 text-sm font-normal text-slate-400">{metric.hint}</span></p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200/80 bg-white px-5 pt-2 shadow-[0_2px_8px_rgba(31,35,41,0.03)] sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 border-b border-slate-100 py-4">
            <span className="shrink-0 text-sm font-medium text-slate-700">空间维度</span>
            <Tabs className="app-filter-tabs min-w-0 flex-1" type="line" activeTab={space} onChange={setSpace}>
              {spaceTabs.map((tab) => <Tabs.TabPane key={tab} title={tab} />)}
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 py-4">
            <span className="shrink-0 text-sm font-medium text-slate-700">业务维度</span>
            <Tabs className="app-filter-tabs min-w-0 flex-1" type="line" activeTab={business} onChange={setBusiness}>
              {businessTabs.map((tab) => <Tabs.TabPane key={tab} title={tab} />)}
            </Tabs>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((app) => (
            <article key={app.id} className="group min-h-48 rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(22,93,255,0.09)]">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eff5ff] text-lg text-[#165dff]"><IconThunderbolt /></div>
                <Tag color="arcoblue" bordered={false}>{app.tag}</Tag>
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-800">{app.name}</h2>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{app.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                <span>{app.level}</span>
                <span>{app.space}</span>
              </div>
            </article>
          ))}
        </div>
        {!filteredApps.length && <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">当前筛选条件下暂无应用占位卡</div>}
      </div>

      <Modal
        visible={createOpen}
        title={<span className="flex items-center justify-center gap-2 text-base font-semibold text-slate-800"><span className="grid size-8 place-items-center rounded-lg bg-[#eff5ff] text-lg text-[#165dff]"><IconPlus /></span>创建新应用</span>}
        footer={null}
        onCancel={closeCreate}
        unmountOnExit
        className="create-application-modal"
        style={{ width: 760 }}
      >
        <Tabs className="create-mode-tabs" activeTab={createMode} onChange={(key) => setCreateMode(key as 'template' | 'blank')}>
          <Tabs.TabPane key="template" title="使用应用模板">
            <div className="grid max-h-[430px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {templates.map((template) => (
                <article key={template.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-slate-800">{template.name}</h3><Tag color="arcoblue" bordered={false}>{template.tag}</Tag></div>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{template.description}</p>
                  <div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-400">{template.level}</span><Button type="primary" size="small" onClick={() => createFromTemplate(template)}>创建应用</Button></div>
                </article>
              ))}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="blank" title="创建空白应用">
            <Form form={form} layout="vertical" initialValues={{ space: '个人空间', business: '淘宝', level: 'L2 场景应用' }} requiredSymbol={{ position: 'start' }}>
              <Form.Item field="name" label="应用名称" rules={[{ required: true, message: '请输入应用名称' }]}>
                <Input placeholder="请输入应用名称，例如：店铺财务对账机器人" />
              </Form.Item>
              <div className="grid gap-x-3 sm:grid-cols-3">
                <Form.Item field="space" label="所属空间"><Select><Select.Option value="个人空间">个人空间</Select.Option><Select.Option value="公共空间">公共空间</Select.Option><Select.Option value="研发中心">研发中心</Select.Option><Select.Option value="客服中心">客服中心</Select.Option></Select></Form.Item>
                <Form.Item field="business" label="业务分类"><Select>{businessTabs.slice(1).map((item) => <Select.Option key={item} value={item}>{item}</Select.Option>)}</Select></Form.Item>
                <Form.Item field="level" label="应用层级"><Select><Select.Option value="L1 原子能力">L1 原子能力</Select.Option><Select.Option value="L2 场景应用">L2 场景应用</Select.Option><Select.Option value="L3 智能应用">L3 智能应用</Select.Option></Select></Form.Item>
              </div>
              <Form.Item field="description" label="应用描述说明"><ArcoInput.TextArea autoSize={{ minRows: 4, maxRows: 4 }} placeholder="简要描述该自动化的核心业务功能与使用对象..." /></Form.Item>
              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-3"><Button onClick={closeCreate}>取消</Button><Button type="primary" onClick={createBlankApplication}>立即创建</Button></div>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </section>
  )
}
