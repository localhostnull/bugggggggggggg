<template>
  <div class="content">
    <el-card class="loginWrap" v-if="!joined">
      <el-form ref="form" :model="form">
        <el-form-item :required="true" prop="channel">
          <el-input v-model="form.channel" placeholder="频道"></el-input>
        </el-form-item>
        <el-form-item :required="true" prop="name">
          <el-input v-model="form.name" placeholder="昵称"></el-input>
        </el-form-item>
        <el-form-item :required="true" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="tech">老师</el-radio>
            <el-radio label="stu">学生</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="join">加入频道</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-container class="roomWrap" v-else>
      <el-container direction="vertical">
        <div class="whiteBoard"></div>
        <div class="stuWrap">
          <div class="scoreBox">
            <span class="teamName" style="color: #0b44cd" @click="addL">大圣队</span>
            <div class="scoreBar" ref="bar">
              <div class="leftBar" :style="`width: ${this.leftBarWidth}%`">{{this.leftScore}}</div>
              <div class="rightBar" :style="`width: ${this.rightBarWidth}%`">{{this.rightScore}}</div>
            </div>
            <span class="teamName" style="color: #bd5673" @click="add">哪吒队</span>
          </div>
          <div class="teamWrap">
            <div class="team">
              <div class="peer" v-for="(peer, index) in leftList" :key="index">
                <img src="../assets/pig.jpg" alt class="head" />
                <span class="score">{{peer.score}}</span>
                <div class="name">{{peer.name}}</div>
              </div>
            </div>
            <img class="vs" src="../assets/VS.png" />
            <div class="team">
              <div class="peer" v-for="(peer, index) in rightList" :key="index">
                <img src="../assets/self.jpg" alt class="head" />
                <span class="score">{{peer.score}}</span>
                <div class="name">{{peer.name}}</div>
              </div>
            </div>
          </div>
        </div>
      </el-container>
      <el-aside class="sideBox" width="300px">
        <div class="btnBox">
          <el-button
            v-if="form.role === 'tech' && !isLocal"
            @click="backChannel"
            type="success"
            icon="el-icon-back"
            circle
          ></el-button>
          <el-button
            v-if="form.role === 'tech' && isLocal"
            @click="changeChannel"
            type="success"
            icon="el-icon-right"
            circle
          ></el-button>
          <el-button type="danger" @click="handleLeave" icon="el-icon-circle-close" circle></el-button>
        </div>
        <div class="player" id="local_stream"></div>
        <div class="player" v-if="form.role === 'stu'" :id="'remote_video_'+ remoteStreamId"></div>
        <div class="chatWrap" ref="msgWrap">
          <div
            :class="['message', {selfMsg: item.type === 'self'}]"
            v-for="(item, index) in msgList"
            :key="index"
          >
            <img
              :class="['head', {selfHead: item.type === 'self'}]"
              v-if="item.type !== 'self'"
              src="../assets/pig.jpg"
            />
            <img
              :class="['head', {selfHead: item.type === 'self'}]"
              v-else
              src="../assets/self.jpg"
            />
            <div :class="['text', {selfText: item.type === 'self'}]">{{item.message}}</div>
          </div>
        </div>
        <el-input class="textInput" placeholder="在这里输入聊天内容" v-model="msg" @keyup.enter="sendMsg">
          <el-button slot="append" icon="el-icon-position" :disabled="msg === ''" @click="sendMsg"></el-button>
        </el-input>
      </el-aside>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import AgoraRTC from "agora-rtc-sdk";
import AgoraRTM from "agora-rtm-sdk";
import { IMsg, IForm } from "./ClassRoom";

