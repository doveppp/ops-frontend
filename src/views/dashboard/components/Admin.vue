<script setup>
import { ref } from "vue"
import InfoTable from "@/components/InfoTable/index.vue"
import LineChart from "@/components/LineChart/index.vue"

const servers = ref([])

const handleDataFromChild = (data) => {
  servers.value = data
  console.log(servers) // 输出: Data from child
}
</script>

<template>
  <div class="app-container">
    <InfoTable @serversDataEvent="handleDataFromChild" />
    <div v-for="server in servers.value" :key="server.id">
      <LineChart :server="server" />
    </div>
    <!-- <el-empty description="欢迎来到 admin 角色专属首页" /> -->
  </div>
</template>

<style lang="scss" scoped>
.center {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
