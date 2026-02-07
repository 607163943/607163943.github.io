---
title: JDK安装
date: 2026-02-07 20:48:17
categories:
  - 编程
tags:
  - Java
series: Java入门
---

### JDK安装

​	目前市面上常见Java版本有8、9、11、17，部分使用21及以上的LTS版本。这里要说明一下Java代码运行在JVM虚拟机上，JVM虚拟机跟一些运行JVM所需要的文件组成了Java运行环境JRE，JRE配合Java开发常用的一些基础代码组成Java开发工具包JDK。安装Java一般是指安装JDK。

#### 下载JDK

​	下载JDK8要去[Oracle官方网站]([Oracle | Cloud Applications and Cloud Platform](https://www.oracle.com/))下载，进入网站后点击Products

{% asset_img oracle.jpeg %}

展开列表往下拉，选择Java

{% asset_img oracle-java.jpeg %}

{% asset_img oracle-java-download.jpeg %}

{% asset_img 4.jpeg %}

{% asset_img 5.jpeg %}

这里要根据自己电脑做选择，我是Windows电脑这里点击Windows那个标签页，四个安装项分成x86和x64，末尾分成Installer和Compressed Archive

区别如下

* x64：64位电脑使用
* x86：32位电脑使用
* Installer：相当于软件安装包，直接根据引导安装即可
* Compressed Archive：压缩包，需要自己解压安装

现在的家用PC几乎都是64位，Windows用户可以通过Win+R打开运行窗口，输入msinfo32回车弹出的系统信息进行确认

{% asset_img 6.jpeg %}

> 需要注意的是JDK安装尽量不要选系统盘，这个盘的文件非常混乱如果再将下载的应用放到这个盘，后期清理工作是场灾难

> 值得一提的是由于Oracle对JDK8之后的商业版权原因，JDK8之后生产环境多数采用的OpenJDK处获取的JDK应用而非Oracle JDK，但这不是Java基础的重点，而且也没有对Java入门用的API产生影响

#### 配置环境变量

​	JDK安装后在安装目录下的bin文件夹中可以发现它就是一个应用程序，也就是给它提供Java代码文件，它就可以编译运行Java代码，但如果不配置环境变量，在其他路径中系统是找不到这个应用程序的，这里先说一下环境变量的作用。

​	当需要通过终端启动一个应用程序时，直接打开终端输入应用程序名就行了，终端会尝试从当前目录下找该程序，当前目录没有就会去环境变量中的Path项记录的路径集合中寻找，上述步骤中找到就直接启动程序，没有找到就会返回下面这种

{% asset_img 7.jpeg %}

所以只要配置了环境变量，在任意目录都可以唤起目标程序。

​	按下Win键唤起菜单，输入环境

{% asset_img 8.jpeg %}

唤起弹窗中点击环境变量

{% asset_img 9.jpeg %}

新的弹窗有用户变量和系统变量，它们都是环境变量，区别是用户环境变量会根据用户账号进行变化，系统环境变量则跟随系统。作用都是一样的，一般配置的是系统的环境变量，找到下面这项

{% asset_img 10.jpeg %}

双击后进一个列表页，点击新建按钮，将安装目录下bin目录中Java应用程序所在路径添加上去，

{% asset_img 11.jpeg %}

然后点击确定回到弹窗页，然后点击新建弹出新弹窗

{% asset_img 12.jpeg %}

输入JAVA_HOME和安装目录路径点击确定，然后一路确定指导环境变量窗口关闭，环境变量配置完成。

> 配置JAVA_HOME后Path处的Java安装目录bin路径可以更改为%JAVA_HOME%/bin，这里相当于将JAVA_HOME内容去拼接/bin路径作为java程序所在路径，后续多版本JDK共存时，通过更改JAVA_HOME的方式就可以更改启用的JDK很方便

#### 验证安装

在非Java目录下任意目录打开终端，输入如下指令

```bash
java --version
```

弹出JDK版本信息说明系统找到了Java应用程序路径，环境变量配置成功。

{% asset_img 13.jpeg %}

至此JDK安装完成。
