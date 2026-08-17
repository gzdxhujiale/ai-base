import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Breadcrumb, Button, Card, Empty, Modal, Popconfirm, Select, Table, Tag, Upload } from '@arco-design/web-react'
import { IconDelete, IconEye, IconFile, IconPlus, IconRefresh, IconSettings, IconUpload } from '@arco-design/web-react/icon'
import { categories, type DocumentCategory, type KnowledgeBase, type KnowledgeDocument, useKnowledgeStore } from '../../stores/knowledge-store'

const statusMeta = {
  uploading: { label: '上传中', color: 'arcoblue' },
  parsing: { label: '解析中', color: 'orange' },
  ready: { label: '已就绪', color: 'green' },
  failed: { label: '解析失败', color: 'red' },
} as const

type UploadChangeHandler = NonNullable<ComponentProps<typeof Upload>['onChange']>

const categoryOptions = categories.map((category) => ({ label: category, value: category }))
const departmentOptions = ['产品部', '人力资源部', '战略与运营部'].map((item) => ({ label: item, value: item }))
const visibilityOptions = ['全员可见', '指定部门可见', '指定成员可见'].map((item) => ({ label: item, value: item }))

function DocumentTable({ documents, knowledgeBases, canManage, personal, onView }: { documents: KnowledgeDocument[]; knowledgeBases: KnowledgeBase[]; canManage: (document: KnowledgeDocument) => boolean; personal: boolean; onView: (document: KnowledgeDocument) => void }) {
  const { updateDocument, retryDocument, archiveDocument, deleteDocument } = useKnowledgeStore()
  const kbOptions = knowledgeBases.filter((item) => !item.archived).map((item) => ({ label: item.name, value: item.id }))
  const columns = [
    { title: '文档名称', dataIndex: 'name', render: (name: string) => <span className="flex items-center gap-2 font-medium text-slate-700"><IconFile className="text-[#165dff]" />{name}</span> },
    { title: '分类', dataIndex: 'category', render: (category: DocumentCategory, record: KnowledgeDocument) => canManage(record) ? <Select size="small" value={category} style={{ width: 108 }} onChange={(value) => updateDocument(record.id, { category: value as DocumentCategory, knowledgeBaseId: record.knowledgeBaseId })} aria-label={`修改 ${record.name} 分类`} options={categoryOptions} /> : <Tag color="blue">{category}</Tag> },
    ...(!personal ? [{ title: '知识库', dataIndex: 'knowledgeBaseId', render: (id: string, record: KnowledgeDocument) => canManage(record) ? <Select size="small" value={id ?? undefined} style={{ width: 128 }} onChange={(value) => updateDocument(record.id, { category: record.category, knowledgeBaseId: value as string })} aria-label={`移动 ${record.name}`} options={kbOptions} /> : knowledgeBases.find((item) => item.id === id)?.name ?? '—' }] : []),
    { title: '状态', dataIndex: 'status', render: (status: KnowledgeDocument['status']) => <Tag color={statusMeta[status].color}>{statusMeta[status].label}</Tag> },
    {
      title: '操作', width: 180, render: (_: unknown, record: KnowledgeDocument) => <div className="flex items-center gap-1">
        <Button type="text" size="small" icon={<IconEye />} onClick={() => onView(record)} aria-label={`查看 ${record.name}`} />
        {canManage(record) && <>
        {record.status === 'failed' && <Button type="text" size="small" icon={<IconRefresh />} onClick={() => retryDocument(record.id)}>重试</Button>}
        <Button type="text" size="small" onClick={() => archiveDocument(record.id)}>归档</Button>
        <Popconfirm title="确认移入回收站？" onOk={() => deleteDocument(record.id)}><Button type="text" size="small" status="danger" icon={<IconDelete />} aria-label={`删除 ${record.name}`} /></Popconfirm>
        </>}
      </div>,
    },
  ]
  return <Table rowKey="id" columns={columns} data={documents} pagination={false} border={false} scroll={{ x: 800 }} noDataElement={<Empty description="暂无文档" />} />
}

