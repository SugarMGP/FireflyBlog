---
title: "浙工大第五届 CTF 迎新赛回顾"
published: 2024-12-22T23:01:45+08:00
draft: false
image: ./cover.webp
category: "实践记录"
tags:
  - "CTF"
  - "比赛"
  - "题解"
  - "C++"
  - "Python"
---

## 前言

这次赛题感觉整体难度不高，不会或者不了解的地方上网搜搜很快就能学会，答出大部分题应该是足够了。

本文中使用的代码均为 ChatGPT 生成。

## PWN

### welcome_pwn

题面："你听说过a[-1]吗"

下载附件后使用 IDA 进行反编译，发现 `main` 函数中有一个 10 次的循环。

```c
int main() // 简化的 main() 函数
{
  init();
  puts("let us play a game!");
  for ( int i = 0; i <= 9; ++i )
    game();
  return 0;
}
```

进入 `game` 函数，可以看到程序判断对应数组下标的值是否正确，如正确则计数，如错误则赋值。
然而要触发 `sh` 命令，需要计数大于 10，按正常逻辑无法做到。

```c
void game() // 简化的 game() 函数
{
  int v1;
  int v2;
  puts("input the index");
  scanf("%d", &v1);
  puts("input the result");
  scanf("%d", &v2);
  if ( pp[v1] == v2 ) {
    puts("right!");
    ++coins;
  } else {
    puts("wrong!");
    pp[v1] = v2;
  }
  if ( coins > 10 )
  {
    puts("wow you are so good!");
    system("/bin/sh");
  }
  return;
}
```

点击 `pp` 数组，发现其内存地址为 `201040`，而 `coin` 的地址为 `20103C`，刚好差距 4 字节。
结合题面，我们不难想到通过 `pp[-1]` 修改 `coin` 的值，从而激活终端。

连接容器，输入 `index` 为 -1，`result` 为大于 10 的数，即可进入终端，输入 `cat /flag` 即可得到 flag.

### ret2libc_32

这题难度较高，可能是题库中最难的。

但是这题可以在网上搜到原题和题解，所以难度大大下降。

具体解法可参考下列链接，本文不再赘述。

