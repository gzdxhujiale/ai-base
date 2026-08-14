import { Modal as ArcoModal } from '@arco-design/web-react'
import type { ModalProps } from '@arco-design/web-react'
import type { ReactNode } from 'react'

export type AppModalProps = ModalProps & { children?: ReactNode }

export function Modal({ className = '', children, ...props }: AppModalProps) {
  return (
    <ArcoModal {...props} className={`ui-modal ${className}`}>
      {children}
    </ArcoModal>
  )
}

Modal.confirm = ArcoModal.confirm
Modal.info = ArcoModal.info
Modal.success = ArcoModal.success
Modal.warning = ArcoModal.warning
Modal.error = ArcoModal.error
Modal.useModal = ArcoModal.useModal

