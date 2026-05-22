---
title: "精弘网络 Java 后端微课 - EP1.5 巧用 Lombok 简化样板代码"
published: 2025-08-04T14:31:00+08:00
draft: false
image: ./cover.webp
category: "编程笔记"
tags:
  - "Java"
  - "后端开发"
  - "SpringBoot"
  - "MybatisPlus"
  - "精弘微课"
---

## 导入 Lombok

```xml
<dependency>
	<groupId>org.projectlombok</groupId>
	<artifactId>lombok</artifactId>
	<version>1.18.38</version>
	<scope>provided</scope>
</dependency>
```

## 原理简析

![](./images/1.5.1.png)

Java 的编译过程可以分成三个阶段：

1. 把所有源文件解析成语法树
2. 调用注解处理器，如果产生了新的源文件则再次编译
3. 分析语法树并转化成类文件

Lombok 会在上述的第二阶段，执行 *lombok.core.AnnotationProcessor*，它所做的工作就是修改语法树，并将注解对应需要生成的内容全部添加到类文件中。

这样，我们即使没有在源代码中编写的内容，也会存在于生成出来的 class 文件中。

## 常用注解

### @Getter 和 @Setter

可以打在字段或者类上，作用是生成对应的 get 和 set 方法。

注意布尔值的命名规则：

```java
@Getter
public class User {
    private boolean bar;    // isBar()
    private boolean isBar;  // isBar()
    private Boolean foo;    // getFoo()
    private Boolean isFoo;  // getIsFoo()
}
```

### 构造函数相关

- `@AllArgsConstructor` 生成全参构造函数
- `@NoArgsConstructor` 生成无参构造函数
- `@RequiredArgsConstructor` 生成需要初始化的参数的构造函数

### @ToString

自动生成类的 toString 方法，默认输出类名和所有字段名和值。

### @EqualsAndHashCode

自动生成类属性的比较方法以及对应的 HashCode 计算

```java
Account a1 = new Account(1, "小明", 18);
Account a2 = new Account(1, "小明", 18);
log.info(a1.equals(a2));
```

### @Data

集大成者，包含了 `@Getter`、`@Setter`、`@ToString`、`@EqualsAndHashCode`、`@RequiredArgsConstructor`

### @Builder

生成 Builder 模式的代码，用于创建对象。

### @Slf4j

**Simple Logging Facade for Java（简称 SLF4J）** 是一个 Java 日志门面（facade）库，其主要作用是为各种日志框架提供统一的日志 API 接口

Spring Boot 默认使用 `slf4j-api` 作为日志 API，`logback-classic` 作为默认实现

Lombok 的 @Slf4j 注解会自动生成一个 SLF4J 日志对象，其等效于

```java
private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(class);
```

## 拓展阅读

[Lombok 官方文档](https://projectlombok.org/features)

[柏码知识库 - Lombok 极速上手](https://www.itbaima.cn/zh-CN/document/iqbc2haub31bwqtz)
