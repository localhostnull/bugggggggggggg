<template>
  <div v-show="visible" class="dialog" :class="{'dialog__open' : visible, 'dialog__close': !visible}">
    <div class="dialog-mask" @click="close"></div>
    <div class="dialog-content">
      <div class="dialog-user-info">
        <div class="dialog-user-info-avatar"><img :src="userInfo.avatar"/></div>
        <div class="dialog-user-info-right">
          <div class="dialog-user-info-name">{{userInfo.name}}</div>
          <div class="dialog-user-info-point">当前得分：{{userInfo.point}}</div>
        </div>
        <div class="dialog-user-medal">
          <div v-for="item in userInfo.medal" :key="item.id" class="dialog-user-medal-item">
            <img :src="item.url" class="dialog-user-medal-item-url">
            <div class="dialog-user-medal-item-count">{{item.count}}</div>
          </div>
        </div>
      </div>
      <div class="dialog-tools">
        <div v-if="!userInfo.active && userInfo.online" class="dialog-tools-item" @click="sendEvent('upSeat')">上讲台</div>
        <div class="dialog-tools-item">禁言</div>
        <div class="dialog-tools-item">踢出</div>
        <div class="dialog-tools-item">重进</div>
        <div class="dialog-tools-item" @click="close">关闭</div>
      </div>
      <div class="dialog-medal">
        <div v-for="(item, index) in medalList" :key="item.id" class="dialog-medal-item"
             @click="sendMedal(index)">
          <div class="dialog-medal-item-url"><img :src="item.icon_url"/></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { IMedal, IUserInfo } from './index.d'
import { getMedalInfoApi, sendMedalApi } from '@/servece/operations/index'

@Component
export default class Appraise extends Vue {
  @Prop({
    type: String,
    default: ''
  })
  public roomId!: string;

  public visible:boolean = false
  public userInfo:IUserInfo = {} as IUserInfo
  public medalList: IMedal[] = []

  public init(): void {
    getMedalInfoApi(this.roomId).then(res => {
      res.data.list.map(item => {
        this.medalList.push(item)
      })
    })
  }

  public open(userInfo: IUserInfo) {
    this.userInfo = userInfo
    this.visible = true
  }

  public close(userInfo: IUserInfo) {
    this.visible = false
  }
  
  @Emit('success')
  public sendMedal(index: number) {
    this.visible = false
    sendMedalApi({
      user_id: this.userInfo.uid,
      medal_uuid: this.medalList[index].medal_uuid
    })
    return this.medalList[index]
  }
  
  @Emit('event')
  public sendEvent(action: string) {
    this.visible = false
    return {
      uid: this.userInfo.uid,
      action
    }
  }
}
</script>

<style scoped lang="less">
  .dialog {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    z-index: 999;
  }

  .dialog-content {
    position: absolute;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12);
    width: 100%;
    height: 40%;
    left: 0;
    bottom: 0;
    z-index: 50002;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  .dialog-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 50001;
    background: rgba(0, 0, 0, .5);
  }

  @keyframes btt-drawer-in {
    0% {
      transform: translateY(100%)
    }
    to {
      transform: translateY(0)
    }
  }

  @keyframes btt-drawer-out {
    0% {
      transform: translate(0)
    }
    to {
      transform: translateY(100%)
    }
  }

  @keyframes drawer-fade-in {
    0% {
      opacity: 0
    }
    to {
      opacity: 1
    }
  }

  .dialog__open .dialog-mask {
    animation: drawer-fade-in .3s
  }

  .dialog__open .dialog-content {
    animation: btt-drawer-in .3s
  }

  .dialog__close .dialog-content {
    transform: translateY(100%)
  }

  .dialog-user-info {
    position: absolute;
    top: -40px;
    left: 50px;
    display: flex;
    width: 500px;
    height: 100px;
  }

  .dialog-user-info-avatar {
    width: 100px;
    height: 100px;
  }

  .dialog-user-info-avatar img {
    width: 100px;
    height: 100px;
    border-radius: 100px;
    /*box-shadow: 0px 1px 3px 2px rgba(0, 0, 0, .2);*/
  }

  .dialog-user-info-right {
    margin-top: 55px;
    margin-left: 20px;
  }

  .dialog-user-info-name {
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }

  .dialog-user-info-point {
    color: #666666;
    font-size: 12px;
    margin-top: 2px;
  }

  .dialog-tools {
    height: 50px;
    margin-left: 250px;
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
  }

  .dialog-tools-item {
    padding: 3px 10px;
    border: 1px solid #437ae7;
    border-radius: 5px;
    font-size: 12px;
    color: #437ae7;
    cursor: pointer;
    opacity: 0.4;
    margin: 10px 5px;
    height: 26px;
  }

  .dialog-medal {
    display: flex;
    flex-wrap: wrap;
    margin-left: 70px;
  }

  .dialog-medal-item {
    margin: 70px 20px 0 20px;
  }

  .dialog-medal-item-url {
    width: 100px;
    height: 100px;
  }

  .dialog-medal-item-url img {
    width: 100px;
  }

  .dialog-user-medal {
    display: flex;
    margin-top: 55px;
    margin-left: 10px;
    overflow: hidden;
  }

  .dialog-user-medal-item {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 5px;
  }

  .dialog-user-medal-item-url {
    width: 40px;
  }

  .dialog-user-medal-item-count {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 20px;
    width: 20px;
    border-radius: 20px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    background-color: rgba(255, 255, 255, 0.3);
  }
</style>