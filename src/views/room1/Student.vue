<template>
  <div class="app-container">
    <div class="view-bar">
      <div class="view-logo">
        <img :src="roomInfo.logo" />
      </div>
      <div class="view-title">{{roomInfo.title}}</div>
    </div>
    <div
      class="view-main"
      :style="{width:viewSet.main.width + 'px',height:viewSet.main.height + 'px'}"
    >
      <div
        class="view-teacher"
        :style="{width:viewSet.teacher.width + 'px',height:viewSet.teacher.height + 'px',top:viewSet.teacher.top + 'px',left:viewSet.teacher.left + 'px'}"
      >
        <div id="teacher-video" class="teacher-video"></div>
      </div>
      <div
        class="view-self"
        :style="{width:viewSet.self.width + 'px',height:viewSet.self.height + 'px',top:viewSet.self.top + 'px',left:viewSet.self.left + 'px'}"
      >
        <div id="self-video" class="self-video"></div>
      </div>
      <div
        class="view-courseware"
        :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px',top:viewSet.courseware.top + 'px',left:viewSet.courseware.left + 'px'}"
      >
        <div
          v-for="item in studentActivityList"
          :key="item.uid"
          class="student-active"
          :style="{left:item.x + 'px',top:item.y + 'px'}"
        >
          <div class="student-active-bar"></div>
          <div :id="'student-video-' + item.uid" class="student-active-video"></div>
        </div>

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
          :src="roomInfo.courseware_url"
          scrolling="no"
          allow="autoplay"
        ></iframe>
      </div>
      <div
        class="view-control"
        :style="{width:viewSet.control.width + 'px',height:viewSet.control.height + 'px',top:viewSet.control.top + 'px',left:viewSet.control.left + 'px'}"
      >
        <div class="control-draw">
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
        </div>
      </div>
      <div
        class="view-student"
        :style="{width:viewSet.student.width + 'px',height:viewSet.student.height + 'px',top:viewSet.student.top + 'px',left:viewSet.student.left + 'px'}"
      >
        <div v-if="groupInfo.length === 2" class="student-group-top">
          <div class="student-group-top-pk">
            <div class="student-group-top-1">{{ groupInfo[0].name }}</div>
            <div class="student-group-top-2">PK</div>
            <div class="student-group-top-3">{{ groupInfo[1].name }}</div>
          </div>
          <div class="student-group-top-score">
            <div
              class="student-group-top-score-1"
              :style="{width: (groupInfo[0].score + groupInfo[1].score > 0? groupInfo[0].score / (groupInfo[0].score + groupInfo[1].score) * 100 : 50) + '%'}"
            >{{ groupInfo[0].score }}</div>
            <div class="student-group-top-score-2">{{ groupInfo[1].score }}</div>
          </div>
        </div>
        <div class="student-list" :style="{height:viewSet.student.height - 80 + 'px'}">
          <div
            v-for="groupLi in groupInfo"
            :key="groupLi.id"
            class="student-list-group"
            :style="{width: ((groupInfo.length > 0? 100 / groupInfo.length : 100) + '%')}"
          >
            <div
              v-for="item in groupLi.list"
              :key="item.uid"
              class="student-item"
              :style="{alignSelf: 'flex-end'}"
            >
              <div class="student-item-avatar">
                <img :src="item.avatar" />
              </div>
              <div v-if="groupLi.mvp === item.uid" class="student-item-mvp">MVP</div>
              <div class="student-item-praise">赞</div>
              <div class="student-item-point">{{ item.point }}</div>
              <div class="student-item-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "vue-class-component";
import AgoraRTC from "agora-rtc-sdk";
import AgoraRTM from "agora-rtm-sdk";
import RoomCanvas from "@/components/RoomCanvas/index.vue";
import { IRoomInfo, IRoomUser } from "@/servece/operations/index.d";
import appModule from "@/store/modules/app";
import {
  IRtcInfo,
  IRtmInfo,
  IRtc,
  IRtm,
  IDragData,
  IDrawSet,
  IPageSet,
  IStudent,
  IActivityStudent,
  IDiscuss,
  IViewSet,
  ICacheData,
} from ".";
import {
  getRoomInfoApi,
  getRtcInfoApi,
  getRtmInfoApi,
  getAgoraUserInfoApi,
} from "@/servece/operations";

