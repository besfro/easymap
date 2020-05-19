import { checkedBMap } from './utils/checked'
import { getGlobalVar } from './utils/global'
import EasyMap from './easymap'

const BMapURL = 'http://api.map.baidu.com/api?v=3.0'
const BMapCallbackName = '_BMapCallback'
const defOpts = {
  // 初始化的中心坐标
  basePoint: [113.95683036359692, 22.548633292515582],
  // 地图缩放级别
  zoom: 15,
  // 是否滚轮缩放
  enableScrollWheelZoom: true,
  // 缩放导航
  navigation: true,
  navigationAnchor: 'BMAP_ANCHOR_TOP_LEFT',
  navigationType: 'BMAP_NAVIGATION_CONTROL_LARGE',
  // 信息窗口参数
  infoWidth: 300,
  infoHeight: 90,
  // 标注物参数
  // icon 最好是 png 透明底
  markerIcon: 'icon.png',
  markerWidth: 40,
  markerHeight: 50
}

// map install
// append dependency script
// @params {String} ak - 百度开发者应用密钥, 影响HTTP接口调用
// @return {Promise}
const installScript = ak => {
  // 插入 API script
  if (!checkedBMap()) {
    let src = `${BMapURL}&ak=${this.ak}&callback=${BMapCallbackName}`
    let script = document.createElement('script')
    script.src = src
    document.body.append(script)
  }
  // 返回 promise
  return new Promise(resolve => {
    window[callbackName] = () => {
      if (checkedBMap()) {
        resolve(true)
      } else {
        resolve(false)
      }
    }
  })
}

// map initialize 
const initialize = opts => {
  // merge config
  const {
    id, 
    basePoint,
    navigation, 
    enableScrollWheelZoom, 
    navigationAnchor,
    navigationType
  } 
  = options 
  = Object.assign({}, defOpts, opts) 

  // instance baidu map
  const map = new BMap.Map(id)
  
  // 开启鼠标滚轮缩放
  map.enableScrollWheelZoom(enableScrollWheelZoom)

  // 缩放导航控件
  // http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a2b1
  navigation && map.addControl(
    new BMap.NavigationControl({ 
      anchor: getGlobalVar(navigationAnchor), 
      type: getGlobalVar(navigationType)
    })
  )

  // 创建点坐标
  const [ lng, lat ] = basePoint
  const point = new BMap.Point(lng, lat)

  // 初始化地图，设置中心点坐标和地图级别
  map.centerAndZoom(
    new BMap.Point(lng, lat), 15
  )
  
  // use
  EasyMap.use()
  EasyMap.use()
  // 
  return new EasyMap(map, options)
}

const easymap = opts => {
  // 百度开发者应用密钥, 影响HTTP接口调用
  const ak = opts.ak
  
  if (!ak) {
    console.error(`[easymap]: 请申请并配置百度开发者 ak http://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/getkey`)
    return false
  }

  // append baidu api js script
  if (!await install(ak)) {
    console.error('[easymap]: 百度地图Javascript API安装失败!')
    return false
  }

  // initialize
  return initialize(opts)
}

export {
  easymap,
  installScript,
  initialize
}