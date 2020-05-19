class Overlay {
  
}

const install = EasyMap => {
  EasyMap.prototype.$storeMarker = () => {
    this.$overlay
  }
}

install (overlay) {
  const overlay = new Overlay()
  class Create extends overlay {
    constructor() {
      super()
    }
  }
  return new Create()
}

export default {
  install
}

new BMap.Overlay()