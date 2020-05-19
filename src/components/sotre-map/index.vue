<template>
  <div id="container" :style="{ height }" v-loading="loading">
    <div id="tool" :style="{ width: toolWidth }">
      <el-select v-model="searchParams.city" class="city" placeholder="选择城市">
        <el-option v-for="item of cityOptions" :value="item.name" :key="item.name"></el-option>
      </el-select>
      <el-input v-model="searchParams.address" class="address" placeholder="输入地址"></el-input>
      <el-button icon="el-icon-search" class="button" type="primary" :loading="buttonLoading" @click="search"></el-button>
    </div>
    <div id="mapss"></div>
  </div>
</template>

<script>
/*global BMap, BMAP_ANCHOR_BOTTOM_RIGHT*/
// import overlay from './overlay'
export default {
  data () {
    return {
      // 百度开发者 应用密钥 ak
      ak: 'EC0bfdef7be7f8ba6a2c4dbd8d758ca5',
      // API URL
      BMapApiUrl: 'http://api.map.baidu.com/api?v=3.0',
      // 初始坐标点
      base: [113.95683036359692, 22.548633292515582],
      // 地图实例
      map: null,
      // 信息窗口对象
      mapInfoWindow: null,
      // 地图服务范围对象
      mapCircle: null,
      // 地图标注配置
      markParams: {
        icon: require('./icon.png'),
        width: 40,
        height: 50
      },
      // 信息窗口参数
      infoWindowParams: {
        width: 300,
        height: 90
      },
      // 搜索参数
      searchParams: {
        city: '',
        address: ''
      },
      // 当前门店
      stores: [],
      // 城市可选项
      cityOptions: [
        { name: '深圳市' },
        { name: '广州市' },
        { name: '珠海市' },
        { name: '汕头市' },
        { name: '上海市' }
      ],
      // 搜索按钮 loading
      buttonLoading: false,
      // 组件 loading
      loading: true
    }
  },
  props: {
    height: {
      type: String,
      default: '100%'
    },
    toolWidth: {
      type: String,
      default: '400px'
    }
  },
  mounted() {
    this.initial()
  },
  methods: {
    // 检测是否已加载百度 script
    checkedBMap () {
      if (window.BMap) {
        return true
      }
    },
    // 插入百度地图 API script
    // https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/usage
    appendBMapApi () {
      // 回调名称
      const callbackName = 'BMapInitial'
      // 插入 API script
      const src = `${this.BMapApiUrl}&ak=${this.ak}&callback=${callbackName}`
      const script = document.createElement('script')
      script.src = src
      document.body.append(script)
      // 返回 promise
      return new Promise(resolve => {
        window[callbackName] = () => {
          if (this.checkedBMap()) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    },
    // 初始化方法
    initial () {
      Promise.all([
        // 加载 API script
        this.checkedBMap() ? Promise.resolve(1) : this.appendBMapApi(), 
        // 获取全部门店数据
        this.getAllStoreInfo()
      ])
        .then(([ isInstall, stores ]) => {
          // 脚本安装成功
          if (isInstall) {
            this.stores = stores
            this.initialBMap()
            this.initialInfoWindow()
            this.initialServiceCircle()
            this.addStoreMarker()
            this.loading = false
          } else {
            console.error('百度地图API加载失败!')
          }
        })
    },
    // 初始化地图
    initialBMap () {
      // 创建地图实例
      const map = this.map = window.map = new BMap.Map('map')
      // 创建点坐标
      const point = this.createPoint(...this.base)
      // 开启鼠标滚轮缩放
      map.enableScrollWheelZoom(true)
      // 缩放导航控件
      // http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a2b1
      map.addControl(
        new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT })
      )
      // 初始化地图，设置中心点坐标和地图级别
      map.centerAndZoom(point, 15)
    },
    // 初始化信息窗口
    initialInfoWindow () {
      const { width, height } = this.infoWindowParams
      this.mapInfoWindow = new BMap.InfoWindow('', { width, height })
    },
    // 初始化服务范围
    initialServiceCircle () {
      const point = this.map.getCenter()
      const color = 'red'
      this.mapCircle = new BMap.Circle(point, 500, {
        strokeColor: color,
        strokeWeight: 1,
        strokeOpacity: 0.5,
        fillColor: color,
        fillOpacity: 0.2
      })
    },
    // 搜索方法
    search () {
      this.buttonLoading = true
      this.getStoresByCity(this.city)
      setTimeout(() => this.buttonLoading = false, 500)
    },
    // 通过经纬度创建坐标点
    createPoint (lon, lat) {
      return new BMap.Point(lon, lat)
    },
    // 获得所有实体店信息
    getAllStoreInfo () {
      const stores = [
        { id: 668, lat: 22.53651, lon: 113.953291, name: '留学生创业大厦二期122404', number: "0001", serviceRadiusShape: '', type: 1 },
        { id: 18, lat: 22.554006, lon: 114.067305, name: '福田区深圳市政府店', number: "0003", serviceRadiusShape: [{"points":[{"lon":114.059526,"lat":22.550355},{"lon":114.05949,"lat":22.552157},{"lon":114.062832,"lat":22.552257},{"lon":114.059643,"lat":22.540466},{"lon":114.059643,"lat":22.5405}]},{"points":[{"lon":114.059656,"lat":22.54047},{"lon":114.074433,"lat":22.540658},{"lon":114.063438,"lat":22.554343},{"lon":114.063366,"lat":22.55411}]},{"points":[{"lon":114.063546,"lat":22.554243},{"lon":114.074362,"lat":22.554377},{"lon":114.074577,"lat":22.540591},{"lon":114.074613,"lat":22.540525}]}], type: 1 },
        { id: 715, lat: 22.536523, lon: 113.953286, name: '留学生创业大厦二期200509', number: "0004", serviceRadiusShape: [{"points":[{"lon":113.948471,"lat":22.544338},{"lon":113.948471,"lat":22.544338},{"lon":113.948471,"lat":22.544338},{"lon":113.948471,"lat":22.544338}]},{"points":[{"lon":113.946423,"lat":22.544105},{"lon":113.962988,"lat":22.544105},{"lon":113.962988,"lat":22.530151},{"lon":113.946423,"lat":22.530151}]}], type: 1 },
        { id: 48, lat: 22.655027, lon: 114.131557, name: '百果园建升大厦第三分店', number: "0007", serviceRadiusShape: '', type: 1 },
        { id: 363, lat: 22.536972, lon: 113.954075, name: '留创百果园二店0423', number: "000789", serviceRadiusShape: [{"points":[{"lon":113.949394,"lat":22.541003},{"lon":113.959275,"lat":22.541003},{"lon":113.959275,"lat":22.532925},{"lon":113.949394,"lat":22.532925}]}], type: 1 },
        { id: 46, lat: 22.654914, lon: 114.131285, name: '百果园建升大厦店', number: "0008", serviceRadiusShape: '', type: 1 },
        { id: 47, lat: 22.654668, lon: 114.131323, name: '百果园建升大厦第2分店', number: "0009", serviceRadiusShape: [{"points":[{"lon":114.125942,"lat":22.658128},{"lon":114.126733,"lat":22.659729},{"lon":114.128745,"lat":22.660363},{"lon":114.131691,"lat":22.66063},{"lon":114.132769,"lat":22.660663},{"lon":114.132805,"lat":22.660196},{"lon":114.133524,"lat":22.660129},{"lon":114.135392,"lat":22.660096},{"lon":114.137548,"lat":22.659963},{"lon":114.138123,"lat":22.659963},{"lon":114.138051,"lat":22.657761},{"lon":114.138123,"lat":22.654826},{"lon":114.138123,"lat":22.652925},{"lon":114.138698,"lat":22.651725},{"lon":114.139273,"lat":22.650724},{"lon":114.139075,"lat":22.65034},{"lon":114.138357,"lat":22.650174},{"lon":114.137548,"lat":22.64994},{"lon":114.137027,"lat":22.64969},{"lon":114.136937,"lat":22.64959},{"lon":114.136901,"lat":22.64934},{"lon":114.136452,"lat":22.649023},{"lon":114.135536,"lat":22.648773},{"lon":114.134368,"lat":22.648189},{"lon":114.133434,"lat":22.647522},{"lon":114.132266,"lat":22.647139},{"lon":114.131745,"lat":22.647155},{"lon":114.130991,"lat":22.647539},{"lon":114.130218,"lat":22.648206},{"lon":114.128242,"lat":22.650124},{"lon":114.128817,"lat":22.650607},{"lon":114.12808,"lat":22.651358},{"lon":114.127379,"lat":22.650907},{"lon":114.126283,"lat":22.651908},{"lon":114.125798,"lat":22.651775},{"lon":114.124038,"lat":22.650607},{"lon":114.123714,"lat":22.650524},{"lon":114.122762,"lat":22.651308},{"lon":114.122403,"lat":22.651608},{"lon":114.122205,"lat":22.652008},{"lon":114.122187,"lat":22.652659},{"lon":114.122241,"lat":22.652959},{"lon":114.123445,"lat":22.653059},{"lon":114.12411,"lat":22.653142},{"lon":114.124523,"lat":22.653409},{"lon":114.123732,"lat":22.654276},{"lon":114.1249,"lat":22.655327},{"lon":114.126355,"lat":22.656744},{"lon":114.126499,"lat":22.656844},{"lon":114.126625,"lat":22.657345},{"lon":114.126625,"lat":22.657595}]}], type: 1 },
        { id: 42, lat: 22.536665, lon: 113.953402, name: '妖魔鬼怪魑魅魍魉光怪陆离', number: "0013", serviceRadiusShape: [{"points":[{"lon":113.950668,"lat":22.539971},{"lon":113.955519,"lat":22.540321},{"lon":113.958124,"lat":22.536282},{"lon":113.955698,"lat":22.53286},{"lon":113.948638,"lat":22.536649},{"lon":113.949536,"lat":22.538869}]}], type: 1 },
        { id: 493, lat: 22.508064, lon: 113.939537, name: '招商海月店', number: "0023", serviceRadiusShape: [{"points":[{"lon":113.935086,"lat":22.510226},{"lon":113.961927,"lat":22.510827},{"lon":113.962646,"lat":22.510827},{"lon":113.960849,"lat":22.498673},{"lon":113.94468,"lat":22.498773},{"lon":113.93717,"lat":22.497605}]}], type: 1 },
        { id: 272, lat: 22.528127, lon: 113.945443, name: 'A8门店', number: "00255", serviceRadiusShape: [{}], type: 1 },
        { id: 551, lat: 22.57981, lon: 113.90271, name: 'Test-建安新村店', number: "0031", serviceRadiusShape: [{"points":[{"lon":113.878555,"lat":22.599543},{"lon":113.93389,"lat":22.599543},{"lon":113.93389,"lat":22.562302},{"lon":113.878555,"lat":22.562302}]}], type: 1 },
        { id: 563, lat: 22.647267, lon: 114.059567, name: '水斗富豪店1', number: "0059", serviceRadiusShape: [{"points":[{"lon":114.057551,"lat":22.648756},{"lon":114.060605,"lat":22.648756},{"lon":114.060605,"lat":22.646517},{"lon":114.057551,"lat":22.646517}]}], type: 1 },
        { id: 491, lat: 22.536627, lon: 113.953268, name: '新留创店', number: "0061", serviceRadiusShape: '', type: 1 },
        { id: 620, lat: 22.549457, lon: 114.064408, name: '（名称）渣渣辉测试专用', number: "006600", serviceRadiusShape: [{"points":[{"lon":113.951064,"lat":22.537896},{"lon":113.956597,"lat":22.537896},{"lon":113.956597,"lat":22.535225},{"lon":113.951064,"lat":22.535225}]}], type: 1 },
        { id: 622, lat: 22.55998, lon: 114.068339, name: '渣渣辉测试专用2', number: "006601", serviceRadiusShape: '', type: 1 },
        { id: 33, lat: 22.639974, lon: 114.187297, name: '龙岗区六约店', number: "0078", serviceRadiusShape: '', type: 1 },
        { id: 34, lat: 22.549136, lon: 114.128212, name: '水斗富豪店', number: "0079", serviceRadiusShape: '', type: 1 },
        { id: 562, lat: 22.704468, lon: 114.240315, name: '名居广场扫码购', number: "0080", serviceRadiusShape: [{"points":[{"lon":114.229967,"lat":22.715769},{"lon":114.252245,"lat":22.715769},{"lon":114.252245,"lat":22.697566},{"lon":114.229967,"lat":22.697566}]}], type: 1 },
        { id: 624, lat: 22.566508, lon: 113.905743, name: '正华测试店', number: "00800", serviceRadiusShape: [{"points":[{"lon":113.87415,"lat":22.586648},{"lon":113.931929,"lat":22.586648},{"lon":113.931929,"lat":22.552807},{"lon":113.87415,"lat":22.552807}]}], type: 1 },
        { id: 719, lat: 22.709258, lon: 114.237433, name: '龙城医院扫码购', number: "0081", serviceRadiusShape: [{"points":[{"lon":114.232061,"lat":22.714759},{"lon":114.243308,"lat":22.714759},{"lon":114.243308,"lat":22.700356},{"lon":114.232061,"lat":22.700356}]}], type: 1 },
        { id: 260, lat: 22.543956, lon: 113.950436, name: 'Test-0087测试店1', number: "0087", serviceRadiusShape: [{"points":[{"lon":113.943053,"lat":22.543427},{"lon":113.948802,"lat":22.537752},{"lon":113.960516,"lat":22.542625},{"lon":113.957785,"lat":22.550703},{"lon":113.944202,"lat":22.550636},{"lon":113.941543,"lat":22.55057},{"lon":113.939244,"lat":22.548634},{"lon":113.940106,"lat":22.546297},{"lon":113.936225,"lat":22.54376},{"lon":113.936369,"lat":22.539955},{"lon":113.937663,"lat":22.538887},{"lon":113.941876,"lat":22.539771},{"lon":113.942666,"lat":22.540172}]},{"points":[{"lon":113.959762,"lat":22.542175},{"lon":113.962277,"lat":22.537902},{"lon":113.955845,"lat":22.530358},{"lon":113.956276,"lat":22.530458},{"lon":113.947077,"lat":22.537068},{"lon":113.947293,"lat":22.537302},{"lon":113.947042,"lat":22.536901}]}], type: 1 },
        { id: 326, lat: 22.528177, lon: 113.945878, name: '后海货柜门店', number: "0089", serviceRadiusShape: [{"points":[{"lon":113.941809,"lat":22.530543},{"lon":113.941809,"lat":22.524383},{"lon":113.951475,"lat":22.524383},{"lon":113.951475,"lat":22.530543}]}], type: 2 },
        { id: 319, lat: 22.548989, lon: 114.064045, name: '市民中心店', number: "0091", serviceRadiusShape: [{"points":[{"lon":114.062356,"lat":22.549619},{"lon":114.062356,"lat":22.548142},{"lon":114.066066,"lat":22.548142},{"lon":114.066066,"lat":22.549619}]}], type: 0 },
        { id: 337, lat: 22.530194, lon: 114.04277, name: '上沙货柜店', number: "0099", serviceRadiusShape: [{"points":[{"lon":114.041301,"lat":22.530891},{"lon":114.043839,"lat":22.530774},{"lon":114.044683,"lat":22.529647},{"lon":114.043763,"lat":22.529001},{"lon":114.040794,"lat":22.529297}]}], type: 2 },
        { id: 392, lat: 22.695855, lon: 113.820469, name: '桥头店', number: "0102", serviceRadiusShape: [{"points":[{"lon":113.815838,"lat":22.698998},{"lon":113.824175,"lat":22.698998},{"lon":113.824175,"lat":22.69473},{"lon":113.815838,"lat":22.69473}]}], type: 1 },
        { id: 496, lat: 22.53315, lon: 113.928957, name: 'Test-学府中路店', number: "0116", serviceRadiusShape: [{"points":[{"lon":113.907928,"lat":22.539781},{"lon":113.922875,"lat":22.539781},{"lon":113.922875,"lat":22.527897},{"lon":113.907928,"lat":22.527897}]}], type: 1 },
        { id: 566, lat: 22.609324, lon: 113.855822, name: 'test1-百果园-香格丽湾园店', number: "011901", serviceRadiusShape: [{"points":[{"lon":113.845561,"lat":22.616747},{"lon":113.87305,"lat":22.615312},{"lon":113.870247,"lat":22.599865},{"lon":113.846963,"lat":22.597863},{"lon":113.844807,"lat":22.600065}]}], type: 1 },
        { id: 494, lat: 22.542581, lon: 114.058803, name: '世纪广场店', number: "0122", serviceRadiusShape: [{"points":[{"lon":114.04662,"lat":22.553273},{"lon":114.08672,"lat":22.553273},{"lon":114.08672,"lat":22.526702},{"lon":114.04662,"lat":22.526702}]}], type: 1 },
        { id: 452, lat: 22.536964, lon: 113.953969, name: '测试01230', number: "01230", serviceRadiusShape: '', type: 1 },
        { id: 348, lat: 22.632236, lon: 114.041462, name: '深圳世纪春城店', number: "0136", serviceRadiusShape: '', type: 1 },
        { id: 683, lat: 22.553646, lon: 113.903568, name: '凯旋城店123qwe@#', number: "0150", serviceRadiusShape: '', type: 1 },
        { id: 267, lat: 22.549324, lon: 114.117118, name: '百果园地王大厦店测试缓存店', number: "020801", serviceRadiusShape: [{"points":[{"lon":114.115465,"lat":22.550158},{"lon":114.115465,"lat":22.54851},{"lon":114.119287,"lat":22.54851},{"lon":114.119287,"lat":22.550158}]}], type: 1 },
        { id: 261, lat: 22.580554, lon: 113.885014, name: '百果园新安区域店', number: "020809", serviceRadiusShape: [{"points":[{"lon":113.883779,"lat":22.581342},{"lon":113.883779,"lat":22.579799},{"lon":113.886793,"lat":22.579799},{"lon":113.886793,"lat":22.581342}]}], type: 1 },
        { id: 262, lat: 22.569074, lon: 113.918646, name: '百果园中山公园区域店', number: "020909", serviceRadiusShape: [{"points":[{"lon":113.916795,"lat":22.569821},{"lon":113.916795,"lat":22.568173},{"lon":113.921911,"lat":22.568173},{"lon":113.921911,"lat":22.569821}]}], type: 1 },
        { id: 263, lat: 22.529801, lon: 114.039123, name: '上沙幼儿园区域一店', number: "021009", serviceRadiusShape: [{"points":[{"lon":114.038481,"lat":22.530327},{"lon":114.038481,"lat":22.529042},{"lon":114.041382,"lat":22.529042},{"lon":114.041382,"lat":22.530327}]}], type: 1 },
        { id: 264, lat: 22.526584, lon: 114.048721, name: '百果园沙尾区域店', number: "021109", serviceRadiusShape: [{"points":[{"lon":114.047315,"lat":22.52726},{"lon":114.047315,"lat":22.526146},{"lon":114.049794,"lat":22.526146},{"lon":114.049794,"lat":22.52726}]}], type: 1 },
        { id: 265, lat: 22.550451, lon: 114.091911, name: '百果园华强北店', number: "021309", serviceRadiusShape: [{"points":[{"lon":114.091246,"lat":22.551002},{"lon":114.091246,"lat":22.549375},{"lon":114.094561,"lat":22.549375},{"lon":114.094561,"lat":22.551002}]}], type: 1 },
        { id: 595, lat: 22.53789, lon: 113.928606, name: '常丰花园店', number: "0216", serviceRadiusShape: [{"points":[{"lon":113.92711,"lat":22.538495},{"lon":113.930187,"lat":22.538495},{"lon":113.930187,"lat":22.537222},{"lon":113.92711,"lat":22.537222}]}], type: 1 },
        { id: 627, lat: 22.535424, lon: 113.942277, name: 'Test-华华殿', number: "023123", serviceRadiusShape: [{"points":[{"lon":113.938886,"lat":22.538261},{"lon":113.946126,"lat":22.538261},{"lon":113.946126,"lat":22.532753},{"lon":113.938886,"lat":22.532753}]}], type: 1 },
        { id: 635, lat: 22.554864, lon: 114.088698, name: '鼎太风华店', number: "0237", serviceRadiusShape: '', type: 1 },
        { id: 497, lat: 22.541664, lon: 113.993518, name: '华侨城店', number: "0300", serviceRadiusShape: [{"points":[{"lon":113.980924,"lat":22.543003},{"lon":113.988829,"lat":22.539665},{"lon":114.000327,"lat":22.539532},{"lon":114.004352,"lat":22.538597},{"lon":114.020449,"lat":22.540734},{"lon":114.022605,"lat":22.540867},{"lon":114.015562,"lat":22.547142},{"lon":114.00392,"lat":22.550347},{"lon":113.992997,"lat":22.555153},{"lon":113.987823,"lat":22.559826},{"lon":113.978768,"lat":22.560493},{"lon":113.980636,"lat":22.56036}]}], type: 1 },
        { id: 266, lat: 22.527814, lon: 113.943641, name: '后海虚拟门店', number: "030909", serviceRadiusShape: [{"points":[{"lon":114.127708,"lat":22.556396},{"lon":114.127708,"lat":22.554685},{"lon":114.131495,"lat":22.554685},{"lon":114.131495,"lat":22.556396}]},{"points":[{"lon":113.94162,"lat":22.530009},{"lon":113.94162,"lat":22.525919},{"lon":113.949049,"lat":22.525919},{"lon":113.949049,"lat":22.530009}]}], type: 0 },
        { id: 492, lat: 22.536696, lon: 113.953386, name: '百果园-口碑测试店铺', number: "031001", serviceRadiusShape: [{"points":[{"lon":113.944686,"lat":22.545373},{"lon":113.968329,"lat":22.545373},{"lon":113.968329,"lat":22.529416},{"lon":113.944686,"lat":22.529416}]}], type: 1 },
        { id: 373, lat: 22.560217, lon: 113.890481, name: '裕安二路店', number: "0351", serviceRadiusShape: [{"points":[{"lon":113.875214,"lat":22.568133},{"lon":113.890449,"lat":22.554917},{"lon":113.907409,"lat":22.564529},{"lon":113.892174,"lat":22.565597},{"lon":113.883263,"lat":22.575475}]}], type: 1 },
        { id: 128, lat: 22.463466, lon: 113.904094, name: '产品百果园', number: "0509", serviceRadiusShape: '', type: 1 },
        { id: 579, lat: 22.547922, lon: 114.096172, name: '东莞厚街镇汇景新城店', number: "0564", serviceRadiusShape: [{"points":[{"lon":114.09946,"lat":22.546583},{"lon":114.103376,"lat":22.546583},{"lon":114.103376,"lat":22.545089},{"lon":114.09946,"lat":22.545089}]}], type: 1 },
        { id: 544, lat: 22.605604, lon: 113.853342, name: '宝安固戍新天地购物广场店', number: "075501", serviceRadiusShape: [{"points":[{"lon":113.852803,"lat":22.605729},{"lon":113.854541,"lat":22.605729},{"lon":113.854541,"lat":22.604674},{"lon":113.852803,"lat":22.604674}]}], type: 1 },
        { id: 545, lat: 22.536937, lon: 113.954032, name: '百果园留创二期测试店', number: "075502", serviceRadiusShape: [{"points":[{"lon":113.950986,"lat":22.538778},{"lon":113.956574,"lat":22.538778},{"lon":113.956574,"lat":22.534964},{"lon":113.950986,"lat":22.534964}]}], type: 1 },
        { id: 660, lat: 22.541232, lon: 113.97934, name: '世界之窗测试店', number: "080019", serviceRadiusShape: [{"points":[{"lon":113.974705,"lat":22.544153},{"lon":113.984496,"lat":22.544153},{"lon":113.984496,"lat":22.536968},{"lon":113.974705,"lat":22.536968}]}], type: 1 },
        { id: 481, lat: 22.536894, lon: 113.954054, name: '留创测试01店', number: "08080", serviceRadiusShape: [{"points":[{"lon":113.947564,"lat":22.541576},{"lon":113.959547,"lat":22.541576},{"lon":113.959547,"lat":22.532229},{"lon":113.947564,"lat":22.532229}]}], type: 1 },
        { id: 659, lat: 22.536506, lon: 113.953593, name: 'YYJ特价专用门店', number: "080808", serviceRadiusShape: [{"points":[{"lon":113.944825,"lat":22.540841},{"lon":113.953701,"lat":22.542978},{"lon":113.962792,"lat":22.538338},{"lon":113.961642,"lat":22.53096},{"lon":113.95,"lat":22.528991},{"lon":113.943496,"lat":22.531995},{"lon":113.940981,"lat":22.536502}]}], type: 1 },
        { id: 504, lat: 22.546431, lon: 113.956554, name: '测试门店资质非必填00', number: "08082", serviceRadiusShape: [{"points":[{"lon":113.952557,"lat":22.537088},{"lon":113.954892,"lat":22.537088},{"lon":113.954892,"lat":22.536041},{"lon":113.952557,"lat":22.536041}]}], type: 1 },
        { id: 505, lat: 22.555398, lon: 114.061677, name: '测试0403', number: "08083", serviceRadiusShape: [{"points":[{"lon":114.06139,"lat":22.555577},{"lon":114.062059,"lat":22.555577},{"lon":114.062059,"lat":22.555219},{"lon":114.06139,"lat":22.555219}]}], type: 1 },
        { id: 506, lat: 22.551126, lon: 114.066277, name: '测试门店资质', number: "08084", serviceRadiusShape: [{"points":[{"lon":113.953484,"lat":22.537247},{"lon":113.954692,"lat":22.537247},{"lon":113.954692,"lat":22.536667},{"lon":113.953484,"lat":22.536667}]}], type: 1 },
        { id: 590, lat: 22.58487, lon: 113.874282, name: '有运力测试店铺cb', number: "0814", serviceRadiusShape: [{"points":[{"lon":113.858353,"lat":22.58606},{"lon":113.862665,"lat":22.58606},{"lon":113.862665,"lat":22.583532},{"lon":113.858353,"lat":22.583532}]}], type: 1 },
        { id: 541, lat: 22.558069, lon: 114.064552, name: '测试门店资质1', number: "091423", serviceRadiusShape: [{"points":[{"lon":114.058488,"lat":22.561407},{"lon":114.07164,"lat":22.561407},{"lon":114.07164,"lat":22.555132},{"lon":114.058488,"lat":22.555132}]}], type: 1 },
        { id: 381, lat: 22.533502, lon: 114.068217, name: '测试门店522', number: "10000", serviceRadiusShape: [{"points":[{"lon":114.066317,"lat":22.534687},{"lon":114.070557,"lat":22.534687},{"lon":114.070557,"lat":22.531916},{"lon":114.066317,"lat":22.531916}]}], type: 1 },
        { id: 185, lat: 22.546166, lon: 114.068228, name: '市民中心虚拟店', number: "100008", serviceRadiusShape: '', type: 0 },
        { id: 343, lat: 22.538935, lon: 113.950624, name: '港大研究院货柜港大研究院货柜港大研究院货柜港大研究院货柜港大研究院货柜港大研究院货柜', number: "100020", serviceRadiusShape: [{"points":[{"lon":113.950175,"lat":22.539298},{"lon":113.950179,"lat":22.538672},{"lon":113.9511,"lat":22.538689},{"lon":113.951289,"lat":22.538939},{"lon":113.951244,"lat":22.539089},{"lon":113.951087,"lat":22.539169},{"lon":113.950988,"lat":22.539198},{"lon":113.950664,"lat":22.539198},{"lon":113.950655,"lat":22.539302}]}], type: 2 },
        { id: 667, lat: 22.536968, lon: 113.954072, name: 'wjyyyyyy', number: "100100", serviceRadiusShape: [{"points":[{"lon":113.951593,"lat":22.538441},{"lon":113.957054,"lat":22.538441},{"lon":113.957054,"lat":22.53552},{"lon":113.951593,"lat":22.53552}]}], type: 1 },
        { id: 315, lat: 22.534168, lon: 113.933503, name: '桃苑虚拟店', number: "100101", serviceRadiusShape: [{"points":[{"lon":113.930341,"lat":22.53509},{"lon":113.927377,"lat":22.535407},{"lon":113.927071,"lat":22.533822},{"lon":113.927987,"lat":22.531518},{"lon":113.932587,"lat":22.531084},{"lon":113.93494,"lat":22.530567},{"lon":113.937096,"lat":22.532253},{"lon":113.938462,"lat":22.536075},{"lon":113.933808,"lat":22.537577},{"lon":113.93185,"lat":22.539296},{"lon":113.927969,"lat":22.538462},{"lon":113.92743,"lat":22.535441},{"lon":113.92743,"lat":22.535391},{"lon":113.92743,"lat":22.53529}]}], type: 0 },
        { id: 316, lat: 22.549189, lon: 113.93627, name: '腾讯虚拟店', number: "100102", serviceRadiusShape: [{"points":[{"lon":113.927965,"lat":22.551188},{"lon":113.928109,"lat":22.546448},{"lon":113.948698,"lat":22.545513},{"lon":113.948626,"lat":22.557563},{"lon":113.92969,"lat":22.557963},{"lon":113.921569,"lat":22.554759},{"lon":113.920779,"lat":22.551888},{"lon":113.923114,"lat":22.547549},{"lon":113.928181,"lat":22.546348},{"lon":113.928145,"lat":22.546448},{"lon":113.928145,"lat":22.544579}]}], type: 0 },
        { id: 317, lat: 22.531197, lon: 113.92258, name: '阳光棕榈虚拟店', number: "100107", serviceRadiusShape: [{"points":[{"lon":113.916391,"lat":22.534243},{"lon":113.916499,"lat":22.528768},{"lon":113.922284,"lat":22.528702},{"lon":113.925553,"lat":22.529603},{"lon":113.925913,"lat":22.530204},{"lon":113.925086,"lat":22.533943}]}], type: 0 },
        { id: 320, lat: 22.540928, lon: 113.990779, name: '汉唐虚拟店', number: "100109", serviceRadiusShape: [{"points":[{"lon":113.990631,"lat":22.542134},{"lon":113.98993,"lat":22.541216},{"lon":113.989984,"lat":22.539964},{"lon":113.994224,"lat":22.539998},{"lon":113.993685,"lat":22.540265},{"lon":113.993811,"lat":22.542701},{"lon":113.992032,"lat":22.542801},{"lon":113.991152,"lat":22.542184}]}], type: 0 },
        { id: 332, lat: 22.543331, lon: 113.98026, name: '世界之窗货柜', number: "100111", serviceRadiusShape: [{"points":[{"lon":113.979317,"lat":22.543844},{"lon":113.978935,"lat":22.543031},{"lon":113.978818,"lat":22.542772},{"lon":113.981738,"lat":22.541579},{"lon":113.982438,"lat":22.543072},{"lon":113.979451,"lat":22.544165},{"lon":113.979451,"lat":22.54417}]}], type: 2 },
        { id: 321, lat: 22.523947, lon: 113.944488, name: '百果盒子', number: "100201", serviceRadiusShape: [{"points":[{"lon":113.942593,"lat":22.525383},{"lon":113.942593,"lat":22.522687},{"lon":113.946797,"lat":22.522687},{"lon":113.946797,"lat":22.525383}]},{"points":[{"lon":113.941308,"lat":22.530782},{"lon":113.941308,"lat":22.526626},{"lon":113.949465,"lat":22.526626},{"lon":113.949465,"lat":22.530782}]}], type: 2 },
        { id: 328, lat: 22.530623, lon: 113.945246, name: '深圳软件产业基地4A货柜', number: "100204", serviceRadiusShape: [{"points":[{"lon":113.944312,"lat":22.531161},{"lon":113.944312,"lat":22.529834},{"lon":113.946248,"lat":22.529834},{"lon":113.946248,"lat":22.531161}]}], type: 2 },
        { id: 9, lat: 22.663363, lon: 114.037685, name: '宝安区大润发店', number: "1008", serviceRadiusShape: '', type: 1 },
        { id: 254, lat: 22.5232, lon: 113.947082, name: '我是门店', number: "10086", serviceRadiusShape: [{"points":[{"lon":114.123321,"lat":22.546421},{"lon":114.123321,"lat":22.544827},{"lon":114.126537,"lat":22.544827},{"lon":114.126537,"lat":22.546421}]},{"points":[{"lon":113.939195,"lat":22.528633},{"lon":113.939195,"lat":22.518284},{"lon":113.95364,"lat":22.518284},{"lon":113.95364,"lat":22.528633}]},{"points":[{"lon":113.944513,"lat":22.531437},{"lon":113.944513,"lat":22.527298},{"lon":113.951628,"lat":22.527298},{"lon":113.951628,"lat":22.531437}]}], type: 1 },
        { id: 21, lat: 22.664138, lon: 114.039343, name: '宝安区大润发店2', number: "1009", serviceRadiusShape: '', type: 1 },
        { id: 334, lat: 22.530539, lon: 113.945237, name: '货柜门店', number: "10258", serviceRadiusShape: [{"points":[{"lon":113.943656,"lat":22.530969},{"lon":113.943656,"lat":22.529596},{"lon":113.946459,"lat":22.529596},{"lon":113.946459,"lat":22.530969}]}], type: 2 },
        { id: 51, lat: 22.506591, lon: 113.901161, name: '前海虚拟门店', number: "1046", serviceRadiusShape: '', type: 0 },
        { id: 324, lat: 22.542238, lon: 114.031917, name: '车公庙货柜店', number: "110110", serviceRadiusShape: [{"points":[{"lon":114.030677,"lat":22.542668},{"lon":114.03083,"lat":22.541437},{"lon":114.033013,"lat":22.54099},{"lon":114.034612,"lat":22.5422},{"lon":114.034594,"lat":22.542538},{"lon":114.033458,"lat":22.542856},{"lon":114.032685,"lat":22.54273},{"lon":114.032528,"lat":22.542956},{"lon":114.032447,"lat":22.542956}]}], type: 2 },
        { id: 335, lat: 22.544866, lon: 113.95747, name: '创维大厦货柜店', number: "110112", serviceRadiusShape: [{"points":[{"lon":113.956738,"lat":22.545104},{"lon":113.956787,"lat":22.544687},{"lon":113.958162,"lat":22.544799},{"lon":113.958139,"lat":22.545179}]},{"points":[{"lon":113.956785,"lat":22.54525},{"lon":113.956489,"lat":22.544507},{"lon":113.95829,"lat":22.544653},{"lon":113.958205,"lat":22.54535}]}], type: 2 },
        { id: 43, lat: 22.549472, lon: 114.117345, name: '罗湖区地王大厦店', number: "1111", serviceRadiusShape: '', type: 1 },
        { id: 57, lat: 22.596454, lon: 114.006482, name: '南山区西丽塘朗店', number: "1122", serviceRadiusShape: [{"points":[{"lon":113.98848,"lat":22.596291},{"lon":113.994337,"lat":22.596291},{"lon":113.994337,"lat":22.590469},{"lon":113.98848,"lat":22.590469}]}], type: 1 },
        { id: 31, lat: 22.57131, lon: 114.052242, name: '市场部测试用店', number: "1123", serviceRadiusShape: '', type: 1 },
        { id: 244, lat: 22.542907, lon: 113.981312, name: '深圳百果汇', number: "1129", serviceRadiusShape: [{"points":[{"lon":113.930023,"lat":22.586515},{"lon":114.028334,"lat":22.586515},{"lon":114.028334,"lat":22.525102},{"lon":113.930023,"lat":22.525102}]}], type: 0 },
        { id: 411, lat: 22.53697, lon: 113.954078, name: '果多美-京东留创二店', number: "11784314", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 },
        { id: 36, lat: 22.625597, lon: 114.154649, name: '龙岗区丹竹头店', number: "1199", serviceRadiusShape: '', type: 1 },
        { id: 3, lat: 22.661793, lon: 114.039899, name: '人民医院店-全称', number: "12", serviceRadiusShape: '', type: 0 },
        { id: 277, lat: 22.575738, lon: 113.877299, name: '坪洲百果园', number: "12012", serviceRadiusShape: [{"points":[{"lon":113.876994,"lat":22.576063},{"lon":113.876994,"lat":22.575529},{"lon":113.878,"lat":22.575529},{"lon":113.878,"lat":22.576063}]}], type: 1 },
        { id: 629, lat: 22.700499, lon: 114.063591, name: '你我你我test1', number: "120507", serviceRadiusShape: [{"points":[{"lon":114.062078,"lat":22.701881},{"lon":114.066731,"lat":22.701881},{"lon":114.066731,"lat":22.69903},{"lon":114.062078,"lat":22.69903}]}], type: 1 },
        { id: 356, lat: 22.623393, lon: 114.047568, name: '百果园民治店', number: "121562", serviceRadiusShape: [{"points":[{"lon":114.044536,"lat":22.624636},{"lon":114.050465,"lat":22.624636},{"lon":114.050465,"lat":22.621667},{"lon":114.044536,"lat":22.621667}]},{"points":[{"lon":114.046041,"lat":22.623998},{"lon":114.048031,"lat":22.624044},{"lon":114.048956,"lat":22.62321},{"lon":114.048147,"lat":22.622521},{"lon":114.046355,"lat":22.622709},{"lon":114.045893,"lat":22.622926}]}], type: 1 },
        { id: 669, lat: 22.539498, lon: 113.92242, name: '大新小学122405', number: "122405", serviceRadiusShape: '', type: 1 },
        { id: 670, lat: 22.539362, lon: 113.921856, name: '大新前海商业中心122406~三方', number: "122406", serviceRadiusShape: '', type: 1 },
        { id: 671, lat: 22.627933, lon: 114.111988, name: '深圳上水径地铁站超3KM', number: "122407", serviceRadiusShape: [{"points":[{"lon":114.09744,"lat":22.641263},{"lon":114.125611,"lat":22.629522},{"lon":114.073581,"lat":22.6039},{"lon":113.893632,"lat":22.574002},{"lon":113.928415,"lat":22.505639}]}], type: 1 },
        { id: 630, lat: 22.536665, lon: 113.953387, name: '你我你我test2', number: "122508", serviceRadiusShape: [{"points":[{"lon":113.951817,"lat":22.537732},{"lon":113.956596,"lat":22.537732},{"lon":113.956596,"lat":22.535395},{"lon":113.951817,"lat":22.535395}]}], type: 1 },
        { id: 357, lat: 22.537475, lon: 113.950393, name: '香港城市大学百果园店', number: "122525", serviceRadiusShape: [{"points":[{"lon":113.946863,"lat":22.540392},{"lon":113.954121,"lat":22.540392},{"lon":113.954121,"lat":22.533982},{"lon":113.946863,"lat":22.533982}]}], type: 1 },
        { id: 1, lat: 22.586683, lon: 113.890041, name: '宝安区西乡街道办', number: "123", serviceRadiusShape: [{"points":[{"lon":113.888133,"lat":22.587411},{"lon":113.888133,"lat":22.585843},{"lon":113.891843,"lat":22.585843},{"lon":113.891843,"lat":22.587411}]},{"points":[{"lon":113.892144,"lat":22.587991},{"lon":113.896007,"lat":22.587716},{"lon":113.894911,"lat":22.585338},{"lon":113.891847,"lat":22.587407},{"lon":113.890509,"lat":22.588174},{"lon":113.888623,"lat":22.589176}]}], type: 1 },
        { id: 444, lat: 22.536947, lon: 113.954032, name: '测试12310', number: "12310", serviceRadiusShape: '', type: 1 },
        { id: 529, lat: 22.5368, lon: 113.953383, name: '不上传图片', number: "123124", serviceRadiusShape: [{"points":[{"lon":113.957533,"lat":22.534321},{"lon":113.957821,"lat":22.534856},{"lon":113.958072,"lat":22.53539},{"lon":113.958288,"lat":22.535723},{"lon":113.958324,"lat":22.536391},{"lon":113.958324,"lat":22.537226},{"lon":113.958216,"lat":22.53766},{"lon":113.958108,"lat":22.537993},{"lon":113.958072,"lat":22.53816},{"lon":113.958036,"lat":22.538394},{"lon":113.957893,"lat":22.538728},{"lon":113.957785,"lat":22.539095},{"lon":113.957497,"lat":22.539329},{"lon":113.95721,"lat":22.539496},{"lon":113.957084,"lat":22.539729},{"lon":113.956671,"lat":22.540096},{"lon":113.956437,"lat":22.540247},{"lon":113.955952,"lat":22.540647},{"lon":113.955665,"lat":22.540731},{"lon":113.955162,"lat":22.540847},{"lon":113.954892,"lat":22.541031},{"lon":113.954677,"lat":22.541114},{"lon":113.953832,"lat":22.541165},{"lon":113.953688,"lat":22.541265},{"lon":113.953132,"lat":22.541265},{"lon":113.952754,"lat":22.541265},{"lon":113.952269,"lat":22.541248},{"lon":113.952107,"lat":22.541148},{"lon":113.951317,"lat":22.540931},{"lon":113.950994,"lat":22.540731},{"lon":113.95058,"lat":22.54053},{"lon":113.949987,"lat":22.540263},{"lon":113.949197,"lat":22.539112},{"lon":113.948963,"lat":22.538561},{"lon":113.948784,"lat":22.538311},{"lon":113.948712,"lat":22.537943},{"lon":113.948514,"lat":22.536575},{"lon":113.948874,"lat":22.537342},{"lon":113.948586,"lat":22.536708},{"lon":113.948802,"lat":22.535974},{"lon":113.948981,"lat":22.535073},{"lon":113.949125,"lat":22.534205},{"lon":113.949736,"lat":22.533504},{"lon":113.950706,"lat":22.53307},{"lon":113.951281,"lat":22.532702},{"lon":113.952179,"lat":22.532369},{"lon":113.953545,"lat":22.532302},{"lon":113.954551,"lat":22.532302},{"lon":113.955018,"lat":22.532502},{"lon":113.956096,"lat":22.532669},{"lon":113.956635,"lat":22.532769},{"lon":113.957102,"lat":22.533871},{"lon":113.957389,"lat":22.534171},{"lon":113.958683,"lat":22.535039}]}], type: 1 },
        { id: 530, lat: 22.547922, lon: 114.066277, name: '上传图片', number: "123125", serviceRadiusShape: [{"points":[{"lon":113.947751,"lat":22.53902},{"lon":113.9618,"lat":22.53902},{"lon":113.9618,"lat":22.534046},{"lon":113.947751,"lat":22.534046}]}], type: 1 },
        { id: 531, lat: 22.535914, lon: 113.960019, name: '深圳湾生态园', number: "123126", serviceRadiusShape: [{"points":[{"lon":113.959453,"lat":22.536323},{"lon":113.961389,"lat":22.536323},{"lon":113.961389,"lat":22.535447},{"lon":113.959453,"lat":22.535447}]}], type: 1 },
        { id: 532, lat: 22.543938, lon: 113.955678, name: '中兴店', number: "123127", serviceRadiusShape: [{"points":[{"lon":113.95517,"lat":22.544176},{"lon":113.956423,"lat":22.544176},{"lon":113.956423,"lat":22.543133},{"lon":113.95517,"lat":22.543133}]}], type: 1 },
        { id: 533, lat: 22.535834, lon: 113.960051, name: '深圳湾生态园店01', number: "123128", serviceRadiusShape: [{"points":[{"lon":113.958928,"lat":22.536526},{"lon":113.96147,"lat":22.536526},{"lon":113.96147,"lat":22.535425},{"lon":113.958928,"lat":22.535425}]}], type: 1 },
        { id: 535, lat: 22.543818, lon: 113.955718, name: '中兴2店不上传', number: "123129", serviceRadiusShape: [{"points":[{"lon":113.955336,"lat":22.544077},{"lon":113.956185,"lat":22.544077},{"lon":113.956185,"lat":22.543651},{"lon":113.955336,"lat":22.543651}]}], type: 1 },
        { id: 536, lat: 22.543835, lon: 113.9557, name: '中兴3店上传图片', number: "123130", serviceRadiusShape: [{"points":[{"lon":113.955148,"lat":22.544046},{"lon":113.956756,"lat":22.544046},{"lon":113.956756,"lat":22.543362},{"lon":113.955148,"lat":22.543362}]}], type: 1 },
        { id: 30, lat: 22.586683, lon: 113.890041, name: '西乡街道店', number: "12321", serviceRadiusShape: '', type: 1 },
        { id: 589, lat: 22.626739, lon: 113.902929, name: '铁岗水库店', number: "123450", serviceRadiusShape: [{"points":[{"lon":113.90199,"lat":22.627385},{"lon":113.90102,"lat":22.627402},{"lon":113.905655,"lat":22.626968},{"lon":113.904488,"lat":22.625284},{"lon":113.900553,"lat":22.624733},{"lon":113.899888,"lat":22.626134},{"lon":113.898631,"lat":22.627018}]},{"points":[{"lon":113.899134,"lat":22.628694},{"lon":113.906823,"lat":22.628961},{"lon":113.905476,"lat":22.622706},{"lon":113.89448,"lat":22.62369}]}], type: 1 },
        { id: 2, lat: 22.585749, lon: 113.875963, name: '宝安西乡店（天虹商场）', number: "123456", serviceRadiusShape: [{"points":[{"lon":113.874939,"lat":22.586684},{"lon":113.877257,"lat":22.586684},{"lon":113.877257,"lat":22.585032},{"lon":113.874939,"lat":22.585032}]}], type: 1 },
        { id: 631, lat: 22.53668, lon: 113.953381, name: '测试店铺_CB', number: "123509", serviceRadiusShape: [{"points":[{"lon":113.951589,"lat":22.53764},{"lon":113.955649,"lat":22.53764},{"lon":113.955649,"lat":22.535545},{"lon":113.951589,"lat":22.535545}]}], type: 1 },
        { id: 550, lat: 22.765052, lon: 114.008175, name: '深东店2', number: "12369", serviceRadiusShape: [{"points":[{"lon":113.993587,"lat":22.779781},{"lon":114.03225,"lat":22.779781},{"lon":114.03225,"lat":22.752855},{"lon":113.993587,"lat":22.752855}]}], type: 1 },
        { id: 511, lat: 22.537031, lon: 113.95407, name: '测试上传门店资质图片', number: "123789", serviceRadiusShape: [{"points":[{"lon":113.953311,"lat":22.537419},{"lon":113.954982,"lat":22.537419},{"lon":113.954982,"lat":22.536589},{"lon":113.953311,"lat":22.536589}]}], type: 1 },
        { id: 386, lat: 22.540795, lon: 114.067714, name: '会展中心店', number: "125463", serviceRadiusShape: [{"points":[{"lon":114.06749,"lat":22.541283},{"lon":114.068083,"lat":22.541283},{"lon":114.068083,"lat":22.540715},{"lon":114.06749,"lat":22.540715}]}], type: 1 },
        { id: 684, lat: 22.537378, lon: 113.953507, name: '测试店铺_chengbing_勿动', number: "1280", serviceRadiusShape: [{"points":[{"lon":113.951172,"lat":22.538496},{"lon":113.957532,"lat":22.538496},{"lon":113.957532,"lat":22.535292},{"lon":113.951172,"lat":22.535292}]}], type: 1 },
        { id: 628, lat: 22.532037, lon: 113.952285, name: 'Test-士大夫', number: "130152", serviceRadiusShape: [{"points":[{"lon":113.948009,"lat":22.528173},{"lon":113.946967,"lat":22.528173},{"lon":113.946967,"lat":22.519927},{"lon":113.948009,"lat":22.519927}]},{"points":[{"lon":113.948952,"lat":22.535146},{"lon":113.955779,"lat":22.535146},{"lon":113.955779,"lat":22.528803},{"lon":113.948952,"lat":22.528803}]}], type: 1 },
        { id: 60, lat: 22.53509, lon: 114.001676, name: '南山区华侨城店', number: "1314", serviceRadiusShape: [{"points":[{"lon":113.992298,"lat":22.540665},{"lon":113.992298,"lat":22.530917},{"lon":114.007964,"lat":22.530917},{"lon":114.007964,"lat":22.540665}]}], type: 1 },
        { id: 672, lat: 22.536989, lon: 113.954042, name: '好吃的水果', number: "131452", serviceRadiusShape: [{"points":[{"lon":113.95333,"lat":22.537218},{"lon":113.955347,"lat":22.537218},{"lon":113.955347,"lat":22.536},{"lon":113.95333,"lat":22.536}]}], type: 1 },
        { id: 596, lat: 22.558069, lon: 114.081799, name: '石超测试门店0001', number: "1342", serviceRadiusShape: [{"points":[{"lon":114.080092,"lat":22.558357},{"lon":114.082351,"lat":22.558357},{"lon":114.082351,"lat":22.557193},{"lon":114.080092,"lat":22.557193}]}], type: 1 },
        { id: 599, lat: 22.545252, lon: 114.07835, name: '石超测试门店0005', number: "1432", serviceRadiusShape: [{"points":[{"lon":114.082999,"lat":22.543858},{"lon":114.085262,"lat":22.543858},{"lon":114.085262,"lat":22.542348},{"lon":114.082999,"lat":22.542348}]}], type: 1 },
        { id: 393, lat: 22.530143, lon: 114.054267, name: '新洲小学二店', number: "147852", serviceRadiusShape: [{"points":[{"lon":114.053714,"lat":22.531616},{"lon":114.057353,"lat":22.531616},{"lon":114.057353,"lat":22.529313},{"lon":114.053714,"lat":22.529313}]}], type: 1 },
        { id: 606, lat: 22.538477, lon: 113.921769, name: '大新地铁站店', number: "151263", serviceRadiusShape: '', type: 1 },
        { id: 355, lat: 22.550326, lon: 114.122906, name: '百果园老街店', number: "151589", serviceRadiusShape: [{"points":[{"lon":114.121835,"lat":22.550735},{"lon":114.123443,"lat":22.550872},{"lon":114.123861,"lat":22.549404},{"lon":114.122527,"lat":22.548982},{"lon":114.121633,"lat":22.549512}]}], type: 1 },
        { id: 605, lat: 22.545827, lon: 114.060075, name: '福田地铁站店', number: "152152", serviceRadiusShape: [{"points":[{"lon":114.0599,"lat":22.546295},{"lon":114.061175,"lat":22.546295},{"lon":114.061175,"lat":22.54556},{"lon":114.0599,"lat":22.54556}]},{"points":[{"lon":114.056872,"lat":22.549599},{"lon":114.072682,"lat":22.54833},{"lon":114.06334,"lat":22.535446},{"lon":114.047889,"lat":22.542255}]}], type: 1 },
        { id: 298, lat: 22.53657, lon: 114.028302, name: '百果园下沙店', number: "1539", serviceRadiusShape: [{"points":[{"lon":114.02629,"lat":22.53707},{"lon":114.050508,"lat":22.533264},{"lon":114.042962,"lat":22.526187},{"lon":114.033117,"lat":22.529258}]}], type: 1 },
        { id: 408, lat: 22.53697, lon: 113.954078, name: '果多美-饿了么留创二店', number: "163969762", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 },
        { id: 226, lat: 22.654916, lon: 114.131285, name: '百果园旗舰店', number: "1688", serviceRadiusShape: '', type: 1 },
        { id: 227, lat: 22.654916, lon: 114.131285, name: '百果盛宴', number: "16881", serviceRadiusShape: '', type: 0 },
        { id: 232, lat: 22.528745, lon: 113.941946, name: '百果园测试店', number: "170424", serviceRadiusShape: [{"points":[{"lon":113.944353,"lat":22.529179},{"lon":113.944416,"lat":22.527777},{"lon":113.948189,"lat":22.527752},{"lon":113.947866,"lat":22.529288},{"lon":113.947812,"lat":22.529296}]}], type: 1 },
        { id: 89, lat: 22.649263, lon: 113.790966, name: '宝安区机场店', number: "1711", serviceRadiusShape: '', type: 1 },
        { id: 421, lat: 22.565716, lon: 113.990029, name: '桃源村店', number: "174888", serviceRadiusShape: [{"points":[{"lon":113.958503,"lat":22.58777},{"lon":114.022175,"lat":22.58777},{"lon":114.022175,"lat":22.543316},{"lon":113.958503,"lat":22.543316}]}], type: 1 },
        { id: 45, lat: 22.527908, lon: 113.945187, name: '深圳市宝安区深业新岸线店', number: "18", serviceRadiusShape: '', type: 1 },
        { id: 610, lat: 22.561844, lon: 113.893708, name: '没有充值活动门店', number: "191913", serviceRadiusShape: [{"points":[{"lon":113.876528,"lat":22.576624},{"lon":113.916844,"lat":22.576958},{"lon":113.91167,"lat":22.55146},{"lon":113.884936,"lat":22.549791}]}], type: 1 },
        { id: 633, lat: 22.541617, lon: 113.926866, name: '欢乐颂店', number: "191986", serviceRadiusShape: [{"points":[{"lon":113.921692,"lat":22.542782},{"lon":113.932777,"lat":22.542014},{"lon":113.927872,"lat":22.536373},{"lon":113.920883,"lat":22.537408}]}], type: 1 },
        { id: 90, lat: 22.529651, lon: 114.061082, name: '深圳碧馨花园店', number: "1981", serviceRadiusShape: '', type: 1 },
        { id: 91, lat: 22.54264, lon: 114.032574, name: '深圳车公庙店', number: "1982", serviceRadiusShape: [{"points":[{"lon":114.028846,"lat":22.543829},{"lon":114.028846,"lat":22.536686},{"lon":114.040686,"lat":22.536686},{"lon":114.040686,"lat":22.543829}]}], type: 1 },
        { id: 252, lat: 22.558662, lon: 113.958603, name: '鸟厂专用', service: 600, number: "1986", serviceRadiusShape: [{"points":[{"lon":113.902971,"lat":22.574611},{"lon":113.887448,"lat":22.55779},{"lon":113.901246,"lat":22.534558},{"lon":113.922518,"lat":22.563931},{"lon":113.919069,"lat":22.574611}]},{"points":[{"lon":113.905846,"lat":22.600505},{"lon":113.876237,"lat":22.597035},{"lon":113.895784,"lat":22.617053},{"lon":113.977997,"lat":22.610381},{"lon":113.966499,"lat":22.548979}]}], type: 1 },
        { id: 238, lat: 22.524547, lon: 113.988427, name: '下沙水莲寺璐珈', number: "1989", serviceRadiusShape: '', type: 1 },
        { id: 71, lat: 22.489144, lon: 113.92325, name: '南山区海上世界店', number: "1990", serviceRadiusShape: [{"points":[{"lon":113.919468,"lat":22.480658},{"lon":113.911994,"lat":22.486669},{"lon":113.909407,"lat":22.501495},{"lon":113.921624,"lat":22.50283},{"lon":113.93111,"lat":22.493748},{"lon":113.932691,"lat":22.486134}]}], type: 1 },
        { id: 75, lat: 22.49421, lon: 113.922733, name: '海上世界高达虚拟店', number: "1991", serviceRadiusShape: '', type: 0 },
        { id: 591, lat: 22.705205, lon: 114.239917, name: '名居广场店', number: "199302", serviceRadiusShape: [{"points":[{"lon":114.231859,"lat":22.710056},{"lon":114.247849,"lat":22.710056},{"lon":114.247849,"lat":22.699654},{"lon":114.231859,"lat":22.699654}]}], type: 1 },
        { id: 674, lat: 22.538794, lon: 113.956359, name: '高新公寓店', number: "199306", serviceRadiusShape: '', type: 1 },
        { id: 675, lat: 22.553968, lon: 113.950146, name: '科兴科学园店', number: "199307", serviceRadiusShape: '', type: 1 },
        { id: 676, lat: 22.697876, lon: 114.235117, name: '龙岗星河cocopark店', number: "199308", serviceRadiusShape: [{"points":[{"lon":114.220565,"lat":22.708379},{"lon":114.25082,"lat":22.708379},{"lon":114.25082,"lat":22.686973},{"lon":114.220565,"lat":22.686973}]}], type: 1 },
        { id: 677, lat: 22.712144, lon: 114.245724, name: '中粮祥云店', number: "199309", serviceRadiusShape: [{"points":[{"lon":114.235654,"lat":22.706688},{"lon":114.24275,"lat":22.706688},{"lon":114.24275,"lat":22.70007},{"lon":114.235654,"lat":22.70007}]}], type: 1 },
        { id: 678, lat: 22.720718, lon: 114.250178, name: '龙岗万科广场店', number: "199310", serviceRadiusShape: '', type: 1 },
        { id: 679, lat: 22.706366, lon: 114.241656, name: '龙岗爱联小学店', number: "199311", serviceRadiusShape: '', type: 1 },
        { id: 67, lat: 22.49719, lon: 113.954741, name: '南山区湾厦店', number: "1996", serviceRadiusShape: [{"points":[{"lon":113.953609,"lat":22.49757},{"lon":113.954144,"lat":22.497728},{"lon":113.955922,"lat":22.497065},{"lon":113.953694,"lat":22.496593},{"lon":113.95307,"lat":22.497202}]},{"points":[{"lon":113.945199,"lat":22.530951},{"lon":113.947912,"lat":22.530626},{"lon":113.946165,"lat":22.529165},{"lon":113.944301,"lat":22.530008}]}], type: 1 },
        { id: 66, lat: 22.536746, lon: 113.97619, name: '南山区京基百纳店', number: "1997", serviceRadiusShape: '', type: 1 },
        { id: 65, lat: 22.492011, lon: 113.926695, name: '南山区海伴雅居店', number: "1999", serviceRadiusShape: [{"points":[{"lon":113.926309,"lat":22.492257},{"lon":113.92643,"lat":22.491748},{"lon":113.927751,"lat":22.492191},{"lon":113.927539,"lat":22.492466},{"lon":113.927229,"lat":22.492645},{"lon":113.927144,"lat":22.492608},{"lon":113.927185,"lat":22.492608}]}], type: 1 },
        { id: 72, lat: 22.534275, lon: 113.926994, name: '南山区金宝花园店', number: "2016", serviceRadiusShape: [{"points":[{"lon":113.926049,"lat":22.534853},{"lon":113.927859,"lat":22.53487},{"lon":113.928713,"lat":22.533714},{"lon":113.927329,"lat":22.533134},{"lon":113.926188,"lat":22.533063},{"lon":113.925865,"lat":22.533539},{"lon":113.925672,"lat":22.533818},{"lon":113.925699,"lat":22.53406},{"lon":113.925663,"lat":22.534307},{"lon":113.925645,"lat":22.53472},{"lon":113.925851,"lat":22.53474}]}], type: 1 },
        { id: 73, lat: 22.547002, lon: 114.071197, name: '凤凰大厦店NO1', number: "2017", serviceRadiusShape: [{"points":[{"lon":114.069728,"lat":22.547849},{"lon":114.069728,"lat":22.54608},{"lon":114.073043,"lat":22.54608},{"lon":114.073043,"lat":22.547849}]}], type: 1 },
        { id: 382, lat: 22.615096, lon: 114.035663, name: '百果园-深圳北站店-测试12346789', number: "201805", serviceRadiusShape: [{"points":[{"lon":113.99435,"lat":22.638868},{"lon":114.076563,"lat":22.638868},{"lon":114.076563,"lat":22.594831},{"lon":113.99435,"lat":22.594831}]}], type: 1 },
        { id: 383, lat: 22.623603, lon: 114.047484, name: '百果园-民治店-测试', number: "201806", serviceRadiusShape: [{"points":[{"lon":114.032604,"lat":22.632293},{"lon":114.064224,"lat":22.632293},{"lon":114.064224,"lat":22.613478},{"lon":114.032604,"lat":22.613478}]}], type: 1 },
        { id: 574, lat: 22.615381, lon: 114.035658, name: '北站店-测试', number: "201907", serviceRadiusShape: [{"points":[{"lon":114.008147,"lat":22.630497},{"lon":114.066645,"lat":22.630497},{"lon":114.066645,"lat":22.601005},{"lon":114.008147,"lat":22.601005}]}], type: 1 },
        { id: 237, lat: 22.528565, lon: 113.946817, name: '北极熊FF分店', number: "2048", serviceRadiusShape: [{"points":[{"lon":113.944868,"lat":22.529408},{"lon":113.948039,"lat":22.529408},{"lon":113.947563,"lat":22.528173},{"lon":113.946476,"lat":22.52773},{"lon":113.944805,"lat":22.52791}]},{"points":[{"lon":113.945286,"lat":22.530042},{"lon":113.94626,"lat":22.529136},{"lon":113.947832,"lat":22.529224},{"lon":113.948403,"lat":22.529996},{"lon":113.948358,"lat":22.530013}]}], type: 1 },
        { id: 215, lat: 22.532508, lon: 114.04777, name: '中国凤凰大厦店2', number: "2071", serviceRadiusShape: [{"points":[{"lon":114.043302,"lat":22.536346},{"lon":114.056992,"lat":22.536346},{"lon":114.056992,"lat":22.529435},{"lon":114.043302,"lat":22.529435}]}], type: 1 },
        { id: 547, lat: 22.617465, lon: 114.117023, name: 'Test-龙岗区龙翔花园店（哈哈名称很长的那种显示）', number: "208007", serviceRadiusShape: [{"points":[{"lon":114.103737,"lat":22.626585},{"lon":114.13428,"lat":22.626585},{"lon":114.13428,"lat":22.607836},{"lon":114.103737,"lat":22.607836}]}], type: 1 },
        { id: 469, lat: 22.536926, lon: 113.95391, name: '测试2103', number: "2103", serviceRadiusShape: [{"points":[{"lon":113.953573,"lat":22.537085},{"lon":113.954395,"lat":22.537164},{"lon":113.954404,"lat":22.536755},{"lon":113.953968,"lat":22.53645},{"lon":113.953654,"lat":22.536838}]}], type: 1 },
        { id: 707, lat: 22.543649, lon: 114.033866, name: '深圳傻瓜店1号', number: "216512", serviceRadiusShape: [{"points":[{"lon":114.036866,"lat":22.541926},{"lon":114.040967,"lat":22.541926},{"lon":114.040967,"lat":22.539543},{"lon":114.036866,"lat":22.539543}]}], type: 1 },
        { id: 366, lat: 22.696665, lon: 113.81792, name: '福永百果园', number: "217612", serviceRadiusShape: [{"points":[{"lon":113.817533,"lat":22.697398},{"lon":113.818885,"lat":22.697398},{"lon":113.818885,"lat":22.696281},{"lon":113.817533,"lat":22.696281}]}], type: 1 },
        { id: 346, lat: 22.538645, lon: 113.954293, name: '留创百果园一店', number: "2222", serviceRadiusShape: '', type: 1 },
        { id: 409, lat: 22.53697, lon: 113.954078, name: '果多美-百度留创二店', number: "2227381235", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 },
        { id: 221, lat: 22.542106, lon: 114.014226, name: '竹子林店', number: "2235", serviceRadiusShape: '', type: 1 },
        { id: 273, lat: 39.910944, lon: 116.413451, name: '123哈哈', number: "236514", serviceRadiusShape: [{"points":[{"lon":116.412337,"lat":39.911601},{"lon":116.414982,"lat":39.911601},{"lon":116.414982,"lat":39.910577},{"lon":116.412337,"lat":39.910577},{"lon":116.412337,"lat":39.911601}]}], type: 1 },
        { id: 293, lat: 22.535745, lon: 113.947461, name: 'Test-深大南区食堂分店', number: "25411", serviceRadiusShape: [{"points":[{"lon":113.92521,"lat":22.54893},{"lon":113.977096,"lat":22.54893},{"lon":113.977096,"lat":22.526164},{"lon":113.92521,"lat":22.526164}]}], type: 1 },
        { id: 440, lat: 22.536342, lon: 113.9533, name: '果多美-有赞留创店', number: "254112", serviceRadiusShape: [{"points":[{"lon":113.940499,"lat":22.543469},{"lon":113.967376,"lat":22.543469},{"lon":113.967376,"lat":22.53005},{"lon":113.940499,"lat":22.53005}]}], type: 1 },
        { id: 441, lat: 22.536887, lon: 113.95256, name: '果多美-饿百测试店', number: "254113", serviceRadiusShape: [{"points":[{"lon":113.952434,"lat":22.537137},{"lon":113.953651,"lat":22.537137},{"lon":113.953651,"lat":22.536261},{"lon":113.952434,"lat":22.536261}]}], type: 1 },
        { id: 290, lat: 22.527924, lon: 113.943976, name: '创业投资大厦店a', number: "25412", serviceRadiusShape: [{"points":[{"lon":113.944558,"lat":22.528611},{"lon":113.944558,"lat":22.527614},{"lon":113.946862,"lat":22.527614},{"lon":113.946862,"lat":22.528611}]}], type: 1 },
        { id: 687, lat: 22.572021, lon: 113.867772, name: 'Test-西乡F518创意园店', number: "2602", serviceRadiusShape: [{"points":[{"lon":113.85962,"lat":22.578199},{"lon":113.880173,"lat":22.578199},{"lon":113.880173,"lat":22.566952},{"lon":113.85962,"lat":22.566952}]}], type: 1 },
        { id: 488, lat: 22.562341, lon: 114.065702, name: '测试-研发专用06', number: "321231", serviceRadiusShape: [{"points":[{"lon":114.075453,"lat":22.563159},{"lon":114.077861,"lat":22.560622},{"lon":114.073082,"lat":22.55882},{"lon":114.072543,"lat":22.562525}]}], type: 1 },
        { id: 548, lat: 22.575088, lon: 113.877362, name: '深圳市宝安区坪洲Android测试廖海龙', number: "321654", serviceRadiusShape: [{"points":[{"lon":113.872978,"lat":22.57689},{"lon":113.872978,"lat":22.57689},{"lon":113.872978,"lat":22.57689},{"lon":113.872978,"lat":22.57689}]},{"points":[{"lon":113.873302,"lat":22.575722},{"lon":113.873302,"lat":22.575722},{"lon":113.873302,"lat":22.575722},{"lon":113.873302,"lat":22.575722}]},{"points":[{"lon":113.874236,"lat":22.576289},{"lon":113.880632,"lat":22.576289},{"lon":113.880632,"lat":22.573452},{"lon":113.874236,"lat":22.573452}]}], type: 1 },
        { id: 301, lat: 22.55256, lon: 114.143419, name: '黄贝岭虚拟门店', number: "3321", serviceRadiusShape: [{"points":[{"lon":114.14178,"lat":22.552827},{"lon":114.144385,"lat":22.55304},{"lon":114.145099,"lat":22.551813},{"lon":114.142125,"lat":22.551746}]}], type: 0 },
        { id: 303, lat: 22.523261, lon: 113.946879, name: '后海2店', number: "3327", serviceRadiusShape: [{"points":[{"lon":113.945516,"lat":22.523783},{"lon":113.945516,"lat":22.522522},{"lon":113.948566,"lat":22.522522},{"lon":113.948566,"lat":22.523783}]}], type: 1 },
        { id: 74, lat: 22.634504, lon: 113.84211, name: '宝安区后瑞店', number: "333", serviceRadiusShape: [{"points":[{"lon":113.836841,"lat":22.641104},{"lon":113.836841,"lat":22.641104},{"lon":113.836841,"lat":22.641104},{"lon":113.836841,"lat":22.641104}]},{"points":[{"lon":113.822244,"lat":22.654917},{"lon":113.88455,"lat":22.654917},{"lon":113.88455,"lat":22.610218},{"lon":113.822244,"lat":22.610218}]}], type: 1 },
        { id: 86, lat: 22.528266, lon: 113.945168, name: '南山区软件产业基地222店', number: "3355", serviceRadiusShape: [{"points":[{"lon":113.943006,"lat":22.531371},{"lon":113.94071,"lat":22.529293},{"lon":113.945723,"lat":22.527156},{"lon":113.954599,"lat":22.5283},{"lon":113.946702,"lat":22.529034},{"lon":113.948154,"lat":22.532314},{"lon":113.946159,"lat":22.532548}]},{"points":[{"lon":113.937514,"lat":22.532439},{"lon":113.940623,"lat":22.532439},{"lon":113.940623,"lat":22.529735},{"lon":113.937514,"lat":22.529735}]},{"points":[{"lon":113.93479,"lat":22.540134},{"lon":113.927316,"lat":22.540134},{"lon":113.927316,"lat":22.536395},{"lon":113.93479,"lat":22.536395}]}], type: 1 },
        { id: 87, lat: 22.726315, lon: 114.254253, name: '龙岗区龙翔大道店', number: "3366", serviceRadiusShape: [{"points":[{"lon":114.2541,"lat":22.726169},{"lon":114.2541,"lat":22.726169},{"lon":114.2541,"lat":22.726169},{"lon":114.2541,"lat":22.726169}]},{"points":[{"lon":114.23944,"lat":22.739252},{"lon":114.277169,"lat":22.739252},{"lon":114.277169,"lat":22.714585},{"lon":114.23944,"lat":22.714585}]}], type: 1 },
        { id: 306, lat: 22.546218, lon: 114.128453, name: '国贸虚拟店', number: "3368", serviceRadiusShape: [{"points":[{"lon":114.127052,"lat":22.546356},{"lon":114.128511,"lat":22.546844},{"lon":114.130452,"lat":22.546072},{"lon":114.129356,"lat":22.545488},{"lon":114.127833,"lat":22.545425},{"lon":114.127007,"lat":22.545575}]}], type: 0 },
        { id: 305, lat: 22.549539, lon: 114.051909, name: '香蜜湖虚拟门店', number: "3369", serviceRadiusShape: [{"points":[{"lon":114.050548,"lat":22.549443},{"lon":114.05261,"lat":22.55014},{"lon":114.053674,"lat":22.549084},{"lon":114.051882,"lat":22.548688},{"lon":114.050786,"lat":22.548967}]}], type: 0 },
        { id: 88, lat: 22.749751, lon: 114.377063, name: '龙岗区坑梓店', number: "3377", serviceRadiusShape: '', type: 1 },
        { id: 309, lat: 22.528661, lon: 114.037313, name: '上沙广场店', number: "3379", serviceRadiusShape: [{"points":[{"lon":114.035944,"lat":22.528746},{"lon":114.038217,"lat":22.530699},{"lon":114.041774,"lat":22.52984},{"lon":114.041496,"lat":22.528363},{"lon":114.038172,"lat":22.527795},{"lon":114.036537,"lat":22.528287}]}], type: 1 },
        { id: 384, lat: 22.531244, lon: 114.055503, name: '上沙新洲小学店', number: "3380", serviceRadiusShape: [{"points":[{"lon":114.035453,"lat":22.53525},{"lon":114.058378,"lat":22.53525},{"lon":114.058378,"lat":22.527706},{"lon":114.035453,"lat":22.527706}]}], type: 1 },
        { id: 308, lat: 22.52185, lon: 114.057254, name: '益田虚拟店', number: "3387", serviceRadiusShape: [{"points":[{"lon":114.055803,"lat":22.52253},{"lon":114.057285,"lat":22.522543},{"lon":114.059221,"lat":22.522021},{"lon":114.058875,"lat":22.52122},{"lon":114.056863,"lat":22.521141},{"lon":114.055812,"lat":22.52142},{"lon":114.055799,"lat":22.521429}]}], type: 0 },
        { id: 307, lat: 22.527993, lon: 113.946251, name: '滨海之窗2店', number: "3397", serviceRadiusShape: [{"points":[{"lon":113.944841,"lat":22.528807},{"lon":113.944841,"lat":22.527609},{"lon":113.947792,"lat":22.527609},{"lon":113.947792,"lat":22.528807}]}], type: 1 },
        { id: 331, lat: 22.54475, lon: 114.038569, name: '百果盒子2', number: "3434", serviceRadiusShape: [{"points":[{"lon":114.038475,"lat":22.544838},{"lon":114.038475,"lat":22.544733},{"lon":114.038645,"lat":22.544733},{"lon":114.038645,"lat":22.544838}]}], type: 2 },
        { id: 284, lat: 22.542261, lon: 113.98045, name: '世界之窗店', number: "365552", serviceRadiusShape: [{"points":[{"lon":113.979727,"lat":22.542628},{"lon":113.979727,"lat":22.541744},{"lon":113.981285,"lat":22.541744},{"lon":113.981285,"lat":22.542628}]}], type: 1 },
        { id: 549, lat: 22.694835, lon: 113.817394, name: '深东店', number: "369", serviceRadiusShape: [{"points":[{"lon":113.555233,"lat":23.226127},{"lon":114.334818,"lat":23.226127},{"lon":114.334818,"lat":22.480141},{"lon":113.555233,"lat":22.480141}]}], type: 1 },
        { id: 288, lat: 22.528048, lon: 113.945443, name: '音乐大厦店', number: "4099", serviceRadiusShape: [{"points":[{"lon":113.944046,"lat":22.528499},{"lon":113.947917,"lat":22.528499},{"lon":113.947917,"lat":22.52766},{"lon":113.944046,"lat":22.52766}]}], type: 1 },
        { id: 485, lat: 22.483982, lon: 113.897925, name: '赤湾大厦110期', number: "42110", serviceRadiusShape: [{"points":[{"lon":113.895073,"lat":22.487405},{"lon":113.904271,"lat":22.487305},{"lon":113.904415,"lat":22.481294},{"lon":113.895396,"lat":22.481361}]}], type: 1 },
        { id: 304, lat: 22.563441, lon: 114.067889, name: '测试2', number: "424242", serviceRadiusShape: [{"points":[{"lon":114.067588,"lat":22.564325},{"lon":114.067588,"lat":22.563508},{"lon":114.068266,"lat":22.563508},{"lon":114.068266,"lat":22.564325}]}], type: 0 },
        { id: 241, lat: 22.631089, lon: 114.067378, name: '坂田四季花城店（测试店）', number: "4431", serviceRadiusShape: [{"points":[{"lon":114.054853,"lat":22.643579},{"lon":114.078281,"lat":22.643579},{"lon":114.078281,"lat":22.623698},{"lon":114.054853,"lat":22.623698}]}], type: 1 },
        { id: 14, lat: 22.554056, lon: 114.155655, name: '罗湖区新秀店', number: "4432", serviceRadiusShape: '', type: 1 },
        { id: 240, lat: 22.631022, lon: 114.067306, name: '坂田四季花城店（果多多测试店）', number: "4433", serviceRadiusShape: '', type: 1 },
        { id: 376, lat: 22.527469, lon: 114.041404, name: '百果园金地店', number: "445564", serviceRadiusShape: [{"points":[{"lon":114.038381,"lat":22.527911},{"lon":114.042666,"lat":22.527911},{"lon":114.042666,"lat":22.525908},{"lon":114.038381,"lat":22.525908}]}], type: 1 },
        { id: 387, lat: 22.542348, lon: 114.0318, name: '车公庙店', number: "456852", serviceRadiusShape: [{"points":[{"lon":114.012635,"lat":22.554948},{"lon":114.048998,"lat":22.554948},{"lon":114.048998,"lat":22.532517},{"lon":114.012635,"lat":22.532517}]}], type: 1 },
        { id: 712, lat: 22.58797, lon: 113.938071, name: '深圳零售1号店', number: "46531", serviceRadiusShape: [{"points":[{"lon":113.941395,"lat":22.586064},{"lon":113.939378,"lat":22.586064},{"lon":113.939378,"lat":22.588145},{"lon":113.941395,"lat":22.588145}]}], type: 1 },
        { id: 368, lat: 22.51767, lon: 113.913479, name: '山水情家园店', number: "500000", serviceRadiusShape: [{"points":[{"lon":113.897723,"lat":22.53558},{"lon":113.911952,"lat":22.529037},{"lon":113.933799,"lat":22.520491},{"lon":113.930637,"lat":22.510609},{"lon":113.921007,"lat":22.510609},{"lon":113.910515,"lat":22.487235},{"lon":113.905916,"lat":22.493914},{"lon":113.902466,"lat":22.494181},{"lon":113.882488,"lat":22.524097}]}], type: 1 },
        { id: 412, lat: 22.530397, lon: 113.974757, name: '万科臻湾店', number: "500002", serviceRadiusShape: [{"points":[{"lon":113.970764,"lat":22.537495},{"lon":113.969614,"lat":22.524142},{"lon":113.989161,"lat":22.523674},{"lon":113.989018,"lat":22.53182}]}], type: 1 },
        { id: 476, lat: 22.49289, lon: 113.944121, name: '金色海琴苑', number: "500005", serviceRadiusShape: [{"points":[{"lon":113.94342,"lat":22.48263},{"lon":113.913812,"lat":22.490912},{"lon":113.925311,"lat":22.519226},{"lon":113.962105,"lat":22.516288},{"lon":113.964117,"lat":22.494385}]}], type: 1 },
        { id: 49, lat: 22.507935, lon: 113.905, name: '南山区月亮湾公园店', number: "502", serviceRadiusShape: '', type: 1 },
        { id: 50, lat: 22.560863, lon: 113.89366, name: '宝安区宝安中心店', number: "503", serviceRadiusShape: '', type: 1 },
        { id: 129, lat: 22.554344, lon: 114.074569, name: '彩田路', number: "5187", serviceRadiusShape: '', type: 1 },
        { id: 657, lat: 22.548473, lon: 114.064565, name: '测试订单001', number: "520201", serviceRadiusShape: '', type: 1 },
        { id: 656, lat: 22.547922, lon: 114.068576, name: '下单就送', number: "520202", serviceRadiusShape: '', type: 1 },
        { id: 658, lat: 22.536438, lon: 113.953323, name: '好水果好', number: "520203", serviceRadiusShape: [{"points":[{"lon":113.952353,"lat":22.537072},{"lon":113.954298,"lat":22.537056},{"lon":113.953408,"lat":22.535424},{"lon":113.953395,"lat":22.53542},{"lon":113.953381,"lat":22.535507},{"lon":113.953381,"lat":22.535507},{"lon":113.953372,"lat":22.53552},{"lon":113.953184,"lat":22.535729}]}], type: 1 },
        { id: 509, lat: 22.557001, lon: 114.071451, name: 'trtryt', number: "523147", serviceRadiusShape: [{"points":[{"lon":114.071173,"lat":22.557172},{"lon":114.071914,"lat":22.557172},{"lon":114.071914,"lat":22.556834},{"lon":114.071173,"lat":22.556834}]}], type: 1 },
        { id: 122, lat: 22.547359, lon: 114.067513, name: 'My god', number: "5287", serviceRadiusShape: [{"points":[{"lon":114.061309,"lat":22.551884},{"lon":114.078018,"lat":22.551884},{"lon":114.078018,"lat":22.542972},{"lon":114.061309,"lat":22.542972}]}], type: 1 },
        { id: 710, lat: 22.553262, lon: 114.019709, name: '深圳老虎机店', number: "541356", serviceRadiusShape: [{"points":[{"lon":114.018294,"lat":22.55398},{"lon":114.022543,"lat":22.55398},{"lon":114.022543,"lat":22.55219},{"lon":114.018294,"lat":22.55219}]}], type: 1 },
        { id: 99, lat: 22.529692, lon: 113.943178, name: 'Test-深圳产业基地4栋A座分店', number: "5506", serviceRadiusShape: [{"points":[{"lon":113.941998,"lat":22.530449},{"lon":113.944266,"lat":22.530515},{"lon":113.94547,"lat":22.530382},{"lon":113.945587,"lat":22.529468},{"lon":113.944491,"lat":22.528379},{"lon":113.941585,"lat":22.528759},{"lon":113.941005,"lat":22.529998}]},{"points":[{"lon":113.941886,"lat":22.530899},{"lon":113.941886,"lat":22.529431},{"lon":113.945308,"lat":22.529431},{"lon":113.945308,"lat":22.530899}]}], type: 1 },
        { id: 102, lat: 22.528559, lon: 113.946817, name: 'Test-深圳产业基地北极熊分店', number: "5508", serviceRadiusShape: [{"points":[{"lon":113.944612,"lat":22.530153},{"lon":113.944202,"lat":22.527743},{"lon":113.949415,"lat":22.527703},{"lon":113.949058,"lat":22.530153}]},{"points":[{"lon":113.942982,"lat":22.530163},{"lon":113.942982,"lat":22.52902},{"lon":113.943871,"lat":22.52902},{"lon":113.943871,"lat":22.530163}]}], type: 1 },
        { id: 123, lat: 22.581798, lon: 113.869126, name: 'Test-西乡地铁站店', number: "5510", serviceRadiusShape: [{"points":[{"lon":113.86498,"lat":22.582978},{"lon":113.868178,"lat":22.586549},{"lon":113.874053,"lat":22.585114},{"lon":113.878832,"lat":22.58156},{"lon":113.882372,"lat":22.579558},{"lon":113.879605,"lat":22.577322},{"lon":113.877,"lat":22.57542},{"lon":113.869328,"lat":22.576154},{"lon":113.864873,"lat":22.580843}]}], type: 1 },
        { id: 131, lat: 22.529257, lon: 113.941302, name: '产业基地芒果大厦虚拟店', number: "5513", serviceRadiusShape: [{"points":[{"lon":113.941189,"lat":22.529668},{"lon":113.94185,"lat":22.529706},{"lon":113.941998,"lat":22.52923},{"lon":113.941203,"lat":22.52905},{"lon":113.940938,"lat":22.529468}]},{"points":[{"lon":113.940839,"lat":22.529918},{"lon":113.941391,"lat":22.529806},{"lon":113.941315,"lat":22.529509},{"lon":113.94079,"lat":22.529589}]}], type: 0 },
        { id: 132, lat: 22.550872, lon: 113.94132, name: 'Test-腾讯大厦店', number: "5514", serviceRadiusShape: '', type: 0 },
        { id: 133, lat: 22.599263, lon: 114.058766, name: 'Test-梅林检查站店', number: "5515", serviceRadiusShape: '', type: 0 },
        { id: 124, lat: 22.527836, lon: 113.9452, name: '产品测试店-A8', number: "5555", serviceRadiusShape: [{"points":[{"lon":113.944657,"lat":22.528562},{"lon":113.944657,"lat":22.52857},{"lon":113.944885,"lat":22.528317},{"lon":113.945101,"lat":22.527913},{"lon":113.946152,"lat":22.527565},{"lon":113.94463,"lat":22.527581},{"lon":113.943026,"lat":22.527782}]}], type: 1 },
        { id: 313, lat: 22.541412, lon: 114.066326, name: '百果园怡景店', number: "5757", serviceRadiusShape: [{"points":[{"lon":114.065163,"lat":22.542017},{"lon":114.066681,"lat":22.542201},{"lon":114.067651,"lat":22.540895},{"lon":114.06625,"lat":22.540686},{"lon":114.065199,"lat":22.540686}]}], type: 1 },
        { id: 289, lat: 22.544252, lon: 113.979551, name: '深圳市世界之窗店啊啊啊啊啊啊1', number: "58426", serviceRadiusShape: [{"points":[{"lon":113.97299,"lat":22.546986},{"lon":113.97299,"lat":22.541011},{"lon":113.98359,"lat":22.541011},{"lon":113.98359,"lat":22.546986}]}], type: 1 },
        { id: 10, lat: 22.552426, lon: 114.14336, name: '罗湖区黄贝岭店', number: "600", serviceRadiusShape: '', type: 1 },
        { id: 374, lat: 22.537048, lon: 113.954074, name: '留学生创业大厦二期店', number: "6001", serviceRadiusShape: [{"points":[{"lon":113.952475,"lat":22.538204},{"lon":113.955457,"lat":22.538204},{"lon":113.955457,"lat":22.536518},{"lon":113.952475,"lat":22.536518}]}], type: 1 },
        { id: 713, lat: 22.541148, lon: 113.942678, name: '扫码购门店6001', number: "6002", serviceRadiusShape: '', type: 1 },
        { id: 35, lat: 22.654833, lon: 114.131329, name: '龙岗区建昇大厦店2', number: "6003", serviceRadiusShape: [{"points":[{"lon":114.125966,"lat":22.658814},{"lon":114.138794,"lat":22.658814},{"lon":114.138794,"lat":22.650093},{"lon":114.125966,"lat":22.650093}]}], type: 1 },
        { id: 502, lat: 22.548456, lon: 114.063977, name: 'test-lin', number: "654321", serviceRadiusShape: [{"points":[{"lon":114.063007,"lat":22.549228},{"lon":114.063191,"lat":22.54924},{"lon":114.063294,"lat":22.549211},{"lon":114.062692,"lat":22.548147},{"lon":114.065733,"lat":22.549307},{"lon":114.06391,"lat":22.549833},{"lon":114.063923,"lat":22.549712},{"lon":114.063353,"lat":22.549628},{"lon":114.062778,"lat":22.549136},{"lon":114.062805,"lat":22.549119}]}], type: 1 },
        { id: 285, lat: 22.546542, lon: 113.979634, name: '白石洲塘头六坊店', number: "65455", serviceRadiusShape: [{"points":[{"lon":113.978552,"lat":22.547022},{"lon":113.978552,"lat":22.545949},{"lon":113.980941,"lat":22.545949},{"lon":113.980941,"lat":22.547022}]}], type: 1 },
        { id: 507, lat: 22.537051, lon: 113.954095, name: '个非官方个', number: "654785", serviceRadiusShape: [{"points":[{"lon":113.953758,"lat":22.537222},{"lon":113.954504,"lat":22.537222},{"lon":113.954504,"lat":22.53678},{"lon":113.953758,"lat":22.53678}]}], type: 1 },
        { id: 377, lat: 22.525203, lon: 114.040551, name: '金地幼儿园店', number: "665512", serviceRadiusShape: [{"points":[{"lon":114.03813,"lat":22.525929},{"lon":114.03963,"lat":22.526555},{"lon":114.04149,"lat":22.525971},{"lon":114.042702,"lat":22.524777},{"lon":114.04113,"lat":22.524335},{"lon":114.040223,"lat":22.524477}]}], type: 1 },
        { id: 352, lat: 22.52923, lon: 114.056791, name: '百果园石厦店2', number: "666", serviceRadiusShape: [{"points":[{"lon":114.05631,"lat":22.529543},{"lon":114.05631,"lat":22.528971},{"lon":114.057501,"lat":22.528971},{"lon":114.057501,"lat":22.529543}]}], type: 1 },
        { id: 329, lat: 22.54742, lon: 114.073064, name: '百果盒子1', number: "6767", serviceRadiusShape: [{"points":[{"lon":114.072844,"lat":22.547629},{"lon":114.072844,"lat":22.547545},{"lon":114.073073,"lat":22.547545},{"lon":114.073073,"lat":22.547629}]}], type: 2 },
        { id: 673, lat: 22.536827, lon: 113.953583, name: '中华新店', number: "700001", serviceRadiusShape: [{"points":[{"lon":113.950372,"lat":22.540048},{"lon":113.957145,"lat":22.540048},{"lon":113.957145,"lat":22.533856},{"lon":113.950372,"lat":22.533856}]}], type: 1 },
        { id: 714, lat: 22.536608, lon: 113.943253, name: '深圳大学扫码购700001', number: "700009", serviceRadiusShape: '', type: 1 },
        { id: 58, lat: 22.530631, lon: 113.945205, name: '南山区软件产业基地店', number: "7002", serviceRadiusShape: [{"points":[{"lon":113.943997,"lat":22.531207},{"lon":113.943997,"lat":22.52973},{"lon":113.947011,"lat":22.52973},{"lon":113.947011,"lat":22.531207}]}], type: 1 },
        { id: 340, lat: 22.548922, lon: 114.064584, name: '产业基地货柜店', number: "7152", serviceRadiusShape: [{"points":[{"lon":114.063443,"lat":22.549506},{"lon":114.063443,"lat":22.548221},{"lon":114.066075,"lat":22.548221},{"lon":114.066075,"lat":22.549506}]}], type: 2 },
        { id: 333, lat: 22.547954, lon: 114.051217, name: '百果盒子3', number: "7272", serviceRadiusShape: [{"points":[{"lon":114.051136,"lat":22.548029},{"lon":114.051136,"lat":22.5479},{"lon":114.051293,"lat":22.5479},{"lon":114.051293,"lat":22.548029}]}], type: 2 },
        { id: 508, lat: 22.552728, lon: 114.073751, name: '湖广会', number: "745698", serviceRadiusShape: [{"points":[{"lon":114.07438,"lat":22.552194},{"lon":114.075736,"lat":22.552194},{"lon":114.075736,"lat":22.551735},{"lon":114.07438,"lat":22.551735}]},{"points":[{"lon":114.073131,"lat":22.553195},{"lon":114.074685,"lat":22.553195},{"lon":114.074685,"lat":22.552461},{"lon":114.073131,"lat":22.552461}]}], type: 1 },
        { id: 246, lat: 22.56791, lon: 113.912926, name: '知昊测试店', number: "7764", serviceRadiusShape: [{"points":[{"lon":113.912547,"lat":22.567903},{"lon":113.913648,"lat":22.568721},{"lon":113.914528,"lat":22.567828},{"lon":113.913868,"lat":22.566368},{"lon":113.911901,"lat":22.56734}]}], type: 1 },
        { id: 342, lat: 22.529673, lon: 113.941858, name: '芒果网大厦货柜-201', number: "7788", serviceRadiusShape: [{"points":[{"lon":113.94122,"lat":22.530487},{"lon":113.943655,"lat":22.530399},{"lon":113.943857,"lat":22.529306},{"lon":113.943767,"lat":22.528588},{"lon":113.942671,"lat":22.52787},{"lon":113.941023,"lat":22.529122},{"lon":113.940668,"lat":22.530303},{"lon":113.940609,"lat":22.530629}]},{"points":[{"lon":113.941898,"lat":22.530841},{"lon":113.941898,"lat":22.528605},{"lon":113.94551,"lat":22.528605},{"lon":113.94551,"lat":22.530841}]}], type: 2 },
        { id: 391, lat: 22.526189, lon: 114.047926, name: '仁爱医院店', number: "778854", serviceRadiusShape: [{"points":[{"lon":114.035296,"lat":22.529068},{"lon":114.036733,"lat":22.53264},{"lon":114.053513,"lat":22.530137},{"lon":114.055094,"lat":22.522625},{"lon":114.047728,"lat":22.521991},{"lon":114.039105,"lat":22.525697}]}], type: 1 },
        { id: 708, lat: 22.559003, lon: 114.151364, name: '深圳智慧测试店1号', number: "778894", serviceRadiusShape: [{"points":[{"lon":114.156462,"lat":22.557176},{"lon":114.157967,"lat":22.557176},{"lon":114.157967,"lat":22.555995},{"lon":114.156462,"lat":22.555995}]}], type: 1 },
        { id: 312, lat: 22.547837, lon: 114.06214, name: '百果园益田路店', number: "7878", serviceRadiusShape: [{"points":[{"lon":114.060752,"lat":22.548192},{"lon":114.060752,"lat":22.54626},{"lon":114.064202,"lat":22.54626},{"lon":114.064202,"lat":22.548192}]}], type: 1 },
        { id: 718, lat: 22.629782, lon: 114.068509, name: '李彦文测试门店', number: "8787", serviceRadiusShape: [{"points":[{"lon":114.065405,"lat":22.63323},{"lon":114.063896,"lat":22.628827},{"lon":114.06713,"lat":22.625158},{"lon":114.073239,"lat":22.627826},{"lon":114.071729,"lat":22.633497},{"lon":114.071729,"lat":22.633631},{"lon":114.071729,"lat":22.633631},{"lon":114.071658,"lat":22.633364}]}], type: 1 },
        { id: 32, lat: 22.529179, lon: 113.956213, name: '南山区科技南路店', number: "888", serviceRadiusShape: '', type: 1 },
        { id: 93, lat: 22.528517, lon: 113.9464, name: '科园路测试店', number: "8881", serviceRadiusShape: '', type: 1 },
        { id: 475, lat: 22.53697, lon: 113.954078, name: '饿百测试_留创二店', number: "88888888", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 },
        { id: 223, lat: 22.575148, lon: 113.877396, name: '百果园坪洲分店', number: "987512", serviceRadiusShape: '', type: 1 },
        { id: 248, lat: 22.527809, lon: 113.943984, name: 'A8-虚拟门店', number: "9901", serviceRadiusShape: [{"points":[{"lon":113.934354,"lat":22.536505},{"lon":113.964537,"lat":22.538374},{"lon":113.945277,"lat":22.499447},{"lon":113.924006,"lat":22.502719},{"lon":113.919694,"lat":22.504054},{"lon":113.90877,"lat":22.523486}]},{"points":[{"lon":113.938953,"lat":22.517076},{"lon":113.94039,"lat":22.502519},{"lon":113.960225,"lat":22.504656},{"lon":113.958069,"lat":22.505858}]},{"points":[{"lon":113.913944,"lat":22.539777},{"lon":113.940821,"lat":22.539777},{"lon":113.921849,"lat":22.522952}]},{"points":[{"lon":113.945277,"lat":22.541779},{"lon":113.945277,"lat":22.529896},{"lon":113.968561,"lat":22.529896},{"lon":113.968561,"lat":22.541779}]}], type: 0 },
        { id: 247, lat: 22.528057, lon: 113.945427, name: 'A8普通门店123', number: "9902", serviceRadiusShape: [{"points":[{"lon":113.942953,"lat":22.531149},{"lon":113.942953,"lat":22.527426},{"lon":113.948091,"lat":22.527426},{"lon":113.948091,"lat":22.531149}]}], type: 1 },
        { id: 294, lat: 22.581378, lon: 113.870622, name: '西乡天虹店', number: "9903", serviceRadiusShape: [{"points":[{"lon":113.867759,"lat":22.582913},{"lon":113.870391,"lat":22.583109},{"lon":113.871172,"lat":22.581649},{"lon":113.87159,"lat":22.580552},{"lon":113.870175,"lat":22.579609},{"lon":113.867844,"lat":22.580581},{"lon":113.866955,"lat":22.581611}]},{"points":[{"lon":113.869937,"lat":22.581367},{"lon":113.872919,"lat":22.582193},{"lon":113.873602,"lat":22.580516},{"lon":113.87185,"lat":22.579724}]}], type: 1 },
        { id: 296, lat: 22.529917, lon: 113.942617, name: '怡化科技大厦店', number: "9904", serviceRadiusShape: [{"points":[{"lon":113.941499,"lat":22.530701},{"lon":113.943911,"lat":22.530935},{"lon":113.944553,"lat":22.529721},{"lon":113.94462,"lat":22.528786},{"lon":113.943556,"lat":22.528331},{"lon":113.941678,"lat":22.529049},{"lon":113.940488,"lat":22.530167}]},{"points":[{"lon":113.943875,"lat":22.530322},{"lon":113.943875,"lat":22.528256},{"lon":113.94551,"lat":22.528256},{"lon":113.94551,"lat":22.530322}]}], type: 1 },
        { id: 297, lat: 22.529619, lon: 113.941858, name: 'Test-深圳芒果网大厦店', number: "9905", serviceRadiusShape: [{"points":[{"lon":113.940892,"lat":22.530349},{"lon":113.943012,"lat":22.530299},{"lon":113.944203,"lat":22.529661},{"lon":113.944216,"lat":22.527992},{"lon":113.941157,"lat":22.528305},{"lon":113.940362,"lat":22.528955},{"lon":113.940228,"lat":22.529732}]}], type: 1 },
        { id: 274, lat: 22.550451, lon: 114.091911, name: 'hell hell', number: "999", serviceRadiusShape: [{"points":[{"lon":114.091246,"lat":22.551002},{"lon":114.091246,"lat":22.549375},{"lon":114.094561,"lat":22.549375},{"lon":114.094561,"lat":22.551002}]}], type: 1 },
        { id: 56, lat: 22.553889, lon: 114.243509, name: '盐田区金融店', number: "9998", serviceRadiusShape: '', type: 1 },
        { id: 608, lat: 22.654747, lon: 114.131005, name: 'IT培训测试门店000', number: "999990", serviceRadiusShape: [{"points":[{"lon":114.129649,"lat":22.654905},{"lon":114.130533,"lat":22.653592},{"lon":114.132564,"lat":22.654793},{"lon":114.130843,"lat":22.655931},{"lon":114.130753,"lat":22.655927},{"lon":114.130659,"lat":22.655968}]}], type: 1 },
        { id: 611, lat: 22.654743, lon: 114.131023, name: 'IT培训测试门店001', number: "999991", serviceRadiusShape: [{"points":[{"lon":114.12972,"lat":22.655018},{"lon":114.131086,"lat":22.655864},{"lon":114.132043,"lat":22.654664},{"lon":114.130466,"lat":22.653788}]}], type: 1 },
        { id: 612, lat: 22.654805, lon: 114.131018, name: 'IT培训测试门店002', number: "999992", serviceRadiusShape: [{"points":[{"lon":114.130236,"lat":22.655435},{"lon":114.132024,"lat":22.655401},{"lon":114.132442,"lat":22.654117},{"lon":114.129697,"lat":22.654188},{"lon":114.129689,"lat":22.6542},{"lon":114.129689,"lat":22.6542},{"lon":114.129657,"lat":22.654205}]}], type: 1 },
        { id: 613, lat: 22.654784, lon: 114.131009, name: 'IT培训测试门店003', number: "999993", serviceRadiusShape: [{"points":[{"lon":114.128876,"lat":22.65568},{"lon":114.132518,"lat":22.65568},{"lon":114.132518,"lat":22.653575},{"lon":114.128876,"lat":22.653575}]}], type: 1 },
        { id: 614, lat: 22.654788, lon: 114.130982, name: 'IT培训测试门店004', number: "999994", serviceRadiusShape: [{"points":[{"lon":114.129679,"lat":22.655276},{"lon":114.132213,"lat":22.655276},{"lon":114.132213,"lat":22.653679},{"lon":114.129679,"lat":22.653679}]}], type: 1 },
        { id: 615, lat: 22.654772, lon: 114.131, name: 'IT培训测试门店005', number: "999995", serviceRadiusShape: [{"points":[{"lon":114.130937,"lat":22.656031},{"lon":114.128979,"lat":22.653221},{"lon":114.133376,"lat":22.653042},{"lon":114.133102,"lat":22.653392}]}], type: 1 },
        { id: 616, lat: 22.654772, lon: 114.131005, name: 'IT培训测试门店006', number: "999996", serviceRadiusShape: [{"points":[{"lon":114.129586,"lat":22.655493},{"lon":114.132505,"lat":22.655539},{"lon":114.133107,"lat":22.653671},{"lon":114.13008,"lat":22.65368},{"lon":114.130062,"lat":22.653746}]}], type: 1 },
        { id: 617, lat: 22.654755, lon: 114.130991, name: 'IT培训测试门店007', number: "999997", serviceRadiusShape: [{"points":[{"lon":114.129621,"lat":22.655426},{"lon":114.131858,"lat":22.655355},{"lon":114.13277,"lat":22.653267},{"lon":114.128763,"lat":22.65345},{"lon":114.128786,"lat":22.653463}]}], type: 1 },
        { id: 618, lat: 22.654797, lon: 114.131, name: 'IT培训测试门店008', number: "999998", serviceRadiusShape: [{"points":[{"lon":114.129302,"lat":22.655552},{"lon":114.132307,"lat":22.655502},{"lon":114.132913,"lat":22.653559},{"lon":114.128691,"lat":22.653696}]}], type: 1 },
        { id: 446, lat: 22.53697, lon: 113.954078, name: '京东测试_留创二店02', number: "99999999", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 },
        { id: 318, lat: 22.523947, lon: 113.944488, name: '百果园海岸大厦店', number: "test_0001", serviceRadiusShape: '', type: 1 },
        { id: 406, lat: 22.53697, lon: 113.954078, name: '果多美-美团留创二店', number: "t_7F7v73jTrx", serviceRadiusShape: [{"points":[{"lon":113.953194,"lat":22.537496},{"lon":113.955183,"lat":22.537496},{"lon":113.955183,"lat":22.536411},{"lon":113.953194,"lat":22.536411}]}], type: 1 }
      ]
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(stores)
        }, 1000)
      })
    },
    // 获取所选城市的门店信息
    getStoresByCity (city) {
      return this.stores || this.stores[city]
    },
    // 添加门店标注标注
    addStoreMarker (delay = 0) {
      const step = 20
      this.stores.forEach(info => {
        const { lon, lat } = info
        const point = this.createPoint(lon, lat)
        if (lon && lat) {
          // 延迟
          delay += step
          // 添加标注
          this.addMarker({ 
            point,
            info,
            delay
          })
        }
      })
    },
    // 在地图上添加门店标注
    // https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/mark
    addMarker({
      point, 
      info = {},
      delay = 0
    }){     
      const { icon, width, height } = this.markParams
      const myIcon = new BMap.Icon(
        icon, 
        new BMap.Size(width, height), 
        {    
          // 位移      
          // anchor: new BMap.Size(10, 25)   
        }
      )      
      // 创建标注对象并添加到地图 
      const marker = new BMap.Marker(point, { icon: myIcon })
      // 标注绑定 store 信息
      marker.$info = info
      // 点击
      marker.addEventListener('click', this.clickMarker) 
      // 点击
      marker.addEventListener('mouseover', this.enterMarker)
      // 点击
      marker.addEventListener('mouseout', this.leaveMarker) 
      // 添加覆盖物
      this.map.addOverlay(marker)
      // 覆盖物动画
      // http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a3b2
      // http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a3b4
      if (delay) {
        marker.hide()
        // 添加动画
        setTimeout(() => {
          marker.show()
          //marker.setAnimation(BMAP_ANIMATION_BOUNCE)
        }, delay)
        // 清除动画
        setTimeout(() => {
          marker.setAnimation()
        }, 200 + delay)
      }
    },
    enterMarker (e) {
      const marker = e.target
      this.showServiceCircle(marker)
    },
    leaveMarker () {
      // this.mapCircle.getDom().classList.add('animation_fadeOut')
      // this.map.removeOverlay(this.mapCircle)
    },
    // 点击标注物
    clickMarker (e) {
      const marker = e.target
      this.showInfoWindow(marker)
      this.showServiceCircle(marker)
    },
    // 展示服务范围
    showServiceCircle (marker) {
      const { point, $info: { service } } = marker
      const { map, mapCircle } = this 
      mapCircle.setCenter(point)
      mapCircle.setRadius(service)
      map.addOverlay(mapCircle)
      mapCircle.getDom().classList.add('animation_fadeIn')
    },
    // 标注的信息窗口
    showInfoWindow (marker) {
      const { map, mapInfoWindow } = this
      const { name, number } = marker.$info
      // 计算两点距离
      const distance = map.getDistance(marker.point, map.getCenter()) || 0
      const content = document.createElement('div')
      content.innerHTML = `
        <div class="window-info">
          <div><span>门店地址:</span> ${name}</div>
          <div><span>门店编号:</span> ${number}</div>
          <div><span>距离:</span> ${distance.toFixed(0)}米</div>
        </div>
      `
      // 设置信息窗口内容
      mapInfoWindow.setContent(content)
      marker.openInfoWindow(mapInfoWindow)
    }
  }
}
</script>

