<template>
  <div>
    <a-menu
      v-model:selectedKeys="state.selectedKeys"
      mode="inline"
      :open-keys="state.openKeys"
      :items="items"
      @click="onClick"
    ></a-menu>
  </div>
</template>

<script lang="ts" setup>
import { VueElement, h, reactive, watch } from 'vue'
import {
  CloudServerOutlined,
  AppstoreAddOutlined,
  CopyOutlined,
  NodeIndexOutlined
} from '@ant-design/icons-vue'
import { type ItemType } from 'ant-design-vue'
import router from '@/router'

watch(
  () => router.currentRoute.value.path,
  (path) => {
    const pathed = path.endsWith('/') ? path.substring(0, path.length - 1) : path
    const paths = pathed.split('/')
    const rootPath = '/' + paths[1]
    state.openKeys = [rootPath]
    state.selectedKeys = [pathed]
  }
)

function getItem(
  label: VueElement | string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: 'group'
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type
  } as ItemType
}

const items: ItemType[] = reactive([
  getItem('服务管理', '/service', () => h(CloudServerOutlined), [
    getItem('手动管理', '/service/systemctl')
  ]),
  getItem('插件管理', '/plugin', () => h(AppstoreAddOutlined), [
    getItem('断言器', '/plugin/element/predicate'),
    getItem('过滤器', '/plugin/element/filter'),
    getItem('元数据', '/plugin/metadata')
  ]),
  getItem('模板管理', '/template', () => h(CopyOutlined)),
  getItem('路由管理', '/route', () => h(NodeIndexOutlined))
])

const state = reactive({
  rootSubmenuKeys: ['/service', '/plugin', '/template', '/route'],
  openKeys: [''],
  selectedKeys: ['']
})

const onClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>
