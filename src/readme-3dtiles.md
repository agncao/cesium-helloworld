# [cesium数据和模型加载](https://juejin.cn/post/7291195694466744361)

## CZML（Cesium Language）

## [3DTiles三位模型](http://mars3d.cn/dev/guide/map/tileset.html#_3-4-%E5%8D%95%E4%B8%AAtile%E7%93%A6%E7%89%87%E7%9A%84%E5%86%85%E9%83%A8%E6%9E%84%E6%88%90)

### 3D Tiles 数据结构

#### 数据结构特点

不记录模型数据（指三维模型的顶点、贴图材质、法线、颜色等信息），只记录各级“Tile”的逻辑关系（指LOD是如何组织的），以及“Tile”自己的属性信息（如房子的名称、建设年限、面积等）。

#### 3D Tiles支持的模型

- 城市建筑白膜
- 倾斜摄影
- 点云数据
- 人工建模
- BIM模型

这些数据的原始格式都需要转换为3dtiles格式后，才能在平台加载使用。

#### LOD树结构

- 四叉树：
- 八叉树:
- KD树：
- 格网结构：

#### 构成3dtiles的成员：Tile瓦片

瓦片对象会引用一个二进制的瓦片数据文件,目前这些文件有以下类型：

| 文件后缀名 | 名称         | 英文名称          | 对应实际数据                                               |
| ---------- | ------------ | ----------------- | ---------------------------------------------------------- |
| b3dm       | 批量三维模型 | Batch 3D Model    | 传统三维建模数据、BIM数据、倾斜摄影数据                    |
| i3dm       | 实例三维模型 | Instance 3D Model | 一个模型多次渲染的数据，灯塔、树木、椅子等                 |
| pnts       | 点云         | PointCloud        | 点云数据                                                   |
| cmpt       | 复合模型     | Component         | 前三种数据的复合（允许一个cmpt文件内嵌多个其他类型的瓦片） |

#### 单个Tile瓦片的内部构成

![map-tileset-data](/images/map-tileset-data.png)

每一种瓦片二进制数据文件都有一个记录该瓦片的文件头信息，文件头包括若干个因瓦片不同而不太一致的数据信息，紧随其后的是两大数据表：FeatureTable（我翻译其为：要素表）、BatchTable（我翻译其为：批量表）。

（1）FeatureTable 要素表: 记录渲染相关的数据

（2）BatchTable 批量表: 记录属性数据

（3）代码中如何查询瓦片的批量表

#### [数据规范细读 Tileset与Tile](https://juejin.cn/post/7257894053902123065?from=search-suggest)

#### [cesium 如何实现 3D Tiles 数据结构](https://cloud.tencent.com/developer/article/1149083)

#### [调用Cesium3DTileset的API](https://blog.csdn.net/lethe0624/article/details/113757903)

#### [Cesium种加载大规模3dtiles数据稳定流畅之性能优化思路](https://juejin.cn/post/7257710391019077690?from=search-suggest)

#### [3dtiles操作（移动+旋转）](https://juejin.cn/post/7322356470254174227)

#### [3dtiles模型展示优化，平移、旋转、缩放](https://www.bilibili.com/video/BV12u4y1o74V/?spm_id_from=333.788&vd_source=8c4e01de2e9cd590661c06570eff07ff)
