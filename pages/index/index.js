//index.js
//获取应用实例
Page({
  data: {
    num: 0,
    words: {
      content: "人最强大的武器，是习惯和信赖",
    },
    nowSong: {
      name: '',
      artist: '',
      comment: '',
      url: '',
      picUrl: '',
      lyric: '',
      currentIndex: 0
    },
    musicList: [],//这是歌单，里面很多歌单id，
    songList: [],
    playing: false,
    // lyric: [],
    //文稿数组，转化完成用来在wxml中使用
    //滚动距离
    marginTop: 0,
    currentLine: 0,
    _num: 0,
    _album: 0,
    _hover:false
  },
  //开始/暂停音乐
  changeHover(){
    console.log(!this.data._hover)
    this.setData({
      _hover:!this.data._hover
    })
  },
  stopMusic () {
    const back = wx.getBackgroundAudioManager()
    if (!back.src) {
      wx.showToast({
        title: '先在下面选择歌曲播放呀~',
        icon: 'none',
        duration: 2000
      })
    } else {
      if (!this.data.playing) {
        back.play()
        this.setData({
          playing: true,
        })
      } else {
        back.pause()
        this.setData({
          playing: false
        })
      }
    }
  },
  //播放音乐
  playMusic (e) {
    // console.log(e)//单首音乐id
    const target = e.currentTarget.dataset.hi
    const currentIndex = e.currentTarget.dataset.index
    this.setData({
      'nowSong.currentIndex': currentIndex
    })
    this.onPlayMusic(target, currentIndex)
  },
  onPlayMusic (target, currentIndex) {
    const back = wx.getBackgroundAudioManager()
    const id = target.id//
    const name = target.name//
    const picUrl = target.al.picUrl//
    const artist = target.ar[0].name//
    console.log(target)
    wx.request({
      url: 'http://129.204.49.171:3066/song/url?id=' + id,
      success: (res) => {
        if (res.data.data[0].url) {
          back.src = res.data.data[0].url
          this.setData({
            'nowSong.url': res.data.data[0].url
          })
          this.getSongLyric(id)
          this.getSongComment(id)
          this.setData({
            'nowSong.name': name,
            'nowSong.artist': artist,
            'nowSong.picUrl': picUrl,
            'nowSong.currentIndex': currentIndex 
          })
          // back.src = this.data.nowSong.url
          back.title = name
          back.coverImgUrl = picUrl
          back.play()
          back.onPlay(
            this.setData({
              _num: target.id,
              playing: true
            })
          )
        } else {
          // this.setData({
          //   'nowSong.currentIndex': currentIndex + 1
          // })
          wx.showToast({
            title: '木有版权~',
            icon: 'none',
            duration: 2000
          })
          this.onPlayMusic(this.data.songList[currentIndex + 1], currentIndex + 1)
        }
      }
    })
  },
  getSongLyric (id) {
    wx.request({
      url: 'http://129.204.49.171:3066/lyric?id=' + id,
      success: (res) => {
        if (!res.data.lrc) {
          wx.showToast({
            title: '没找到歌词~',
            icon: 'none',
            duration: 2000
          })
        } else {
          //歌词成功获取
          const medisArray = []
          const medis = res.data.lrc.lyric
          const medises = medis.split("\n")
          medises[medises.length - 1].length === 0 && medises.pop()
          if (!medises[medises.length - 1].c) medises.pop()
          medises.forEach(function (v, i, a) {
            const t = v.substring(v.indexOf("[") + 1, v.indexOf("]"))
            medisArray.push({
              t: (t.split(":")[0] * 60 + parseFloat(t.split(":")[1])).toFixed(3),
              c: v.substring(v.indexOf("]") + 1, v.length)
            })
          })
          if (!medisArray[0].c) medisArray.shift()
          this.setData({
            'nowSong.lyric': medisArray
          })
        }
      }
    })
  },
  getSongComment (id) {
    wx.request({
      url: "http://129.204.49.171:3066/comment/music?id=" + id + "&limit=1",
      success: (res) => {
        if (!res.data.hotComments.length) {
          wx.showToast({
            title: '居然还没有人评论~',
            icon: 'none',
            duration: 2000
          })
        } else {
          this.setData({
            'nowSong.comment': res.data.hotComments[0].content
          })
        }
      }
    })
  },
  changSongList (e) {
    this.getSongList(e.currentTarget.dataset.id);
    // console.log(e)
    // console.log(e.currentTarget.dataset.id)//歌单id
    this.setData({
      _album: e.currentTarget.dataset.id
    })
  },
  getSongList (id) {
    wx.request({
      url: 'http://129.204.49.171:3066/playlist/detail?id=' + id,
      success: (res) => {
        this.setData({
          songList: res.data.playlist.tracks
        })
      }
    })
  },
  getAlbumList () {
    wx.request({
      url: 'http://129.204.49.171:3066/personalized',
      success: (res) => {
        this.setData({
          musicList: res.data.result
        })
        // console.log(this.data.musicList)
        this.getSongList(this.data.musicList[0].id)
      }
    })
  },

  onLoad: function () {
    // this.getWord();
    this.getAlbumList();
    const back = wx.getBackgroundAudioManager()
    back.onTimeUpdate(() => {
      let cindex = this.data.currentLine//0
      let clyric = this.data.nowSong.lyric//有歌词
      if (cindex != clyric.length - 1) {//
        var j = 0;
        for (var j = cindex; j < clyric.length - 1; j++) {
          // 当前时间与前一行，后一行时间作比较， j:代表当前行数
          if (cindex == clyric.length - 2) {
            //最后一行只能与前一行时间比较
            if (parseFloat(back.currentTime) > parseFloat(clyric[clyric.length - 1][0])) {
              this.setData({
                currentLine: clyric.length - 1
              })
              return;
            }
          } else {
            if (parseFloat(back.currentTime) > parseFloat(clyric[j].t) && parseFloat(back.currentTime) < parseFloat(clyric[j + 1].t)) {
              cindex = j
            }
          }
        }
      }
      if (cindex >= 1) {//超过6行开始滚动
        this.setData({
          marginTop: (cindex) * 30
        })
      }
    })
    back.onEnded(() => {
      console.log("当前歌曲播放完毕，即将播放下一首")
      const index = this.data.nowSong.currentIndex
      if (!this.data.songList[index + 1]) {
        wx.showToast({
          title: '当前列表播放完毕',
          icon: 'success',
          duration: 2000
        })
      } else {
        this.onPlayMusic(this.data.songList[index + 1], index + 1)
      }
    })
  }
})