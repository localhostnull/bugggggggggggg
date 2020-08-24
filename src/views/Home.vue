<template>
  <div class="home"></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppModule from '@/store/modules/app'

@Component
export default class Home extends Vue {
  public type = "";
  public role = "";
  public token = "";
  public roomId = "";
  public message = "";
  public loading = false;

  public created(): void {
    this.init();
  }
  public init(): void {
    this.type = this.$route.query.type as string;
    console.log(this.type);
    if (!this.type) {
      this.$router.push({ path: "/error", query: { message: "教室类型错误" } });
      return;
    }
    this.role = this.$route.query.role as string;
    if (!this.role) {
      this.$router.push({ path: "/error", query: { message: "角色错误" } });
      return;
    }
    this.token = this.$route.query.token as string;
    if (!this.token) {
      this.$router.push({ path: "/error", query: { message: "认证错误" } });
      return;
    }
    this.roomId = this.$route.query.room_id as string;
    if (!this.roomId) {
      this.$router.push({ path: "/error", query: { message: "教室ID错误" } });
      return;
    }
    this.loading = true;
    console.log(this.$store.dispatch("LoginByToken", this.token))
    AppModule.LoginByToken(this.token)
      // .dispatch("LoginByToken", this.token)
      .then(() => {
        this.$router.push({
          path: "/" + this.type + "/" + this.role + "/" + this.roomId,
        });
      })
      .catch(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="less" scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
