import type { ComponentProps } from 'react'
import { Tabs as ArcoTabs } from '@arco-design/web-react'
import type { TabsProps } from '@arco-design/web-react'

export type TabPaneProps = ComponentProps<typeof ArcoTabs.TabPane>
export type { TabsProps }

export function Tabs({ className = '', ...props }: TabsProps) {
  return <ArcoTabs {...props} className={`ui-tabs ${className}`} />
}

Tabs.TabPane = ArcoTabs.TabPane

