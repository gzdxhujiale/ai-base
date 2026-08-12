import { Modal as ArcoModal } from '@arco-design/web-react'
import type { ModalProps } from '@arco-design/web-react'
import type { ReactNode } from 'react'

type AppModalProps = ModalProps & { children?: ReactNode }

export function Modal({ className = '', children, ...props }: AppModalProps) {
  return <ArcoModal {...props} className={`ui-modal ${className}`}>{children}</ArcoModal>
}
