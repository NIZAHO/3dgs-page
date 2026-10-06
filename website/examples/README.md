# 手动添加 3DGS 网页示例

主页 `#explore` 已内置真实的 SuperSplat 3D 查看器。默认使用标准 Gaussian **PLY**；也可读取单文件 SOG。例子由你手动维护，不会从私有训练仓库自动抓取模型。

## 方式一：先在本机预览

点击网页的 **Open local PLY**，选择训练导出的 `scene.ply`。文件只在当前浏览器内存中解析，不上传服务器，不会出现在其他访客的示例列表里。点击 **Unload** 释放当前渲染上下文；切换示例也会卸载旧场景。

必须是带 `scale_0..2`、`rot_0..3`、`opacity`、`f_dc_0..2` 等属性的 Gaussian PLY，而不是只有 XYZ/RGB 的普通点云。项目原生输出为 binary little-endian PLY。建议将主层和环境层合并为一个 `scene.ply` 后展示。

## 方式二：发布到示例列表

在本仓库添加：

```text
website/examples/room/scene.ply
```

编辑 `website/examples/scenes.json`：

```json
{
  "version": 1,
  "scenes": [
    {
      "id": "room",
      "name": "Room walkthrough",
      "url": "./examples/room/scene.ply",
      "description": "My first reconstructed scene."
    }
  ]
}
```

这里的相对 URL 以**项目网页根目录**为基准，不是相对于 JSON 文件。向 `main` 提交后自动部署。访客选择示例并点击 **Load example** 后才下载模型，不会在首屏自动加载大型文件。

`id` 不可重复，只使用字母、数字、连字符或下划线。需要临时隐藏示例时添加 `"enabled": false`；删除列表条目不会删除模型文件。

## 较大的模型

大型 PLY 不建议直接放进 Git。可将其放到你授权公开的 HTTPS 对象存储，把 `url` 改为模型直链。外部主机需要允许本网站读取文件（CORS），不能使用需要登录、临时 Cookie 或会过期的签名地址。不要填写 GitHub 的 `blob/main/...` 预览页面地址。

网站也提供 **Open a model link** 临时预览直链；这不会自动修改场景清单。压缩后的下载大小并不等于浏览器实际内存占用。较大的模型在手机上可能受 GPU/内存限制。

## 可选：指定初始相机

条目可以增加 `"settings": "./examples/room/settings.json"`，读取 SuperSplat 的设置文件。直接使用 Stage 10 随模型导出的设置时，必须确认模型与相机使用相同坐标变换。不要把旋转后的 SOG 相机未经检查直接套到原生 PLY。

不提供 settings 时使用自动取景、60° FOV、深色背景；可在查看器中旋转、平移、缩放和复位。鼠标操作只在查看器中生效，键盘操作需要先点击场景。实际颜色不应用训练 checkpoint 中逐图 appearance/distortion。

## 发布与隐私

只有提交到此公开仓库或外部公开存储的模型才会公开。Open local PLY 是本机预览，不是上传功能。不要提交原始采集数据、checkpoint、访问令牌或未获准公开的场景。

运行时为随站点部署的 `@playcanvas/supersplat-viewer` 1.37.0，构建时复制官方 bundle 与 MIT LICENSE，不依赖远程 iframe 服务或运行时 CDN。首页文字/图示可独立阅读，查看器按需加载。
