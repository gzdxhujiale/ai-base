import { Input as ArcoInput } from '@arco-design/web-react'
import type { InputProps } from '@arco-design/web-react'

export function Input({ className = '', ...props }: InputProps) {
  return <ArcoInput {...props} className={`ui-input ${className}`} />
}
