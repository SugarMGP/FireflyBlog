---
title: "精弘网络 Java 后端微课 - EP3 异常捕获与日志记录"
published: 2025-08-13T22:30:00+08:00
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

## 接口日志记录

```java
@Slf4j
@Component
public class AccessLogFilter implements Filter {

    static {
        AnsiOutput.setEnabled(AnsiOutput.Enabled.ALWAYS);
    }

    private static AnsiColor getStatusColor(int status) {
        return switch (status / 100) {
            case 2 -> AnsiColor.GREEN;
            case 4 -> AnsiColor.YELLOW;
            case 5 -> AnsiColor.RED;
            default -> AnsiColor.DEFAULT;
        };
    }

    private static AnsiColor getMethodColor(String method) {
        return switch (method) {
            case "GET" -> AnsiColor.BLUE;
            case "POST" -> AnsiColor.CYAN;
            case "PUT" -> AnsiColor.YELLOW;
            case "DELETE" -> AnsiColor.RED;
            default -> AnsiColor.MAGENTA;
        };
    }

    private static String getRemoteAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        return ip == null ? request.getRemoteAddr() : ip;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!(request instanceof HttpServletRequest req) || !(response instanceof HttpServletResponse res)) {
            chain.doFilter(request, response);
            return;
        }

        Instant start = Instant.now();
        chain.doFilter(request, response);
        Instant end = Instant.now();
        long durationMs = Duration.between(start, end).toMillis();

        int status = res.getStatus();
        String method = req.getMethod();
        String uri = req.getRequestURI();
        String query = req.getQueryString();
        String ip = getRemoteAddr(req);

        // 彩色状态码
        String colorStatus = AnsiOutput.toString(
                getStatusColor(status),
                status,
                AnsiColor.DEFAULT
        );

        // 彩色方法
        String colorMethod = AnsiOutput.toString(
                getMethodColor(method),
                method,
                AnsiColor.DEFAULT
        );

        log.info("{} | {}ms | {} {} | IP: {}",
                colorStatus,
                durationMs,
                String.format("%-6s", colorMethod),
                uri + (query != null ? "?" + query : ""),
                ip
        );
    }
}
```


## 自定义错误类型与错误码聚合

```java
@Getter
public class ApiException extends RuntimeException {
    private final Integer errorCode;
    private final String errorMsg;

    public ApiException(Integer errorCode, String errorMsg) {
        super(errorMsg);
        this.errorCode = errorCode;
        this.errorMsg = errorMsg;
    }

    public ApiException(Integer errorCode, String errorMsg, Throwable cause) {
        super(errorMsg, cause);
        this.errorCode = errorCode;
        this.errorMsg = errorMsg;
    }
}
```

```java
@Getter
public enum ExceptionEnum {
    INVALID_PARAMETER(200000, "参数错误"),
    RESOURCE_NOT_FOUND(200001, "资源不存在"),
    WRONG_USERNAME_OR_PASSWORD(200002, "用户名或密码错误"),
    PERMISSION_NOT_ALLOWED(200003, "权限不足"),

    NOT_FOUND_ERROR(200404, HttpStatus.NOT_FOUND.getReasonPhrase()),
    SERVER_ERROR(200500, "系统错误, 请稍后重试"),
    ;

    private final Integer errorCode;
    private final String errorMsg;

    ExceptionEnum(Integer errorCode, String errorMsg) {
        this.errorCode = errorCode;
        this.errorMsg = errorMsg;
    }
}
```

## 错误捕获

```java
@ControllerAdvice
@Order(1000)
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public AjaxResult<Object> handleGlobalException(Exception e) {
        HandlerUtils.logException(e);
        return AjaxResult.fail(ExceptionEnum.SERVER_ERROR);
    }
}
```

常见参数校验异常：
- `MethodArgumentNotValidException` 参数校验错误
- `JsonMappingException` Json解析失败
- `HttpMessageNotReadableException` Json格式错误
- `ServletRequestBindingException` Query参数错误

常见 404 异常：
- `NoResourceFoundException` 路径不存在
- `HttpRequestMethodNotSupportedException` 请求方法不支持

## 课外拓展

这边列出一些可以课外研究研究的方面，以便你对 Spring 框架有更深的理解。

注意：这些教程可能与最新的 Spring 版本有所出入，有疑问可以多上网上搜搜，或者问 Qwen、Deepseek 等大语言模型。

- [Spring Bean](https://dunwu.github.io/spring-tutorial/pages/68097d/)
- [Spring IOC](https://dunwu.github.io/spring-tutorial/pages/915530/)
- [Spring 依赖注入](https://dunwu.github.io/spring-tutorial/pages/f61a1c/)
- [Spring AOP](https://dunwu.github.io/spring-tutorial/pages/f61a1c/)
- [Spring 访问 Redis](https://dunwu.github.io/spring-tutorial/pages/65e4a2/)
- [Spring 集成调度器](https://dunwu.github.io/spring-tutorial/pages/a187f0/)