@Component({
  components: {
    RoomCanvas,
  },
})
export default class Student extends Vue {
  public roomId = "";
  public roomInfo: IRoomInfo = {
    uid: 0,
    teacher_uid: 0,
    tutor_uid: 0,
    logo: "",
    title: "",
    courseware_url: "",
    user_list: [],
  };
  public rtcInfo: IRtcInfo = {
    app_id: "",
    channel: "",
    uid: 0,
    token: "",
  };
  public rtmInfo: IRtmInfo = {
    app_id: "",
    channel: "",
    uid: 0,
    token: "",
  };
  public rtc: IRtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {},
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
  public studentList: IStudent[] = [];
  public studentActivityList: IActivityStudent[] = [];
  public groupInfo: any[] = [];
  public discuss: IDiscuss = {
    list: [],
    message: "",
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
    select: -1,
  };
  public pageSet: IPageSet = {
    total: 1,
    current: 1,
  };
  public gameShow = false;

  public get viewSet(): IViewSet {
    let scale = 1;
    let screenWidth = document.body.clientWidth;
    if (screenWidth > 1700) scale = 1.2;
    const main = {
      width: 1330 * scale,
      height: 660 * scale,
    };
    const teacher = {
      width: 250 * scale,
      height: 250 * scale,
      top: 0,
      left: 0,
    };
    const courseware = {
      width: 800 * scale,
      height: 600 * scale,
      top: 0,
      left: 265 * scale,
    };
    const student = {
      width: 250 * scale,
      height: 650 * scale,
      top: 0,
      left: 1080 * scale,
    };
    const discuss = {
      width: 250 * scale,
      height: 335 * scale,
      top: 265 * scale,
      left: 0,
    };
    const control = {
      width: 800 * scale,
      height: 70 * scale,
      top: 580 * scale,
      left: 265 * scale,
    };
    const self = {
      width: 250 * scale,
      height: 250 * scale,
      top: 265 * scale,
      left: 0,
    };
    return {
      main: main,
      teacher: teacher,
      courseware: courseware,
      student: student,
      discuss: discuss,
      control: control,
      self: self,
    };
  }
  created() {
    this.init();
    window.addEventListener(
      "message",
      (event) => {
        let message = JSON.parse(event.data);
        if (message.action === "game") {
          this.sendMessage({
            action: "gameScore",
            score: message.score,
            uid: this.roomInfo.uid,
          });
        } else if (message.action === "coursewareEvent") {
          this.sendMessage(message);
        } else if (message.action === "coursewareReady") {
          this.pageSet.total = message.total;
        }
      },
      false
    );
  }
  public init(): void {
    this.roomId = this.$router.currentRoute.params.pathMatch;
    this.coursewareInit();
    getRoomInfoApi(this.roomId).then(({ data: res }) => {
      this.roomInfo = res;
    });
    getRtcInfoApi(this.roomId).then(({ data: res }) => {
      this.rtcInfo = res;
      this.rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
      this.rtcInit();
    });
    getRtmInfoApi(this.roomId).then(({ data: res }) => {
      this.rtmInfo = res;
      this.rtm.client = AgoraRTM.createInstance(this.rtmInfo.app_id);
      this.rtmInit();
    });
  }
  public getUser(uid: number): Promise<IRoomUser> {
    let userInfo: IRoomUser = {
      uid: 0,
      name: "",
      avatar: "",
    };
    return new Promise((resolve, reject) => {
      let index = this.roomInfo.user_list.findIndex((item) => item.uid === uid);
      if (index !== -1) {
        userInfo.uid = this.roomInfo.user_list[index].uid;
        userInfo.name = this.roomInfo.user_list[index].name;
        userInfo.avatar = this.roomInfo.user_list[index].avatar;
        resolve(userInfo);
      } else {
        getAgoraUserInfoApi(uid)
          .then(({ data: res }) => {
            userInfo = res;
            this.roomInfo.user_list.push(userInfo);
            resolve(userInfo);
          })
          .catch((err: Error) => {
            reject(err);
          });
      }
    });
  }
  public rtcInit() {
    this.rtcEvent();

    this.rtc.client.init(
      this.rtcInfo.app_id,
      function () {
        console.log("init success");
      },
      (err: Error) => {
        console.error(err);
      }
    );

    // The value of role can be "host" or "audience".
    this.rtc.client.setClientRole("host");

    // Join a channel
    this.rtc.client.join(
      this.rtcInfo.token ? this.rtcInfo.token : null,
      this.rtcInfo.channel,
      this.rtcInfo.uid ? +this.rtcInfo.uid : null,
      (uid: number) => {
        console.log(
          "join channel: " + this.rtcInfo.channel + " success, uid: " + uid
        );
        this.rtc.params.uid = uid;
        // Create a local stream
        this.rtc.localStream = AgoraRTC.createStream({
          streamID: this.rtc.params.uid,
          audio: true,
          video: true,
          screen: false,
        });

        // Initialize the local stream
        this.rtc.localStream.init(
          () => {
            console.log("init local stream success");
            this.rtc.localStream.play("self-video");
          },
          function (err: Error) {
            console.error("init local stream failed ", err);
          }
        );
      },
      (err: Error) => {
        console.error("client join failed", err);
      }
    );
  }
  public rtcEvent() {
    this.rtc.client.on("stream-added", (evt: any) => {
      let remoteStream = evt.stream;
      let uid = remoteStream.getId();
      console.log("有流加入", uid);
      if (uid !== this.rtc.params.uid) {
        if (uid === this.roomInfo.tutor_uid) {
          console.log("老师加入的教室");
        } else {
          this.addStudent(uid);
          this.addActivity(uid, this.dragData.x, this.dragData.y);
        }
        this.rtc.client.subscribe(remoteStream, (err: Error) => {
          console.log("stream subscribe failed", err);
        });
      }
    });

    this.rtc.client.on("stream-subscribed", (evt: any) => {
      let remoteStream = evt.stream;
      let uid = remoteStream.getId();
      console.log("stream-subscribed", uid);
      this.$nextTick(() => {
        if (
          uid === this.roomInfo.tutor_uid ||
          uid === this.roomInfo.teacher_uid
        ) {
          document.getElementById("teacher-video")!.innerHTML = "";
          remoteStream.play("teacher-video");
        } else {
          remoteStream.play("student-video-" + uid);
        }
      });
    });

    this.rtc.client.on("stream-removed", (evt: any) => {
      let remoteStream = evt.stream;
      let uid = remoteStream.getId();
      console.log("stream-removed", uid);
      if (
        uid === this.roomInfo.tutor_uid ||
        uid === this.roomInfo.teacher_uid
      ) {
        remoteStream.stop("teacher-video");
      } else {
        remoteStream.stop("student-video-" + uid);
        this.removeActivity(uid);
      }
    });

    //该回调提示有远端用户/主播加入频道。
    this.rtc.client.on("peer-online", (evt: any) => {
      let uid = evt.uid;
      if (
        uid === this.roomInfo.tutor_uid ||
        uid === this.roomInfo.teacher_uid
      ) {
        console.log("老师加入频道");
      } else {
        this.addStudent(uid);
      }
    });

    //该回调通知应用有远端用户离线。
    this.rtc.client.on("peer-leave", (evt: any) => {
      let uid = evt.uid;
      let reason = evt.reason;
      if (
        uid === this.roomInfo.tutor_uid ||
        uid === this.roomInfo.teacher_uid
      ) {
        console.log("老师离开频道");
      } else {
        if (reason !== "BecomeAudience") {
          this.removeStudent(uid);
        }
      }
    });
  }
  public rtmInit() {
    this.rtm.channel = this.rtm.client.createChannel(this.rtmInfo.channel);

    this.rtmEvent();

    this.rtm.client
      .login({ token: this.rtmInfo.token, uid: this.rtmInfo.uid })
      .then(() => {
        this.rtm.channel
          .join()
          .then(() => {
            console.log("加入频道成功");
            this.roomGetHistory();
          })
          .catch((error: Error) => {
            console.log(error);
          });
      })
      .catch((err: Error) => {
        console.log("登陆频道失败", err);
      });
  }
  public rtmEvent() {
    this.rtm.client.on(
      "ConnectionStateChanged",
      (newState: any, reason: any) => {
        console.log(
          "on connection state changed to " + newState + " reason: " + reason
        );
      }
    );

    this.rtm.channel.on("ChannelMessage", ({ text }: any, senderId: any) => {
      console.log(senderId);
      let message = JSON.parse(text);
      console.log(message);
      if (message.action === "upSeat") {
        if (message.uid === this.rtcInfo.uid) {
          this.rtcPublish();
        }
      }
      if (message.action === "downSeat") {
        if (message.uid === this.rtcInfo.uid) {
          this.rtcUnpublish();
        }
      }
      if (message.action === "sendDiscuss") {
        this.discuss.list.push({
          name: message.name,
          message: message.message,
        });
      }
      if (message.action === "canvas") {
        let id = message.id;
        if (message.type === "draw") {
          (this.$refs[id] as any)[0].drawWithInfoOne(message.info);
        } else if (message.type === "back") {
          (this.$refs[id] as any)[0].backWithInfoOne();
        }
      }
      if (message.action === "courseware") {
        if (message.type === "seek") {
          this.pageSeek(message.page);
        }
      }
      if (message.action === "history") {
        if (this.rtmInfo.uid === message.uid) {
          this.roomHistoryToCourseware(message.message);
        }
      }
      if (message.action === "gameStart") {
        this.gameShow = true;
        this.$nextTick(() => {
          (document.getElementById("courseware-game") as any).src = message.url;
        });
      }
      if (message.action === "gameClose") {
        (document.getElementById("courseware-game") as any).src = "";
        this.gameShow = false;
      }
      if (message.action === "groupInfo") {
        this.groupInfo = message.groupInfo;
      }
      if (message.action === "studentVideo") {
        let index = this.studentActivityList.findIndex(
          (item) => item.uid === message.uid
        );
        if (index !== -1) {
          this.studentActivityList[index].x = message.x;
          this.studentActivityList[index].y = message.y;
        }
      }
      if (message.action === "coursewareEvent") {
        this.coursewarePostEvent(message.event);
      }
    });
  }
  public coursewareInit() {
    this.$nextTick(() => {
      document.getElementById("courseware-main")!.onload = () => {
        this.pageSeek(this.pageSet.current);
      };
    });
  }
  public rtcPublish() {
    // Publish the local stream
    this.rtc.client.publish(this.rtc.localStream, function (err: Error) {
      console.log("publish failed");
      console.error(err);
    });
  }
  public rtcUnpublish() {
    this.rtc.client.unpublish(this.rtc.localStream, function (err: Error) {
      console.log("unpublish failed");
      console.error(err);
    });
  }
  public addActivity(uid: number, x = 0, y = 0) {
    let index = this.studentList.findIndex((item) => item.uid === uid);
    if (index !== -1) {
      this.studentList[index].active = true;
      if (
        this.studentActivityList.findIndex((item) => item.uid === uid) === -1
      ) {
        this.studentActivityList.push({
          uid: uid,
          x: x,
          y: y,
        });
      }
    }
  }
  public removeActivity(uid: number) {
    let index = this.studentList.findIndex((item) => item.uid === uid);
    if (index !== -1) {
      this.studentList[index].active = false;
    }
    for (let i = 0, len = this.studentActivityList.length; i < len; i++) {
      if (this.studentActivityList[i].uid === uid) {
        this.studentActivityList.splice(i, 1);
        break;
      }
    }
  }
  public addStudent(uid: number) {
    let userIndex = this.roomInfo.user_list.findIndex(
      (item) => item.uid === uid
    );
    if (userIndex === -1) {
      return false;
    }
    if (this.roomInfo.user_list[userIndex].role === "student") {
      if (this.studentList.findIndex((item) => item.uid === uid) === -1) {
        this.studentList.push({
          uid: uid,
          active: false,
          name: this.roomInfo.user_list[userIndex].name,
          avatar: this.roomInfo.user_list[userIndex].avatar,
          point: 0,
          group: this.roomInfo.user_list[userIndex].group as number,
        });
      }
    }
  }
  public removeStudent(uid: number) {
    for (let i = 0, len = this.studentList.length; i < len; i++) {
      if (this.studentList[i].uid === uid) {
        this.studentList.splice(i, 1);
        break;
      }
    }
  }
  public sendMessage(data: any) {
    let text = JSON.stringify(data);
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
  public upSeat(uid: number) {
    this.sendMessage({
      action: "upSeat",
      uid: uid,
    });
  }
  public downSeat(uid: number) {
    this.sendMessage({
      action: "downSeat",
      uid: uid,
    });
  }
  public sendDiscuss() {
    this.sendMessage({
      action: "sendDiscuss",
      message: this.discuss.message,
      name: appModule.name,
    });
    this.discuss.list.push({
      message: this.discuss.message,
      name: appModule.name,
    });
    this.discuss.message = "";
  }
  public drawSelect(index: number) {
    if (this.drawSet.select === index) {
      this.drawSet.select = -1;
    } else {
      this.drawSet.select = index;
      for (let i = 1; i <= this.pageSet.total; i++) {
        let id = "courseware-canvas-" + i;
        (this.$refs[id] as any)[0].setLineType(this.drawSet.list[index].type);
      }
    }
  }
  public drawGetHistory() {
    let id = "courseware-canvas-" + this.pageSet.current;
    let res = (this.$refs[id] as any)[0].getBack();
    if (res) {
      this.sendMessage({
        action: "canvas",
        type: "back",
        info: null,
        id: id,
      });
    }
  }
  public handelCanvas(data: any) {
    this.sendMessage({
      action: "canvas",
      type: "draw",
      info: data.info,
      id: data.id,
    });
  }
  public pagePrev() {
    if (this.pageSet.current > 1) {
      this.pageSet.current--;
      this.pageSeek(this.pageSet.current);
      this.sendMessage({
        action: "courseware",
        type: "seek",
        page: this.pageSet.current,
      });
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
    }
  }
  public pageSeek(page: number) {
    let message = {
      action: "seek",
      page: page,
    };
    window.frames["courseware-main" as any].postMessage(
      JSON.stringify(message),
      "*"
    );
    this.pageSet.current = page;
  }
  public roomHistoryToCourseware(data: ICacheData) {
    // this.cacheData.pageCurrent = data.pageCurrent
    // this.cacheData.drawInfo = data.drawInfo
    this.pageSeek(data.pageCurrent);
    for (let i = 0; i < data.drawInfo.length; i++) {
      let message = data.drawInfo[i];
      if (message.action === "canvas") {
        let id = message.id;
        if (message.type === "draw") {
          (this.$refs[id] as any)[0].drawWithInfoOne(message.info);
        } else if (message.type === "back") {
          (this.$refs[id] as any)[0].backWithInfoOne();
        }
      }
    }
  }
  public roomGetHistory() {
    this.sendMessage({
      action: "roomGetHistory",
      uid: this.rtmInfo.uid,
    });
  }
  public getGroupInfo() {
    this.sendMessage({
      action: "getGroupInfo",
    });
  }
  public coursewarePostEvent(event: any) {
    window.frames["courseware-main" as any].postMessage(
      JSON.stringify(event),
      "*"
    );
  }
}
</script>
