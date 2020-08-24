<template>
  <div class="app-container">
    <div
      class="view-main"
      :style="{width:viewSet.main.width + 'px',height:viewSet.main.height + 'px'}"
    >
      <div
        class="view-courseware"
        :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px',top:viewSet.courseware.top + 'px',left:viewSet.courseware.left + 'px'}"
      >
        <iframe
          v-if="gameShow"
          :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px'}"
          id="courseware-game"
          name="courseware-game"
          class="courseware-game"
          src
          scrolling="no"
          allow="autoplay"
        ></iframe>

        <div
          class="courseware-canvas"
          :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px', pointerEvents: drawSet.select === null ? 'none' : 'auto'}"
        >
          <RoomCanvas
            v-for="n in pageSet.total"
            :key="n"
            v-show="n === pageSet.current"
            :ref="'courseware-canvas-' + n"
            :id="'courseware-canvas-' + n"
            :width="viewSet.courseware.width"
            :height="viewSet.courseware.height"
            @success="handelCanvas"
          />
        </div>

        <iframe
          :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px'}"
          id="courseware-main"
          name="courseware-main"
          class="courseware-main"
          src="https://app.ejinyubao.com/index3.html"
          scrolling="no"
          allow="autoplay"
        ></iframe>
        <!--测试课件地址：https://app.ejinyubao.com/index3.html-->
        <!--测试课件地址：http://127.0.0.1:5594/index.html-->
      </div>
      <div
        class="view-control"
        :style="{width:viewSet.control.width + 'px',height:viewSet.control.height + 'px',top:viewSet.control.top + 'px',left:viewSet.control.left + 'px'}"
      >
        <div class="control-draw">
          <div class="draw-color-list">
            <div
              v-for="(item, index) in drawSet.color"
              :key="index"
              :class="'draw-color-list-item ' + (index === drawSet.colorSelect ? 'select' : '')"
              :style="{backgroundColor: item}"
              @click="drawSetColor(index)"
            ></div>
          </div>
          <div
            v-for="(item, index) in drawSet.list"
            :key="index"
            :class="'control-draw-item' + (index === drawSet.select?' select':'')"
            @click="drawSelect(index)"
          >{{item.title}}</div>
          <div class="control-draw-item" @click="drawGetHistory">撤销</div>
        </div>
        <div class="control-page">
          <div class="control-page-info">{{pageSet.current}} / {{pageSet.total}}</div>
          <div class="control-page-item" @click="pagePrev">上一页</div>
          <div class="control-page-item" @click="pageNext">下一页</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import cache from "@/utils/cache";
import AgoraRTM from "agora-rtm-sdk";
import RoomCanvas from "../../components/RoomCanvas";
import { IRoomInfo } from "@/servece/operations/index.d";
import {
  IRtm,
  IDragData,
  IDrawSet,
  IPageSet,
  ICacheData,
  IViewSet,
  IRtmInfo,
} from "./index.d";
import { getRoomInfoApi, getRtmInfoApi } from "@/servece/operations";

@Component({
  components: {
    RoomCanvas,
  },
})
export default class Couseware extends Vue {
  public roomId = "";
  public roomInfo: IRoomInfo = {} as IRoomInfo;
  public rtmInfo: IRtmInfo = {
    app_id: "",
    channel: "",
    uid: 0,
    token: "",
  };
  public rtm: IRtm = {
    client: null,
    channel: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {},
  };
  public dragData: IDragData = {
    x: 0,
    y: 0,
    show: false,
  };
  public drawSet: IDrawSet = {
    list: [
      { title: "画笔", type: "pen" },
      { title: "矩形", type: "rec" },
      { title: "椭圆", type: "circle" },
    ],
    color: ["#FF0000", "#008000", "#FFA500", "#0000FF"],
    colorSelect: 0,
    select: -1,
  };
  public pageSet: IPageSet = {
    total: 5,
    current: 1,
  };
  public cacheData: ICacheData = {
    pageCurrent: -1,
    drawInfo: [],
  };
  public cacheKey = "";
  public gameShow = false;

