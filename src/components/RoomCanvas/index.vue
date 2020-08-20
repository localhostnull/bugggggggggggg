<template>
  <div>
    <canvas
      :id="id"
      :class="canDraw?'canvas':''"
      :width="width"
      :height="height"
      :style="{'width':`${width}px`,'height':`${height}px`}"
      @mousedown="canvasDown($event)"
      @mouseup="canvasUp($event)"
      @mousemove="canvasMove($event)"
      @touchstart="canvasDown($event)"
      @touchend="canvasUp($event)"
      @touchmove="canvasMove($event)"
    ></canvas>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { IBeginRec, IVertex, IDrawInfo } from "./index.d";

@Component
export default class RoomCanvas extends Vue {
  @Prop({
    type: String,
  })
  public id = "";

  @Prop({
    type: Number,
  }) // 绘图区域宽度
  public width = 0;

  @Prop({
    type: Number,
  }) // 绘图区域高度
  public height = 0;

  @Prop({
    type: Boolean,
  }) // 图片路径
  public canDraw = true;

  //   @Prop({
  //     type: Array,
  //   }) // 位置点信息
  //   public info: Array = true;

  // canvas对象
  public context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
  // 是否处于绘制状态
  public canvasMoveUse = false;
  // 绘制矩形和椭圆时用来保存起始点信息
  public beginRec: IBeginRec = {
    x: 0,
    y: 0,
    imageData: {} as ImageData,
  };

  // 储存坐标信息
  public drawInfo: IDrawInfo[] = [];
  // 储存历史记录
  public drawHistory: ImageData[] = [];
  public drawHistoryMax = 20;
  public lineColor = "red";
  public lineWidth = 20;
  public lineType = "rec";
  public vertex: IVertex = {
    left: 0,
    top: 0,
  };
  public canvas: HTMLCanvasElement = {} as HTMLCanvasElement;

