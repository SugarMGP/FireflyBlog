---
title: "使用 Zap 实现高性能日志记录"
published: 2024-10-24T22:27:17+08:00
draft: false
image: ./cover.webp
category: "编程笔记"
tags:
  - "Zap"
  - "Golang"
  - "日志"
  - "后端开发"
---

## 前言

**Zap** 是一款由 uber-go 开发的开源日志库，它支持多种日志级别和结构化，并对性能和内存分配做了极致的优化。

试用期大作业的后端中我们使用了 Zap 来进行日志记录，今日探索日志滚动时顺带回顾了一下 Zap 的基本用法，于是决定水一篇博客（逃

项目地址：https://github.com/uber-go/zap

## 快速使用

```bash
go get -u go.uber.org/zap
```

Zap 库的使用与其他的日志库非常相似，我们需要先创建一个日志记录器，然后调用相应的方法来记录不同级别的日志。

Zap 提供了两种日志记录器：`Sugared Logger` 和 `Logger`.

- `Sugared Logger` 并重性能与易用性，支持**结构化和 printf 风格**的日志记录。

- `Logger` 非常强调性能，不提供 printf 风格的 api，**只支持强类型的、结构化的**日志记录。

举例如下：

```go
func main() {
    // Sugared Logger
    sugar := zap.NewExample().Sugar()
    sugar.Infof("hello! name:%s,age:%d", "xiaomin", 20) // printf 风格

    // Logger
    logger := zap.NewExample()
    logger.Info("hello!", zap.String("name", "xiaomin"), zap.Int("age", 20)) // 结构化
}
```

输出结果：

```json
// output
{"level":"info","msg":"hello! name:xiaomin,age:20"}
{"level":"info","msg":"hello!","name":"xiaomin","age":20}
```

要创建一个 Logger，Zap 提供了三个默认配置：`Example`，`Development`，`Production`，分别对应测试环境、开发环境和生产环境。

```go
func main() {
   // Example
   logger := zap.NewExample()
   logger.Info("Example")

   // Development
   logger, _ = zap.NewDevelopment()
   logger.Info("Development")

   // Production
   logger, _ = zap.NewProduction()
   logger.Info("Production")
}
```

相应的输出如下：

```json
// Example
{"level":"info","msg":"Example"}

// Development
2024-10-24T22:52:16.544+0800    INFO    ConfessionWallServer/main.go:14 Development

// Production
{"level":"info","ts":1729781536.5583117,"caller":"ConfessionWallServer/main.go:18","msg":"Production"}
```

可以看到，日志等级，日志输出格式，默认字段都有所差异。

## 定制 Logger

Zap 提供了丰富的配置选项。

### 使用自定义配置

我们可以通过自己创建 Config 来配置 Logger 的行为。

```go
func main() {
    // 定制 Config
    config := zap.Config{
        Level:       zap.NewAtomicLevelAt(zap.InfoLevel), // 最低日志等级
        Encoding:    "json", // 日志输出格式
        EncoderConfig: zap.EncoderConfig{
            TimeKey:        "time", // 时间字段名
            LevelKey:       "level", // 日志等级字段名
            NameKey:        "logger", // 日志名字段名
            CallerKey:      "caller", // 调用者字段名
            MessageKey:     "msg", // 消息字段名
            StacktraceKey:  "stacktrace", // 堆栈字段名
            LineEnding:     zapcore.DefaultLineEnding,
            EncodeLevel:    zapcore.LowercaseLevelEncoder,
            EncodeTime:     zapcore.ISO8601TimeEncoder,
            EncodeDuration: zapcore.SecondsDurationEncoder,
            EncodeCaller:   zapcore.ShortCallerEncoder,
        },
        OutputPaths:      []string{"stdout"}, // 日志输出路径
        ErrorOutputPaths: []string{"stderr"}, // 错误日志输出路径
    }

    // 通过 Config 构建 Logger
    logger, _ := config.Build()

    // 在程序结束时同步缓冲区
    defer logger.Sync()

    // 记录日志
    logger.Info("hello!", zap.String("name", "xiaomin"), zap.Int("age", 20))
}
```

### 记录调用信息

Zap 提供了 `AddCaller()` 方法，可以记录调用者的信息，包括文件名、函数名、行号。
前提是必须设置 `CallerKey` 字段，因此 NewExample() 不能输出调用者信息。

```go
func main() {
  logger, _ := zap.NewProduction(zap.AddCaller())
  defer logger.Sync()

  logger.Info("hello world")
}
```

输出结果：

```json
{"level":"info","ts":1587740198.9508286,"caller":"caller/main.go:9","msg":"hello world"}
```

