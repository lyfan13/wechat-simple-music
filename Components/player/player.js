// components/MyTitle/MyTitle.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    nowSong: Object,
    playing: {
      type: Boolean,
      value: false
    },
    lyric: Array,
    marginTop:Number
  },
  /**
   * 组件的初始数据
   */
  data: {
    animationData: {},
    // music:true
  },
  pageLifetimes: {
    show () {
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onTap () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
    tellme (e) {
      console.log(e)
      console.log(e.target.offsetTop)
      e.target.offsetTop = 400
    }
  },
})
