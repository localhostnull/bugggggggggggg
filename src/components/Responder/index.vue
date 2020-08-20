<template>
  <transition name="fade">
    <div
      v-show="show"
      id="responder"
      class="responder-container"
      :style="{'left':`${left}px`,'top':`${top}px`}"
    >
      <div class="responder-bar" @mousedown="move($event)" @touchstart="move($event)"></div>
      <div class="responder-close" @click="close">关闭</div>
      <div v-if="isStart" class="responder-timer">{{timerData.label}}</div>
      <div v-if="result" class="responder-content">
        <div>
          <img
            :src="userInfo.avatar"
            style="width: 60px;height: 60px;border-radius: 60px;margin-right: 10px"
          />
        </div>
        <div>{{userInfo.name}}</div>
      </div>
      <div v-if="!isStart && !result" class="responder-no">无人抢答</div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { ITimerData } from "./index.d";
import { IUserInfo } from '../Appraise';

@Component
export default class Responder extends Vue {
  @Prop({
    type: Number,
    default: 10,
  })
  public time: number = 10;

  public left: number = 500;
  public top: number = 100;
  public show: boolean = false;
  public isStart: boolean = false;
  public result: boolean = false;
  public timer: number = 0;
  public timerData: ITimerData = {
    number: 0,
    label: "00",
  };
  public userInfo: Partial<IUserInfo> = {
    avatar:
      "http://file.yizhujiao.com/01e82ff4-0c5e-4821-9dc9-100c70699bf5.jpg?imageView2/0/w/120/h/120/q/75|imageslim",
    name: "测试人员",
  };

  public move(e: MouseEvent): void {
    const that = this;
    let odiv = (e.target as HTMLElement).parentNode as HTMLElement; //获取当前元素
    //算出鼠标相对元素的位置
    let disX = e.pageX - odiv!.offsetLeft;
    let disY = e.pageY - odiv!.offsetTop;
    odiv.onmousedown = () => {
      document.onmousemove = (e) => {
        that.left = e.pageX - disX;
        that.top = e.pageY - disY;
      };
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };
  }
  public start(time: number = 10): void {
    const that = this;
    this.show = true;
    this.result = false;
    this.isStart = true;
    this.timerData.number = time;
    this.countLabel();
    this.userInfo = {
      avatar: "",
      name: "",
    };
    this.timer = setInterval(function () {
      if (that.timerData.number === 0) {
        that.stop();
        return false;
      }
      that.timerData.number = that.timerData.number - 1;
      that.countLabel();
    }, 1000);
  }
  public countLabel(): void {
    if (this.timerData.number < 10) {
      this.timerData.label = "0" + this.timerData.number;
    } else {
      this.timerData.label = "" + this.timerData.number;
    }
  }
  public stop(): void {
    this.isStart = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    this.timerData.number = 0;
    this.timerData.label = "00";
    if (!this.result) {
      this.timerData.label = "无人抢答";
    }
  }
  public close(): void {
    this.stop();
    this.show = false;
  }
  public sendUser(userInfo: IUserInfo): void {
    if (this.isStart) {
      this.result = true;
      this.userInfo = userInfo;
      this.stop();
      this.$emit("success", { uid: this.userInfo.uid });
    }
  }
}
</script>

<style scoped lang="less">
.responder-container {
  position: fixed;
  width: 200px;
  height: 100px;
  border-radius: 10px;
  background-color: #437ae7;
  z-index: 999;
  box-shadow: 0px 5px 10px #999999;
  overflow: hidden;
}

.responder-bar {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
}

.responder-timer {
  width: 100%;
  height: 100%;
  font-size: 60px;
  color: #ffffff;
  text-align: center;
  line-height: 100px;
  user-select: none;
}

.responder-close {
  position: absolute;
  z-index: 101;
  font-size: 12px;
  line-height: 20px;
  padding: 0 15px;
  top: 0;
  right: 0;
  cursor: pointer;
  color: #000000;
  background-color: rgba(255, 255, 255, 0.5);
  border-bottom-left-radius: 10px;
  user-select: none;
}

.responder-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  user-select: none;
}

.responder-no {
  width: 100%;
  height: 100%;
  font-size: 30px;
  color: #ffffff;
  text-align: center;
  line-height: 100px;
  user-select: none;
}
</style>