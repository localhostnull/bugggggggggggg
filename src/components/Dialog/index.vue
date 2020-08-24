<template>
  <transition name="fade">
    <div v-show="visible" class="dialog-mask" @click.self="close">
      <div class="dialog-wrapper animated fadeInUp" ref="dialogWrapper" @click.self="close">
        <div class="dialog-container" :style="{width:width + 'px'}">
          <div v-if="title !== ''" class="dialog-header">{{title}}</div>
          <div class="dialog-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component
export default class Dialog extends Vue {
  @Prop({
    type: String,
    default: "",
  })
  public title!: string;
  @Prop({
    type: Number,
    default: 500,
  })
  public width!: number;

  public visible: boolean = false;

  public open(): void {
    this.visible = true;
  }
  public close(): void {
    this.visible = false;
  }
}
</script>

<style scoped lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.dialog-mask {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  display: table;
  animation-duration: 0.6s;

  .dialog-wrapper {
    display: table-cell;
    animation-duration: 0.3s;

    .dialog-container {
      margin: auto;
      margin-top: 10%;
      background-color: white;
      min-height: 100px;
      border-radius: 12px;
      padding: 20px;

      .dialog-header {
        background-color: #f3fff7;
        color: #42b983;
        height: 32px;
        border-radius: 12px 12px 0 0;
        border-bottom: 1px solid #cccccc;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        color: #38c26b;
      }

      .dialog-body {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        align-items: center;
        font-size: 13px;
      }

      .dialog-footer {
        height: 40px;
        width: 100%;
        background-color: #ffffff;
        border-radius: 0 0 12px 12px;
        display: table;

        .left {
          width: 50%;
          height: 100%;
          vertical-align: middle;
          display: table-cell;
          font-size: 13px;
          color: #38c26b;
        }

        .right {
          width: 50%;
          height: 100%;
          vertical-align: middle;
          display: table-cell;
          font-size: 13px;
          color: #38c26b;
        }

        .left:hover {
          cursor: pointer;
        }

        .right:hover {
          cursor: pointer;
        }
      }
    }
  }
}
</style>