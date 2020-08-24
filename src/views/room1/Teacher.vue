<template>
  <div class="app-container">
    <div class="view-bar" :style="{width:viewSet.main.width + 'px'}">
      <div class="view-bar-left">
        <div class="view-logo">
          <img :src="roomInfo.logo" />
        </div>
      </div>
      <div class="view-bar-right">
        <div class="view-txt-no">课程编号：0002</div>
        <div class="view-txt-length">课程时长20分钟</div>
        <div class="view-txt-timer">
          <div class="view-txt-timer-icon">
            <img src="http://file.yizhujiao.com/93a05fad-9022-4408-8172-544009709f19.png" />
          </div>
          <div>20:00</div>
        </div>
        <div class="view-handle">
          <div class="view-handle-item">
            <img src="http://file.yizhujiao.com/63adc02b-7396-4446-8a1e-74e39b51d623.png" />
          </div>
          <div class="view-handle-item">
            <img src="http://file.yizhujiao.com/a5bf9567-54fb-42bc-af60-121a56ce858d.png" />
          </div>
          <div class="view-handle-item">
            <img src="http://file.yizhujiao.com/09a221c0-e345-4f37-8d2f-760c90575746.png" />
          </div>
          <div class="view-handle-item" @click="classOver">
            <img src="http://file.yizhujiao.com/fde79439-0342-4f44-8b9e-d9166888d2f0.png" />
          </div>
        </div>
      </div>
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
        class="view-courseware"
        :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px',top:viewSet.courseware.top + 'px',left:viewSet.courseware.left + 'px'}"
      >
        <div
          v-if="dragData.show"
          :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px'}"
          class="view-courseware-bar"
          @drop="onDragend($event)"
          @dragover="allowDrop($event)"
        ></div>
        <div
          v-for="item in studentActivityList"
          :key="item.uid"
          class="student-active"
          :style="{left:(item.x * 100) + '%',top:(item.y * 100) + '%'}"
        >
          <div
            class="student-active-bar"
            @mousedown="studentVideoMove($event, item.uid)"
            @touchstart="studentVideoMove($event, item.uid)"
          ></div>
          <div class="student-active-info" @click="downSeat(item.uid)">关闭</div>
          <div :id="'student-video-' + item.uid" class="student-active-video"></div>
          <div class="student-active-loading">
            <div class="loadEffect">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div
          v-if="gameReport"
          :style="{width:viewSet.courseware.width + 'px',height:viewSet.courseware.height + 'px'}"
          class="view-game-report"
        >
          <div class="game-report-top" style="height: 100px">
            <div class="game-report-icon"></div>
            <div>
              <img
                src="http://file.yizhujiao.com/04f0ed41-0d35-493e-a315-741fb68d6a87.png"
                style="height: 80px"
              />
            </div>
            <div class="game-report-timer">倒计时：{{timerData.number}}</div>
          </div>
          <div class="game-group-content">
            <div class="game-group-vs">vs</div>
            <div v-for="(li, index) in groupInfo" :key="li.id" class="game-group">
              <div class="game-group-item" :class="{'game-group-item-right': index % 2 !==0}">
                <div class="game-group-top">{{li.name}}</div>
                <div class="game-group-bottom">
                  <div
                    v-for="item in li.list"
                    :key="item.uid"
                    class="game-item"
                    :style="{alignSelf: 'flex-end', order: item.gameScore}"
                  >
                    <div class="game-item-avatar">
                      <img :src="item.avatar" :draggable="!item.active" />
                    </div>
                    <div v-if="li.gameMvp === item.uid" class="student-item-mvp">MVP</div>
                    <div class="game-item-name">{{ item.name }}</div>
                    <div class="game-item-point">{{ item.gameScore }}</div>
                  </div>
                </div>
                <div class="game-group-score" :style="{height: li.gameScore * 2 + 20 + 'px'}">
                  <div class="game-group-score-t">{{ li.gameScore }}</div>
                  <div class="game-group-score-h"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <div class="dialog-button cancel" @click.self="gameClose">关闭游戏</div>
            <div class="dialog-button submit" @click.self="gameSend">发送报告</div>
          </div>
        </div>
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
          <div class="control-draw-item" @click="randomAsk">随机提问</div>
          <div class="control-draw-item" @click="giveRed">红包雨</div>
          <div class="control-draw-item" @click="responderStart">抢答器</div>
          <div class="control-draw-item" @click="openClassStatusAnalysis">专注度分析</div>
        </div>
        <div class="control-page">
          <div class="control-page-info">{{pageSet.current}} / {{pageSet.total}}</div>
          <div class="control-page-item" @click="pagePrev">上一页</div>
          <div class="control-page-item" @click="pageNext">下一页</div>
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
            v-for="(groupLi, index) in groupInfo"
            :key="groupLi.id"
            class="student-list-group"
            :style="{width: ((groupInfo.length > 0? 100 / groupInfo.length : 100) + '%')}"
          >
            <div
              v-for="item in groupLi.list"
              class="student-item"
              :key="item.uid"
              :class="{'student-item-right': (index % 2 !== 0)}"
              :style="{alignSelf: 'flex-end'}"
            >
              <div
                class="student-item-avatar"
                :draggable="!item.active && item.online"
                @dragstart="onDragstart($event,item.uid)"
                @click="openAppraise(item.uid)"
              >
                <img
                  :src="item.avatar"
                  :draggable="!item.active && item.online"
                  :class="{gray: !item.online}"
                />
              </div>
              <div v-if="groupLi.mvp === item.uid" class="student-item-mvp">MVP</div>
              <div class="student-item-praise" @click="awardPoint(item.uid)">赞</div>
              <div v-if="item.raise" class="student-item-raise"></div>
              <div v-if="item.classStatus === 0 && item.online" class="student-item-status-0"></div>
              <div v-if="item.classStatus === 2 && item.online" class="student-item-status-2"></div>
              <div class="student-item-point">{{ item.point }}</div>
              <div class="student-item-name">{{ item.name }}</div>
              <div class="student-item-line"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="view-discuss"
        :style="{width:viewSet.discuss.width + 'px',height:viewSet.discuss.height + 'px',top:viewSet.discuss.top + 'px',left:viewSet.discuss.left + 'px'}"
      >
        <div class="discuss-list" :style="{height:viewSet.discuss.height - 100 + 'px'}">
          <div class="discuss-item" v-for="(item, index) in discuss.list" :key="index">
            <div class="discuss-item-name">{{item.name}}</div>
            <div class="discuss-item-message">
              <div>{{item.message}}</div>
            </div>
          </div>
        </div>
        <div class="discuss-control">
          <div class="discuss-control-textarea">
            <textarea v-model="discuss.message"></textarea>
          </div>
          <div class="discuss-control-button">
            <button class="discuss-control-send" @click="sendDiscuss">发送</button>
          </div>
        </div>
      </div>
    </div>
    <Appraise
      ref="appraise"
      :roomId="roomId"
      @success="handleAppraise"
      @event="handleAppraiseEvent"
    ></Appraise>
    <ClassStatusAnalysis ref="class-status-analysis"></ClassStatusAnalysis>
    <Dialog ref="dialog-give-red" :width="300">
      <div class="dialog-title">设置红包额度</div>
      <div class="dialog-title-tips">红包额度每个学生单独计算</div>
      <div class="dialog-content">
        <input
          class="from-input"
          v-model="redData.max"
          type="number"
          style="font-size: 20px;width: 150px"
        />
      </div>
      <div class="dialog-footer">
        <div class="dialog-button cancel" @click.self="giveRedCancel">取消</div>
        <div class="dialog-button submit" @click.self="giveRedSubmit">确定</div>
      </div>
    </Dialog>
    <Dialog ref="dialog-random-ask" :width="300">
      <div class="dialog-title">随机提问</div>
      <div class="dialog-title-tips">被提问到的同学会自动上讲台</div>
      <div class="dialog-content">
        <div>
          <img :src="askData.avatar" style="width: 90px;height: 90px;border-radius: 90px" />
        </div>
        <div>{{askData.name}}</div>
      </div>
    </Dialog>
    <Dialog ref="dialog-class-over" :width="300">
      <div class="dialog-title">是否确认下课</div>
      <div class="dialog-title-tips">下课后不能再进去该教室</div>
      <div class="dialog-content"></div>
      <div class="dialog-footer">
        <div class="dialog-button cancel" @click.self="classOverCancel">取消</div>
        <div class="dialog-button submit" @click.self="classOverSubmit">确定</div>
      </div>
    </Dialog>
    <Dialog ref="dialog-class-over-close" :width="300">
      <div class="dialog-title">离开教室</div>
      <div class="dialog-title-tips"></div>
      <div class="dialog-content"></div>
      <div class="dialog-footer">
        <div class="dialog-button submit" @click.self="classOverSubmitClose">确定</div>
      </div>
    </Dialog>
    <Responder ref="responder" @success="handleResponder"></Responder>
  </div>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "vue-class-component";
