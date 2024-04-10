<script setup>
import { onMounted, ref } from "vue"
import LineChart from "@/components/LineChart/index.vue"
import { getTableDataApi } from "@/api/table"

const servers = ref([])
onMounted(() => {
  getTableDataApi().then((resp) => {
    servers.value = resp.data
  })
})
</script>

<template>
  <div>
    <br />
    <br />
    <div v-for="server in servers" :key="server.id">
      <LineChart :server="server" />
    </div>
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
