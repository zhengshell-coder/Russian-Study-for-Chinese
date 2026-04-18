# GitHub Pages 部署说明 v1

## 文档信息
- 版本：`v1.0`
- 日期：`2026-04-18`
- 适用对象：当前 `Russian-Study-for-Chinese` 仓库

## 1. 当前仓库与站点
- 仓库地址：
  - `https://github.com/zhengshell-coder/Russian-Study-for-Chinese`
- 站点地址：
  - `https://zhengshell-coder.github.io/Russian-Study-for-Chinese/`

## 2. 当前发布方式
- 发布平台：`GitHub Pages`
- 发布来源：`GitHub Actions`
- 当前工作流文件：
  - `.github/workflows/static.yml`
- 当前发布目录：
  - `demo/`

## 3. 当前实现说明
- `demo/` 目录是实际发布的静态 PWA
- GitHub Pages 只发布 `demo/`，不发布仓库根目录
- 当前已启用：
  - `manifest.webmanifest`
  - `service-worker.js`
  - `apple-touch-icon`
  - iPhone 主屏幕 Web App 所需 meta 配置

## 4. 重要注意事项
- 如果工作流把仓库根目录 `.` 发布到 Pages，站点会因为缺少根目录首页入口而出现 `404`
- 当前已经修正为只发布 `./demo`
- 后续如果再修改 Pages 工作流，必须确认上传路径仍然是 `./demo`

## 5. iPhone 使用方式
1. 在 iPhone Safari 打开站点
2. 点击分享
3. 选择“添加到主屏幕”
4. 以后可像 App 一样直接从主屏幕打开

## 6. 后续维护规则
- 每次修改 `demo/` 后，都通过 `main` 分支触发自动发布
- 每次修改工作流后，都检查：
  - Actions 是否绿色成功
  - Pages 地址是否可打开
  - iPhone Safari 是否仍可正常安装到主屏幕

## 7. 参考官方文档
- GitHub Pages 介绍：
  - `https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages`
- 创建和配置 GitHub Pages：
  - `https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site`
- 配置发布源：
  - `https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site`