import cache from "@/utils/cache";
import { uuid } from "@/utils/uuid";
import AgoraRTC from "agora-rtc-sdk";
import AgoraRTM from "agora-rtm-sdk";
import RoomCanvas from "@/components/RoomCanvas/index.vue";
import Appraise from "@/components/Appraise/index.vue";
import Dialog from "@/components/Dialog/index.vue";
import Responder from "@/components/Responder/index.vue";
import ClassStatusAnalysis from "@/components/ClassStatusAnalysis/index.vue";
import {
  IDragData,
  IDiscuss,
  IActivityStudent,
  IStudent,
  IDrawSet,
  IPageSet,
  IRtm,
  IRtc,
  IRtmInfo,
  IRtcInfo,
  ICacheData,
  IDraInfo,
  IAppraiseParam,
} from ".";
import appModule from "@/store/modules/app";
import { IRoomInfo, IRoomUser } from "@/servece/operations/index.d";
import {
  getRoomInfoApi,
  getRtcInfoApi,
  getRtmInfoApi,
  getAgoraUserInfoApi,
} from "@/servece/operations";
@Component({
  components: {
    RoomCanvas,
    Appraise,
    Dialog,
    Responder,
    ClassStatusAnalysis,
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
    courseware_url: "https://file.ejinyubao.com/courseware1.html",
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
  public cacheGroupInfoKey = "";
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
    color: ["#FF0000", "#008000", "#FFA500", "#0000FF"],
    colorSelect: 0,
    select: -1,
  };
  public pageSet: IPageSet = {
    total: 1,
    current: 1,
  };
  public cacheKey = "";
  public cacheData: ICacheData = {
    pageCurrent: -1,
    drawInfo: [],
  };
  public gameData = false;
  public gameReport = false;
  public redData = {
    max: 10,
    time: 20,
  };
  public askData = {
    uid: 0,
    name: "",
    avatar: "",
  };
  public timerData = {
    number: 0,
  };
  public classStatusData = {
    focusTime: 120,
    medalId: 0,
  };

  public get viewSet() {
    let scale = 1;
    const screenWidth = document.body.clientWidth;
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
    return {
      main: main,
      teacher: teacher,
      courseware: courseware,
      student: student,
      discuss: discuss,
      control: control,
    };
  }

  created() {
    this.init();
    window.addEventListener(
      "message",
      (event) => {
        console.log("message111", event);
        try {
          const message = JSON.parse(event.data);
          if (message.action === "game") {
            this.addPoint(message.uid, message.score);
          } else if (message.action === "courseware") {
            this.sendMessage(message);
            if (message.event.action === "startGame") {
              this.gameStart(message.event.url);
            }
            if (message.event.action === "responderStart") {
              this.responderStart();
            }
          } else if (message.action === "coursewareReady") {
            this.coursewareInit();
            this.pageSet.total = message.data.data.totalPage;
          }
        } catch (e) {
          console.log(e);
        }
      },
      false
    );
    setInterval(() => {
      this.classStatusAppraise();
    }, 5000);
    setInterval(() => {
      this.classStatusAnalysis();
    }, 10000);
  }

  public init(): void {
    this.roomId = this.$router.currentRoute.params.pathMatch;
    this.cacheKey = "room_cache_" + this.roomId;
    this.cacheGroupInfoKey = "room_cache_group_info_" + this.roomId;
    // let groupInfo = cache.get(this.cacheGroupInfoKey)
    // if(groupInfo !== null) this.groupInfo = groupInfo
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
      const index = this.roomInfo.user_list.findIndex(
        (item) => item.uid === uid
      );
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
      const remoteStream = evt.stream;
      const uid = remoteStream.getId();
      if (uid !== this.rtc.params.uid) {
        this.addStudent(uid);
        this.addActivity(uid, this.dragData.x, this.dragData.y);
        this.rtc.client.subscribe(remoteStream, (err: Error) => {
          console.log("stream subscribe failed", err);
        });
      }
      console.log("stream-added remote-uid: ", uid);
    });

    this.rtc.client.on("stream-subscribed", (evt: any) => {
      const remoteStream = evt.stream;
      const uid = remoteStream.getId();
      this.$nextTick(() => {
        remoteStream.play("student-video-" + uid);
      });
      console.log("stream-subscribed remote-uid: ", uid);
    });

    this.rtc.client.on("stream-removed", (evt: any) => {
      const remoteStream = evt.stream;
      const uid = remoteStream.getId();
      remoteStream.stop("student-video-" + uid);
      this.removeActivity(uid);
      console.log("stream-removed remote-uid: ", uid);
    });

    //该回调提示有远端用户/主播加入频道。
    this.rtc.client.on("peer-online", (evt: any) => {
      console.log("peer-online", evt.uid);
      this.addStudent(evt.uid);
    });

    //该回调通知应用有远端用户离线。
    this.rtc.client.on("peer-leave", (evt: any) => {
      const uid = evt.uid;
      const reason = evt.reason;
      if (reason !== "BecomeAudience") {
        this.removeActivity(uid);
        this.removeStudent(uid);
      }
    });
  }
  public rtmInit() {
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
  public rtmEvent() {
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
        const id = message.id;
        if (message.type === "draw") {
          (this.$refs[id] as any)[0].drawWithInfoOne(message.info);
        } else if (message.type === "back") {
          (this.$refs[id] as any)[0].backWithInfoOne();
        }
      }
      if (message.action === "courseware") {
        this.coursewarePostEvent(message);
      }
      if (message.action === "coursewarePage") {
        this.pageSeek(message.page);
      }
      if (message.action === "roomGetHistory") {
        if (this.cacheData.pageCurrent !== null) {
          this.sendMessage({
            action: "history",
            uid: message.uid,
            message: this.cacheData,
          });
        }
      }
      if (message.action === "roomGetHistory") {
        if (this.cacheData.pageCurrent !== null) {
          this.sendMessage({
            action: "history",
            uid: message.uid,
            message: this.cacheData,
          });
        }
      }
      if (message.action === "getGroupInfo") {
        this.sendGroupInfo();
      }
      if (message.action === "gameScore") {
        this.addGameScore(message.uid, message.score);
      }
      if (message.action === "gameScoreFix") {
        this.fixGameScore(message.uid, message.score);
      }
      if (message.action === "raise") {
        this.handleRaise(message.uid);
      }
      if (message.action === "responderSend") {
        this.responderSendUser(message.uid);
      }
      if (message.action === "classStatus") {
        this.setClassStatus(message.uid, message.status);
      }
    });
  }
  public coursewareInit() {
    const data = cache.get(this.cacheKey);
    if (data !== null) {
      this.roomHistoryToCourseware(data);
    } else {
      this.pageSeek(this.pageSet.current);
    }
  }
  public rtcPublish() {
    // Publish the local stream
    this.rtc.client.publish(this.rtc.localStream, (err: Error) => {
      console.log("publish failed");
      console.error(err);
    });
  }
  public rtcUnpublish() {
    this.rtc.client.unpublish(this.rtc.localStream, (err: Error) => {
      console.log("unpublish failed");
      console.error(err);
    });
  }
  public addActivity(uid: number, x = 0, y = 0) {
    const index = this.studentList.findIndex((item) => item.uid === uid);
    if (index !== -1) {
      this.studentList[index].active = true;
      const groupIndex = this.findGroupUser(uid);
      if (groupIndex != null) {
        this.groupInfo[groupIndex.groupIndex].list[
          groupIndex.index
        ].active = true;
      }
      if (
        this.studentActivityList.findIndex((item) => item.uid === uid) === -1
      ) {
        this.studentActivityList.push({
          uid: uid,
          x: x,
          y: y,
        });
        const message = {
          action: "studentVideo",
          uid: uid,
          x: x,
          y: y,
        };
        this.sendMessage(message);
      } else {
        const elementId = "student-video-" + uid;
        document.getElementById(elementId)!.innerHTML = "";
      }
    }
  }
  public removeActivity(uid: number, active = false) {
    const index = this.studentList.findIndex((item) => item.uid === uid);
    if (index !== -1) {
      this.studentList[index].active = active;
      const groupIndex = this.findGroupUser(uid);
      if (groupIndex != null) {
        this.groupInfo[groupIndex.groupIndex].list[
          groupIndex.index
        ].active = active;
      }
    }
    for (let i = 0, len = this.studentActivityList.length; i < len; i++) {
      if (this.studentActivityList[i].uid === uid) {
        this.studentActivityList.splice(i, 1);
        break;
      }
    }
  }
  public addStudent(uid: number) {
    const userIndex = this.roomInfo.user_list.findIndex(
      (item) => item.uid === uid
    );
    if (userIndex === -1) {
      return false;
    }
    if (this.roomInfo.user_list[userIndex].role === "student") {
      const studentIndex = this.studentList.findIndex(
        (item) => item.uid === uid
      );
      if (studentIndex === -1) {
        this.studentList.push({
          uid: uid,
          active: false,
          name: this.roomInfo.user_list[userIndex].name,
          avatar: this.roomInfo.user_list[userIndex].avatar,
          point: 0,
          group: this.roomInfo.user_list[userIndex].group as number,
          online: true,
          classStatus: -1,
          classStatusTime: 0,
          classStatusList: [],
        });
        let groupIndex = this.groupInfo.findIndex(
          (item) => item.id === this.roomInfo.user_list[userIndex].group
        );
        if (groupIndex === -1) {
          this.groupInfo.push({
            id: this.roomInfo.user_list[userIndex].group,
            name: "队伍" + this.roomInfo.user_list[userIndex].group,
            mvp: 0,
            gameScore: 0,
            gameMvp: 0,
            score: 0,
            list: [],
          });
          groupIndex = this.groupInfo.length - 1;
        }
        const groupInfoIndex = this.findGroupUser(uid);
        if (groupInfoIndex === null) {
          this.groupInfo[groupIndex].list.push({
            uid: uid,
            name: this.roomInfo.user_list[userIndex].name,
            avatar: this.roomInfo.user_list[userIndex].avatar,
            point: 0,
            gameScore: 0,
            raise: false,
            medal: [],
            online: true,
            active: false,
            classStatus: null,
          });
        }
      } else {
        this.studentList[studentIndex].online = true;
        const groupInfoIndex = this.findGroupUser(uid);
        if (groupInfoIndex !== null) {
          this.groupInfo[groupInfoIndex.groupIndex].list[
            groupInfoIndex.index
          ].online = true;
        }
      }
    }
    this.sendGroupInfo();
  }
  public removeStudent(uid: number) {
    const userIndex = this.studentList.findIndex((item) => item.uid === uid);
    if (userIndex !== -1) {
      console.log(this.studentList[userIndex]);
      this.studentList[userIndex].online = false;
    }
    const groupInfoIndex = this.findGroupUser(uid);
    if (groupInfoIndex !== null) {
      this.groupInfo[groupInfoIndex.groupIndex].list[
        groupInfoIndex.index
      ].online = false;
    }
    this.sendGroupInfo();
  }
  public setClassStatus(uid: number, status: any) {
    uid = parseInt(uid.toString());
    status = parseInt(status);
    const userIndex = this.studentList.findIndex((item) => item.uid === uid);
    if (userIndex !== -1) {
      this.studentList[userIndex].classStatus = status;
      this.studentList[userIndex].classStatusTime = Math.floor(
        new Date().getTime() / 1000
      );
    }
    const groupInfoIndex = this.findGroupUser(uid);
    if (groupInfoIndex !== null) {
      this.groupInfo[groupInfoIndex.groupIndex].list[
        groupInfoIndex.index
      ].classStatus = status;
    }
  }
  public classStatusAppraise() {
    const currentTime = Math.floor(new Date().getTime() / 1000);
    for (let i = 0, len = this.studentList.length; i < len; i++) {
      if (this.studentList[i].classStatus === 1) {
        if (this.classStatusData.focusTime > 0) {
          if (
            currentTime - this.studentList[i].classStatusTime! >
            this.classStatusData.focusTime
          ) {
            this.handleAppraise({
              uid: this.studentList[i].uid,
              id: 6,
              name: "认真专注",
              url: "https://file.ejinyubao.com/m6.png",
              point: 3,
            });
            this.studentList[i].classStatusTime = currentTime;
          }
        }
      }
    }
  }
  public sendMessage(data: any) {
    this.sendMessageBase(data)
      .then(() => {
        console.log("发送消息");
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }
  public sendMessageBase(data: any) {
    const text = JSON.stringify(data);
    return this.rtm.channel.sendMessage({ text: text });
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
    this.removeActivity(uid, true);
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
  public onDragstart(e: any, uid: number) {
    this.dragData.x = 0;
    this.dragData.y = 0;
    this.dragData.show = true;
    e.dataTransfer.setData("Text", uid);
    console.log("start");
  }
  public onDragend(e: any) {
    console.log("end");
    this.dragData.x = Number(
      ((e.offsetX - 60) / this.viewSet.courseware.width).toFixed(5)
    );
    this.dragData.y = Number(
      ((e.offsetY - 60) / this.viewSet.courseware.height).toFixed(5)
    );
    this.dragData.show = false;
    let uid = parseInt(e.dataTransfer.getData("Text"));
    this.upSeat(uid);
    this.addStudent(uid);
    this.addActivity(uid, this.dragData.x, this.dragData.y);
  }
  public allowDrop(e: Event) {
    e.preventDefault();
  }
  public studentVideoMove(e: any, uid: number) {
    const odiv = e.target.parentNode; //获取当前元素
    const index = this.studentActivityList.findIndex(
      (item) => item.uid === uid
    );
    odiv.onmousedown = (e: MouseEvent) => {
      //算出鼠标相对元素的位置
      const disX = e.clientX - odiv.offsetLeft;
      const disY = e.clientY - odiv.offsetTop;

      document.onmousemove = (e: MouseEvent) => {
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let x = e.clientX - disX;
        let y = e.clientY - disY;

        //移动当前元素
        x < 0 ? (x = 0) : null;
        x > this.viewSet.courseware.width - 150
          ? (x = this.viewSet.courseware.width - 150)
          : null;
        y < 0 ? (y = 0) : null;
        y > this.viewSet.courseware.height - 150
          ? (y = this.viewSet.courseware.height - 150)
          : null;

        this.studentActivityList[index].x = Number(
          (x / this.viewSet.courseware.width).toFixed(5)
        );
        this.studentActivityList[index].y = Number(
          (y / this.viewSet.courseware.height).toFixed(5)
        );
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        const message = {
          action: "studentVideo",
          uid: uid,
          x: this.studentActivityList[index].x,
          y: this.studentActivityList[index].y,
        };
        this.sendMessage(message);
      };
    };
    odiv.ontouchstart = (e: TouchEvent) => {
      console.log(e);
      //算出鼠标相对元素的位置
      const disX = e.changedTouches[0].clientX - odiv.offsetLeft;
      const disY = e.changedTouches[0].clientY - odiv.offsetTop;

      document.ontouchmove = (e: TouchEvent) => {
        console.log(e);
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let x = e.changedTouches[0].clientX - disX;
        let y = e.changedTouches[0].clientY - disY;

        //移动当前元素
        x < 0 ? (x = 0) : null;
        x > this.viewSet.courseware.width - 150
          ? (x = this.viewSet.courseware.width - 150)
          : null;
        y < 0 ? (y = 0) : null;
        y > this.viewSet.courseware.height - 150
          ? (y = this.viewSet.courseware.height - 150)
          : null;

        console.log(x, y);
        this.studentActivityList[index].x = x;
        this.studentActivityList[index].y = y;
      };
      document.ontouchend = () => {
        console.log("touchend");
        document.ontouchmove = null;
        document.ontouchend = null;
        const message = {
          action: "studentVideo",
          uid: uid,
          x: this.studentActivityList[index].x,
          y: this.studentActivityList[index].y,
        };
        this.sendMessage(message);
      };
    };
  }
  public drawSelect(index: number) {
    if (this.drawSet.select === index) {
      this.drawSet.select = -1;
      this.sendMessage({
        action: "canvasDraw",
        open: false,
      });
    } else {
      this.drawSet.select = index;
      for (let i = 1; i <= this.pageSet.total; i++) {
        const id = ("courseware-canvas-" + i) as string;
        (this.$refs[id] as any)[0].setLineType(this.drawSet.list[index].type);
      }
      this.sendMessage({
        action: "canvasDraw",
        open: true,
      });
    }
  }
  public drawSetColor(index: number) {
    this.drawSet.colorSelect = index;
    for (let i = 1; i <= this.pageSet.total; i++) {
      let id = "courseware-canvas-" + i;
      (this.$refs[id] as any)[0].setLineColor(this.drawSet.color![index]);
    }
  }
  public drawGetHistory() {
    let id = "courseware-canvas-" + this.pageSet.current;
    (this.$refs[id] as any)[0].getBack();
  }
  public handelCanvas(data: any) {
    console.log(111)
    let message = {
      action: "canvas",
      type: data.type,
      info: data.info,
      id: data.id,
    };
    this.sendMessage(message);
    this.roomCache(message);
  }
  public pagePrev() {
    if (this.pageSet.current > 1) {
      this.pageSet.current--;
      this.pageSeek(this.pageSet.current);
      this.sendMessage({
        action: "coursewarePage",
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
        action: "coursewarePage",
        type: "seek",
        page: this.pageSet.current,
      });
      this.roomCache(null);
    }
  }
  public pageSeek(page: number) {
    let message = {
      action: "courseware",
      time: new Date().getTime(),
      messageId: uuid(),
      data: {
        cmd: 1002,
        data: {
          page: page,
        },
      },
    };
    window.frames["courseware-main" as any].postMessage(
      JSON.stringify(message),
      "*"
    );
    this.pageSet.current = page;
  }
  public coursewarePostEvent(event: any) {
    window.frames["courseware-main" as any].postMessage(
      JSON.stringify(event),
      "*"
    );
  }
  public roomCache(message: IDraInfo | null = null) {
    if (this.cacheData.pageCurrent === this.pageSet.current) {
      this.cacheData.drawInfo.push(message as IDraInfo);
    } else {
      this.cacheData.pageCurrent = this.pageSet.current;
      this.cacheData.drawInfo = [];
      if (message !== null) this.cacheData.drawInfo.push(message);
    }
    cache.set(this.cacheKey, this.cacheData, 86400);
  }
  public roomHistoryToCourseware(data: ICacheData) {
    this.cacheData.pageCurrent = data.pageCurrent;
    this.cacheData.drawInfo = data.drawInfo;
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
  public findGroupUser(uid: number) {
    uid = parseInt(uid.toString());
    let userIndex = this.roomInfo.user_list.findIndex(
      (item) => item.uid === uid
    );
    if (userIndex === -1) return null;
    let groupIndex = this.groupInfo.findIndex(
      (item) => item.id === this.roomInfo.user_list[userIndex].group
    );
    if (groupIndex === -1) return null;
    let index = this.groupInfo[groupIndex].list.findIndex(
      (item: any) => item.uid === uid
    );
    if (index === -1) return null;
    return {
      groupIndex: groupIndex,
      index: index,
    };
  }
  public openAppraise(uid: number) {
    let index = this.findGroupUser(uid);
    if (index !== null) {
      const userInfo = this.groupInfo[index.groupIndex].list[index.index];
      (this.$refs["appraise"] as any).open(userInfo);
    }
    return false;
  }
  public addGameScore(uid: number, point = 1) {
    point = parseInt(point.toString());
    const index = this.findGroupUser(uid);
    if (index !== null) {
      this.groupInfo[index.groupIndex].gameScore =
        this.groupInfo[index.groupIndex].gameScore + point;
      this.groupInfo[index.groupIndex].list[index.index].gameScore =
        this.groupInfo[index.groupIndex].list[index.index].gameScore + point;
    }
    let index2 = this.findGroupUser(this.groupInfo[index!.groupIndex].gameMvp);
    if (index2 !== null) {
      if (
        this.groupInfo[index!.groupIndex].list[index!.index].gameScore >
        this.groupInfo[index2.groupIndex].list[index2.index].gameScore
      ) {
        this.groupInfo[index!.groupIndex].gameMvp = uid;
      }
    } else {
      this.groupInfo[index!.groupIndex].gameMvp = uid;
    }
  }
  public fixGameScore(uid: number, point = 1) {
    point = parseInt(point.toString());
    let index = this.findGroupUser(uid);
    if (index !== null) {
      let t = point - this.groupInfo[index.groupIndex].gameScore;
      this.groupInfo[index.groupIndex].gameScore = point;
      this.groupInfo[index.groupIndex].list[index.index].gameScore =
        this.groupInfo[index.groupIndex].list[index.index].gameScore + t;
    }
    let index2 = this.findGroupUser(this.groupInfo[index!.groupIndex].gameMvp);
    if (index2 !== null) {
      if (
        this.groupInfo[index!.groupIndex].list[index!.index].gameScore >
        this.groupInfo[index2.groupIndex].list[index2.index].gameScore
      ) {
        this.groupInfo[index!.groupIndex].gameMvp = uid;
      }
    } else {
      this.groupInfo[index!.groupIndex].gameMvp = uid;
    }
  }
  public addPoint(uid: number, point = 1) {
    point = parseInt(point.toString());
    const index = this.findGroupUser(uid);
    if (index !== null) {
      this.groupInfo[index.groupIndex].score =
        this.groupInfo[index.groupIndex].score + point;
      this.groupInfo[index.groupIndex].list[index.index].point =
        this.groupInfo[index.groupIndex].list[index.index].point + point;
    }
    const index2 = this.findGroupUser(this.groupInfo[index!.groupIndex].mvp);
    if (index2 !== null) {
      if (
        this.groupInfo[index!.groupIndex].list[index!.index].point >
        this.groupInfo[index2.groupIndex].list[index2.index].point
      ) {
        this.groupInfo[index!.groupIndex].mvp = uid;
      }
    } else {
      this.groupInfo[index!.groupIndex].mvp = uid;
    }
  }
  public awardPoint(uid: number, point = 1) {
    this.addPoint(uid, point);
    this.sendMessage({
      action: "awardPoint",
      uid: uid,
      point: point,
    });
    this.sendGroupInfo();
  }
  public handleAppraise(data: IAppraiseParam) {
    let uid = data.uid;
    let point = parseInt(data.point.toString());
    let index = this.findGroupUser(uid);
    if (index !== null) {
      let medalIndex = this.groupInfo[index.groupIndex].list[
        index.index
      ].medal.findIndex((item: any) => item.id === data.medal_id);
      if (medalIndex > -1) {
        this.groupInfo[index.groupIndex].list[index.index].medal[
          medalIndex
        ].count =
          this.groupInfo[index.groupIndex].list[index.index].medal[medalIndex]
            .count + 1;
      } else {
        this.groupInfo[index.groupIndex].list[index.index].medal.push({
          id: data.medal_id,
          count: 1,
          url: data.url,
        });
      }
    }
    this.addPoint(uid, point);
    this.sendMessage({
      action: "appraise",
      uid: uid,
      point: point,
      medalId: data.medal_id,
    });
    this.sendGroupInfo();
  }
  public handleAppraiseEvent(data: any) {
    if (data.action === "upSeat") {
      this.upSeat(data.uid);
    }
  }
  public gameStart(url: string) {
    this.showReport(30);
    this.sendMessage({
      action: "gameStart",
      url: url,
    });
  }
  public gameClose() {
    this.gameData = false;
    this.gameReport = false;
    for (let i = 0, len = this.groupInfo.length; i < len; i++) {
      for (let ii = 0, len2 = this.groupInfo[i].list.length; ii < len2; ii++) {
        this.addPoint(
          this.groupInfo[i].list[ii].uid,
          this.groupInfo[i].list[ii].gameScore
        );
      }
    }
    this.sendMessage({
      action: "gameClose",
    });
    this.sendGroupInfo();
  }
  public gameSend() {
    this.gameData = true;
    this.sendMessage({
      action: "gameReport",
    });
    this.sendGroupInfo();
  }
  public sendGroupInfo() {
    this.sendMessage({
      action: "groupInfo",
      groupInfo: this.groupInfo,
    });
    cache.set(this.cacheGroupInfoKey, this.groupInfo, 86400);
  }
  public handleRaise(uid: number) {
    const that = this;
    let index = this.findGroupUser(uid);
    if (index !== null) {
      that.groupInfo[index.groupIndex].list[index.index].raise = true;
      setTimeout(function () {
        that.groupInfo[index!.groupIndex].list[index!.index].raise = false;
      }, 5000);
    }
  }
  public randomAsk() {
    let len = this.studentList.length;
    if (len > 0) {
      let index = Math.floor(Math.random() * len);
      let uid = this.studentList[index].uid;
      let i = 10;
      let timer = setInterval(() => {
        if (i < 1) {
          this.askData.uid = this.studentList[index].uid;
          this.askData.name = this.studentList[index].name;
          this.askData.avatar = this.studentList[index].avatar;
          clearInterval(timer);
          return false;
        }
        let index2 = Math.floor(Math.random() * len);
        this.askData.uid = this.studentList[index2].uid;
        this.askData.name = this.studentList[index2].name;
        this.askData.avatar = this.studentList[index2].avatar;
        i--;
      }, 100);
      (this.$refs["dialog-random-ask"] as any).open();
      this.sendMessage({
        action: "randomAsk",
        uid: uid,
      });
    }
  }
  public giveRed() {
    (this.$refs["dialog-give-red"] as any).open();
  }
  public giveRedCancel() {
    (this.$refs["dialog-give-red"] as any).close();
  }
  public giveRedSubmit() {
    (this.$refs["dialog-give-red"] as any).close();
    this.showReport(this.redData.time);
    this.sendMessage({
      action: "giveRed",
      max: this.redData.max,
      time: this.redData.time,
    });
  }
  public showReport(time = 30) {
    this.gameData = false;
    this.gameReport = true;
    for (let i = 0, len = this.groupInfo.length; i < len; i++) {
      this.groupInfo[i].gameScore = 0;
      this.groupInfo[i].gameMvp = 0;
      for (let ii = 0, len2 = this.groupInfo[i].list.length; ii < len2; ii++) {
        this.groupInfo[i].list[ii].gameScore = 0;
      }
    }
    if (time > 0) {
      this.timerData.number = time;
      let timer = setInterval(() => {
        if (this.timerData.number === 0) {
          clearInterval(timer);
          return false;
        }
        this.timerData.number = this.timerData.number - 1;
      }, 1000);
    }
  }
  public classOver() {
    (this.$refs["dialog-class-over"] as any).open();
  }
  public classOverCancel() {
    (this.$refs["dialog-class-over"] as any).close();
  }
  public classOverSubmit() {
    let data = {
      action: "classOver",
      analysis: this.studentList,
    };
    this.sendMessageBase(data).then(() => {
      window.close();
    });
  }
  public classOverSubmitClose() {
    window.close();
  }
  public responderStart() {
    (this.$refs["responder"] as any).start();
    this.sendMessage({
      action: "responder",
      type: 1,
    });
  }
  public responderSendUser(uid: number) {
    let index = this.findGroupUser(uid);
    if (index !== null) {
      let userInfo = this.groupInfo[index.groupIndex].list[index.index];
      (this.$refs["responder"] as any).sendUser(userInfo);
    }
  }
  public handleResponder(data: any) {
    let uid = data.uid;
    this.sendMessage({
      action: "responderResult",
      uid: uid,
    });
  }
  public openClassStatusAnalysis() {
    (this.$refs["class-status-analysis"] as any).open();
  }
  public classStatusAnalysis() {
    let data = [];
    for (let i = 0, len = this.studentList.length; i < len; i++) {
      if (
        this.studentList[i].classStatus === null ||
        this.studentList[i].online === false
      )
        continue;
      let value = 0;
      if (this.studentList[i].classStatus === 1) value = 100;
      if (this.studentList[i].classStatus === 2) value = 50;
      data.push(value);
      this.studentList[i].classStatusList!.push(value);
    }
    if (data.length > 0) {
      let value = eval(data.join("+"));
      (this.$refs["class-status-analysis"] as any).addData(
        Math.floor(value / data.length)
      );
    }
  }
}
</script>

<style lang="less" scoped>
.gray {
  filter: grayscale(100%);
  filter: gray();
}
</style>