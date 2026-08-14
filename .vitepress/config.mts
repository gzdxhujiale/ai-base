import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: 'docs',
  title: 'AI Base 知识库',
  description: 'AI Base 企业工作台项目知识库',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '知识库首页', link: '/' },
      { text: '架构', link: '/architecture/' },
      { text: '产品', link: '/product-specs/' },
      { text: '设计', link: '/design-docs/' },
      { text: '计划', link: '/PLANS' },
    ],
    sidebar: {
      '/architecture/': [
        {
          text: '架构与工程',
          items: [
            { text: '架构总览', link: '/architecture/' },
            { text: '前端工程约定', link: '/FRONTEND' },
            { text: '设计摘要', link: '/DESIGN' },
          ],
        },
      ],
      '/design-docs/': [
        {
          text: '设计文档',
          items: [
            { text: '设计文档索引', link: '/design-docs/' },
            { text: '核心信念', link: '/design-docs/core-beliefs' },
            { text: '工作台交互模型', link: '/design-docs/workspace-interaction-model' },
            { text: '应用中心', link: '/design-docs/application-center' },
          ],
        },
      ],
      '/product-specs/': [
        {
          text: '产品规格',
          items: [
            { text: '产品规格索引', link: '/product-specs/' },
            { text: '新用户引导', link: '/product-specs/new-user-onboarding' },
          ],
        },
      ],
      '/exec-plans/': [
        {
          text: '执行计划',
          items: [
            { text: '技术债务追踪', link: '/exec-plans/tech-debt-tracker' },
            { text: '活跃计划', link: '/exec-plans/active/README' },
            { text: '已完成计划', link: '/exec-plans/completed/README' },
          ],
        },
      ],
      '/agent/': [
        {
          text: 'Agent 治理',
          items: [
            { text: 'Skills', link: '/agent/skill' },
            { text: 'Skill 编写', link: '/agent/skill-authoring' },
          ],
        },
      ],
      '/PLANS': [
        {
          text: '项目治理',
          items: [
            { text: '路线图与计划', link: '/PLANS' },
            { text: '产品判断', link: '/PRODUCT_SENSE' },
            { text: '质量评分', link: '/QUALITY_SCORE' },
            { text: '可靠性', link: '/RELIABILITY' },
            { text: '安全', link: '/SECURITY' },
          ],
        },
      ],
    },
    outline: 'deep',
    socialLinks: [],
    search: { provider: 'local' },
    footer: {
      message: 'AI Base 项目知识库',
      copyright: '仅供项目协作使用',
    },
  },
})
