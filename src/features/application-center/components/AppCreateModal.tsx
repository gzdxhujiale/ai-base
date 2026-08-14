import { useState } from 'react'
import { Form, Input as ArcoInput, Message, Select, Tag } from '@arco-design/web-react'
import { Button, Input, Modal, Tabs } from '../../../UI'
import type { AppItem, AppSpace } from '../types'

interface AppCreateModalProps {
  visible: boolean
  onClose: () => void
  onCreateApp: (app: Partial<AppItem>, openDetail?: boolean) => void
}

const templates: {
  title: string
  tag: string
  desc: string
  space: AppSpace
  category: string
  level: 'L1 原子能力' | 'L2 场景应用' | 'L3 执行系统'
  accent: string
}[] = [
  {
    title: '招聘助手',
    tag: 'HR/Agent',
    desc: '上传 JD 与简历，自动匹配岗位需求并输出评价多维报告。',
    space: 'public',
    category: '人事',
    level: 'L2 场景应用',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: '合同审查专家',
    tag: '法务AI',
    desc: '上传合同文件，自动进行合规审查、风险避坑与修改建议。',
    space: 'personal',
    category: '财务',
    level: 'L2 场景应用',
    accent: 'from-violet-500 to-purple-500',
  },
  {
    title: '智能语音助手',
    tag: '语音/RPA',
    desc: '按住 Space 空格键语音输入，自动抓取指令并语音合成回复。',
    space: 'jv',
    category: '客服',
    level: 'L1 原子能力',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    title: '模板生成表格',
    tag: '数据/Excel',
    desc: '上传 Excel 模板，自动提取表头与补全字段并生成新报表。',
    space: 'public',
    category: '财务',
    level: 'L2 场景应用',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    title: '知识库问答机器人',
    tag: 'Agent',
    desc: '引用关联知识库内容，根据用户问题深度检索解答。',
    space: 'rnd',
    category: '营销',
    level: 'L2 场景应用',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: '竞店上新巡检',
    tag: '电商/抓取',
    desc: '每日自动定时抓取竞店商品更新，生成对比情报。',
    space: 'public',
    category: '商品',
    level: 'L2 场景应用',
    accent: 'from-cyan-500 to-blue-600',
  },
]

export function AppCreateModal({ visible, onClose, onCreateApp }: AppCreateModalProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'blank'>('template')
  const [form] = Form.useForm()

  const handleUseTemplate = (tpl: (typeof templates)[0]) => {
    onCreateApp(
      {
        name: tpl.title,
        category: tpl.category,
        space: tpl.space,
        level: tpl.level,
        accent: tpl.accent,
        description: tpl.desc,
        tag: tpl.tag,
        tags: [tpl.tag, '模板导入'],
        isInstalled: true,
      },
      true,
    )
    Message.success({ content: `成功基于模板创建 [${tpl.title}]！` })
    onClose()
  }

  const handleCreateBlank = async () => {
    try {
      const values = await form.validate()
      onCreateApp(
        {
          name: values.name as string,
          category: values.category as string,
          space: values.space as AppSpace,
          level: values.level as 'L1 原子能力' | 'L2 场景应用' | 'L3 执行系统',
          description: (values.description as string) || '用户新建的自定义自动化应用',
          tag: '自建应用',
          tags: ['自建应用', values.category as string],
          isInstalled: true,
        },
        true,
      )
      Message.success({ content: `应用 [${values.name}] 创建成功！` })
      form.resetFields()
      onClose()
    } catch {
      // Form validation message
    }
  }

  return (
    <Modal
      visible={visible}
      footer={null}
      unmountOnExit
      style={{ width: 760 }}
      className="shadow-2xl rounded-2xl create-app-modal"
      onCancel={onClose}
      title={<div className="w-full text-center text-base font-bold text-slate-800">创建新应用</div>}
    >
      <div className="space-y-4 p-1">
        <Tabs
          activeTab={activeTab}
          onChange={(k) => setActiveTab(k as 'template' | 'blank')}
          type="line"
          size="default"
          className="app-detail-tabs mb-2"
          extra={<span className="text-xs text-slate-400">选择适合你的构建方式</span>}
        >
          <Tabs.TabPane key="template" title="使用应用模板" />
          <Tabs.TabPane key="blank" title="创建空白应用" />
        </Tabs>

        {/* Tab 1: Template Selection */}
        {activeTab === 'template' ? (
          <div className="grid max-h-[460px] grid-cols-2 gap-3 overflow-y-auto pr-1">
            {templates.map((tpl) => (
              <div
                key={tpl.title}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 transition duration-200 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 transition group-hover:text-[#165dff]">
                      {tpl.title}
                    </span>
                    <Tag size="small" color="arcoblue">
                      {tpl.tag}
                    </Tag>
                  </div>
                  <p className="mb-3 min-h-10 text-xs leading-5 text-slate-500">{tpl.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">{tpl.level}</span>
                  <Button
                    type="primary"
                    size="mini"
                    className="!rounded-[2px]"
                    onClick={() => handleUseTemplate(tpl)}
                  >
                    创建应用
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Blank Form */
          <div className="space-y-4 py-2">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                space: 'personal',
                category: '商品',
                level: 'L2 场景应用',
              }}
            >
              <Form.Item
                field="name"
                label="应用名称"
                rules={[{ required: true, message: '请输入应用名称' }]}
              >
                <Input
                  placeholder="请输入应用名称，例如：店铺财务对账机器人"
                  className="minimal-radius !rounded-[2px]"
                />
              </Form.Item>

              <Form.Item field="space" label="所属空间">
                <Select className="minimal-radius !rounded-[2px] w-full">
                  <Select.Option value="personal">个人空间</Select.Option>
                  <Select.Option value="public">公共空间</Select.Option>
                  <Select.Option value="rnd">研发中心</Select.Option>
                  <Select.Option value="jv">合资企业</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item field="category" label="业务分类">
                <Select className="minimal-radius !rounded-[2px] w-full">
                  <Select.Option value="商品">商品</Select.Option>
                  <Select.Option value="淘宝">淘宝</Select.Option>
                  <Select.Option value="亚马逊">亚马逊</Select.Option>
                  <Select.Option value="跨境">跨境</Select.Option>
                  <Select.Option value="财务">财务</Select.Option>
                  <Select.Option value="客服">客服</Select.Option>
                  <Select.Option value="人事">人事</Select.Option>
                  <Select.Option value="营销">营销</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item field="level" label="应用层级">
                <Select className="minimal-radius !rounded-[2px] w-full">
                  <Select.Option value="L1 原子能力">L1 原子能力</Select.Option>
                  <Select.Option value="L2 场景应用">L2 场景应用</Select.Option>
                  <Select.Option value="L3 执行系统">L3 执行系统</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item field="description" label="应用描述说明">
                <ArcoInput.TextArea
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  placeholder="简要描述该自动化的核心业务功能与使用对象..."
                  className="minimal-radius !rounded-[2px]"
                />
              </Form.Item>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button className="!rounded-[2px]" onClick={onClose}>
                  取消
                </Button>
                <Button
                  type="primary"
                  className="!rounded-[2px] !px-6"
                  onClick={handleCreateBlank}
                >
                  立即创建
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </Modal>
  )
}