export function KnowledgeSpace() {
  const { role, knowledgeBases, documents, members, createKnowledgeBase, updateKnowledgeBase, archiveKnowledgeBase, createDocument } = useKnowledgeStore()
  const [space, setSpace] = useState<'enterprise' | 'personal'>('enterprise')
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null)
  const [knowledgeBaseModal, setKnowledgeBaseModal] = useState(false)
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null>(null)
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState('产品部')
  const [visibility, setVisibility] = useState<KnowledgeBase['visibility']>('指定部门可见')
  const [viewingDocument, setViewingDocument] = useState<KnowledgeDocument | null>(null)
  const activeKnowledgeBases = knowledgeBases.filter((item) => !item.archived)
  const manager = members.find((member) => member.id === 'member-2')
  const assignedKnowledgeBaseIds = manager?.assignedKnowledgeBaseIds ?? []
  const managerPermission = manager?.permission ?? 'view'
  const visibleKnowledgeBases = role === 'owner' ? activeKnowledgeBases : activeKnowledgeBases.filter((item) => role === 'manager' ? assignedKnowledgeBaseIds.includes(item.id) : item.id === 'product' || item.id === 'policy')
  const selectedKnowledgeBase = visibleKnowledgeBases.find((item) => item.id === selectedKnowledgeBaseId) ?? null
  const canEditKnowledgeBase = (id: string) => role === 'owner' || (role === 'manager' && assignedKnowledgeBaseIds.includes(id) && managerPermission !== 'view')
  const canManageKnowledgeBase = (id: string) => role === 'owner' || (role === 'manager' && assignedKnowledgeBaseIds.includes(id) && managerPermission === 'manage')
  const enterpriseDocuments = documents.filter((item) => item.space === 'enterprise' && !item.archived && !item.deleted && visibleKnowledgeBases.some((knowledgeBase) => knowledgeBase.id === item.knowledgeBaseId) && (!selectedKnowledgeBase || item.knowledgeBaseId === selectedKnowledgeBase.id))
  const personalDocuments = documents.filter((item) => item.space === 'personal' && !item.archived && !item.deleted)
  const canUpload = space === 'personal' || (space === 'enterprise' && selectedKnowledgeBase !== null && canEditKnowledgeBase(selectedKnowledgeBase.id))

  const openKnowledgeBaseModal = (knowledgeBase?: KnowledgeBase) => {
    setEditingKnowledgeBase(knowledgeBase ?? null)
    setKnowledgeBaseName(knowledgeBase?.name ?? '')
    setDescription(knowledgeBase?.description ?? '')
    setDepartment(knowledgeBase?.department ?? '产品部')
    setVisibility(knowledgeBase?.visibility ?? '指定部门可见')
    setKnowledgeBaseModal(true)
  }
  const saveKnowledgeBase = () => {
    if (!knowledgeBaseName.trim()) return
    const input = { name: knowledgeBaseName.trim(), description: description.trim(), department, visibility }
    if (editingKnowledgeBase) updateKnowledgeBase(editingKnowledgeBase.id, input)
    else createKnowledgeBase(input)
    setKnowledgeBaseModal(false)
  }
  const handleUpload: UploadChangeHandler = (_fileList, file) => {
    if (!canUpload || !file.name) return
    createDocument(file.name, space === 'enterprise' ? selectedKnowledgeBase?.id ?? visibleKnowledgeBases[0]?.id ?? null : null, space, '其他')
  }

  if (viewingDocument) {
    const knowledgeBaseName = viewingDocument.knowledgeBaseId ? knowledgeBases.find((item) => item.id === viewingDocument.knowledgeBaseId)?.name : '个人空间'
    return <section className="min-h-full bg-[#f6f8fb] px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1100px] space-y-5">
      <Breadcrumb><Breadcrumb.Item><button type="button" className="text-[#165dff] hover:underline" onClick={() => setViewingDocument(null)}>知识空间</button></Breadcrumb.Item><Breadcrumb.Item>{knowledgeBaseName}</Breadcrumb.Item><Breadcrumb.Item>{viewingDocument.name}</Breadcrumb.Item></Breadcrumb>
      <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><IconFile className="text-xl text-[#165dff]" /><h1 className="text-xl font-semibold text-slate-900">{viewingDocument.name}</h1></div><div className="mt-3 flex flex-wrap gap-2"><Tag color="blue">{viewingDocument.category}</Tag><Tag color={statusMeta[viewingDocument.status].color}>{statusMeta[viewingDocument.status].label}</Tag><Tag>{viewingDocument.space === 'personal' ? '个人空间' : knowledgeBaseName}</Tag></div></div><Button onClick={() => setViewingDocument(null)}>返回文档列表</Button></div><div className="py-10"><h2 className="text-base font-semibold text-slate-800">文档内容</h2><p className="mt-3 leading-7 text-slate-600">这是“{viewingDocument.name}”的演示详情页。当前原型仅保存本地选择的文件名与解析状态，尚未接入文件解析或文档正文预览。</p></div></article>
    </div></section>
  }

  return <section className="min-h-full bg-[#f6f8fb] px-4 py-5 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-lg bg-slate-200/70 p-1"><Button type={space === 'enterprise' ? 'primary' : 'text'} size="small" onClick={() => { setSpace('enterprise'); setSelectedKnowledgeBaseId(null) }}>企业空间</Button><Button type={space === 'personal' ? 'primary' : 'text'} size="small" onClick={() => setSpace('personal')}>个人空间</Button></div>
        {space === 'enterprise' && role === 'owner' && <Button type="primary" icon={<IconPlus />} onClick={() => openKnowledgeBaseModal()}>创建知识库</Button>}
      </div>

      {space === 'enterprise' && <>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleKnowledgeBases.map((knowledgeBase) => <Card key={knowledgeBase.id} hoverable className={`border ${selectedKnowledgeBase?.id === knowledgeBase.id ? '!border-[#165dff] ring-2 ring-blue-100' : '!border-slate-200'}`} onClick={() => setSelectedKnowledgeBaseId(knowledgeBase.id)}>
            <div className="flex justify-between gap-3"><div><h3 className="font-semibold text-slate-800">{knowledgeBase.name}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{knowledgeBase.description}</p></div>{canManageKnowledgeBase(knowledgeBase.id) && <Button type="text" size="small" icon={<IconSettings />} onClick={(event) => { event.stopPropagation(); openKnowledgeBaseModal(knowledgeBase) }} aria-label={`管理 ${knowledgeBase.name}`} />}</div>
            <div className="mt-4 flex items-center gap-2"><Tag color="blue">{knowledgeBase.department}</Tag><Tag>{knowledgeBase.visibility}</Tag></div>
            {canManageKnowledgeBase(knowledgeBase.id) && <div className="mt-3 border-t border-slate-100 pt-3"><Popconfirm title="确认归档此知识库？" onOk={() => archiveKnowledgeBase(knowledgeBase.id)}><Button type="text" size="small" status="warning">归档知识库</Button></Popconfirm></div>}
          </Card>)}
        </div>
      </>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-800">{space === 'personal' ? '我的文档' : selectedKnowledgeBase ? `${selectedKnowledgeBase.name} · 文档` : '企业文档'}</h2><p className="mt-1 text-xs text-slate-500">支持 MD、DOCX 文档；上传后将显示解析状态</p></div>{canUpload && <Upload accept={{ type: '.md,.docx', strict: true }} autoUpload={false} showUploadList={false} onChange={handleUpload}><Button type="primary" icon={<IconUpload />}>上传文档</Button></Upload>}</div>
        <DocumentTable documents={space === 'personal' ? personalDocuments : enterpriseDocuments} knowledgeBases={visibleKnowledgeBases} personal={space === 'personal'} canManage={(document) => space === 'personal' || canEditKnowledgeBase(document.knowledgeBaseId ?? '')} onView={setViewingDocument} />
      </div>
    </div>

    <Modal visible={knowledgeBaseModal} title={editingKnowledgeBase ? '编辑知识库' : '创建知识库'} onCancel={() => setKnowledgeBaseModal(false)} onOk={saveKnowledgeBase} okText="保存" unmountOnExit>
      <div className="space-y-4 py-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">名称</label>
          <input value={knowledgeBaseName} onChange={(event) => setKnowledgeBaseName(event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#165dff]" placeholder="例如：销售知识库" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">描述</label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#165dff]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">所属部门</label>
          <Select value={department} onChange={setDepartment} className="w-full" options={departmentOptions} placeholder="请选择所属部门" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">可见范围</label>
          <Select value={visibility} onChange={(value) => setVisibility(value as KnowledgeBase['visibility'])} className="w-full" options={visibilityOptions} placeholder="请选择可见范围" />
        </div>
      </div>
    </Modal>
  </section>
}