有时我们稍微封装了一下记录日志的方法，但是我们希望输出的文件名和行号是调用封装函数的位置，这时可以使用 `zap.AddCallerSkip(skip int)` 向上跳过：

```go
func Output(msg string, fields ...zap.Field) {
  zap.L().Info(msg, fields...)
}

func main() {
  logger, _ := zap.NewProduction(zap.AddCaller(), zap.AddCallerSkip(1))
  defer logger.Sync()

  zap.ReplaceGlobals(logger)
  Output("hello world")
}
```

输出结果：

```json
{"level":"info","ts":1587740501.5592482,"caller":"skip/main.go:15","msg":"hello world"}
```

### 记录堆栈信息

Zap 提供了 `AddStacktrace()` 方法，可以记录堆栈信息。
前提是必须设置 `StacktraceKey` 字段，因此 NewExample() 不能输出堆栈信息。

```go
func f1() {
  f2("hello world")
}

func f2(msg string, fields ...zap.Field) {
  zap.L().Warn(msg, fields...)
}

func main() {
  logger, _ := zap.NewProduction(zap.AddStacktrace(zapcore.WarnLevel))
  defer logger.Sync()

  zap.ReplaceGlobals(logger)

  f1()
}
```

将 `zapcore.WarnLevel` 传入 `AddStacktrace()`，之后 Warn 和 Error 级别的日志会输出堆栈，Debug 和 Info 则不会。

运行结果：

```json
{"level":"warn","ts":1729783529.2137501,"caller":"ConfessionWallServer/main.go:13","msg":"hello world","stacktrace":"main.f2\n\tD:/07_Github/ConfessionWallServer/main.go:13\nmain.f1\n\tD:/07_Github/ConfessionWallServer/main.go:9\nmain.main\n\tD:/07_Github/ConfessionWallServer/main.go:22\nruntime.main\n\tC:/Program Files/Go/src/runtime/proc.go:272"}
```

将 `stacktrace` 单独拉出来看：

```log
main.f2
D:/07_Github/ConfessionWallServer/main.go:13
    main.f1
    D:/07_Github/ConfessionWallServer/main.go:9
        main.main
        D:/07_Github/ConfessionWallServer/main.go:22
            runtime.main
            C:/Program Files/Go/src/runtime/proc.go:272
```

我们很清楚地看到调用路径。

### 预设日志字段

有些时候我们需要在每条日志中添加一些预设字段，可以通过 `zap.Fields(fs ...Field)` 来实现。

```go
func main() {
  logger := zap.NewExample(zap.Fields(
    zap.Int("serverId", 114514),
    zap.String("serverName", "ConfessionWallServer"),
  ))

  logger.Info("hello world")
}
```

输出：

```json
{"level":"info","msg":"hello world","serverId":114514,"serverName":"ConfessionWallServer"}
```

## 设置全局 Logger

为了方便使用，Zap 提供了 `ReplaceGlobals(logger *Logger)`，可以将一个 Logger 设置为全局的 Logger。
`zap.L()` 获取全局 Logger，`zap.S()` 获取全局 Sugared Logger。

```go
func main() {
  logger := zap.NewExample()
  defer logger.Sync()

  zap.ReplaceGlobals(logger)
  zap.L().Info("Global Logger")
  zap.S().Infof("Global %s", "Sugared Logger")
}
```

输出：

```json
{"level":"info","msg":"Global Logger"}
{"level":"info","msg":"Global Sugared Logger"}
```

注意：若没有设置全局 Logger，则调用 `zap.L()` 和 `zap.S()` 并不会有日志输出。

## 实现日志滚动

**lumberjack** 是一个高效且易用的日志滚动包，它允许开发人员将日志写入自动滚动的文件中，从而使日志管理更加简单。

```bash
go get -u github.com/natefinch/lumberjack
```

lumberjack 提供了一个滚动记录器 logger，它实现了 `io.Writer` 和 `io.Closer` 接口，我们可以使用 `zapcore.AddSync` 来将其与 Zap 结合使用。

```go
func main() {
    lumberJackLogger := &lumberjack.Logger{
        Filename:   filename,  // 文件路径
        MaxSize:    maxsize,   // 单个日志文件的最大大小（单位为MB）
        MaxAge:     maxAge,    // 保留旧文件的最大天数
        MaxBackups: maxBackup, // 保留旧文件的最大个数
        Compress:   false,     // 是否压缩/归档旧文件
    }

    core := zapcore.NewCore(
        zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig()),
        zapcore.AddSync(lumberJackLogger),
        zapcore.DebugLevel,
    )

    logger := zap.New(core)
}
```

更多高级用法请参考 [Github 项目文档](https://github.com/natefinch/lumberjack)，在此不多赘述。
