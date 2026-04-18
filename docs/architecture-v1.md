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
- 数据：本地 `JSON`
- 进度：`localStorage`
- 语音：浏览器 `speechSynthesis` + `SpeechRecognition/webkitSpeechRecognition`

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
- 今日课程配置

原则：
- 内容数据与页面展示解耦
- 字母展示必须以俄文字母为主，不用拉丁字母代替
- 俄语文本字段必须只存标准西里尔字母
- 转写与中文说明字段必须分离

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
  docs/
    requirements-v1.md
    architecture-v1.md
    evaluation-rubric-v1.md
    iteration-review-current.md
  demo/
    index.html
    assets/
      styles.css
      app.js
    data/
      curriculum.json
```

## 5. 数据结构建议

### 5.1 字母数据
- `uppercase`
- `lowercase`
- `nameZh`
- `translit`
- `note`
- `example.word`

### 5.2 场景数据
- `title`
- `tag`
- `words`
- `phrase`

字段规则：
- `word` / `phrase.ru` / `example.word` 只存俄文
- `translit` 只存拉丁转写
- `zh` / `nameZh` / `note` 只存中文说明

### 5.3 今日课程数据
- `title`
- `summary`
- `reviewCount`
- `tasks`

## 6. 手机侧要求
- 窄屏优先
- 单舞台单步骤
- 按钮大、路径短
- 音频播放必须由用户触发

## 7. 当前已知限制
- 语音播放质量受浏览器内置语音影响
- 语音评分仍是基础文本近似比较
- 当前没有离线缓存和 PWA 能力

## 8. 下一阶段技术重点
1. 更高质量的俄语音频样本方案
2. 更细颗粒度的单题卡流
3. PWA 和离线缓存准备