@Component
export default class ClassRoom extends Vue {
  public leftList = [
    {
      name: "嘻嘻",
      score: 3,
    },
    {
      name: "梵蒂冈",
      score: 12,
    },
    {
      name: "水电费",
      score: 2,
    },
    {
      name: "更好",
      score: 8,
    },
    {
      name: "结果符合",
      score: 21,
    },
    {
      name: "啥的",
      score: 0,
    },
  ];
  public rightList = [
    {
      name: "计划",
      score: 18,
    },
    {
      name: "asda",
      score: 3,
    },
    {
      name: "地方",
      score: 17,
    },
    {
      name: "儿为",
      score: 6,
    },
    {
      name: "按时的",
      score: 5,
    },
    {
      name: "突然人",
      score: 7,
    },
    {
      name: "阿萨德",
      score: 11,
    },
  ];
  public joined = false;
  public form: IForm = {
    channel: "",
    name: "",
    role: "",
  };
  public rtc: any = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {},
  };
  public bigRtc: any = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {},
  };
  public rtmClient: any = null;
  public rtmChannel: any = null;
  public appID = "e7e90756a7244ec397ee1c46c9ae1bec";
  public remoteStreamId = "";
  public newRtmChannel: any = null;
  public isPassiveInit = false;
  public isChanged = false;
  public isLocal = true;
  public msgList: IMsg[] = [];
  public msg = "";
  public get allScore() {
    return this.rightScore + this.leftScore;
  }
  public get leftScore() {
    return this.leftList.reduce((pre, current) => {
      return pre + current.score;
    }, 0);
  }
  public get rightScore() {
    return this.rightList.reduce((pre, current) => {
      return pre + current.score;
    }, 0);
  }
  public get leftBarWidth() {
    return parseInt(((this.leftScore / this.allScore) * 1000).toString()) / 10;
  }
  public get rightBarWidth() {
    return 100 - this.leftBarWidth;
  }
  public add() {
    this.$set(this.rightList, 0, {
      ...this.rightList[0],
      score: this.rightList[0].score + 30,
    });
  }
  public addL() {
    this.$set(this.leftList, 0, {
      ...this.leftList[0],
      score: this.leftList[0].score + 10,
    });
  }
  public sendMsg() {
    if (this.msg === "") {
      return;
    }
    const msg = this.msg;
    this.msg = "";
    if (this.rtmChannel) {
      this.rtmChannel
        .sendMessage({ text: `{ "type": "msg", "message": "${msg}" }` })
        .then(() => {
          this.msgList.push({
            type: "self",
            message: msg,
            peerId: this.form.name,
          });
          (this.$refs.msgWrap as HTMLFormElement).scrollTop = (this.$refs
            .msgWrap as HTMLFormElement).scrollHeight;
        });
    }
  }
  public handleLeave() {
    this.leave();
  }
  public changeChannel() {
    this.rtc.client.unpublish(this.rtc.localStream, (err: Error) =>
      console.log(err)
    );
    this.rtmChannel
      .sendMessage({
        text: '{ "type": "changeChannel", "message": "2" }',
      })
      .then(() => {
        this.isLocal = false;
      });
  }
  public backChannel() {
    this.rtc.client.publish(this.rtc.localStream, (err: Error) =>
      console.log(err)
    );
    this.rtmChannel
      .sendMessage({
        text: '{ "type": "comeBack", "message": "1" }',
      })
      .then(() => {
        this.isLocal = true;
      });
  }
  public join() {
    (this.$refs.form as HTMLFormElement).validate((valid: boolean) => {
      if (valid) {
        this.joined = true;
        console.log(this.form);
        this.$nextTick(() => {
          this.initRTC();
          this.initRTM();
          console.log(this.rtc);
        });
      }
    });
  }
  public initRTM() {
    this.rtmClient = AgoraRTM.createInstance(this.appID);
    this.rtmClient.on(
      "ConnectionStateChanged",
      (newState: any, reason: any) => {
        console.log("connect change state" + newState + "reason:" + reason);
      }
    );
    this.rtmClient
      .login({
        token: null,
        uid: `${parseInt((Math.random() * 100 * Math.random()).toString())}`,
      })
      .then(() => {
        console.log("login success");
        this.rtmChannel = this.rtmClient.createChannel(this.form.channel);
        this.onMessage(this.rtmChannel);
        this.rtmChannel
          .join()
          .then(() => {
            console.log("join rtm channel success");
          })
          .catch((err: Error) => {
            console.log("join rtm channel fail", err);
          });
      })
      .catch((err: Error) => {
        console.log("login fail", err);
      });
  }
  public onMessage(rtm: any): void {
    rtm.on("ChannelMessage", ({ text }: any, senderId: string) => {
      const msg = JSON.parse(text);
      if (msg.type === "msg") {
        this.msgList.push({
          type: "remote",
          message: msg.message,
          peerId: senderId,
        });
        // this.$refs.msgWrap.scrollTop = this.$refs.msgWrap.scrollHeight;
      }
      if (msg.type === "changeChannel") {
        this.form.role = "stu";
        this.joined = true;
        this.isPassiveInit = true;
        if (this.isChanged) {
          while (this.rtc.remoteStreams.length > 0) {
            const stream = this.rtc.remoteStreams.shift();
            stream.stop();
            this.rtc.client.unsubscribe(stream, (err: Error) =>
              console.log(err)
            );
          }
          this.bigRtc.client.subscribe(this.bigRtc._stream_, (err: Error) =>
            console.log(err)
          );
        } else {
          this.initRTC(msg.message, this.bigRtc);
          this.newRtmChannel = this.rtmClient.createChannel(msg.message);
          this.onMessage(this.newRtmChannel);
          this.newRtmChannel
            .join()
            .then(() => {
              console.log("join rtm channel success");
            })
            .catch((err: Error) => {
              console.log("join rtm channel fail", err);
            });
          this.isChanged = true;
        }
      }
      if (msg.type === "comeBack") {
        while (this.bigRtc.remoteStreams.length > 0) {
          const stream = this.bigRtc.remoteStreams.shift();
          stream.stop();
          this.bigRtc.client.unsubscribe(stream, (err: Error) =>
            console.log(err)
          );
          this.bigRtc._stream_ = stream;
        }
      }
    });
  }
  public initRTC(channel?: string | number, rtcObj?: any) {
    rtcObj = rtcObj ? rtcObj : this.rtc;
    rtcObj.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
    rtcObj.client.on("stream-added", (evt: any) => {
      console.log("add");
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      if (id !== rtcObj.params.uid) {
        rtcObj.client.subscribe(remoteStream, (err: Error) =>
          console.log("stream subscribe failed", err)
        );
      }
    });
    rtcObj.client.on("stream-subscribed", (evt: any) => {
      console.log("subscribed");
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      rtcObj.remoteStreams.push(remoteStream);
      this.remoteStreamId = id;
      this.$nextTick(() => {
        remoteStream.play("remote_video_" + id);
      });
    });
    rtcObj.client.on("stream-removed", (evt: any) => {
      console.log("removed");
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop("remote_video_" + id);
    });
    rtcObj.client.init(
      this.appID,
      () => {
        console.log("init success");
        if (this.form.role === "tech") {
          rtcObj.client.setClientRole("host");
        } else {
          rtcObj.client.setClientRole("audience");
        }
        this.joinChannel(channel ? channel : this.form.channel, rtcObj);
      },
      (err: Error) => {
        console.log(err);
      }
    );
  }

  public joinChannel(channel?: string | number, rtcObj?: any) {
    console.log("join channel");
    rtcObj.client.join(
      null,
      channel,
      this.form.name,
      (uid: string | number) => {
        rtcObj.params.uid = uid;
        if (!this.isPassiveInit) {
          rtcObj.localStream = AgoraRTC.createStream({
            streamID: rtcObj.params.uid,
            audio: false,
            video: false,
            screen: true,
          });
          rtcObj.localStream.init(
            () => {
              console.log("init local stream success");
              rtcObj.localStream.play("local_stream");
              if (this.form.role === "tech") {
                rtcObj.client.publish(rtcObj.localStream, (err: Error) =>
                  console.log(err)
                );
              }
            },
            (err: Error) => {
              console.log(err);
            }
          );
        }
      },
      (err: Error) => {
        console.log(err, "join fail");
      }
    );
  }
  public leave(rtcObj?: any) {
    rtcObj = rtcObj ? rtcObj : this.rtc;
    console.log(rtcObj);
    if (rtcObj.client) {
      rtcObj.client.leave(
        () => {
          if (rtcObj.localStream) {
            rtcObj.localStream.stop();
            rtcObj.localStream.close();
            rtcObj.client.unpublish(rtcObj.localStream, (err: Error) =>
              console.log(err)
            );
          }
          while (rtcObj.remoteStreams.length > 0) {
            const stream = rtcObj.remoteStreams.shift();
            // const id = stream.getId();
            stream.stop();
          }
        },
        (err: Error) => {
          console.log(err);
        }
      );
    }
    if (this.rtmChannel) {
      this.rtmChannel.leave();
    }
    this.joined = false;
    this.isPassiveInit = false;
  }
}
</script>

