import { create } from 'zustand'

export type DemoRole = 'employee' | 'manager' | 'owner'
export type PermissionLevel = 'view' | 'edit' | 'manage'
export type DocumentStatus = 'uploading' | 'parsing' | 'ready' | 'failed'
export type DocumentCategory = '制度规范' | '产品资料' | '项目文档' | '培训资料' | '会议纪要' | '其他'

export type KnowledgeBase = {
  id: string
  name: string
  description: string
  department: string
  visibility: '全员可见' | '指定部门可见' | '指定成员可见'
  archived?: boolean
}

export type KnowledgeDocument = {
  id: string
  name: string
  knowledgeBaseId: string | null
  space: 'enterprise' | 'personal'
  category: DocumentCategory
  status: DocumentStatus
  archived?: boolean
  deleted?: boolean
  deletedFrom?: string
}

export type Member = {
  id: string
  name: string
  department: string
  role: '员工' | '管理者' | '经营者'
  assignedKnowledgeBaseIds: string[]
  permission: PermissionLevel
}

const initialKnowledgeBases: KnowledgeBase[] = [
  { id: 'product', name: '产品知识库', description: '产品策略、需求与版本资料的统一入口', department: '产品部', visibility: '指定部门可见' },
  { id: 'policy', name: '企业制度库', description: '面向全员的流程制度与组织规范', department: '人力资源部', visibility: '全员可见' },
  { id: 'project', name: '重点项目库', description: '跨部门重点项目的协作材料', department: '战略与运营部', visibility: '指定成员可见' },
]

const initialDocuments: KnowledgeDocument[] = [
  { id: 'doc-1', name: '2026 年产品路线图.md', knowledgeBaseId: 'product', space: 'enterprise', category: '产品资料', status: 'ready' },
  { id: 'doc-2', name: '需求评审规范.docx', knowledgeBaseId: 'product', space: 'enterprise', category: '制度规范', status: 'parsing' },
  { id: 'doc-3', name: '员工行为准则.docx', knowledgeBaseId: 'policy', space: 'enterprise', category: '制度规范', status: 'ready' },
  { id: 'doc-4', name: 'Q3 项目复盘.md', knowledgeBaseId: 'project', space: 'enterprise', category: '项目文档', status: 'failed' },
  { id: 'doc-5', name: '我的调研笔记.md', knowledgeBaseId: null, space: 'personal', category: '产品资料', status: 'ready' },
]

const initialMembers: Member[] = [
  { id: 'member-1', name: '林川', department: '战略与运营部', role: '经营者', assignedKnowledgeBaseIds: [], permission: 'manage' },
  { id: 'member-2', name: '陈墨', department: '产品部', role: '管理者', assignedKnowledgeBaseIds: ['product'], permission: 'manage' },
  { id: 'member-3', name: '周宁', department: '产品部', role: '员工', assignedKnowledgeBaseIds: [], permission: 'view' },
  { id: 'member-4', name: '许言', department: '人力资源部', role: '员工', assignedKnowledgeBaseIds: [], permission: 'view' },
]

type KnowledgeState = {
  role: DemoRole
  knowledgeBases: KnowledgeBase[]
  documents: KnowledgeDocument[]
  members: Member[]
  setRole: (role: DemoRole) => void
  createKnowledgeBase: (input: Omit<KnowledgeBase, 'id' | 'archived'>) => void
  updateKnowledgeBase: (id: string, input: Omit<KnowledgeBase, 'id' | 'archived'>) => void
  archiveKnowledgeBase: (id: string) => void
  restoreKnowledgeBase: (id: string) => void
  createDocument: (name: string, knowledgeBaseId: string | null, space: 'enterprise' | 'personal', category: DocumentCategory) => void
  updateDocument: (id: string, input: Pick<KnowledgeDocument, 'knowledgeBaseId' | 'category'>) => void
  retryDocument: (id: string) => void
  archiveDocument: (id: string) => void
  restoreDocument: (id: string) => void
  deleteDocument: (id: string) => void
  restoreDeletedDocument: (id: string) => void
  updateMember: (id: string, input: Pick<Member, 'role' | 'assignedKnowledgeBaseIds' | 'permission'>) => void
}

export const roleLabels: Record<DemoRole, string> = { employee: '员工', manager: '管理者', owner: '经营者' }
export const categories: DocumentCategory[] = ['制度规范', '产品资料', '项目文档', '培训资料', '会议纪要', '其他']

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  role: 'employee',
  knowledgeBases: initialKnowledgeBases,
  documents: initialDocuments,
  members: initialMembers,
  setRole: (role) => set({ role, members: initialMembers.map((member) => ({ ...member, assignedKnowledgeBaseIds: [...member.assignedKnowledgeBaseIds] })) }),
  createKnowledgeBase: (input) => set((state) => ({ knowledgeBases: [...state.knowledgeBases, { ...input, id: `kb-${Date.now()}` }] })),
  updateKnowledgeBase: (id, input) => set((state) => ({ knowledgeBases: state.knowledgeBases.map((item) => item.id === id ? { ...item, ...input } : item) })),
  archiveKnowledgeBase: (id) => set((state) => ({ knowledgeBases: state.knowledgeBases.map((item) => item.id === id ? { ...item, archived: true } : item) })),
  restoreKnowledgeBase: (id) => set((state) => ({ knowledgeBases: state.knowledgeBases.map((item) => item.id === id ? { ...item, archived: false } : item) })),
  createDocument: (name, knowledgeBaseId, space, category) => {
    const id = `document-${Date.now()}`
    set((state) => ({ documents: [...state.documents, { id, name, knowledgeBaseId, space, category, status: 'uploading' }] }))
    window.setTimeout(() => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, status: 'parsing' } : item) })), 700)
    window.setTimeout(() => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, status: 'ready' } : item) })), 1700)
  },
  updateDocument: (id, input) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, ...input } : item) })),
  retryDocument: (id) => {
    set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, status: 'parsing' } : item) }))
    window.setTimeout(() => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, status: 'ready' } : item) })), 1100)
  },
  archiveDocument: (id) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, archived: true } : item) })),
  restoreDocument: (id) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, archived: false } : item) })),
  deleteDocument: (id) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, deleted: true, deletedFrom: item.space === 'personal' ? '个人空间' : '企业空间' } : item) })),
  restoreDeletedDocument: (id) => set((state) => ({ documents: state.documents.map((item) => item.id === id ? { ...item, deleted: false, deletedFrom: undefined } : item) })),
  updateMember: (id, input) => set((state) => ({ members: state.members.map((member) => member.id === id ? { ...member, ...input } : member) })),
}))
