export interface CreateOrUpdateTableRequestData {
  id?: string
  username: string
  password?: string
}

export interface GetTableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  username?: string
  /** 查询参数：手机号 */
  phone?: string
}

export interface GetTableData {
  createTime: string
  email: string
  id: string
  phone: string
  roles: string
  status: boolean
  username: string
}
interface HostInfo {
  id: number
  serverId: number | null
  mac: string
  platform: string
  platformVersion: string
  cpu: string
  memTotal: number
  diskTotal: number
  swapTotal: number | null
  gpuMemTotal: number
  arch: string
  virtualization: string | null
  bootTime: number
  countryCode: string
  version: string | null
  ip: string
  hostname: string
}

interface ServerState {
  id: number
  serverId: number
  insertTime: string
  cpu: number
  memUsed: number
  swapUsed: number
  diskUsed: number
  gpuMemUsed: number
  gpuCudaUtilization: number
  memPercentage: number
  diskPercentage: number
  gpuMemPercentage: number
  netInTransfer: number
  netOutTransfer: number
  netInSpeed: number
  netOutSpeed: number
  uptime: number
  tcpConnCount: number
  udpConnCount: number
  processCount: number
}

interface SSHInfo {
  id: number
  serverId: number
  sshHost: string
  sshPort: number
  sshUsername: string
  sshPassword: string
}

interface ServerData {
  id: number
  createdAt: string | null
  updatedAt: string | null
  name: string
  tag: string
  displayIndex: number
  hideForGuest: boolean
  enableDDNS: boolean
  ddnsDomain: string | null
  host: HostInfo
  state: ServerState
  ssh: SSHInfo
  lastActive: string
}

// 调整 GetTableResponseData 和 GetTableData 来匹配新的数据结构
export type GetServersResponseData = ApiResponseData<ServerData[]>

export type GetTableResponseData = ApiResponseData<{
  list: GetTableData[]
  total: number
}>
