import { useMemo, useState } from 'react'
import {
  Checkbox,
  DatePicker,
  Form,
  Input as ArcoInput,
  InputNumber,
  Message,
  Select,
} from '@arco-design/web-react'
import {
  IconFolder,
  IconInfoCircle,
  IconPlayArrow,
} from '@arco-design/web-react/icon'
import { Button, Modal } from '../../../UI'
import type { AppItem } from '../types'

interface AppInteractiveDialogModalProps {
  visible: boolean
  app: AppItem | null
  onClose: () => void
  onRun?: (app: AppItem, values: Record<string, unknown>) => void
}

function getSampleFilePath(appName?: string) {
  return `C:/Users/Public/Documents/${appName || 'Task'}_Export_${Date.now().toString().slice(-4)}.xlsx`
}

export function AppInteractiveDialogModal({
  visible,
  app,
  onClose,
  onRun,
}: AppInteractiveDialogModalProps) {
  const [form] = Form.useForm()
  const [rememberValues, setRememberValues] = useState(true)

  const handleBrowseFile = (fieldKey: string) => {
    const samplePath = getSampleFilePath(app?.name)
    form.setFieldValue(fieldKey, samplePath)
    Message.success({ content: `已选择模拟路径: ${samplePath}` })
  }

  const handleSubmit = async () => {
    if (!app) return

    try {
      const values = await form.validate()
      Message.success({ content: `[${app.name}] 运行对话框确认，已投递运行流程！` })
      onRun?.(app, values as Record<string, unknown>)
      onClose()
    } catch {
      // Form validation will mark required fields automatically
    }
  }

  const initialValues = useMemo(() => {
    const initial: Record<string, unknown> = {}
    if (app) {
      app.inputs.forEach((field) => {
        initial[field.key] = field.defaultValue ?? ''
      })
    }
    return initial
  }, [app])

  return (
    <Modal
      visible={visible}
      footer={null}
      unmountOnExit
      maskClosable
      style={{ width: 540 }}
      className="shadow-2xl rounded-2xl"
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <IconPlayArrow />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal text-slate-400">{app?.name}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-1">
        <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-800">
          <IconInfoCircle className="mt-0.5 shrink-0 text-sm text-amber-600" />
          <div>
            <span>提示：确认参数后点击运行将唤起引擎执行流程。</span>
          </div>
        </div>

        <Form form={form} layout="vertical" initialValues={initialValues}>
          {app?.inputs.map((field) => (
            <Form.Item
              key={field.key}
              field={field.key}
              label={field.label}
              rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined}
              className="!mb-3"
            >
              {field.type === 'date' ? (
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  className="w-full minimal-radius !rounded-[2px]"
                  placeholder="请选择时间"
                />
              ) : field.type === 'select' ? (
                <Select
                  className="w-full minimal-radius !rounded-[2px]"
                  placeholder="请选择"
                >
                  {(field.options || []).map((opt) => (
                    <Select.Option key={opt} value={opt}>
                      {opt}
                    </Select.Option>
                  ))}
                </Select>
              ) : field.type === 'file' ? (
                <div className="flex w-full gap-2">
                  <ArcoInput
                    placeholder="请选择数据存放路径..."
                    className="flex-1 minimal-radius !rounded-[2px]"
                  />
                  <Button
                    type="secondary"
                    icon={<IconFolder />}
                    className="!rounded-[2px]"
                    onClick={() => handleBrowseFile(field.key)}
                  >
                    浏览...
                  </Button>
                </div>
              ) : field.type === 'number' ? (
                <InputNumber
                  className="w-full minimal-radius !rounded-[2px]"
                  placeholder="请输入数字"
                />
              ) : (
                <ArcoInput
                  className="w-full minimal-radius !rounded-[2px]"
                  placeholder={field.description || '请输入'}
                />
              )}
            </Form.Item>
          ))}
        </Form>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Checkbox
            checked={rememberValues}
            onChange={setRememberValues}
            className="text-xs text-slate-500"
          >
            记住内容
          </Checkbox>
          <div className="flex gap-2">
            <Button className="!rounded-lg !px-5" onClick={onClose}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<IconPlayArrow />}
              className="!rounded-lg !bg-rose-500 hover:!bg-rose-600 !px-6"
              onClick={handleSubmit}
            >
              确定运行
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
