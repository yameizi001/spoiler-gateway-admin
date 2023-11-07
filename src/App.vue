<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      token: {
        borderRadius: '2px'
      }
    }"
  >
    <a-layout class="layout">
      <!-- side bar layout -->
      <a-layout-sider theme="light" v-model:collapsed="collapsed" :trigger="null" collapsible>
        <!-- title -->
        <div class="title-wrapper">{{ title }}</div>
        <!-- menu -->
        <app-menu></app-menu>
      </a-layout-sider>
      <!-- header and content layout -->
      <a-layout class="layout">
        <!-- header layout -->
        <a-layout-header class="header-layout">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
        </a-layout-header>
        <!-- content layout -->
        <a-layout-content class="content-layout">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppMenu from './components/AppMenu.vue'

dayjs.locale('zh-cn')

const locale = ref(zhCN)

const collapsed = ref<boolean>(false)

const title = computed(() => {
  return collapsed.value ? 'Spoiler' : 'Spoiler 网关后台管理系统'
})
</script>

<style>
.layout {
  height: 100%;
}

.title-wrapper {
  width: 100%;
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: medium;
  white-space: nowrap;
  overflow: hidden;
}

.header-layout {
  height: 48px !important;
  line-height: 48px !important;
  padding-inline: 32px !important;
  background-color: white !important;
}

.content-layout {
  margin: 5px 4px;
  padding: 6px;
  background-color: white;
}
</style>
