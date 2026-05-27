export const LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java",
  "C#", "C++", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Shell"
] as const;

export const ROLES = [
  "前端", "后端", "全栈", "DevOps", "数据工程师", "AI工程师", "移动端", "嵌入式"
] as const;

export const STAGES = [
  "需求分析", "架构设计", "技术选型", "编码", "代码审查",
  "测试", "部署", "运维监控", "文档编写"
] as const;

export type Language = typeof LANGUAGES[number];
export type Role = typeof ROLES[number];
export type Stage = typeof STAGES[number];
