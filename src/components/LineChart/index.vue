<script setup>
import * as echarts from "echarts"
import axios from "axios"
import { ref, reactive, watch, onMounted, markRaw } from "vue"

import { request } from "@/utils/service"

// 使用props
const props = defineProps({
  server: {
    type: Object
  }
})
const server = props.server
const chartData = ref([])
const myChartStyle = { width: "100%", height: "400px" } // 图表样式
let myChart = null // 使用 ref 或 reactive 包装 echarts 实例可能导致问题，因此这里直接声明

// 转换为组合式 API 的方法
const interpolateMissingData = (data) => {
  // 函数用于生成两个时间点之间的预期时间点
  function getNextInsertTime(insertTime, interval) {
    // 解析时间
    const date = new Date(insertTime)
    // 增加间隔时间（3分钟）
    date.setMinutes(date.getMinutes() + interval)
    // 返回格式化后的时间字符串
    return date.toISOString()
  }

  // 函数用于创建一个所有值都为0的补全数据点，除了insertTime
  function createZeroDataPoint(id, serverId, insertTime) {
    return {
      id: id,
      serverId: serverId,
      insertTime: insertTime,
      cpu: "-",
      memUsed: "-",
      swapUsed: "-",
      diskUsed: "-",
      gpuMemUsed: "-",
      gpuCudaUtilization: "-",
      memPercentage: "-",
      diskPercentage: "-",
      gpuMemPercentage: "-",
      netInTransfer: "-",
      netOutTransfer: "-",
      netInSpeed: "-",
      netOutSpeed: "-",
      uptime: "-",
      tcpConnCount: "-",
      udpConnCount: "-",
      processCount: "-"
    }
  }

  // 函数用于计算两个时间点之间的分钟差
  function minutesDiff(time1, time2) {
    const diff = (new Date(time2) - new Date(time1)) / 60000 // 转换为分钟
    return diff
  }

  // 遍历数据点，寻找间隔大于4分钟的地方
  for (let i = 1; i < data.length; i++) {
    const currentInsertTime = data[i].insertTime
    const previousInsertTime = data[i - 1].insertTime
    const interval = 3 // 正常的间隔时间

    // 计算实际间隔时间
    const actualInterval = minutesDiff(previousInsertTime, currentInsertTime)

    // 如果实际间隔大于10分钟，则插入补全数据点
    if (actualInterval > 10) {
      // 计算需要插入多少个数据点
      const missingIntervals = Math.floor(actualInterval / interval)
      for (let j = 1; j <= missingIntervals; j++) {
        // 计算每个缺失数据点的insertTime
        const newInsertTime = getNextInsertTime(previousInsertTime, interval * j)
        // 创建并插入补全数据点
        data.splice(i, 0, createZeroDataPoint(data[i].id, data[i].serverId, newInsertTime))
        // 更新i的位置，因为数组已经增加了元素
        i++
      }
    }
  }

  return data
}

onMounted(() => {
  initEcharts()
})

const initEcharts = () => {
  const url = "/serverStates"
  request({
    url: url,
    params: { serverId: server.id }
  }).then((resp) => {
    // 使用箭头函数
    if (resp.code === 0) {
      chartData.value = interpolateMissingData(resp.data)
      const option = {
        title: {
          text: server.tag + ":" + server.name
        },
        tooltip: {
          trigger: "axis"
          // formatter: function (params) {
          //     console.log(params);
          //     let res = params[0].name + '<br/>';
          //     params.forEach(function (item) {
          //         res += item.marker + item.seriesName + ': ' + item.value + '<br/>';
          //     });
          //     return res;
          // }
        },
        xAxis: {
          type: "time"
          // data: chartData.map(item => new Date(item.insertTime))
        },
        yAxis: {
          // min: 0, // 设置Y轴的最小值
          // max: 100, // 设置Y轴的最大值
        },
        legend: {
          data: ["内存", "cpu", "硬盘", "gpu内存", "cuda使用率"]
        },

        series: [
          {
            showSymbol: false,
            name: "内存",
            data: chartData.value.map((item) => [new Date(item.insertTime), (item.memPercentage * 100).toFixed(2)]),
            type: "line" // 类型设置为折线图
          },
          {
            showSymbol: false,
            name: "cpu",
            data: chartData.value.map((item) => [new Date(item.insertTime), item.cpu]),
            type: "line" // 类型设置为折线图
          },
          {
            showSymbol: false,
            name: "硬盘",
            data: chartData.value.map((item) => [new Date(item.insertTime), (item.diskPercentage * 100).toFixed(2)]),
            type: "line" // 类型设置为折线图
          },
          {
            showSymbol: false,
            name: "gpu内存",
            data: chartData.value.map((item) => [new Date(item.insertTime), (item.gpuMemPercentage * 100).toFixed(2)]),
            type: "line" // 类型设置为折线图
          },
          {
            showSymbol: false,
            name: "cuda使用率",
            data: chartData.value.map((item) => [new Date(item.insertTime), item.gpuCudaUtilization * 1]),
            type: "line" // 类型设置为折线图
          }
        ]
      }
      myChart = markRaw(echarts.init(document.getElementById("chart" + server.id)))
      myChart.setOption(option)
      //随着屏幕大小调节图表
      window.addEventListener("resize", () => {
        myChart.resize()
      })
    } else {
      ElMessage.error(resp.msg)
    }
  })
}
</script>

<template>
  <div class="echart" :id="'chart' + server.id" :style="myChartStyle" />
</template>
