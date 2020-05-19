
// 访问百度 JS API 占用的全局变量

// 控件的定位位置
// ControlAnchor
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a2b1
// BMAP_ANCHOR_TOP_LEFT	控件将定位到地图的左上角
// BMAP_ANCHOR_TOP_RIGHT	控件将定位到地图的右上角
// BMAP_ANCHOR_BOTTOM_LEFT	控件将定位到地图的左下角
// BMAP_ANCHOR_BOTTOM_RIGHT	控件将定位到地图的右下角 

// 缩放导航类型
// NavigationControlType
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a2b3
// BMAP_NAVIGATION_CONTROL_LARGE	标准的平移缩放控件（包括平移、缩放按钮和滑块）
// BMAP_NAVIGATION_CONTROL_SMALL	仅包含平移和缩放按钮
// BMAP_NAVIGATION_CONTROL_PAN	仅包含平移按钮
// BMAP_NAVIGATION_CONTROL_ZOOM	仅包含缩放按钮

// 控件的外观样式
// MapTypeControlType
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a2b17
// BMAP_MAPTYPE_CONTROL_HORIZONTAL	按钮水平方式展示，默认采用此类型展示
// BMAP_MAPTYPE_CONTROL_DROPDOWN	按钮呈下拉列表方式展示
// BMAP_MAPTYPE_CONTROL_MAP	以图片方式展示类型控件，设置该类型后无法指定 maptypes属性

// 动画效果
// Animation
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a3b4
// BMAP_ANIMATION_DROP	坠落动画
// BMAP_ANIMATION_BOUNCE	跳动动画

// 地图类型
// MapType
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_webgl_1_0.html#a5b0
// BMAP_NORMAL_MAP	此地图类型展示普通街道视图
// BMAP_EARTH_MAP	此地图类型展示地球卫星视图

//常量表示长度单位制。
// LengthUnit
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_webgl_1_0.html#a2b6
// BMAP_UNIT_METRIC	公制单位
// BMAP_UNIT_IMPERIAL	英制单位

// 此常量用于描述对象当前状态
// HighlightModes
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a7b26
// BMAP_HIGHLIGHT_STEP	驾车结果展现中点击列表后的展现点步骤
// BMAP_HIGHLIGHT_ROUTE	驾车结果展现中点击列表后的展现路段

// 此常量表示公交方案的策略
// TransitPolicy
// http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a7b9
// BMAP_TRANSIT_POLICY_LEAST_TIME	最少时间
// BMAP_TRANSIT_POLICY_LEAST_TRANSFER	最少换乘
// BMAP_TRANSIT_POLICY_LEAST_WALKING	最少步行
// BMAP_TRANSIT_POLICY_AVOID_SUBWAYS	不乘地铁
const getGlobalVar = name => window[name]

export {
  getGlobalVar
}