<style scoped>
body {
  background-color: #829def;
  margin: 0;
}
.loginWrap {
  width: 30%;
  margin: 20vh auto;
  padding-top: 50px;
}
video {
  left: 0;
}
.whiteBoard {
  height: 74vh;
  border-radius: 10px;
  margin: 0.5vh 1vh;
  background-image: url("../assets/whiteBord.png");
  background-size: 100% 100%;
}
.stuWrap {
  flex: 1;
  margin: 0.5vh 1vh;
}
.btnBox {
  height: 10vh;
  vertical-align: middle;
  text-align: right;
  padding: 27px;
  box-sizing: border-box;
}
.player {
  height: 24vh;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0.5vh 0;
  border-radius: 10px;
  overflow: hidden;
}
.chatWrap {
  background-color: #6185e9;
  margin-top: 0.5vh;
  border-radius: 10px 10px 0 0;
  flex: 1;
  overflow-y: scroll;
}
.chatWrap::-webkit-scrollbar {
  display: none;
}
.sideBox {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  padding: 1vh;
}
.message {
  display: flex;
  padding: 5px 20px;
}
.selfMsg {
  display: flex;
  flex-direction: row-reverse;
}
.head {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  margin-right: 10px;
}
.selfHead {
  margin: 0 0 0 10px;
}
.text {
  display: flex;
  position: relative;
  align-content: center;
  align-items: center;
  word-break: break-all;
  text-align: left;
  padding: 10px 10px;
  background-color: white;
  border-radius: 5px;
}
.text::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-right-color: white;
  left: -16px;
}
.selfText {
  background-color: greenyellow;
}
.selfText::after {
  display: none;
}
.selfText::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-left-color: greenyellow;
  right: -16px;
}
.scoreBox {
  display: flex;
  padding: 2vh 12.5%;
  justify-content: space-between;
}
.scoreBar {
  margin: 0 2%;
  flex: 1;
  background-color: white;
  border-radius: 10px;
  padding: 1px;
  box-sizing: border-box;
  display: flex;
}
.teamName {
  font-weight: bolder;
}
.leftBar,
.rightBar {
  border-radius: 10px;
  box-sizing: border-box;
  padding: 0 6px;
  color: white;
  transition: width 0.5s;
}
.leftBar {
  background-color: #2069f7;
  text-align: left;
}
.rightBar {
  background-color: #e45454;
  text-align: right;
}
.teamWrap {
  display: flex;
  justify-content: space-around;
  padding: 0 6%;
}
.team {
  display: flex;
  flex-wrap: wrap;
  width: 45%;
}
.vs {
  flex: 1;
}
.peer {
  width: 20%;
}
.peer .head {
  height: auto;
  margin: 0;
  width: 45%;
  vertical-align: middle;
  border-radius: 50%;
}
.peer .score {
  width: 30%;
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
  color: #e5d8a7;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: bolder;
}
.peer .name {
  color: white;
  width: 65%;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
}
</style>