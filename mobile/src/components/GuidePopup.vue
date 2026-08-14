<template>
  <van-popup
    :show="show"
    round
    closeable
    close-icon-position="top-right"
    position="bottom"
    :style="{ height: '62%', paddingBottom: 'env(safe-area-inset-bottom)' }"
    @update:show="onUpdateShow"
  >
    <div class="guide-wrap">
      <div class="guide-head">
        <div class="guide-title">{{ title }}</div>
        <div class="guide-sub">{{ subtitle }}</div>
      </div>

      <div class="guide-stage">
        <transition name="fade" mode="out-in">
          <div class="guide-step" :key="current">
            <div class="guide-icon-box icon-circle xl guide-icon-xl">
              <component :is="iconComponent"></component>
            </div>
            <div class="guide-step-no">步骤 {{ current + 1 }} / {{ steps.length }}</div>
            <div class="guide-step-title">{{ currentStep.title }}</div>
            <div class="guide-step-desc">{{ currentStep.desc }}</div>
          </div>
        </transition>
      </div>

      <div class="guide-dots">
        <span
          v-for="(s, i) in steps"
          :key="i"
          class="dot"
          :class="{ active: i === current }"
        ></span>
      </div>

      <div class="guide-actions">
        <button
          v-if="current > 0"
          class="btn-capsule outline"
          style="flex:0 0 38%; height:44px;"
          @click="prev"
        >上一步</button>
        <button
          v-if="current < steps.length - 1"
          class="btn-capsule primary"
          style="flex:1; height:44px;"
          @click="next"
        >下一步</button>
        <button
          v-else
          class="btn-capsule primary"
          style="flex:1; height:44px;"
          @click="finish"
        >我知道了</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed, h, ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '新手指引' },
  subtitle: { type: String, default: '跟着步骤走，下单更轻松' },
  steps: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:show', 'finish']);
const current = ref(0);
const currentStep = computed(() => props.steps[current.value] || { title: '', desc: '' });

const svgProps = {
  viewBox: '0 0 24 24',
  width: '48',
  height: '48',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
};

const svgIcons = {
  location: {
    render: () => h('svg', svgProps, [
      h('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
      h('circle', { cx: '12', cy: '10', r: '3' })
    ])
  },
  edit: {
    render: () => h('svg', svgProps, [
      h('path', { d: 'M12 20h9' }),
      h('path', { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' })
    ])
  },
  search: {
    render: () => h('svg', svgProps, [
      h('circle', { cx: '11', cy: '11', r: '7' }),
      h('path', { d: 'M21 21l-4.3-4.3' })
    ])
  },
  barcode: {
    render: () => h('svg', svgProps, [
      h('path', { d: 'M3 5v14' }),
      h('path', { d: 'M8 5v14' }),
      h('path', { d: 'M12 5v14' }),
      h('path', { d: 'M17 5v14' }),
      h('path', { d: 'M22 5v14' })
    ])
  },
  screenshot: {
    render: () => h('svg', svgProps, [
      h('path', { d: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }),
      h('path', { d: 'M9 3v4' }),
      h('path', { d: 'M15 3v4' }),
      h('path', { d: 'M3 9h4' }),
      h('path', { d: 'M17 9h4' }),
      h('circle', { cx: '12', cy: '15', r: '2' })
    ])
  },
  check: {
    render: () => h('svg', svgProps, [
      h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
      h('polyline', { points: '22 4 12 14.01 9 11.01' })
    ])
  }
};

const iconComponent = computed(() => {
  const iconName = currentStep.value.icon;
  return svgIcons[iconName] || svgIcons.check;
});

watch(() => props.show, (v) => { if (v) current.value = 0; });
function next() { if (current.value < props.steps.length - 1) current.value += 1; }
function prev() { if (current.value > 0) current.value -= 1; }
function finish() { emit('update:show', false); emit('finish'); }
function onUpdateShow(v) { emit('update:show', v); }
</script>

<style scoped>
.guide-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 20px 24px;
  background: var(--hpy-white);
}
.guide-head { text-align: center; margin-bottom: 6px; }
.guide-title { font-size: 20px; font-weight: var(--hpy-fw-bold); color: var(--hpy-text-1); letter-spacing: 0.5px; }
.guide-sub { font-size: 13px; color: var(--hpy-text-3); margin-top: 4px; }
.guide-stage { flex: 1; display: flex; align-items: center; justify-content: center; }
.guide-step { text-align: center; width: 100%; }
.guide-icon-xl {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  animation: pop 0.4s ease;
}
.guide-step-no { font-size: 12px; color: var(--hpy-primary); font-weight: var(--hpy-fw-semi); margin-bottom: 6px; letter-spacing: 1px; }
.guide-step-title { font-size: 19px; font-weight: var(--hpy-fw-bold); color: var(--hpy-text-1); margin-bottom: 8px; }
.guide-step-desc { font-size: 14px; color: var(--hpy-text-2); line-height: 1.75; padding: 0 10px; }
.guide-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
.guide-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: #D4DCE8; transition: all 0.25s ease; }
.guide-dots .dot.active { width: 22px; border-radius: 999px; background: var(--hpy-primary); }
.guide-actions { display: flex; gap: 10px; }

@keyframes pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
