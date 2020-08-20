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
            :width="viewSet.courseware.width.toString()"
            :height="viewSet.courseware.height.toString()"
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
import RoomCanvas from "@/components/RoomCanvas/index.vue";
import { IRoomInfo } from "@/servece/operations/index.d";
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
} from ".";
import modules from '@/store/modules'

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
    appID: "",
    channel: "",
    uid: 0,
    token: "",
  };
  public rtmInfo: IRtmInfo = {
    appID: "",
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
  public mounted(): void {
    console.log(modules.App, "store");
  }
  public get name(): string {
    return this.$store.state.token;
  }
}
</script>
