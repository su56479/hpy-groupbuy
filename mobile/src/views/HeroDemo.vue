<template>
  <div class="page-wrap" style="background: #F6F8FB; min-height: 100vh; padding-bottom: 60px;">
    <header class="detail-topbar" style="background: var(--hpy-grad-primary); color:#fff;">
      <div class="detail-topbar-inner">
        <router-link to="/" class="icon-btn" aria-label="返回" style="color:#fff;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </router-link>
        <div class="detail-title">HERO 设计方案对比</div>
        <div class="icon-btn" style="color:#fff; opacity:0;">·</div>
      </div>
    </header>

    <div class="chips-scroll fade-in" style="margin-top: 14px;">
      <span
        v-for="s in plans"
        :key="s.id"
        class="chip"
        :class="{ active: active === s.id }"
        @click="active = s.id"
      >{{ s.label }}</span>
    </div>

    <!-- ===== 方案 A：果篮主视觉版（生鲜团购风格） ===== -->
    <section v-if="active === 'A'" class="demo-hero plan-a fade-in">
      <div class="text-block">
        <div class="hero-eyebrow"><span class="dot"></span>好朋友 · 精选团购</div>
        <div class="hero-title">甄选好物<br/>新鲜直达</div>
        <div class="hero-sub">今日下单 · 明日到自提点</div>
        <button class="btn-pill primary small" style="margin-top: 14px;">立即选购 →</button>
      </div>
      <div class="art-block" aria-hidden="true">
        <div class="halo h1"></div>
        <div class="halo h2"></div>
        <!-- 水果组合：蓝莓(球) + 橙子(圆) + 叶子 -->
        <div class="fruit blueberry"><span>🥑</span></div>
        <div class="fruit orange"></div>
        <div class="fruit leaf l1"></div>
        <div class="fruit leaf l2"></div>
        <div class="fruit cherry"></div>
        <div class="tag-badge">
          <b>HOT</b><br/><span>团购季</span>
        </div>
      </div>
    </section>

    <!-- ===== 方案 B：双拼卡片版（沃尔玛/超市促销卡结构） ===== -->
    <section v-if="active === 'B'" class="demo-hero plan-b fade-in">
      <div class="left-gradient">
        <div class="left-eyebrow">好朋友 · 精选团购</div>
        <div class="left-title">甄选好物<br/>新鲜直达</div>
        <div class="left-sub">今日下单 · 明日自提</div>
        <button class="btn-pill small" style="background:#fff; color:#1677FF; margin-top: 12px;">
          立即选购 →
        </button>
      </div>
      <div class="right-card-stack">
        <div class="card card-top">
          <div class="fruit-orange-2"></div>
          <div class="card-pill blue">3人拼团</div>
        </div>
        <div class="card card-bottom">
          <div class="fruit-berry"></div>
          <div class="card-pill red">限时特惠</div>
        </div>
        <div class="hot-tag">🔥 HOT</div>
      </div>
    </section>

    <!-- ===== 方案 C：渐变大字促销版（盒马风格） ===== -->
    <section v-if="active === 'C'" class="demo-hero plan-c fade-in">
      <div class="promo-head">
        <div class="left">
          <div class="time-row">
            <span class="t-chip">08</span><i>:</i><span class="t-chip">32</span><i>:</i><span class="t-chip">15</span>
            <span class="t-label">距团购截止</span>
          </div>
          <div class="promo-title">
            甄选<span class="g-text">好物</span><br/>
            <span class="g-text">新鲜</span>直达
          </div>
          <div class="promo-sub">今日下单 · 明日统一到自提点</div>
          <button class="btn-pill primary small" style="margin-top: 10px;">立即拼团 →</button>
        </div>
        <div class="art">
          <div class="halo-a"></div>
          <div class="halo-b"></div>
          <div class="box">
            <div class="b-item i1"></div>
            <div class="b-item i2"></div>
            <div class="b-item i3"></div>
            <div class="b-item i4"></div>
          </div>
          <div class="banner-chip">限量 500 份</div>
        </div>
      </div>
    </section>

    <div class="plan-meta fade-in">
      <h3>{{ planMeta.title }}</h3>
      <ul>
        <li v-for="x in planMeta.points" :key="x">· {{ x }}</li>
      </ul>
      <div class="tips">请在下方反馈选中哪一个方案（A/B/C），我再将其落地到正式首页并构建部署。</div>
    </div>

    <!-- ===== 功能预览区：按第二张截图的结构 ==== -->
    <div class="sub-title fade-in">🔍 功能模块对照（保证第二张截图功能全部可用）</div>
    <div class="feature-grid fade-in">
      <div class="f-card">
        <b>顶栏导航</b>
        <span>品牌Logo + 搜索框 + 订单入口</span>
      </div>
      <div class="f-card">
        <b>分类标签</b>
        <span>本期团购/生鲜/粮油/特惠横滚</span>
      </div>
      <div class="f-card">
        <b>4大入口</b>
        <span>自提码/我的订单/领券+红点/自提点</span>
      </div>
      <div class="f-card">
        <b>团购栏目</b>
        <span>2列商品网格 + 标签 + 空态购物车</span>
      </div>
      <div class="f-card">
        <b>底部TabBar</b>
        <span>首页/分单/自提/我的 四项</span>
      </div>
      <div class="f-card">
        <b>后台设置</b>
        <span>商品/标签/自提点/支付码/模板上传</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const active = ref('A');
