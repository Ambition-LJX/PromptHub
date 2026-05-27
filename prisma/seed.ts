import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedPrompts = [
  {
    title: "TypeScript 代码审查",
    content: `你是一位资深的 TypeScript 工程师。请帮我审查以下代码，关注：

1. **类型安全**：是否有 any 类型滥用、类型守卫是否完善
2. **代码规范**：是否符合 TypeScript 最佳实践
3. **潜在 Bug**：边界条件、空值处理、异步错误
4. **性能优化**：是否有不必要的重复计算或内存泄漏
5. **可维护性**：命名是否清晰、函数是否过于复杂

代码如下：
\`\`\`typescript
{{code}}
\`\`\``,
    description: "对 TypeScript 代码进行全面审查，检查类型安全和最佳实践",
    language: ["TypeScript"],
    role: ["前端", "全栈"],
    stage: ["代码审查"],
    tags: ["typescript", "code-review", "最佳实践"],
  },
  {
    title: "Python 后端 API 开发",
    content: `请帮我使用 Python 开发一个 RESTful API 后端服务：

**技术栈要求：**
- 框架：FastAPI 或 Flask
- 数据库：{{database}}
- ORM：SQLAlchemy
- 认证：JWT Token

**功能需求：**
{{requirements}}

**要求：**
1. 提供完整的项目结构
2. 包含 CRUD 接口设计
3. 添加数据验证和错误处理
4. 包含单元测试示例
5. 提供 Docker 部署配置`,
    description: "基于 FastAPI/Flask 开发 Python RESTful 后端 API",
    language: ["Python"],
    role: ["后端"],
    stage: ["编码"],
    tags: ["python", "api", "fastapi", "restful"],
  },
  {
    title: "React 组件开发",
    content: `请帮我开发一个 React 组件：

**组件需求：**
{{component_requirements}}

**技术要求：**
- React {{react_version}} + TypeScript
- 使用函数式组件 + Hooks
- 样式方案：{{style_solution}}
- 需要处理的状态：{{states}}

**要求：**
1. 组件 Props 接口定义清晰
2. 包含必要的注释和 JSDoc
3. 处理好加载状态和错误状态
4. 符合无障碍访问标准（a11y）
5. 提供使用示例`,
    description: "快速生成高质量的 React TypeScript 组件",
    language: ["TypeScript", "JavaScript"],
    role: ["前端"],
    stage: ["编码"],
    tags: ["react", "组件", "hooks", "typescript"],
  },
  {
    title: "数据库设计",
    content: `请帮我设计一个数据库架构：

**业务背景：**
{{business_description}}

**系统规模：**
- 预计用户量：{{user_scale}}
- 日活：{{daily_active_users}}
- 数据增量：{{data_growth}}

**技术选型：**
- 数据库类型：{{database_type}}
- 是否需要缓存：{{need_cache}}

**要求：**
1. 绘制 ER 图（文字描述）
2. 给出表结构定义（DDL）
3. 设计合理的索引
4. 考虑数据分表策略
5. 提供性能优化建议`,
    description: "根据业务需求设计合理的数据库架构",
    language: ["SQL"],
    role: ["后端", "全栈"],
    stage: ["架构设计", "技术选型"],
    tags: ["数据库", "架构", "ER图", "DDL"],
  },
  {
    title: "需求分析文档生成",
    content: `请帮我分析以下需求，并生成详细的需求文档：

**原始需求：**
{{raw_requirements}}

**项目背景：**
{{project_background}}

**输出要求：**
1. **业务需求概述**：用简洁的语言描述核心功能
2. **用户故事**：按照 MVP 优先级列出用户故事（使用 User Story Mapping 格式）
3. **功能清单**：区分核心功能、扩展功能、未来功能
4. **非功能需求**：性能、安全、可用性、可维护性
5. **约束条件**：技术限制、时间限制、资源限制
6. **风险评估**：识别潜在风险和缓解措施
7. **验收标准**：每条需求可量化、可测试的验收条件`,
    description: "将模糊的需求转化为结构化的需求文档",
    language: ["TypeScript", "Python"],
    role: ["前端", "后端", "全栈"],
    stage: ["需求分析"],
    tags: ["需求分析", "PRD", "用户故事"],
  },
  {
    title: "Git Commit 规范检查",
    content: `请检查以下 Git Commit 信息是否符合规范：

Commit 信息：
\`\`\`
{{commit_message}}
\`\`\`

如果不符合，请按照以下规范重写：

**提交类型：**
- feat：新功能
- fix：Bug 修复
- docs：文档更新
- style：代码格式（不影响功能）
- refactor：重构（不是新功能或修复）
- test：测试相关
- chore：构建/工具相关

**格式：**
\`[type]: subject

body (可选)

footer (可选)\`

**要求：**
1. Subject 不超过 50 字符
2. 使用动词开头，首字母小写
3. 不要在结尾加句号`,
    description: "检查并规范化 Git Commit 信息",
    language: ["TypeScript", "JavaScript", "Python", "Shell"],
    role: ["前端", "后端", "全栈", "DevOps"],
    stage: ["代码审查"],
    tags: ["git", "commit", "规范"],
  },
  {
    title: "系统架构设计",
    content: `请帮我设计一个系统的架构方案：

**系统概述：**
{{system_overview}}

**核心功能：**
{{core_features}}

**性能指标要求：**
- QPS：{{qps}}
- 延迟：{{latency}}
- 可用性：{{availability}}

**技术偏好：**
- 语言：{{languages}}
- 基础设施：{{infrastructure}}

**要求：**
1. 给出系统架构图（文字描述架构组件和关系）
2. 推荐技术栈和中间件
3. 设计高可用和容灾方案
4. 说明核心模块的职责划分
5. 给出数据流向和存储策略
6. 列出关键技术难点和解决方案`,
    description: "设计系统的整体架构方案",
    language: ["TypeScript", "Python", "Go"],
    role: ["后端", "全栈"],
    stage: ["架构设计", "技术选型"],
    tags: ["架构", "系统设计", "高可用"],
  },
  {
    title: "部署脚本生成",
    content: `请帮我生成项目的部署脚本：

**项目信息：**
- 项目类型：{{project_type}}
- 技术栈：{{tech_stack}}
- 部署环境：{{deployment_env}}
- 域名：{{domain}}

**要求：**
1. 提供 Docker 配置（Dockerfile + docker-compose.yml）
2. 提供 Nginx 反向代理配置
3. 提供 CI/CD 配置（GitHub Actions 或 GitLab CI）
4. 配置 HTTPS（Let's Encrypt）
5. 提供健康检查配置
6. 配置日志收集
7. 给出回滚方案`,
    description: "生成完整的项目部署脚本和 CI/CD 配置",
    language: ["Shell", "TypeScript"],
    role: ["前端", "后端", "全栈", "DevOps"],
    stage: ["部署"],
    tags: ["docker", "ci-cd", "nginx", "部署"],
  },
  {
    title: "单元测试编写",
    content: `请帮我为以下代码编写单元测试：

**被测代码：**
\`\`\`{{language}}
{{code}}
\`\`\`

**测试要求：**
- 测试框架：{{test_framework}}
- 覆盖率目标：{{coverage_target}}%

**要求：**
1. 使用 AAA（Arrange-Act-Assert）模式
2. 覆盖所有函数分支
3. 测试边界条件
4. Mock 外部依赖
5. 提供有意义的测试描述
6. 包含性能和压力测试用例`,
    description: "为代码编写高质量的单元测试",
    language: ["TypeScript", "Python", "JavaScript"],
    role: ["前端", "后端", "全栈"],
    stage: ["测试"],
    tags: ["测试", "unit-test", "jest", "pytest"],
  },
  {
    title: "性能分析与优化",
    content: `请帮我分析和优化系统性能：

**场景描述：**
{{scenario}}

**当前指标：**
- 响应时间：{{response_time}}
- 吞吐量：{{throughput}}
- 资源使用：{{resource_usage}}

**瓶颈分析：**
请从以下几个角度分析：
1. 数据库层面（慢查询、索引缺失、N+1 问题）
2. 缓存层面（缓存命中率、缓存穿透/雪崩）
3. 代码层面（同步阻塞、循环耗时、内存泄漏）
4. 网络层面（请求合并、压缩、CDN）
5. 架构层面（单点瓶颈、扩展性）

**请给出：**
1. 性能瓶颈排序（按影响程度）
2. 每个瓶颈的优化方案
3. 优化后的预期收益
4. 实施优先级建议`,
    description: "分析系统性能瓶颈并给出优化方案",
    language: ["TypeScript", "Python", "SQL"],
    role: ["后端", "全栈"],
    stage: ["运维监控"],
    tags: ["性能", "优化", " profiling", "数据库优化"],
  },
];

