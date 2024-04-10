<script setup>
import { ref, onMounted } from "vue"
import { getToken, removeToken, setToken } from "@/utils/cache/cookies"
import { ElMessage } from "element-plus"
import { request } from "@/utils/service"
import { getTableDataApi } from "@/api/table"
const tableData = ref([])
const user = ref({})
const server = ref({})
const dialogVisible = ref(false)
const upload = ref({})
const uploadUrl = ref(import.meta.env.VITE_BASE_API + "/api/upload")
const emit = defineEmits(["serversDataEvent"])

// const getToken = () => getToken();

const onSuccess = (response, uploadFile, uploadFiles) => {
  console.log("上传成功: " + uploadFile.name)
  ElMessage.success("上传成功: " + uploadFile.name)
}

const onError = () => {
  console.error("上传失败")
  message.error("上传失败")
  ElMessage({
    message: "上传失败: ",
    type: "error"
  })
}

const timeColor = (time) => {
  const insertTime = new Date(time)
  const diff = (new Date() - insertTime) / (1000 * 60) // 时间差，单位：分钟
  return diff > 10 ? "red" : "black"
}

const getRowKeys = (row) => row.id

const get_user = () => {
  request("/users/info/").then((resp) => {
    console.log(resp.data)
    user.value = resp.data
  })
}

const refresh = () => {
  getTableDataApi().then((resp) => {
    tableData.value = resp.data
  })
}

const formatSpeed = (row, colum, cellValue) => {
  return formatByteSize(cellValue) + "/s"
}

const formatByteSize = (bs) => {
  const x = readableBytes(bs)
  return x != "NaN undefined" ? x : "0B"
}

const readableBytes = (bytes) => {
  if (!bytes) {
    return "0B"
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ["B", "K", "M", "G", "T", "P", "E", "Z", "Y"]
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i]
}

const formatPercentage = (r, c, value) => {
  return (value * 100).toFixed(2) + "%"
}

const openSSH = (row) => {
  console.log(row)
  const url = "/" + row.id + "/ssh"
  window.open(url)
}

const update = (row) => {
  if (dialogVisible.value) {
    const url = "/serverInfo"
    console.log(server.value)
    request({
      url: url,
      method: "put",
      data: server.value
    }).then((resp) => {
      if (resp.code === 0) {
        ElMessage.success("恭喜你，保存成功!")
      } else {
        console.error(resp.msg)
      }
    })
    refresh()
    dialogVisible.value = false
  } else {
    server.value = row
    dialogVisible.value = true
  }
}

onMounted(() => {
  refresh()
  emit("serversDataEvent", tableData)
  setInterval(() => {
    setTimeout(() => {
      refresh()
    }, 0)
  }, 10000)
})
</script>

<template>
  <el-dialog ref="form" title="编辑" v-model="dialogVisible" width="35%">
    <el-form ref="form" :model="server" label-width="100px">
      <el-form-item label="id">
        <el-input disabled v-model="server.id" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="server.name" />
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="server.tag" />
      </el-form-item>
      <el-form-item label="sshHost">
        <el-input v-model="server.ssh.sshHost" />
      </el-form-item>
      <el-form-item label="sshPort">
        <el-input v-model="server.ssh.sshPort" />
      </el-form-item>
      <el-form-item label="sshUsername">
        <el-input v-model="server.ssh.sshUsername" />
      </el-form-item>
      <el-form-item label="sshPassword">
        <el-input v-model="server.ssh.sshPassword" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="update(server)">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <div>
    <el-container>
      <!-- <el-header style="text-align: right; font-size: 16px">
        <el-button onclick="window.location.href = '/logout'" type="primary">登出
        </el-button>
        <span>{{ user.username }}</span>
      </el-header> -->

      <el-main>
        <el-table :row-key="getRowKeys" stripe :data="tableData" style="width: 100%">
          <!-- <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item v-for="disk in props.row.disk_ls" label="硬盘">
                  <span> {{ disk.device }} 已使用：{{ disk.used }}GB 总容量：{{ disk.total }}GB 使用率：{{ disk.percent }}%</span>
                </el-form-item>
              </el-form>
            </template>
</el-table-column> -->
          <el-table-column label="硬盘" prop="state.diskPercentage" :formatter="formatPercentage" />
          <el-table-column label="名称" prop="name" />
          <el-table-column label="主机名" prop="host.hostname" />
          <el-table-column label="ip" width="150" prop="host.ip" />
          <el-table-column label="cpu占用" prop="state.cpu" :formatter="formatPercentage" />

          <el-table-column label="内存占用" prop="state.memPercentage" :formatter="formatPercentage">
            <!-- <template #default="scope">{{ (scope.row.state.memUsed / scope.row.host.memTotal * 100).toFixed(2)
              }}%</template> -->
          </el-table-column>
          <el-table-column label="gpu内存占用" width="200">
            <template #default="scope"
              >{{ scope.row.state.gpuMemUsed }} / {{ scope.row.host.gpuMemTotal }} ({{
                ((scope.row.state.gpuMemUsed / scope.row.host.gpuMemTotal) * 100).toFixed(2)
              }}%)</template
            >
          </el-table-column>
          <el-table-column label="cuda占用">
            <template #default="scope">{{ scope.row.state.gpuCudaUtilization.toFixed(2) }}%</template>
          </el-table-column>
          <el-table-column label="下载速度" prop="state.netInSpeed" :formatter="formatSpeed" />
          <el-table-column label="上传速度" prop="state.netOutSpeed" :formatter="formatSpeed" />
          <el-table-column label="标签" prop="tag" />
          <el-table-column label="更新时间" width="250">
            <template #default="scope">
              <span :style="{ color: timeColor(scope.row.state.insertTime) }">{{
                new Date(scope.row.state.insertTime).toLocaleString()
              }}</span>
            </template>
          </el-table-column>

          <!-- <el-table-column :filters="[{ text: '是', value: '是' }, { text: '否', value: '否' }]"
            :filter-method="filterOnline" label="是否在线" prop="online">
          </el-table-column> -->

          <el-table-column label="操作" align="center" width="350">
            <template #default="scope">
              <el-button size="default" type="primary" plain style="margin-right: 0px" @click="update(scope.row)"
                >编辑</el-button
              >
              <el-button size="default" type="primary" plain style="margin-right: 10px" @click="openSSH(scope.row)"
                >SSH</el-button
              >
              <el-upload
                ref="upload"
                :action="uploadUrl"
                :auto-upload="true"
                :headers="{ token: getToken() }"
                :data="{ serverId: scope.row.id }"
                :on-success="onSuccess"
                :show-file-list="false"
                style="display: inline-block"
              >
                <template #trigger>
                  <el-button size="default" type="primary" plain>上传文件</el-button>
                </template>
              </el-upload>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<style>
.cell {
  text-align: center;
  /* 设置表头文字居中 */
}
</style>
