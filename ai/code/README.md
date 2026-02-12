# 

# Rules vs Spec vs Skills


* **Rules** 管  **“怎么写代码”** （风格、规范、禁忌）
* **[Specs](https://zhida.zhihu.com/search?content_id=267842293&content_type=Article&match_order=1&q=Specs&zhida_source=entity)** 管  **“要做什么”** （需求、功能定义、数据库设计）
* **[Skills](https://zhida.zhihu.com/search?content_id=267842293&content_type=Article&match_order=1&q=Skills&zhida_source=entity)** 管  **“怎么做特定任务”** （复杂流程、工具链整合）

## Rules

相当于定义编码规范，比如：

1. 代码命名规范
2. 不能使用哪些包，比如Java的hutool

# Skill编写技巧

## 写 Skill 的好处

1. 复用性强 - 写一次，可以反复使用，甚至分享给团队
2. 上下文高效 - Skill 采用渐进式加载，只读取需要的内容
3. 可维护 - 集中管理专业知识，便于迭代更新

## 基本结构

```shell
skill-name/
├── SKILL.md          # 核心！必选，技能的主文档
├── scripts/          # 可选，可执行代码（Python/Bash等）
├── references/       # 可选，参考资料（API文档等）
├── assets/           # 可选，模板资源
└── LICENSE.txt       # 可选，许可证
```

## SKILL.md

分三个部分

```markdown
---
name: skill-name # 必填！必须与目录名一致
description: 简短描述 # 必填！用第三人称
invocable: user # 可选，是否允许用户直接调用
license: 完整条款见 LICENSE.txt # 可选
---

# 标题

## 使用场景

- 场景 1
- 场景 2

## 功能介绍

...

## 工作流程

...

## 示例

...
```

## 原则

### 描述要精准

1. 描述字段必须用第三人称

比如：

错误写法：

```yaml
description: 使用这个技能来翻译文章...
```

正确写法

```yaml
description: 翻译英文文章为简体中文 Markdown 格式...
```

### 指令要明确并且简洁

错误

```yaml
你应该首先读取文件，然后分析内容...
```

正确：把应该这种语气词去掉，直接用命令的方式

```yaml
1. 读取文件
2. 分析内容
```

### 控制字数

SKILL.md 控制5000 字以内，

超过则：

• 把详细内容移到 `references/` 目录

• 把代码移到 `scripts/` 目录

• SKILL.md 只保留核心流程

### 提供完整示例

• 展示完整工作流程

• 包含输入和输出

• 覆盖常见场景

## 模板

### 超简洁型

```yaml
---
name: simple-rule
description: 简短描述
---

# 技能标题

执行任务时，遵循以下规则：

1. 规则一
2. 规则二
3. 规则三

## 注意事项

- 注意点 A
- 注意点 B
```

### 流程型

```yaml
---
name: workflow-skill
description: 描述这个工作流程...
---

# 技能标题

## 使用场景

- 场景一：[具体描述]
- 场景二：[具体描述]

## 核心功能

1. **功能一**：[说明]
2. **功能二**：[说明]
3. **功能三**：[说明]

## 执行流程

### 阶段 1：准备

1. [具体步骤]
2. [具体步骤]

### 阶段 2：执行

1. [具体步骤]
2. [具体步骤]

### 阶段 3：验证

1. [具体步骤]
2. [具体步骤]

## 示例

### 示例 1：[场景名称]

**用户请求：**
```

# Openspec

## 什么是OpenSpec？

让人类和AI在开始工作前对规范达成一致(反复交流)

OpenSpec帮助人和AI编码助手在编写任何代码之前就构建什么达成一致。

## 工作流程

工作流程遵循一个简单的模式：

```
┌────────────────────┐
│ 开始一个变更    	  │  		/opsx:new
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Create Artifacts   │  /opsx:ff or /opsx:continue
│ (proposal, specs,  │
│  design, tasks)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Implement Tasks    │  /opsx:apply
│ (AI writes code)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Archive & Merge    │  /opsx:archive
│ Specs              │
└────────────────────┘
```

每个步骤都可以重复的进行

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            update as you learn
```

## 初始化

在项目文件执行初始化，选择对应的AI工具

```shell
openspec init
```

比如这里选择opencode，在对应的命令，和skill下，能看到对应openspec操作的命令

![image-20260212195803884](README/image-20260212195803884.png)

在打开opencode后，就能看到对应的命令了

![image-20260212195911611](README/image-20260212195911611.png)

## 命令详情

| Command              | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `/opsx:explore`      | 如果我们不知道该做什么时候，可以先使用一个命令，AI会提示我们下面做什么 |
| `/opsx:new`          | 开始一个变更                                                 |
| `/opsx:continue`     | 创建计划（一个个的创建）                                     |
| `/opsx:ff`           | 一次性创建所有的计划                                         |
| `/opsx:apply`        | 实现任务                                                     |
| `/opsx:verify`       | Validate implementation matches artifacts                    |
| `/opsx:sync`         | Merge delta specs into main specs                            |
| `/opsx:archive`      | 归档                                                         |
| `/opsx:bulk-archive` | Archive multiple changes at once                             |
| `/opsx:onboard`      | Guided tutorial through the complete workflow                |