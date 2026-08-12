import { Button as ArcoButton } from '@arco-design/web-react'
import type { ButtonProps as ArcoButtonProps } from '@arco-design/web-react'

export function Button({ className = '', ...props }: ArcoButtonProps) {
  return <ArcoButton {...props} className={`ui-button ${className}`} />
}
