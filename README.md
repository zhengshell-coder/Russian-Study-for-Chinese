# Russian Study Tool

个人自用俄语学习工具项目。

## 目录
- `demo/`：当前可运行的 PWA 学习页面
- `docs/requirements-v1.md`：需求文档
- `docs/architecture-v1.md`：技术架构
- `docs/yearly-curriculum-framework-v1.md`：全年学习框架
- `docs/evaluation-rubric-v1.md`：评估标准
- `docs/change-record-2026-04-18-russian-rules.md`：俄语内容修正记录

## 当前形态
- 静态 HTML/CSS/JS
- 已支持 PWA 基础能力
- 已适配 iPhone 主屏幕 Web App 方向
- 已内置全年 `24` 个 `12` 天周期，共 `288` 个学习日
- 已部署到 GitHub Pages
- 手机端当前采用单屏优先布局
- `part1 / part2 / 复习检查` 已改成单卡片切换，减少长列表下滑

## GitHub Pages 发布
项目已经准备好通过 GitHub Pages 发布：
- 当前仓库：`https://github.com/zhengshell-coder/Russian-Study-for-Chinese`
- 当前站点：`https://zhengshell-coder.github.io/Russian-Study-for-Chinese/`
- 工作流文件：`.github/workflows/static.yml`
- 发布目录：`demo/`
- Pages 会直接部署 `demo` 里的静态文件

详细部署说明见：
- `docs/github-pages-deployment-v1.md`

### 推荐发布步骤
1. 创建一个新的 GitHub 仓库，例如 `russian-study-tool`
2. 把本项目推送到该仓库的 `main` 分支
3. 在 GitHub 仓库里打开 `Settings -> Pages`
4. 确认 `Build and deployment` 使用 `GitHub Actions`
5. 等待 `Deploy static content to Pages` 工作流完成
6. 打开生成的网址

项目站点默认会是：
- `https://<owner>.github.io/<repository>/`

如果你使用用户站点仓库：
- 仓库名为 `<owner>.github.io`
- 站点会是 `https://<owner>.github.io/`

## iPhone 使用方式
部署到 HTTPS 地址后，在 iPhone 上：
1. 用 Safari 打开站点
2. 点击分享
3. 选择“添加到主屏幕”
4. 之后就可以像普通 App 一样直接点开学习