const plans = [
  { id: 'A', label: '方案A · 果篮主视觉' },
  { id: 'B', label: '方案B · 双拼卡片' },
  { id: 'C', label: '方案C · 大字促销' }
];
const planMeta = computed(() => ({
  A: {
    title: '方案A · 果篮主视觉版（推荐）',
    points: [
      '左文右图经典版式，浅蓝柔背景 + 多层柔光圆晕',
      '主视觉是多水果组合（蓝莓球+橙子+绿叶+樱桃）比单球更有「生鲜团购」感',
      'HOT 徽章保留红+蓝撞色，更有促销感；渐变蓝色阶柔和不刺眼'
    ]
  },
  B: {
    title: '方案B · 双拼卡片版（沃尔玛超市 Banner 风格）',
    points: [
      '左深蓝渐变块 + 右白卡叠层的双拼结构，更像连锁超市 APP 首页 Banner',
      '卡片叠放 + 角标（3人拼团蓝 / 限时特惠红）+ 🔥 HOT 标签，突出促销',
      '对比度高，文字更醒目，适合活动信息密集的场景'
    ]
  },
  C: {
    title: '方案C · 渐变大字促销版（盒马风格）',
    points: [
      '带倒计时胶囊（08:32:15 距团购截止），活动氛围强',
      '"甄选好物" 两字做蓝-浅蓝渐变处理，配合商品礼盒艺术感更强',
      '限量 500 份角标，适合本期团购稀缺感场景'
    ]
  }
}[active.value]));
</script>

<style scoped>
.demo-hero {
  margin: 14px 14px 0;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  min-height: 180px;
}
.fade-in { animation: fi .45s ease both; }
@keyframes fi { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform: none;} }

