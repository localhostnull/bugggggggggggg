<template>
  <div
    v-show="visible"
    class="dialog"
    :class="{'dialog__open' : visible, 'dialog__close': !visible}"
  >
    <div class="dialog-mask" @click="close"></div>
    <div class="dialog-content">
      <v-chart :options="options" />
    </div>
  </div>
</template>

<script lang="ts" >
import ECharts from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/polar";
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  components: {
    "v-chart": ECharts,
  },
})
export default class ClassStatusAnalysis extends Vue {
  public visible: boolean = false;
  public dataList = [];
  public options: any = {
    title: {
      text: "课堂情绪曲线",
      show: true,
    },
    xAxis: {
      name: "时间",
      type: "category",
      axisTick: {
        show: true,
        interval: 30,
      },
      splitLine: {
        show: true,
      },
      data: [],
    },
    yAxis: {
      name: "专注度",
      type: "value",
      max: 100,
    },
    series: [
      {
        data: [],
        type: "line",
        smooth: true,
      },
    ],
  };
  public open(): void {
    this.visible = true;
  }
  public close(): void {
    this.visible = false;
  }
  public addData(data: any): void {
    const xData = this.options.xAxis.data;
    let last = 0;
    if (xData.length > 0) {
      last = parseInt(xData[xData.length - 1]);
    }
    const label = last + 10 + "";
    this.options.xAxis.data.push(label);
    this.options.series[0].data.push(data);
  }
}
</script>

<style scoped lang="less" >
.echarts {
  width: 100vw;
  height: 300px;
}
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
  box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.2),
    0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 300px;
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
  background: rgba(0, 0, 0, 0.5);
}

@keyframes btt-drawer-in {
  0% {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes btt-drawer-out {
  0% {
    transform: translate(0);
  }
  to {
    transform: translateY(100%);
  }
}

@keyframes drawer-fade-in {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog__open .dialog-mask {
  animation: drawer-fade-in 0.3s;
}

.dialog__open .dialog-content {
  animation: btt-drawer-in 0.3s;
}

.dialog__close .dialog-content {
  transform: translateY(100%);
}
</style>