  // 初始化绘制信息
  public initDraw(): void {
    // 初始化画布
    this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // 初始化画笔
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.lineColor;
  }
  // 鼠标按下
  public canvasDown(e: MouseEvent & TouchEvent): void {
    if (this.canDraw) {
      this.canvasMoveUse = true;
      // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
      let canvasX = e.offsetX;
      let canvasY = e.offsetY;
      if (e.type === "touchstart") {
        this.vertex = this.getVertexPosition(this.canvas);
        canvasX = e.changedTouches[0].pageX - this.vertex.left;
        canvasY = e.changedTouches[0].pageY - this.vertex.top;
      }
      // 记录起始点和起始状态
      this.beginRec.x = canvasX;
      this.beginRec.y = canvasY;
      this.beginRec.imageData = this.context.getImageData(
        0,
        0,
        this.width,
        this.height
      );
      // 存储本次绘制坐标信息
      this.drawInfo.push({
        x: canvasX / this.width,
        y: canvasY / this.height,
        type: this.lineType,
        color: this.lineColor,
        width: this.lineWidth,
      });
      this.setHistory();

      this.context.beginPath();
      this.context.moveTo(this.beginRec.x, this.beginRec.y);
    }
  }
  // 鼠标抬起
  public canvasUp() {
    if (this.canDraw) {
      this.canvasMoveUse = false;
      this.$emit("success", {
        id: this.id,
        type: "draw",
        info: this.drawInfo[this.drawInfo.length - 1],
      });
    }
  }
  // 鼠标移动时绘制
  public canvasMove(e: MouseEvent & TouchEvent): void {
    if (this.canvasMoveUse && this.canDraw) {
      let canvasX = e.offsetX;
      let canvasY = e.offsetY;
      if (e.type === "touchmove") {
        canvasX = e.changedTouches[0].pageX - this.vertex.left;
        canvasY = e.changedTouches[0].pageY - this.vertex.top;
      }
      if (this.lineType === "rec") {
        // 绘制矩形时恢复起始点状态再重新绘制
        this.context.putImageData(this.beginRec.imageData, 0, 0);
        this.context.beginPath();
        this.context.rect(
          this.beginRec.x,
          this.beginRec.y,
          canvasX - this.beginRec.x,
          canvasY - this.beginRec.y
        );
        const info = this.drawInfo[this.drawInfo.length - 1];
        info.w = canvasX / this.width - info.x;
        info.h = canvasY / this.height - info.y;
      } else if (this.lineType === "circle") {
        // 绘制椭圆时恢复起始点状态再重新绘制
        this.context.putImageData(this.beginRec.imageData, 0, 0);
        this.context.beginPath();
        const a = (canvasX - this.beginRec.x) / 2;
        const b = (canvasY - this.beginRec.y) / 2;
        this.drawEllipse(
          this.context,
          this.beginRec.x + a,
          this.beginRec.y + b,
          a > 0 ? a : -a,
          b > 0 ? b : -b
        );
        const info = this.drawInfo[this.drawInfo.length - 1];
        info.a = a / this.width;
        info.b = b / this.height;
      } else if (this.lineType === "pen") {
        this.context.lineTo(canvasX, canvasY);
        const info = this.drawInfo[this.drawInfo.length - 1];
        typeof info.paths === "undefined" ? (info.paths = []) : null;
        info.paths.push([
          (canvasX / this.width).toFixed(5),
          (canvasY / this.height).toFixed(5),
        ]);
      }
      this.context.stroke();
    }
  }
  // 绘制椭圆
  public drawEllipse(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    a: number,
    b: number
  ): void {
    context.save();
    const r = a > b ? a : b;
    const ratioX = a / r;
    const ratioY = b / r;
    context.scale(ratioX, ratioY);
    context.beginPath();
    context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false);
    context.closePath();
    context.restore();
  }
  // 根据坐标信息绘制图形
  public drawWithInfoOne(data: any): void {
    this.setHistory();
    this.context.beginPath();
    this.context.lineWidth = data.width;
    this.context.strokeStyle = data.color;
    if (data.type === "rec") {
      this.context.rect(
        data.x * this.width,
        data.y * this.height,
        data.w * this.width,
        data.h * this.height
      );
    } else if (data.type === "circle") {
      this.drawEllipse(
        this.context,
        (data.x + data.a) * this.width,
        (data.y + data.b) * this.height,
        data.a > 0 ? data.a * this.width : -data.a * this.width,
        data.b > 0 ? data.b * this.height : -data.b * this.height
      );
    } else if (data.type === "pen") {
      this.context.moveTo(data.x * this.width, data.y * this.height);
      for (let i = 0; i < data.paths.length; i++) {
        this.context.lineTo(
          data.paths[i][0] * this.width,
          data.paths[i][1] * this.height
        );
      }
    }
    this.context.stroke();
  }
  public backWithInfoOne(): void {
    if (this.drawHistory.length > 0) {
      const preData = this.drawHistory.pop();
      this.context.putImageData(preData!, 0, 0);
    }
  }
  // 获取坐标信息
  public getInfo(): IDrawInfo[] {
    return this.drawInfo;
  }
  // 清空画布  此方法并未使用
  //   public clean() {
  //     this.drawInfo = [];
  //     if (this.info && this.info.length !== 0) this.drawWithInfo();
  //   }
  public setLineColor(val: string) {
    this.lineColor = val;
    this.context.strokeStyle = this.lineColor;
  }
  public setLineWidth(val: number) {
    this.lineWidth = val;
    this.context.lineWidth = this.lineWidth;
  }
  public setLineType(val: string) {
    this.lineType = val;
  }
  public setHistory() {
    if (this.drawHistory.length > this.drawHistoryMax) {
      this.drawHistory.splice(0, 1);
    }
    const preData = this.context.getImageData(0, 0, this.width, this.height);
    this.drawHistory.push(preData);
  }
  public getBack() {
    if (this.drawHistory.length === 0) {
      return false;
    } else {
      const preData = this.drawHistory.pop();
      this.context.putImageData(preData!, 0, 0);
      this.$emit("success", { id: this.id, type: "back", info: null });
      return true;
    }
  }
  public getVertexPosition(el: HTMLCanvasElement) {
    let currentTarget: any = el;
    let top = 0;
    let left = 0;
    while (currentTarget !== null) {
      top += currentTarget.offsetTop;
      left += currentTarget.offsetLeft;
      currentTarget = currentTarget.offsetParent;
    }
    return { top, left };
  }
}
</script>

<style scoped lang="less">
.canvas {
  cursor: crosshair;
}
</style>