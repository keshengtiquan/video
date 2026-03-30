# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

基于 React Native 0.81.5 和 Expo SDK 54 的视频播放应用。使用 expo-router 实现基于文件的路由，expo-video 实现视频播放。集成了 13 个第三方视频源 API 用于内容发现和播放。

## 常用命令

```bash
npm start          # 启动 Expo 开发服务器
npm run android    # 运行 Android 版
npm run ios        # 运行 iOS 版
npm run web        # 运行 Web 版
npm run lint       # 运行 ESLint
npm run reset-project  # 重置为 Expo 初始模板
```

## 架构

### 路由 (expo-router)
- `app/(tabs)/` — 底部标签导航，包含 4 个标签页：电影、电视剧、历史、设置
- `app/search.tsx` — 全局搜索页面
- `app/search-result.tsx` — 搜索结果页面
- `app/play.tsx` — 视频播放器，支持切换片源和剧集

### 状态管理
- `context/PlaySourceContext.tsx` — 管理已选视频源，使用 AsyncStorage 持久化
- `hooks/useMovieList.ts` — 从豆瓣获取影视列表，支持分页和缓存
- 自定义 Hook 将数据获取逻辑从组件中抽象出来

### 核心服务
- `services/douban.ts` — 豆瓣 API 客户端，用于影视发现
- `services/search.ts` — 并行搜索所有 13 个视频源

### 数据流
1. 用户选择分类标签 → `useMovieList` 从豆瓣 API 获取数据
2. 用户搜索 → `services/search.ts` 并行查询所有 13 个视频源
3. 用户选择结果 → 携带视频 URL 跳转到 `play.tsx`
4. 视频通过 `expo-video` VideoView 组件播放

### 视频源
`PlaySourceContext` 中配置了 13 个视频源：豆瓣 (dbzy.tv)、如意 (rycjapi.com)、暴风 (bfzyapi.com)、天涯 (tyyszy.com)、小猫咪 (xmm.hk)、360 (360zy.com)、卧龙 (wolongzyw.com)、极速 (jszyapi.com)、魔抓 (mdzyapi.com)、最大 (zuidapi.com)、百度云 (apibdzy.com)、无尽 (wujinapi.me)、量子 (lziapi.com)

### 组件
- `components/movie/MovieCard.tsx` — 影视海报卡片，带评分显示
- `components/movie/MovieList.tsx` — 分页网格，支持下拉刷新和加载更多
- `components/SearchBar.tsx` — 搜索输入框，支持搜索历史持久化

## 技术栈

- **框架**: React Native 0.81.5, Expo SDK 54, React 19.1
- **路由**: expo-router 6 (基于文件)
- **导航**: React Navigation 7 (底部标签)
- **视频**: expo-video 3.0
- **UI**: @expo/vector-icons, expo-image, react-native-safe-area-context
- **持久化**: @react-native-async-storage/async-storage
- **语言**: TypeScript 5.9 (严格模式)