[pwn入门：基本栈溢出之ret2libc详解（以32位+64位程序为例）](https://blog.csdn.net/Bossfrank/article/details/134872403)

[CTFshow-PWN-栈溢出（pwn45）](https://blog.csdn.net/Myon5/article/details/138815469)

## Crypto

### 水题

密码题大部分送分，水题统一写这里。

- 简单签到题：摩斯密码
- 古典密码：W 型栅栏密码
- 真签到题：Ook 密码
- caesar：凯撒密码
- 密码题：培根密码
- Base 家族：Base64 解完再解 Base32

基本找个在线工具丢进去就出来了。

### MiniRSA

题目给出公钥 n = 15，e = 3，密文 c = 3.

丢给 GPT 算出明文 m = 12.

### basicRSA

```python
from gmpy2 import gcd, invert, powmod
from Crypto.Util.number import bytes_to_long, long_to_bytes

# 已知参数 e p q c
e = 
p = 
q = 
n = p * q
c = 

# 计算 phi(n)
phi_n = (p - 1) * (q - 1)

# 计算私钥 d
d = invert(e, phi_n)

# 解密密文
m = powmod(c, d, n)

# 转换回 flag
flag = long_to_bytes(m)
print(flag)
```

### 键盘加密

```text
74 81 43 62 41 32 73
```

打开手机九键键盘，每组第一个数字对应九键，第二个数字对应键中具体的字母。

得到 `stinger` 即为 flag.

### 真的是md5？

```text
剔除前：bci177a7a9c7udf69c248647b4dfc6fd84o
剔除后：bc177a7a9c7df69c248647b4dfc6fd84
```

题目给的密文包含 md5 以外的字符，先把这些字符剔除，然后[反向查询](https://www.cmd5.com/)明文。

得 `666666666666` 即为 flag.

### RSA

这题中 n 是一个素数，所以可以直接用 `n-1` 作为 `phi(n)`.

```python
from Crypto.Util.number import *
from sympy import mod_inverse

# 已知的参数
n =
e =
c =

# 计算私钥 d
d = mod_inverse(e, n - 1)

# 解密密文
m = pow(c, d, n)

# 转换为字节
flag = long_to_bytes(m)

print("Flag:", flag)
```

## Misc

### 你真的看不见吗

Word 文档隐写题。

忘了怎么做的了，好像随便输几个字然后改改属性就出来了。

### 压缩包怎么还要密码

得到一个带密码的压缩包，题目提示密码是学长生日。

暴力破解，从 20000101 到 20240101，可得学长生日为 20040915.

### GIF

直接打开会发现图片显示不全，用 Stegsolve 打开就能看到二维码。

打开 Frame Browser，依次识别 18 张二维码，连起来即可得到 flag.

### 图片题

使用十六进制编辑器打开，发现图片中藏了 XML 文本，格式化后即可找到 flag.

### wireshark

题目给出 Wireshark 抓包记录，打开后筛选 Http 层，搜索 POST 方法，查看内容即可看到密码。

### 图片好像不完整

打开图片发现龙舟图片不完整，用 tweakPNG 打开提示 CRC 错误。

于是编写脚本从 CRC 反推图片大小。

```python
import zlib
import struct
import itertools

bin_data = open("龙舟.png", 'rb').read()
original_crc32 = int(bin_data[29:33].hex(), 16) # 原始crc

for i, j in itertools.product(range(4095), range(4095)):
	data = bin_data[12:16] + struct.pack('>i', i) + struct.pack('>i', j) + bin_data[24:29]
	crc32 = zlib.crc32(data)
	if(crc32 == original_crc32): # 计算当图片大小为i:j时的CRC校验值，与图片中的CRC比较，当相同，则图片大小已经确定
		print(f"宽度: {i}, hex: {hex(i)}")
		print(f"高度: {j}, hex: {hex(j)}")
		exit(0)
```

运行脚本后得图片实际高度应为 500，用 tweakPNG 重新修改图片大小，打开即可得到 flag.

### 又是图片

图片属性中有一串盲文，翻译后即可得 flag.

### 你使用过StegSolve吗？

使用 StegSolve 打开图片，打开 Data Extract 窗口，

勾选 `R0 B0 G0` 三个通道，`Bit Order` 选择 `LSB First`，

提取数据，发现数据头有 `PNG` 字样，保存为 png 文件，可以发现是张二维码，解析即可得 flag.

### 图片怎么打不开

用十六进制编辑器打开，发现文件尾有 `GNP` 字样，编写程序读取二进制数据并反转输出，打开图片即可得 flag.

```cpp
#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    string inputFilename = "1.png";
    string outputFilename = "2.png";

    // 打开输入文件
    ifstream inputFile(inputFilename, ios::binary);
    if (!inputFile) {
        cerr << "Error: Could not open input file " << inputFilename << endl;
        return 1;
    }

    // 读取二进制数据到缓冲区
    vector<char> buffer((istreambuf_iterator<char>(inputFile)),
                        istreambuf_iterator<char>());
    inputFile.close();

    // 反转数据
    reverse(buffer.begin(), buffer.end());

    // 打开输出文件
    ofstream outputFile(outputFilename, ios::binary);
    if (!outputFile) {
        cerr << "Error: Could not open output file " << outputFilename << endl;
        return 1;
    }

    // 写入反转后的数据到输出文件
    outputFile.write(buffer.data(), buffer.size());
    outputFile.close();
    return 0;
}
```

### 社工题

将酒店图片左右翻转，在镜子反光中看到 `Transcendence Resort` 字样，百度搜索即可得到答案 `青城山心越酒店`。

### 明文攻击

这题真有点绕，硬控了我两小时。

下载附件得到 `._none.zip` 和 `none.zip` 两个文件，其中 `._none.zip` 没什么用。

解压 `none.zip`，得到 `woo.jpg` 和 `res.zip` 两个文件，`res.zip` 被密码加密，其中有 `flag.txt` 和 `secret.txt` 两个文件。

用十六进制编辑器打开 `woo.jpg`，在文件尾部找到 Zip 文件尾 `50 4B 05 06`，向前搜索 `03 04`，发现前四位被 `32 32` 覆盖。

修改 `32 32 03 04` 为 `50 4B 03 04`，即可修复 Zip 文件头。

使用 `binwalk` 工具拆分文件，得到一个包含 `flag.txt` 的压缩包，并且这个压缩包没有密码。

查看 CRC 可以发现这个压缩包中的 `flag.txt` 与 `res.zip` 中的完全一致，故用明文攻击即可破解压缩包。

破解完打开 `secret.txt` 即可获得 flag.

## Web

### easyweb1

查看 HTML 源码即可得 flag.

### easyweb2

直接打开容器，未发现有效信息，HTML 源码提示我们寻找其他文件。

使用 dirsearch 工具进行扫描，发现根目录下有 `robot.txt`，用浏览器访问即可得 flag.

### easyweb3

进入容器可以看到 PHP 脚本，可知要绕过数字判断并使 `$a == 404` 成立。

```php
<?php
highlight_file(__FILE__);

if(!isset($_GET['start'])) exit(0);

$a = $_GET['start'];
if (is_numeric($a)) {               //这里要怎么绕过呢？
    echo "can't be number</br>";
    exit(0);
}elseif ($a == 404) {
    echo "Right!</br>";
}

if(isset($_GET['password']) && $_GET['password']=="Stinger666"){
    if(isset($_POST['bash'])){
        system($_POST['bash']);
    }
}
?>
```

设置 `start` 为 `404\0`，即可绕过判断，使用 curl 发送请求即可运行指令。

```bash
curl --location --request POST 'https://xxx.stinger.team/?start=404%00&password=Stinger666' --form 'bash="cat /flag"'
```

### easyweb4

没做出来，这个是真不会，

给 CTF 佬跪辣。
