import { useState } from 'react'
import { Button, Card, Descriptions, Empty, Modal, Select, Table, Tabs, Tag } from '@arco-design/web-react'
import { IconEdit, IconRefresh } from '@arco-design/web-react/icon'
import { type Member, type PermissionLevel, useKnowledgeStore } from '../../stores/knowledge-store'

const permissionLabels: Record<PermissionLevel, string> = { view: '查看', edit: '编辑', manage: '管理' }

export function EnterpriseSettings({ onOpenKnowledge }: { onOpenKnowledge: () => void }) {
  const { role, knowledgeBases, documents, members, restoreKnowledgeBase, restoreDocument, restoreDeletedDocument, updateMember } = useKnowledgeStore()
  const canManageRbac = role === 'owner'
  const [activeTab, setActiveTab] = useState('enterprise')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [memberRole, setMemberRole] = useState<Member['role']>('员工')
  const [memberPermission, setMemberPermission] = useState<PermissionLevel>('view')
  const [assignedKnowledgeBaseIds, setAssignedKnowledgeBaseIds] = useState<string[]>([])
  const archivedKnowledgeBases = knowledgeBases.filter((item) => item.archived)
  const archivedDocuments = documents.filter((item) => item.archived && !item.deleted)
  const deletedDocuments = documents.filter((item) => item.deleted)

  const openMember = (member: Member) => {
    setEditingMember(member)
    setMemberRole(member.role)
    setMemberPermission(member.permission)
    setAssignedKnowledgeBaseIds(member.assignedKnowledgeBaseIds)
  }

  const saveMember = () => {
    if (editingMember) updateMember(editingMember.id, { role: memberRole, permission: memberPermission, assignedKnowledgeBaseIds })
    setEditingMember(null)
  }

  const memberColumns = [
    { title: '成员', dataIndex: 'name', render: (name: string, member: Member) => <div><span className="font-medium text-slate-700">{name}</span><p className="mt-0.5 text-xs text-slate-400">{member.department}</p></div> },
    { title: '角色', dataIndex: 'role', render: (memberRoleValue: Member['role']) => <Tag color={memberRoleValue === '经营者' ? 'purple' : memberRoleValue === '管理者' ? 'blue' : 'gray'}>{memberRoleValue}</Tag> },
    { title: '知识库范围', dataIndex: 'assignedKnowledgeBaseIds', render: (ids: string[], member: Member) => member.role === '经营者' ? '全部知识库' : ids.length ? ids.map((id) => knowledgeBases.find((item) => item.id === id)?.name).join('、') : '按部门继承' },
    { title: '权限档位', dataIndex: 'permission', render: (permission: PermissionLevel) => permissionLabels[permission] },
    { title: '操作', render: (_: unknown, member: Member) => <Button type="text" size="small" icon={<IconEdit />} onClick={() => openMember(member)}>配置</Button> },
  ]

  return (
    <section className="min-h-full bg-[#f6f8fb] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <Tabs activeTab={activeTab} onChange={setActiveTab} type="card-gutter" className="enterprise-settings-tabs">
          <Tabs.TabPane key="enterprise" title="企业信息">
              <Card className="!border-slate-200">
                <Descriptions
                  column={{ xs: 1, md: 2 }}
                  data={[
                    { label: '企业名称', value: '临川科技有限公司' },
                    { label: '行业', value: '企业软件与智能服务' },
                    { label: '企业规模', value: '201–500 人' },
                    { label: '所属部门', value: '产品部、人力资源部、战略与运营部' },
                  ]}
                />
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#eff5ff] text-base font-semibold text-[#165dff]">临</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">企业 Logo</p>
                    <p className="text-xs text-slate-400">当前使用企业标识占位</p>
                  </div>
                  <Button className="ml-auto">更换 Logo</Button>
                </div>
              </Card>
          </Tabs.TabPane>

          {role !== 'employee' && <Tabs.TabPane key="knowledge" title="知识库与文档">
            <Card className="!border-slate-200">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-800">知识库管理</h2><p className="mt-1 text-sm text-slate-500">维护你获授权的知识库、文档与可见范围。</p></div><Button type="primary" onClick={onOpenKnowledge}>进入知识空间</Button></div>
            </Card>
          </Tabs.TabPane>}

          {canManageRbac && (
            <Tabs.TabPane key="rbac" title="RBAC 权限">
              <Card className="!border-slate-200">
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-800">成员与角色</h2>
                  <p className="mt-1 text-sm text-slate-500">部门权限自动继承；成员的显式撤销优先于授权与部门规则。</p>
                </div>
                <Table rowKey="id" columns={memberColumns} data={members} pagination={false} border={false} scroll={{ x: 680 }} />
              </Card>
              <Card className="mt-4 !border-slate-200">
                <h2 className="font-semibold text-slate-800">权限策略</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {[
                    ['查看', '阅读已获授权的知识库与文档'],
                    ['编辑', '上传、更新分类和移动文档'],
                    ['管理', '配置成员/部门可见范围并管理文档全生命周期'],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-lg border border-slate-200 p-4">
                      <Tag color={title === '管理' ? 'purple' : title === '编辑' ? 'blue' : 'gray'}>{title}</Tag>
                      <p className="mt-2 text-sm text-slate-600">{description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane key="recycle" title="回收站">
            <Card className="!border-slate-200">
              <h2 className="font-semibold text-slate-800">已归档</h2>
              <div className="mt-3 space-y-2">
                {[
                  ...archivedKnowledgeBases.map((item) => ({ id: item.id, type: '知识库', name: item.name, restore: () => restoreKnowledgeBase(item.id) })),
                  ...archivedDocuments.map((item) => ({ id: item.id, type: '文档', name: item.name, restore: () => restoreDocument(item.id) })),
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span>
                      <Tag>{item.type}</Tag>
                      <span className="ml-2 text-sm font-medium text-slate-700">{item.name}</span>
                    </span>
                    <Button type="text" size="small" icon={<IconRefresh />} onClick={item.restore}>恢复</Button>
                  </div>
                )) || <Empty description="暂无已归档内容" />}
              </div>
            </Card>
            <Card className="mt-4 !border-slate-200">
              <h2 className="font-semibold text-slate-800">回收站</h2>
              <p className="mt-1 text-sm text-slate-500">已删除内容统一存放，并标注原始空间；只有具备管理权限的用户可以恢复对应文档。</p>
              <div className="mt-3 space-y-2">
                {deletedDocuments.length ? (
                  deletedDocuments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                      <span>
                        <Tag color="gray">{item.deletedFrom}</Tag>
                        <span className="ml-2 text-sm font-medium text-slate-700">{item.name}</span>
                      </span>
                      {role === 'owner' || (role === 'manager' && item.knowledgeBaseId === 'product') || item.space === 'personal' ? (
                        <Button type="text" size="small" icon={<IconRefresh />} onClick={() => restoreDeletedDocument(item.id)}>恢复</Button>
                      ) : (
                        <span className="text-xs text-slate-400">无恢复权限</span>
                      )}
                    </div>
                  ))
                ) : (
                  <Empty description="回收站为空" />
                )}
              </div>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Modal visible={Boolean(editingMember)} title="配置成员角色与知识库权限" onCancel={() => setEditingMember(null)} onOk={saveMember} okText="保存" unmountOnExit>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
            <Select
              value={memberRole}
              onChange={(value) => setMemberRole(value as Member['role'])}
              className="w-full"
              options={['员工', '管理者', '经营者'].map((r) => ({ label: r, value: r }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">知识库授权</label>
            <Select
              mode="multiple"
              value={assignedKnowledgeBaseIds}
              onChange={(value) => setAssignedKnowledgeBaseIds(value as string[])}
              className="w-full"
              disabled={memberRole !== '管理者'}
              options={knowledgeBases.filter((item) => !item.archived).map((item) => ({ label: item.name, value: item.id }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">权限档位</label>
            <Select
              value={memberPermission}
              onChange={(value) => setMemberPermission(value as PermissionLevel)}
              className="w-full"
              options={[
                { label: '查看', value: 'view' },
                { label: '编辑', value: 'edit' },
                { label: '管理', value: 'manage' },
              ]}
            />
          </div>
        </div>
      </Modal>
    </section>
  )
}