  public get viewSet(): IViewSet {
    const scale = 800 / 600;
    const screenWidth = document.body.clientWidth;
    const screenHeight = document.body.clientHeight;
    const main = {
      width: screenWidth,
      height: screenHeight,
    };
    const courseware = {
      width: parseInt(`${(screenHeight - 20) * scale}`),
      height: screenHeight - 20,
      top: 10,
      left: screenWidth - parseInt(`${(screenHeight - 20) * scale}`) - 10,
    };
    const control = {
      width: 80,
      height: screenHeight,
      top: 0,
      left: 0,
    };
    return {
      main: main,
      courseware: courseware,
      control: control,
    };
  }

  public created(): void {
    this.init();
    window.addEventListener(
      "message",
      (event) => {
        const message = JSON.parse(event.data);
        if (message.action === "game") {
          this.sendMessage({
            action: "gameScore",
            score: message.score,
            uid: 10007,
          });
        }
      },
      false
    );
  }
  public init(): void {
    this.roomId = this.$router.currentRoute.params.pathMatch;
    this.cacheKey = "room_cache_" + this.roomId;
    this.coursewareInit();
    getRoomInfoApi(this.roomId).then(({ data: res }) => {
      this.roomInfo = res;
    });
    getRtmInfoApi(this.roomId).then(({ data: res }) => {
      this.rtmInfo = res;
      this.rtm.client = AgoraRTM.createInstance(this.rtmInfo.app_id);
      this.rtmInit();
    });
  }
  public rtmInit(): void {
    this.rtm.channel = this.rtm.client.createChannel(this.rtmInfo.channel);

    this.rtmEvent();

    this.rtm.client
      .login({ token: this.rtmInfo.token, uid: this.rtmInfo.uid })
      .then(() => {
        console.log("AgoraRTM client login success");
        this.rtm.channel
          .join()
          .then(() => {
            console.log("加入频道成功");
          })
          .catch((error: Error) => {
            console.log(error);
          });
      })
      .catch((err: Error) => {
        console.log("AgoraRTM client login failure", err);
      });
  }
  public rtmEvent(): void {
    this.rtm.client.on(
      "ConnectionStateChanged",
      (newState: any, reason: any) => {
        console.log(
          "on connection state changed to " + newState + " reason: " + reason
        );
      }
    );

    this.rtm.channel.on("MemberJoined", (memberId: any) => {
      console.log("MemberJoined", memberId);
    });

    this.rtm.channel.on("MemberLeft", (memberId: any) => {
      // 你的代码：用户已离开频道。
      console.log("MemberLeft", memberId);
    });

    this.rtm.channel.on("ChannelMessage", ({ text }: any, senderId: any) => {
      console.log(senderId);
      const message = JSON.parse(text);
      console.log(message);
      //   if (message.action === "upSeat") {
      //     if (message.uid === this.rtcInfo.uid) {
      //       that.rtcPublish();
      //     }
      //   }
      //   if (message.action === "downSeat") {
      //     if (message.uid === this.rtcInfo.uid) {
      //       that.rtcUnpublish();
      //     }
      //   }
      //   if (message.action === "sendDiscuss") {
      //     that.discuss.list.push({
      //       name: message.name,
      //       message: message.message,
      //     });
      //   }
      if (message.action === "canvas") {
        const id = message.id;
        if (message.type === "draw") {
          (this.$refs[id] as any[])[0].drawWithInfoOne(message.info);
        } else if (message.type === "back") {
          (this.$refs[id] as any[])[0].backWithInfoOne();
        }
      }
      if (message.action === "courseware") {
        if (message.type === "seek") {
          this.pageSeek(message.page);
        }
      }
      if (message.action === "roomGetHistory") {
        if (this.cacheData.pageCurrent !== null) {
          this.sendMessage({
            athisction: "history",
            uid: message.uid,
            message: this.cacheData,
          });
        }
      }
      if (message.action === "gameStart") {
        this.gameShow = true;
        this.$nextTick(() => {
          (document.getElementById("courseware-game") as any).src =
            "http://127.0.0.1:5107/index.html";
        });
      }
      if (message.action === "gameClose") {
        (document.getElementById("courseware-game") as any).src = "";
        this.gameShow = false;
      }
    });
  }
  public coursewareInit(): void {
    this.$nextTick(() => {
      document.getElementById("courseware-main")!.onload = () => {
        const data = cache.get(this.cacheKey);
        if (data !== null) {
          this.roomHistoryToCourseware(data);
        } else {
          this.pageSeek(this.pageSet.current);
        }
      };
    });
  }
  public sendMessage(data: any): void {
    const text = JSON.stringify(data);
    this.rtm.channel
      .sendMessage({ text: text })
      .then(() => {
        /* 频道消息发送成功的处理逻辑 */
        console.log("发送消息", text);
      })
      .catch((error: Error) => {
        /* 频道消息发送失败的处理逻辑 */
        console.log(error);
      });
  }
  public drawSelect(index: number) {
    if (this.drawSet.select === index) {
      this.drawSet.select = 0;
    } else {
      this.drawSet.select = index;
      for (let i = 1; i <= this.pageSet.total; i++) {
        const id = "courseware-canvas-" + i;
        (this.$refs[id] as any)[0].setLineType(this.drawSet.list[index].type);
      }
    }
  }
  public drawSetColor(index: number) {
    this.drawSet.colorSelect = index;
    for (let i = 1; i <= this.pageSet.total; i++) {
      const id = "courseware-canvas-" + i;
      (this.$refs[id] as any)[0].setLineColor(this.drawSet.color![index]);
    }
  }
  public drawGetHistory() {
    const id = "courseware-canvas-" + this.pageSet.current;
    (this.$refs[id] as any)[0].getBack();
  }
  public handelCanvas(data: any) {
    const message = {
      action: "canvas",
      type: data.type,
      info: data.info,
      id: data.id,
    };
    this.sendMessage(message);
    this.roomCache(message);
  }
  public pagePrev(): void {
    if (this.pageSet.current > 1) {
      this.pageSet.current--;
      this.pageSeek(this.pageSet.current);
      this.sendMessage({
        action: "courseware",
        type: "seek",
        page: this.pageSet.current,
      });
      this.roomCache(null);
    }
  }
  public pageNext() {
    if (this.pageSet.current < this.pageSet.total) {
      this.pageSet.current++;
      this.pageSeek(this.pageSet.current);
      this.sendMessage({
        action: "courseware",
        type: "seek",
        page: this.pageSet.current,
      });
      this.roomCache(null);
    }
  }

