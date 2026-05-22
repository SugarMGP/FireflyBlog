---
title: "精弘网络 Java 后端微课 - EP2 业务分层与数据库操作"
published: 2025-08-10T14:30:00+08:00
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

## 数据库基本概念

**1. 数据库（Database）**

存放数据的地方，比如 MySQL、PostgreSQL 就是常见的数据库软件。

**2. 表（Table）**

数据是按表来存的，就像 Excel 的工作表，每一行是一条记录，每一列是一个字段。

**3. 字段（Column）**

表里的列，比如 `name`、`age`，用来描述数据的属性。

**4. 记录 / 行（Row / Record）**

表中的一行数据，比如一个用户的信息就是一条记录。

**5. 主键（Primary Key）**

表中唯一标识一条记录的字段，比如 `id`。

**6. 常见操作（CRUD）**

- Create：插入数据（INSERT）
- Read：查询数据（SELECT）
- Update：修改数据（UPDATE）
- Delete：删除数据（DELETE）

**7. SQL**

操作数据库的语言（Structured Query Language），比如：

```sql
SELECT * FROM user WHERE id = 1;
```

## Mybatis-Plus 

### 简介

MyBatis-Plus 是一款 **Java ORM（Object Relational Mapping，对象关系映射）框架**。

它将数据库表与 Java 类、字段与类属性一一映射，实现数据与对象的自动转换，大幅减少手写 SQL 的工作量。

[Mybatis-Plus 官网](https://baomidou.com/)

它具备以下实用特性：

- 基于 MyBatis 框架的增强，**无需编写 XML 配置文件**
- 内置很多**常用的 CRUD 方法**
- 支持**条件构造器**，写复杂查询不必手写 SQL
- 提供**分页插件、代码生成器**等工具，提升开发效率

### 安装

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-bom</artifactId>
            <version>3.5.12</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-jsqlparser</artifactId>
</dependency>
```

### 配置数据源

```yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/forum_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf-8
    username: root
    password: 123456
```

## 建表并生成实体类

[Mybatis X 插件](https://baomidou.com/guides/mybatis-x/)

## 业务分层

分层架构帮助我们组织代码，让每个部分各司其职，提高代码的可维护性和可扩展性

- 控制器（Controller）：处理 HTTP 请求，调用服务层处理业务逻辑，返回响应结果。
- 服务层（Service）：定义业务逻辑接口，实现业务逻辑，调用数据访问层操作数据库。
- 数据访问层（Mapper）：定义数据库操作接口，提供 CRUD 方法操作数据库。
- 实体类（Entity）：表示数据库表的 Java 类。

[持久层接口](https://baomidou.com/guides/data-interface/)

## 条件构造器

[条件构造器](https://baomidou.com/guides/wrapper/)

## 逻辑删除

[逻辑删除支持](https://baomidou.com/guides/logic-delete/)

## 自动填充字段

[自动填充字段](https://baomidou.com/guides/auto-fill-field/)

```java
@Component
public class AutoFillHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.setFieldValByName("createdAt", LocalDateTime.now(), metaObject);
        this.setFieldValByName("updatedAt", LocalDateTime.now(), metaObject);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.setFieldValByName("updatedAt", LocalDateTime.now(), metaObject);
    }
}
```

## 课外拓展

### 身份鉴权

使用用户ID进行身份鉴权会不会产生安全问题？尝试使用 JWT 或 Session 对登录和鉴权流程进行优化，可自行搜索相关库和技术博客进行学习

[Cookie、Session、Token究竟区别在哪？如何进行身份认证，保持用户登录状态？](https://www.bilibili.com/video/BV1ob4y1Y7Ep/)

### 分页查询

如果数据量很大，一次性查询所有数据会导致性能问题，尝试学习使用 Mybatis-Plus 提供的分页插件

### 事务管理

如果在业务逻辑中需要对多个表进行更新操作，如何确保这些操作要么全部成功，要么全部失败？可以自行搜索了解如何使用 SpringBoot 中的事务管理机制
