---
title: "基于 WebSocket 协议打造简易聊天服务端"
published: 2025-03-11T18:18:29+08:00
draft: false
image: ./cover.webp
category: "实践记录"
tags:
  - "WebSocket"
  - "Golang"
  - "后端开发"
---

## 前言

在本次寒假软件竞赛中，我们决定为系统添加用户间的实时聊天功能。经过综合考量性能、开发难度以及用户体验等因素，我们最终选择基于 **WebSocket** 协议来实现这一功能。

## 为什么是 WebSocket？

WebSocket 是一种基于 **TCP** 的通信协议，它通过建立一个单一的、持久的连接，实现了客户端与服务器之间的**全双工实时通信**。相较于传统的 HTTP 协议，WebSocket 在实时通信场景下具有显著优势：

- **实时双向通信**：WebSocket 允许服务器主动向客户端推送消息，而不仅仅是等待客户端的请求。这消除了传统 HTTP 轮询（Polling）方式带来的延迟，使得消息能够即时送达。

- **高效资源利用**：WebSocket 使用单一的、长时间保持的连接，避免了 HTTP 协议每次请求都需要建立和断开连接的开销。这能减少不必要的握手过程，降低服务器的资源消耗，并显著节省带宽。

- **灵活格式支持**：WebSocket 协议本身不对消息格式进行限制，开发者可以根据实际需求选择合适的数据格式，例如 JSON、XML 或 Protobuf 等。

## 项目实践

为了在 Golang 中处理 WebSocket 协议的请求，我们首先需要引入一个强大的第三方库 `gorilla/websocket`。这个库为我们提供了便捷的 WebSocket 操作接口，极大地简化了开发过程。

```bash
go get github.com/gorilla/websocket
```

### 升级 WebSocket 连接

为了把 HTTP 连接升级到 WS ，我们需要**初始化一个 Upgrader 实例**。它的用法非常简单，直接**传入 HTTP Writer 和 Request 即可**。

此处缓冲区我简单设置成 1024 字节，生产环境中如果遇到性能瓶颈可以适当调整。

跨域检测这里直接返回 `true`，因为路由端已经进行了处理。

```go
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(_ *http.Request) bool {
		return true
	},
}

// 用法：将 HTTP 请求升级为 WebSocket 连接
conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
```

### 构造连接管理器

```go
type ConnectionManager struct {
	connections map[uint]*websocket.Conn // 存储连接信息
    msgChannel  chan models.Message      // 消息队列，用于异步处理消息
	mutex       sync.RWMutex             // 读写锁，保护 connections 的并发访问
	stop        atomic.Bool              // 停止标记
}
```

为了让这个管理器能管理连接，我们编写两个方法，一个用于**注册 WS 连接**，一个用于**移除已断开的连接**。

```go
// registerConnection 注册连接
func (cm *ConnectionManager) registerConnection(conn *websocket.Conn, uid uint) {
	// 获取历史消息
	messages, err := messageService.GetMessagesByUser(uid)
	if err != nil {
		// ...
	}

	// 注册连接并推送历史消息
	cm.mutex.Lock()
	cm.connections[uid] = conn
	cm.mutex.Unlock()
	for _, msg := range messages {
		if err := conn.WriteJSON(msg); err != nil {
			// ...
		}
	}
}

// unregisterConnection 移除连接
func (cm *ConnectionManager) unregisterConnection(uid uint) {
	cm.mutex.Lock()
	delete(cm.connections, uid)
	cm.mutex.Unlock()
}
```

接着，我们编写一个消息处理函数。

首先**将传入的消息保存到数据库**，由于前端没有保存消息记录，所以我们**再把消息推送给发送者和接受者**。

```go
func (cm *ConnectionManager) handleMessage(message *models.Message) {
	// 保存消息到数据库
	if err := messageService.CreateMessage(message); err != nil {
		zap.L().Warn("Error saving message to database", zap.Error(err))
		return
	}

	cm.mutex.RLock()
	receiverConn, exists := cm.connections[message.Receiver]
	senderConn, senderExists := cm.connections[message.Sender]
	cm.mutex.RUnlock()

	// 推送给接收人
	if exists {
		if err := receiverConn.WriteJSON(message); err != nil {
			// ...
		}
	}

	// 推送给发信人
	if senderExists {
		if err := senderConn.WriteJSON(message); err != nil {
			// ...
		}
	}
}
```

在初始化函数中我们启动一个协程，从**消息队列中取出消息并送入消息处理方法**。

```go
func Init() {
	go func() {
		for !cm.stop.Load() {
			msg := <-cm.userChannels
			cm.handleMessage(&msg)
		}
	}()
}
```

### 编写控制器

为了接受前端的握手请求，我们像先前那样写一个控制器并挂载到路由上。

先调用 Upgrader 把请求升级到 WS 连接，然后调用连接管理器进行注册，最后通过循环源源不断地读取前端发来的消息，并送入消息队列。

```go
func WebSocketController(c *gin.Context) {
    // 将 HTTP 请求升级为 WebSocket 连接
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		response.AbortWithException(c, apiException.WebSocketError, err)
		return
	}
	defer conn.Close()

	cm.registerConnection(conn, uid)
	for {
		msgType, msg, err := conn.ReadMessage()
		if err != nil {
			cm.unregisterConnection(uid)
			break
		}

		if msgType == websocket.TextMessage {
            // 反序列化到结构体并送入消息队列
			var message models.Message
			if err := json.Unmarshal(msg, &message); err != nil {
				zap.L().Warn("Error unmarshaling message", zap.Error(err))
				continue
			}
			cm.msgChannel <- message
		}
	}
}
```

至此，一个超级简单的 WebSocket 服务端就完成了。

## 小结

这次对 WebSocket 的折腾十分有趣，全双工的通信方式带来的使用体验相比 HTTP 轮询有了质的飞跃。

当然，由于只是花两天时间草草搓的系统，所以项目中仍有许多地方可以改进，如支持发送图片，引入 `asynq` 等第三方库来完善消息队列等等。更多的探索，相信未来会有机会尝试的。

由于篇幅所限，本文删去了许多非核心代码，若你想参考我的实现，可以直接翻阅[原项目代码](https://github.com/SugarMGP/BookRecycleServer/blob/main/pkg/ws/ws.go)。
