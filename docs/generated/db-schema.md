# 后端数据表结构草案

> 本文是基于当前“知识空间”和“应用中心”产品行为整理的后端数据模型草案，不是已生成的迁移、ORM Schema 或当前运行时能力。应用仍是纯前端原型，未接入数据库、认证、文件存储或任务执行服务。实际接入后应以迁移或 ORM schema 自动覆盖本文。

## 约定

- 主键使用 `uuid`；所有业务表都包含 `id`、`created_at`、`updated_at`。
- 租户业务表必须有 `tenant_id`，并在服务端按当前租户强制过滤；客户端传入的 `tenant_id` 不可信。
- 可恢复删除使用 `deleted_at`、`deleted_by`，而不是立即物理删除。
- 枚举可在数据库中使用受控 `varchar` / enum；具体值由迁移统一定义。

## 组织与授权基础

| 表 | 核心字段 | 说明 |
| --- | --- | --- |
| `tenants` | `id`, `name`, `logo_asset_id`, `industry`, `size_range` | 企业/租户。 |
| `departments` | `id`, `tenant_id`, `parent_id`, `name`, `path` | 企业部门树；`path` 支持部门授权继承查询。 |
| `users` | `id`, `display_name`, `email`, `avatar_asset_id` | 用户身份主体；认证凭据不放在此表。 |
| `tenant_members` | `id`, `tenant_id`, `user_id`, `department_id`, `role` | 用户在企业中的成员关系；`role` 为 `employee`、`manager`、`owner`。 |

`tenant_members` 建议唯一约束：`unique (tenant_id, user_id)`；`departments` 建议唯一约束：`unique (tenant_id, parent_id, name)`。

## 知识库与文档

### `knowledge_bases`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键。 |
| `tenant_id` | `uuid` | 所属企业。 |
| `name` | `varchar(160)` | 知识库名称；建议 `unique (tenant_id, name)`。 |
| `description` | `text` | 知识库描述。 |
| `department_id` | `uuid nullable` | 所属部门。 |
| `visibility` | `varchar` | `all`、`departments`、`members`。 |
| `archived_at`, `archived_by` | `timestamptz`, `uuid` | 归档信息。 |
| `deleted_at`, `deleted_by` | `timestamptz`, `uuid` | 回收站信息。 |

### `knowledge_base_grants`

按成员或部门为知识库配置显式授权与撤销；服务端按“显式撤销 > 显式授权 > 部门继承 > 默认无权限”计算最终权限。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id`, `tenant_id`, `knowledge_base_id` | `uuid` | 关联范围。 |
| `subject_type`, `subject_id` | `varchar`, `uuid` | 主体为 `member` 或 `department`。 |
| `effect` | `varchar` | `allow` 或 `deny`。 |
| `permission` | `varchar` | `view`、`edit`、`manage`；`deny` 时为空。 |
| `created_by` | `uuid` | 授权操作者。 |

建议唯一约束：`unique (knowledge_base_id, subject_type, subject_id)`。

### `documents`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id`, `tenant_id` | `uuid` | 主键与企业范围。 |
| `knowledge_base_id` | `uuid nullable` | 企业文档必须关联知识库；个人文档为空。 |
| `owner_member_id` | `uuid nullable` | 个人空间文档的所有者。 |
| `space` | `varchar` | `enterprise` 或 `personal`。 |
| `name`, `file_name`, `mime_type`, `file_size_bytes` | `varchar`, `varchar`, `varchar`, `bigint` | 显示名与原文件元数据。 |
| `asset_id` | `uuid` | 指向受控文件存储对象。 |
| `category` | `varchar` | 制度规范、产品资料、项目文档、培训资料、会议纪要、其他。 |
| `processing_status` | `varchar` | `uploading`、`parsing`、`ready`、`failed`。 |
| `processing_error` | `text nullable` | 仅保存可安全展示的错误摘要。 |
| `archived_at`, `deleted_at`, `deleted_by` | `timestamptz`, `timestamptz`, `uuid` | 生命周期与回收站信息。 |

约束：`space = 'enterprise'` 时 `knowledge_base_id` 不为空；`space = 'personal'` 时 `owner_member_id` 不为空且 `knowledge_base_id` 为空。常用索引：`(tenant_id, knowledge_base_id, deleted_at)`、`(owner_member_id, deleted_at)`、`(tenant_id, processing_status)`。

### `document_versions` 与 `document_processing_jobs`

| 表 | 核心字段 | 说明 |
| --- | --- | --- |
| `document_versions` | `document_id`, `version_number`, `asset_id`, `created_by`, `created_at` | 保留文件替换历史；`unique (document_id, version_number)`。 |
| `document_processing_jobs` | `document_id`, `status`, `attempt`, `started_at`, `finished_at`, `error_summary` | 上传后的解析、索引任务；失败可新建一次重试记录，不覆盖历史。 |

## 应用中心

### `applications`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id`, `tenant_id` | `uuid` | 主键与企业范围。 |
| `name`, `description` | `varchar(160)`, `text` | 应用基本信息。 |
| `space`, `category`, `tag`, `icon`, `accent` | `varchar` | 应用中心的展示与分类字段。 |
| `owner_member_id` | `uuid` | 创建或维护者。 |
| `is_official`, `is_enabled` | `boolean` | 官方标识与启用状态。 |
| `current_version_id` | `uuid nullable` | 当前发布版本。 |
| `deleted_at`, `deleted_by` | `timestamptz`, `uuid` | 可恢复删除。 |

### 应用关联表

| 表 | 核心字段 | 说明 |
| --- | --- | --- |
| `application_versions` | `application_id`, `version`, `definition_json`, `release_notes`, `published_by`, `published_at` | 应用定义与版本记录；敏感连接配置不得写入明文 JSON。 |
| `application_triggers` | `application_id`, `type`, `name`, `config_json`, `enabled` | 手动、计划或事件触发定义。 |
| `application_permissions` | `application_id`, `subject_type`, `subject_id`, `permission` | 为成员、部门或角色分配应用的查看/运行/管理权限。 |
| `application_runs` | `application_id`, `version_id`, `trigger_id`, `requested_by`, `status`, `started_at`, `finished_at`, `output_summary` | 执行记录与安全摘要；大体积输入输出存入受控对象存储。 |
| `application_run_stages` | `run_id`, `sequence`, `stage_type`, `status`, `started_at`, `finished_at`, `log_summary` | 单次执行内的阶段状态。 |

建议唯一约束：`unique (application_id, version)`、`unique (application_id, subject_type, subject_id)`；常用索引：`application_runs (application_id, created_at desc)`。

## 实施前置条件

实现上述表结构前必须建立后端服务边界，并同步更新 `ARCHITECTURE.md`、`docs/SECURITY.md`、`docs/RELIABILITY.md` 与新的 ExecPlan。特别是文件资产、文档解析、权限判断和应用执行均不得由浏览器端状态承担。
