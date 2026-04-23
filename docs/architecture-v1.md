# 俄语学习工具技术架构设计 v1

## 文档信息
- 版本：`v1.0`
- 日期：`2026-04-18`
- 对应需求：`requirements-v1.md`

## 1. 架构目标
- 第一阶段以纯静态前端快速落地
- 支撑字母、场景、语音三类学习模块
- 支撑手机浏览器单题推进体验
- 为未来更高质量语音能力预留演进空间

## 2. 当前技术方案
- 前端：`HTML + CSS + JavaScript`
- 数据：本地 `JavaScript` 课程模块
- 进度：`localStorage`
- 语音：浏览器 `speechSynthesis` + `SpeechRecognition/webkitSpeechRecognition`
- PWA：`manifest.webmanifest` + `service-worker.js`
- 部署：`GitHub Pages`

## 3. 系统分层

### 3.1 页面层
负责：
- 单题推进界面
- 页面切换与路径展示
- 手机端响应式布局

### 3.2 内容数据层
负责：
- 字母数据
- 场景词汇与句型数据
- 全年课程配置

原则：
- 内容数据与页面展示解耦
- 字母展示必须以俄文字母为主，不用拉丁字母代替
- 俄语文本字段必须只存标准西里尔字母
- 转写与中文说明字段必须分离
- 课程应支持 `24` 个 `12` 天周期的长期扩展

### 3.3 学习流程层
负责：
- 当前步骤切换
- 课程完成状态
- 今日任务进度

### 3.4 语音能力层
负责：
- 字母、单词、句子播放
- 跟读识别
- 基础评分与按词反馈

后续可替换为：
- 更高质量俄语音频样本
- 更强的语音识别或纠音服务

## 4. 当前目录结构

```text
russian-study-tool/
  .github/
    workflows/
      static.yml
  docs/
    requirements-v1.md
    architecture-v1.md
    evaluation-rubric-v1.md
    iteration-review-current.md
    yearly-curriculum-framework-v1.md
    github-pages-deployment-v1.md
  demo/
    .nojekyll
    _headers
    index.html
    manifest.webmanifest
    service-worker.js
    assets/
      styles.css
      app.js
      curriculum-year.js
      icon.svg
      icons/
        apple-touch-icon-180.png
        icon-192.png
        icon-512.png
        icon-maskable-512.png
```

## 5. 当前数据结构

### 5.1 每日课程对象
- `day`
- `cycleNumber`
- `cycleDay`
- `cycleLabel`
- `title`
- `stepNotes`
- `foundation`
- `scene`
- `voice`
- `review`
- `cycleSections`（仅第 `12` 天复盘使用）

### 5.2 foundation 项
- `ru`
- `ipa`
- `zh`
- `exampleRu`
- `exampleIpa`
- `exampleZh`

### 5.3 scene / voice 项
- `ru`
- `ipa`
- `zh`

字段规则：
- `ru` / `exampleRu` 只存标准俄文
- `ipa` 当前实际承担“简化发音标注”角色
- `zh` / `exampleZh` 只存中文说明

## 6. 手机侧要求
- 窄屏优先
- 单舞台单步骤
- 按钮大、路径短
- 音频播放必须由用户触发
- 适配 iPhone 顶部刘海与底部安全区
- 支持 Safari “添加到主屏幕”

## 7. 当前已知限制
- 语音播放质量受浏览器内置语音影响
- 语音评分仍是基础文本近似比较
- 当前离线缓存仍是基础版
- 语音反馈仍不等同于专业纠音
- GitHub Pages 仅提供静态站点，不包含账号同步和云端存档

## 8. 下一阶段技术重点
1. 建立 `Exercise Engine`，支持匹配、拼句、听音排序和即时反馈
2. 将 `part1 / part2 / part3` 从内容展示逐步迁移为题型练习
3. 更高质量的俄语音频样本方案
4. 离线缓存增强与更新策略
5. 可选的云端进度同步能力

详细方案见：
- `docs/duolingo-adaptation-plan-v1.md`
