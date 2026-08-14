<template>
  <el-container class="layout-root" :class="{ mobile: isMobile, drawer: drawerOpen && isMobile }">
    <!-- 手机端 抽屉遮罩 -->
    <div v-if="isMobile && drawerOpen" class="drawer-mask" @click="drawerOpen = false"></div>

    <!-- 左侧菜单 -->
    <el-aside
      :width="(isMobile ? (drawerOpen ? '230px' : '0px') : (collapsed ? '64px' : '210px'))"
      class="layout-aside"
      :class="{ mobileDrawer: isMobile && drawerOpen }"
    >
      <div class="logo">
        <div class="logo-circle-mini">好</div>
        <span v-show="!collapsed || isMobile" class="logo-text">好朋友团购后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="!isMobile && collapsed"
        :router="true"
        background-color="#1677FF"
        text-color="rgba(255,255,255,0.85)"
        active-text-color="#ffffff"
        class="layout-menu"
      >
        <el-menu-item index="/products" v-if="state.role === 'admin'">
          <el-icon><ShoppingBag /></el-icon>
          <template #title>商品管理</template>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/vip" v-if="state.role === 'admin'">
          <el-icon><Medal /></el-icon>
          <template #title>VIP管理</template>
        </el-menu-item>
        <el-menu-item index="/pickup-points" v-if="state.role === 'admin'">
          <el-icon><Location /></el-icon>
          <template #title>自提点管理</template>
        </el-menu-item>
        <el-menu-item index="/settings" v-if="state.role === 'admin'">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部：蓝白渐变 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon v-if="isMobile" class="collapse-btn" @click="drawerOpen = !drawerOpen">
            <Menu />
          </el-icon>
          <el-icon v-else class="collapse-btn" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <span class="role-tag">
            <el-tag size="small" effect="dark" :color="state.role === 'admin' ? 'linear-gradient(135deg,#1677FF,#4096FF)' : '#FF7D00'" style="border:none; color:#fff; border-radius: 999px;">
              {{ state.role === 'admin' ? '管理员' : '核销员' }}
            </el-tag>
          </span>
          <el-dropdown @command="onCommand" @click.stop>
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span class="username" v-show="!isMobile">{{ state.username || '未登录' }}</span>
              <el-icon v-if="!isMobile"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, User, ArrowDown, SwitchButton, Menu } from '@element-plus/icons-vue'
import { state, clearAuth } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const drawerOpen = ref(false)
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 768)

function checkWidth() { isMobile.value = window.innerWidth <= 768 }
onMounted(() => { window.addEventListener('resize', checkWidth) })
onBeforeUnmount(() => { window.removeEventListener('resize', checkWidth) })

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '后台')

function onCommand(cmd) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消'
    })
      .then(() => {
        clearAuth()
        ElMessage.success('已退出登录')
        router.replace('/login')
      })
      .catch(() => {})
  }
}
</script>

<style scoped>
.layout-root {
  height: 100vh;
}
.layout-aside {
  background: linear-gradient(180deg, #1677FF 0%, #4096FF 100%);
  transition: width 0.25s ease;
  overflow: hidden;
  z-index: 90;
}
/* 手机端抽屉滑出 */
.layout-aside.mobileDrawer {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  box-shadow: 4px 0 24px rgba(22, 119, 255, 0.28);
  z-index: 100;
  overflow-y: auto;
}
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 95;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.logo-circle-mini {
  width: 28px; height: 28px; border-radius: 50%;
  background: #fff;
  color: #1677FF;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  flex-shrink: 0;
}
.logo-text {
  white-space: nowrap;
}
.layout-menu {
  border-right: none;
  background: transparent !important;
}
.layout-menu:not(.el-menu--collapse) {
  width: 210px;
}
/* 菜单项 hover 优化 */
:deep(.el-menu-item) {
  border-radius: 10px;
  margin: 6px 8px;
}
:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-weight: 700;
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 58px !important;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #4E5969;
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px;
  transition: all .2s;
}
.collapse-btn:hover {
  color: #1677FF;
  background: #E8F3FF;
}
.page-title {
  font-size: 16px;
  font-weight: 800;
  color: #1D2129;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50vw;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #4E5969;
  outline: none;
  padding: 4px 8px;
  border-radius: 999px;
  transition: background .2s;
}
.user-info:hover { background: #F2F3F5; color: #1677FF; }
.username {
  font-size: 14px;
  color: #1D2129;
  font-weight: 600;
}
.layout-main {
  background-color: #F6F8FB;
  padding: 16px;
  overflow: auto;
}

/* 手机端布局调整 */
@media (max-width: 768px) {
  .layout-root.mobile.drawer > :deep(.el-container) { margin-left: 0; }
  .layout-header {
    padding: 0 10px 0 12px !important;
    height: 54px !important;
  }
  .page-title {
    font-size: 15px;
    max-width: 44vw;
  }
  .role-tag { display: none; }
  .layout-main { padding: 10px; }
  .user-info {
    padding: 6px;
    border-radius: 50%;
  }
}
</style>