<style scope>
#container {
  position: relative;
}
#map {
  width: 100%;
  height: 100%;
}
#tool {
  position: absolute;
  top: 50px;
  left: 50px;
  z-index: 100;
  display: flex;
  box-shadow: 1px 2px 1px rgba(0,0,0,.16);
}
#tool /deep/ .el-button, #tool .el-input__inner {
  border-radius: 0;
  border: 0;
}
#tool /deep/ .el-input__inner {
  border-right: 1px solid #eee
}
#tool .city {
  width: 120px;
  flex: none
}
#tool .address {
  flex: 1
}
#tool .button {
  flex: none
}
#map .window-info span {
  color: #999;
}
#map .window-info div {
  margin-bottom: 6px;
  color: green;
  font-size: 14px;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale3d(0, 0, 0);
  }

  20% {
    transform: scale3d(0.2, 0.2, 0.2);
  }

  40% {
    transform: scale3d(0.4, 0.4, 0.4);
  }

  60% {
    transform: scale3d(0.6, 0.6, 0.6);
  }

  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }

  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.BMap_Marker > div {
  transform-origin: center bottom;
  animation: bounceIn .5s ease-in-out;
}

.animation_bounceIn {
  transform-origin: center bottom;
  animation: bounceIn .5s ease-in-out;
}

.animation_fadeOut {
  animation: fadeOut .5s ease-in-out;
}

.animation_fadeIn {
  transform-origin: center center;
  animation: fadeIn .5s ease-in-out;
}


</style>