  public pageSeek(page: number) {
    window.frames["courseware-main" as any].postMessage(page, "*");
    this.pageSet.current = page;
  }
  public roomCache(message: any = null) {
    if (this.cacheData.pageCurrent === this.pageSet.current) {
      this.cacheData.drawInfo.push(message);
    } else {
      this.cacheData.pageCurrent = this.pageSet.current;
      this.cacheData.drawInfo = [];
      if (message !== null) this.cacheData.drawInfo.push(message);
    }
    cache.set(this.cacheKey, this.cacheData, 86400);
  }
  public roomHistoryToCourseware(data: any) {
    this.cacheData.pageCurrent = data.pageCurrent;
    this.cacheData.drawInfo = data.drawInfo;
    this.pageSeek(data.pageCurrent);
    for (let i = 0; i < data.drawInfo.length; i++) {
      const message = data.drawInfo[i];
      if (message.action === "canvas") {
        const id = message.id;
        if (message.type === "draw") {
          (this.$refs[id] as any)[0].drawWithInfoOne(message.info);
        } else if (message.type === "back") {
          (this.$refs[id] as any)[0].backWithInfoOne();
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.view-control {
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  background-color: transparent;
}

.draw-color-list {
  justify-content: center;
  margin-bottom: 10px;
}

.control-draw-item {
  margin-bottom: 10px;
}

.control-draw {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.control-page {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 0;
}

.control-page-info {
  margin-bottom: 10px;
}

.control-page-item {
  margin-bottom: 10px;
}
</style>
