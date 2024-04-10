# 相机视锥体

## 什么是相机视锥体

相机视锥体是一个四面体，它的顶点是相机的位置，它的底面是屏幕上的四个角，它的侧面是从相机位置到屏幕上的四个角的射线。

## 梳理视锥体参数

我把视锥体的参数分为两类：几何参数和放置参数。几何参数决定了视锥体本身的形状，放置参数决定视锥体在什么位置以什么姿态显示。

### 几何参数

![视锥体](./img/视锥体.png)

- fov 视场角。角度越大，视野越大。
- near 近截面距离。
- far 远截面距离。
- aspectRatio 截面宽高比。

### 放置参数

- origin 视锥体原点（相机位置）。
- orientation 视锥体旋转参数。
- 关于 orientation 参数的理解内容比较多，将在下一节展开。
注：Cesium 中的视锥体分为透视投影视锥体和正射投影视锥体，以上参数主要涉及透视投影视锥体。

## 理解视锥体的 orientation 参数

视锥体的 orientation 参数数据类型为 Quaternion ，和相机的 orientation 参数不同。Cesium API 文档中对 Quaternion 的解释是：一组 4 维坐标，用于表示 3 维空间中的旋转。

Quaternion 有三种比较好理解的创建方式。

### 基于 HeadingPitchRoll 创建

Quaternion.fromHeadingPitchRoll(headingPitchRoll, result)

根据给定的航向角、俯仰角和横滚角计算旋转参数。heading 是绕负 z 轴的旋转。pitch是绕负 y 轴的旋转。roll是围绕正 x 轴的旋转。[5]

```javascript
let heading = 0;
let pitch = 0;
let roll = 0;
// 测试旋转效果
for(let i = 0; i < 8; i = i+2) {
  heading = (Math.PI/6) * i
  let hpr = new HeadingPitchRoll(heading, pitch, roll)
  let orientation = Quaternion.fromHeadingPitchRoll(hpr);
  }
  // todo
```

### 基于旋转轴和旋转角度创建

Quaternion.fromAxisAngle(axis, angle)

根据给定的旋转轴和角度计算旋转参数。[5]

```javascript
for(let i = 0; i < 8; i = i + 2) {
  const orientation = Quaternion.fromAxisAngle(new Cartesian3(0, 0, 1), Math.PI/6 * i)
  // todo
}
```

### 基于旋转矩阵创建

```javascript
Quaternion.fromRotationMatrix(matrix)
```

根据给定的旋转矩阵计算旋转参数[5]

matrix 是一个 3x3 的矩阵，可以基于 HeadingPitchRoll 创建。

### 调整旋转参数看看效果

…………

更多信息参考

[理解 Cesium 中的相机（2）视锥体](https://cesium.com/docs/cesiumjs-ref-doc/Quaternion.html)