const seedProjectTemplates = [
  {
    name: "全栈 Web 开发标准流程",
    description: "适用于大多数 Web 项目的完整开发流程，从需求分析到部署上线",
  },
  {
    name: "前端项目开发流程",
    description: "专注于前端项目的开发流程，从技术调研到 CI/CD 部署",
  },
  {
    name: "后端 API 服务开发",
    description: "后端微服务或 API 服务的标准开发流程",
  },
];

const defaultStages = [
  { name: "需求分析", order: 0 },
  { name: "架构设计", order: 1 },
  { name: "技术选型", order: 2 },
  { name: "编码", order: 3 },
  { name: "代码审查", order: 4 },
  { name: "测试", order: 5 },
  { name: "部署", order: 6 },
  { name: "运维监控", order: 7 },
];

async function main() {
  console.log("Start seeding...");

  const password = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@prompthub.local" },
    update: {},
    create: {
      username: "admin",
      email: "admin@prompthub.local",
      password,
      role: "ADMIN",
    },
  });
  console.log(`Created user: ${user.username}`);

  for (const prompt of seedPrompts) {
    await prisma.prompt.create({
      data: {
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        language: JSON.stringify(prompt.language),
        role: JSON.stringify(prompt.role),
        stage: JSON.stringify(prompt.stage),
        tags: JSON.stringify(prompt.tags),
        isFavorite: false,
        versions: "[]",
        visibility: "PRIVATE",
        userId: user.id,
      },
    });
    console.log(`Created prompt: ${prompt.title}`);
  }

  for (const template of seedProjectTemplates) {
    const project = await prisma.projectTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        stages: "[]",
        visibility: "PRIVATE",
        userId: user.id,
      },
    });

    for (const stage of defaultStages) {
      await prisma.projectStage.create({
        data: {
          projectTemplateId: project.id,
          name: stage.name,
          order: stage.order,
          promptIds: "[]",
        },
      });
    }
    console.log(`Created project template: ${template.name}`);
  }

  await prisma.workspace.create({
    data: {
      name: "代码审查工作集",
      description: "包含代码审查、Git 规范检查、性能分析等提示词",
      visibility: "PRIVATE",
      userId: user.id,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
