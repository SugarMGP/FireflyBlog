---
title: "C++ 盲点笔记（三）之 指针"
published: 2025-01-03T22:17:08+08:00
draft: false
image: ./cover.webp
category: "编程笔记"
tags:
  - "C++"
  - "笔记"
  - "指针"
---

## 指针

### 基本使用

指针是用于存储变量地址的特殊变量。通过指针，可以间接访问或修改变量的值。

```cpp
int num = 10;
int* p = &num;
*p = 20;
```

在上述代码中，`num` 的地址被存入指针 `p` 中，并通过 `*p` 进行解引用，间接给 `num` 赋值。

### 指针与数组

数组名在大多数情况下会被解释为指向其第一个元素的指针。由于数组元素在内存中是连续的，因此可以通过指针遍历数组。

```cpp
int arr[5] = {1, 2, 3, 4, 5};
int* p = arr; // 等价于 int* p = &arr[0];
for (int i = 0; i < 5; ++i) {
    cout << *(p + i) << " "; // *(p + i) 等价于 p[i]
}
```

你可以定义一个指针数组用来存储多个指针，或者声明一个数组指针来指向一个数组。

```cpp
int arr[5] = {1, 2, 3, 4, 5};

// 定义一个指针数组，存储数组中每个元素的地址
int *p1[5] = {&arr[0], &arr[1], &arr[2], &arr[3], &arr[4]};

// 定义一个数组指针，指向整个数组
int (*p2)[] = &arr;
```

优先级：`() > [] > *`

对于 `int *p1[5]`，`[]` 的优先级高，`p1` 首先被解析为数组，数组中的元素类型为整型指针。

对于 `int (*p2)[]`，使用 `()` 提升优先级，强制将 `p2` 解析为指针。

### 多级指针

多级指针是指向指针的指针，通过它我们可以间接访问多级嵌套的变量值。

```cpp
int num = 10;
int* p1 = &num;
int** p2 = &p1; // p2 是指向 p1 的指针
cout << **p2 << endl; // 输出 10
```

### 指针与运算符

指针与运算符经常用来组合出阴间题目，需要多加注意。

```cpp
char s1[20]="123apple",*p=s1, **pp=&p;
cout << *pp + 3 << endl; // 输出 apple
cout << *p++ << endl; // 输出 1
cout << *++p << endl; // 输出 3
cout << *pp << endl; // 输出 3apple
cout << **pp << endl; // 输出 3
```

这段代码中：

- `*pp + 3` 等价于 `p + 3`

- `*p++` 和 `*++p` 分别等价于 `*(p++)` 和 `*(++p)`

- `*pp` 等价于 `p`，此时 `p` 指向 `&s1[2]`，故连续输出后面的字符串

- `**pp` 等价于 `*p`，故输出 `s1[2]`，即为 3


### 动态内存分配

在 C++ 中，可以使用 `new` 和 `delete` 运算符进行动态内存分配和释放。

```cpp
int* p = new int(10); // 分配一个初始值为 10 的整数
delete p; // 释放内存

int n;
cin >> n;
int* arr = new int[n]; // 分配包含 n 个整数的数组
delete[] arr; // 释放数组内存
```

使用完动态分配的变量后一定记得调用 `delete` 或 `delete[]` 释放内存，否则会导致内存泄漏。

多级指针在动态分配二维数组时非常有用，因为二维数组本质上可以看作是指针的数组。

```cpp
int rows, cols;
cin >> rows >> cols;

// 动态分配一个指针数组
int** arr = new int*[rows];

// 为数组分配每一行的空间
for (int i = 0; i < rows; ++i) {
    arr[i] = new int[cols];
}

// 释放内存
for (int i = 0; i < rows; ++i) {
    delete[] arr[i]; // 释放每行的内存
}
delete[] arr; // 释放指针数组的内存
```

如果你不想使用多级指针，也可以使用上文提到的数组指针。

这种方式不太常见，并且写法有点反直觉。

```cpp
int rows, cols;
cin >> rows >> cols;

// 动态分配一个连续的二维数组
int (*arr)[cols] = new int[rows][cols]; // 指向包含 cols 个整数的数组

// 释放内存
delete[] arr;
```

### 常量指针与指针常量

- 常量指针 `const int* p` 或 `int const *p`：指针指向的值不可修改，但指针本身可以指向其他地址。

- 指针常量 `int* const p`：指针本身不可修改，但指向的值可以修改。

- 指向常量的指针常量 `const int* const p`：指针本身和指向的值都不可修改。

### 函数指针

函数指针用于指向函数，可以通过它调用函数。

```cpp
int add(int x, int y) {
    return x + y;
}

// 声明一个函数指针，指向 add 函数
int (*p)(int, int) = add;
```

函数指针常用于自定义排序条件，以下是一个冒泡排序示例，它通过传入函数指针来实现排序的灵活性。

```cpp
#include <iostream>
using namespace std;

// 比较函数：降序
bool descending(int a, int b) {
    return a > b; // 如果 a > b，则不需要交换
}

// 比较函数：升序
bool ascending(int a, int b) {
    return a < b; // 如果 a < b，则不需要交换
}

// 冒泡排序函数
void bubbleSort(int arr[], int size, bool (*compare)(int, int)) {
    for (int i = 0; i < size - 1; ++i) {
        for (int j = 0; j < size - i - 1; ++j) {
            // 使用函数指针进行比较，若为 false 则交换元素
            if (!compare(arr[j], arr[j + 1])) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {4, 2, 3, 5, 1};
    int size = sizeof(arr) / sizeof(int);

    // 使用冒泡排序（升序）
    bubbleSort(arr, size, ascending);
    for (int i = 0; i < size; ++i) { // 输出：1 2 3 4 5
        cout << arr[i] << " ";
    }
    cout << endl;

    // 使用冒泡排序（降序）
    bubbleSort(arr, size, descending);
    for (int i = 0; i < size; ++i) { // 输出：5 4 3 2 1
        cout << arr[i] << " ";
    }
    cout << endl;

    return 0;
}
```

### 指针与结构体

指针常用于操作结构体，特别是在动态内存分配时。

```cpp
struct Person {
    string name;
    int age;
};
Person* p = new Person;
p->name = "Alice"; // 等价于 (*p).name = "Alice";
p->age = 30;
delete p;
```
