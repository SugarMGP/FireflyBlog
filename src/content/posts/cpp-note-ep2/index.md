---
title: "C++ 盲点笔记（二）之 C 字符串"
published: 2024-11-12T19:16:29+08:00
draft: false
image: ./cover.webp
category: "编程笔记"
tags:
  - "C++"
  - "笔记"
  - "字符串"
  - "字符数组"
---

## C 字符串

### 声明

C 语言没有单独的字符串类型，字符串被当作字符数组，即`char[]`.

字符串变量可以声明成一个字符数组，也可以声明成一个指针，指向一个字符数组。

所有字符串都以`\0`结束。

```cpp
// 以下三种写法等价
char s1[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
char s2[6] = "Hello";
char s3[] = "Hello";

// 用指针指向字符数组常量
char* s4 = "Hello";
```

若字符数组长度大于字符串长度，则会用`\0`填充剩余的空间。

```cpp
// 从 s[6] 到 s[9] 均为 '\0'
char s[10] = "Hello"; 
```

C 语言允许合并多个字符串字面量，如果这些字符串之间只有空格或换行，C 语言会将它们自动合并。

```cpp
char greeting[50] = "Hello, "   "how are you "
    "today!";
// 等同于
char greeting[50] = "Hello, how are you today!";
```

对于已经定义的字符数组，我们不能直接使用赋值运算符进行整体赋值，而是必须使用 C 语言提供的`strcpy()`函数。

```cpp
char str[10];
str = "Hello";  // 错误：数组名是常量指针，不能作为赋值操作的左值
strcpy(str, "Hello");  // 正确
```

若使用指针变量，则可以直接指向字符串常量或字符数组：

```cpp
char* p;
p = "World"; // 指向字符串常量
*(p+3) = 'z';  // 错误：常量不能修改

char str[] = "Hello, world!";
p = str; // 指向现有的字符数组
*(p+3) = 'z'; // 合法，等价于 str[3] = 'z'
```

### strlen() 函数

`strlen()`函数返回字符串的字节长度，不包括末尾的空字符`\0`.

```cpp
// string.h
size_t strlen(const char* s);
```

它的参数是字符串变量，返回的是`size_t`类型的无符号整数，除非是极长的字符串，一般情况下当作`int`处理即可。

注意，字符串长度`strlen()`与字符数组长度`sizeof()`是两个不同的概念。

```cpp
char s[50] = "hello\0world12";
cout << strlen(s) << endl; // 5
cout << strlen(s+6) << endl; // 7
cout << sizeof(s) << endl; // 50
```

### strcpy() 函数

`strcpy()`函数用于将一个字符串复制到一个字符数组中。

```cpp
// string.h
char* strcpy(char dest[], const char src[]);
```

`strcpy()`的返回值是一个字符串指针，指向第一个参数，故可以连续为多个字符数组赋值。

```cpp
char str1[20] = "Hello, I'm C0dd1y";
char str2[20] = "C0dd1y";

strcpy(str2, strcpy(str1 + 11, "SugarMGP"));
cout << str1 << endl; // Hello, I'm SugarMGP
cout << str2 << endl; // SugarMGP
```

另外，不能使用`strcpy()`对没初始化的字符指针赋值。

```cpp
char* str; // 未初始化，指向随机位置
strcpy(str, "hello world"); // 错误
```

程C老师给我们写的神金示例，好孩子千万不要这样写码哦：

```cpp
char s[81]="apple***\0s1234567";
char s2[81]="abc";
cout << s << endl; // apple***
cout << s+9 << endl; // s1234567
	
strcpy(s,s2); // abc\0e***\0s1234567
cout << s << endl; // abc
cout << s+4 << endl; // e***
cout << s+9 << endl; // s1234567
```

### strcat() 函数

`strcat()`函数用于将一个字符串追加到另一个字符串的末尾。

```cpp
// string.h
char* strcat(char* s1, const char* s2);
```

`strcat()`的返回值是一个字符串指针，同样指向第一个参数。

```cpp
char s1[30] = "hello";
char s2[20] = "world";
strcat(s1, strcat(s2, ", SugarMGP"));
puts(s1); // "helloworld, SugarMGP"
```

同样也举个神金示例：

```cpp
char s[81]="apple***\0s1234567";
char s2[81]="abc";
cout << s << endl; // apple***
cout << s+9 << endl; // s1234567

strcat(s,s2); // apple***abc\034567\0
cout << s << endl; // apple***abc
cout << s+12 << endl; // 34567

strcat(s+12,s2); // apple***abc\034567abc\0
cout << s << endl; // apple***abc
cout << s+12 << endl; // 34567abc
```

### strcmp() 函数

`strcmp()`函数用于比较两个字符串的内容。

```cpp
// string.h
int strcmp(const char* s1, const char* s2);
```

按照字典顺序，若`s1`小于`s2`，则返回负值；若`s1`大于`s2`，则返回正值；若`s1`等于`s2`，则返回零。

```cpp
// s1 = Happy New Year
// s2 = Happy New Year
// s3 = Happy Holidays
strcmp(s1, s2) // 0
strcmp(s1, s3) // 正值 ('N'>'H')
```

### strchr() 和 strstr()

`strchr()`函数用于在字符串中查找某个字符，并返回该字符第一次出现的位置。

`strstr()`函数用于在字符串中查找另一个字符串的第一次出现的位置。

```cpp
char str[] = "Hello, world!";

char* p = strchr(str, 'l');
if (p != NULL) {
    cout << p - str << endl; // 得到'l'第一次出现的下标为 2
}

char* q = strstr(str, "world");
if (q != NULL) {
    cout << q - str << endl; // 得到'world'第一次出现的下标为 7
}
```