/* ========== Plan A ========== */
.plan-a {
  background: linear-gradient(135deg, #E8F3FF 0%, #F7FBFF 60%, #FFFFFF 100%);
  padding: 18px 18px 14px;
  display: flex;
  box-shadow: 0 8px 22px rgba(22, 119, 255, 0.08);
}
.plan-a .text-block { position: relative; z-index: 2; max-width: 58%; }
.plan-a .art-block { position: absolute; right: -4px; top: 4px; width: 50%; height: 100%; }
.plan-a .halo { position: absolute; border-radius: 50%; filter: blur(0.5px); }
.plan-a .h1 { right: -14px; top: 2px; width: 170px; height: 170px;
  background: radial-gradient(circle at 40% 35%, rgba(64,150,255,0.28), rgba(64,150,255,0) 68%); }
.plan-a .h2 { right: 50px; bottom: -12px; width: 120px; height: 120px;
  background: radial-gradient(circle at 60% 65%, rgba(22,119,255,0.18), rgba(22,119,255,0) 70%); }
.plan-a .fruit { position: absolute; }
.plan-a .blueberry {
  right: 14px; bottom: 10px; width: 130px; height: 130px;
  border-radius: 48% 48% 44% 44% / 54% 54% 46% 46%;
  background:
    radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0) 40%),
    conic-gradient(from 210deg,
      #1677FF 0deg, #4096FF 38deg, #1677FF 76deg, #4096FF 114deg,
      #1677FF 152deg, #4096FF 190deg, #1677FF 228deg, #4096FF 266deg,
      #1677FF 304deg, #4096FF 342deg, #1677FF 360deg);
  filter: drop-shadow(0 10px 22px rgba(22,119,255,0.22));
}
.plan-a .blueberry::after {
  content: ""; position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  width: 30px; height: 22px; border-radius: 50% 50% 10% 10% / 70% 70% 20% 20%;
  background: linear-gradient(180deg, #00B42A, #009F5A);
}
.plan-a .orange {
  right: 86px; top: 38px; width: 48px; height: 48px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFD7A8, #FF7A45 55%, #E85D2B);
  box-shadow: 0 4px 12px rgba(232, 93, 43, 0.28);
}
.plan-a .leaf { width: 26px; height: 16px; }
.plan-a .l1 {
  right: 112px; top: 30px;
  background: #00B42A; border-radius: 0 100% 0 100%; transform: rotate(-12deg);
}
.plan-a .l2 {
  right: 24px; top: 20px;
  background: #009F5A; border-radius: 100% 0 100% 0; transform: rotate(8deg);
  width: 22px; height: 14px;
}
.plan-a .cherry {
  right: 96px; bottom: 8px; width: 16px; height: 16px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FF9AA3, #F53F3F 60%);
  box-shadow: 22px 4px 0 -1px #F53F3F;
}
.plan-a .cherry::before {
  content: ""; position: absolute; top: -10px; left: 4px; width: 26px; height: 14px;
  border: 2px solid transparent; border-top-color: #009F5A; border-right-color: #009F5A;
  border-radius: 0 80% 0 0; transform: rotate(14deg);
}
.plan-a .tag-badge {
  position: absolute; top: 4px; right: 0; width: 54px; height: 54px; border-radius: 50%;
  background: #fff; color: #F53F3F; text-align: center;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; line-height: 1.1;
  box-shadow: 0 6px 16px rgba(245, 63, 63, 0.22);
  z-index: 3;
}
.plan-a .tag-badge b { color: #F53F3F; font-size: 13px; font-weight: 800; }
.plan-a .tag-badge span { color: #1677FF; font-weight: 700; letter-spacing: 0.5px; }

/* ========== Plan B ========== */
.plan-b {
  display: grid;
  grid-template-columns: 52% 1fr;
  background: #1677FF;
  min-height: 180px;
}
.plan-b .left-gradient {
  background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
  color: #fff;
  padding: 20px 18px;
  position: relative;
  overflow: hidden;
}
.plan-b .left-gradient::after {
  content:""; position: absolute; right: -40px; bottom: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, rgba(255,255,255,0.18), rgba(255,255,255,0) 65%);
}
.plan-b .left-eyebrow {
  display: inline-block; font-size: 11px; letter-spacing: 1.2px; font-weight: 700;
  padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.18);
}
.plan-b .left-title { margin-top: 12px; font-size: 26px; font-weight: 800; line-height: 1.15; }
.plan-b .left-sub { margin-top: 6px; font-size: 12.5px; opacity: 0.88; }

.plan-b .right-card-stack { position: relative; background: #F6F9FF; padding: 14px 14px 14px 4px; }
.plan-b .card { position: absolute; border-radius: 14px; background: #fff;
  box-shadow: 0 10px 22px rgba(22, 119, 255, 0.12); overflow: hidden; }
.plan-b .card-top {
  right: 12px; top: 14px; width: 110px; height: 88px;
  background: linear-gradient(135deg, #FFF1E6, #FFE1C7);
  transform: rotate(-6deg);
}
.plan-b .card-bottom {
  right: 34px; top: 62px; width: 100px; height: 82px;
  background: linear-gradient(135deg, #E8F3FF, #D6E8FF);
  transform: rotate(5deg);
}
.plan-b .fruit-orange-2 {
  position: absolute; right: 10px; top: 8px; width: 56px; height: 56px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFD7A8, #FF7A45 55%, #E85D2B);
  box-shadow: 0 4px 10px rgba(232,93,43,0.28);
}
.plan-b .fruit-orange-2::after {
  content: ""; position: absolute; top: -6px; right: 12px;
  width: 16px; height: 10px; background: #00B42A; border-radius: 0 100% 0 100%; transform: rotate(-20deg);
}
.plan-b .fruit-berry {
  position: absolute; left: 10px; bottom: 8px; width: 48px; height: 48px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #6BB8FF, #1677FF 60%);
  box-shadow: 0 4px 10px rgba(22,119,255,0.28);
}
.plan-b .card-pill {
  position: absolute; top: 6px; left: 6px;
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px;
}
.plan-b .card-pill.blue { background: #1677FF; color: #fff; }
.plan-b .card-pill.red { background: #F53F3F; color: #fff; }
.plan-b .hot-tag {
  position: absolute; left: 4px; top: 6px;
  background: linear-gradient(135deg, #FF7A45, #F53F3F); color: #fff;
  font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 10px;
  box-shadow: 0 4px 10px rgba(245, 63, 63, 0.26);
}

/* ========== Plan C ========== */
.plan-c {
  background: linear-gradient(135deg, #FFFFFF 0%, #EAF3FF 60%, #D6E8FF 100%);
  padding: 14px 16px;
  box-shadow: 0 8px 22px rgba(22, 119, 255, 0.10);
}
.plan-c .promo-head { display: grid; grid-template-columns: 58% 1fr; gap: 4px; position: relative; }
.plan-c .time-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.plan-c .t-chip {
  display: inline-block; min-width: 24px; padding: 2px 6px; text-align: center;
  background: #1D2129; color: #fff; border-radius: 6px; font-weight: 800; font-size: 12px;
  font-family: 'Courier New', monospace;
}
.plan-c .time-row i { font-style: normal; font-weight: 800; color: #1D2129; }
.plan-c .t-label { margin-left: 4px; font-size: 11px; color: #4E5969; font-weight: 600; }
.plan-c .promo-title { margin-top: 10px; font-size: 26px; line-height: 1.15; font-weight: 800; color: #1D2129; letter-spacing: 0.5px; }
.plan-c .g-text {
  background: linear-gradient(135deg, #1677FF, #4096FF);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.plan-c .promo-sub { margin-top: 4px; font-size: 12.5px; color: #4E5969; font-weight: 500; }
.plan-c .art { position: relative; }
.plan-c .halo-a, .plan-c .halo-b { position: absolute; border-radius: 50%; }
.plan-c .halo-a { right: -16px; top: 0; width: 130px; height: 130px;
  background: radial-gradient(circle at 50% 40%, rgba(22,119,255,0.25), rgba(22,119,255,0) 70%); }
.plan-c .halo-b { left: -10px; bottom: -10px; width: 90px; height: 90px;
  background: radial-gradient(circle at 60% 60%, rgba(64,150,255,0.25), rgba(64,150,255,0) 70%); }
.plan-c .box {
  position: absolute; right: 4px; top: 16px; width: 110px; height: 100px;
  background: #fff; border-radius: 14px;
  box-shadow: 0 12px 22px rgba(22, 119, 255, 0.14);
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 8px;
}
.plan-c .b-item { border-radius: 10px; }
.plan-c .i1 { background: linear-gradient(135deg, #FFCFA8, #FF7A45); }
.plan-c .i2 { background: linear-gradient(135deg, #B8D8FF, #1677FF); }
.plan-c .i3 { background: linear-gradient(135deg, #FFB4BB, #F53F3F); }
.plan-c .i4 { background: linear-gradient(135deg, #B2ECC4, #00B42A); }
.plan-c .banner-chip {
  position: absolute; left: -6px; bottom: 6px;
  background: linear-gradient(135deg, #1677FF, #4096FF); color: #fff;
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  padding: 4px 8px; border-radius: 999px;
  box-shadow: 0 4px 10px rgba(22, 119, 255, 0.25);
}

.plan-meta { margin: 16px 14px 0; background: #fff; border-radius: 16px; padding: 14px 16px;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.06); }
.plan-meta h3 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: #1677FF; }
.plan-meta ul { margin: 0 0 10px; padding: 0; }
.plan-meta li { list-style: none; color: #4E5969; font-size: 13px; padding: 4px 0; }
.plan-meta .tips { background: #E8F3FF; color: #1677FF; border-radius: 10px; padding: 10px 12px; font-size: 12.5px; font-weight: 600; }

.sub-title { margin: 22px 16px 10px; font-weight: 800; color: #1D2129; font-size: 14px; }
.feature-grid { margin: 0 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.f-card { background: #fff; border-radius: 14px; padding: 12px 14px;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.06);
  display: flex; flex-direction: column; gap: 4px; }
.f-card b { color: #1677FF; font-weight: 800; font-size: 13px; }
.f-card span { color: #4E5969; font-size: 12px; }
</style>
