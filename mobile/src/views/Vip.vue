<template>
  <div class="vip page-wrap">
    <!-- 顶部蓝白渐变 VIP Hero -->
    <header class="vip-hero">
      <div class="hero-inner">
        <router-link to="/" class="icon-btn" aria-label="返回">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </router-link>
        <div class="hero-crown">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="2 20 5 10 12 14 19 10 22 20"></polygon>
            <circle cx="5" cy="10" r="1.8" fill="currentColor"></circle>
            <circle cx="12" cy="14" r="1.8" fill="currentColor"></circle>
            <circle cx="19" cy="10" r="1.8" fill="currentColor"></circle>
            <line x1="2" y1="20" x2="22" y2="20"></line>
          </svg>
        </div>
        <div class="hero-badge">GOOD FRIEND VIP</div>
        <h1 class="hero-title">好朋友 VIP 会员</h1>
        <p class="hero-sub">甄选好物 · 专属权益 · 新鲜直达</p>

        <div class="vip-card fade-in">
          <div class="vip-card-top">
            <div class="logo-big">好</div>
            <div class="level-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 17 5.5 21 7.5 13.5 2 9 9 9"></polygon>
              </svg>
              钻石 VIP
            </div>
          </div>
          <div class="vip-no">NO. HPY 2026 8888</div>
          <div class="vip-valid">会员有效期：永久有效</div>
          <div class="vip-card-bottom">
            <span>好朋友集市 · 甄选团购平台</span>
          </div>
          <div class="deco-circle c1"></div>
          <div class="deco-circle c2"></div>
        </div>
      </div>
    </header>

    <!-- 会员数据概览 -->
    <section class="stats-row fade-in" style="animation-delay: 80ms;">
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">累计下单</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-num">￥0</div>
        <div class="stat-label">累计节省</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">团购次数</div>
      </div>
    </section>

    <!-- 核心权益 -->
    <section class="section fade-in" style="animation-delay: 140ms;">
      <div class="section-title">
        <span class="bar"></span>
        VIP 核心权益
      </div>
      <div class="benefit-grid">
        <div class="benefit-card" v-for="(b, i) in coreBenefits" :key="i">
          <div class="benefit-icon" :style="{ background: b.bg }">
            <span v-html="b.icon"></span>
          </div>
          <div class="benefit-name">{{ b.name }}</div>
          <div class="benefit-desc">{{ b.desc }}</div>
        </div>
      </div>
    </section>

    <!-- 专属服务 -->
    <section class="section fade-in" style="animation-delay: 200ms;">
      <div class="section-title">
        <span class="bar"></span>
        VIP 专属服务
      </div>
      <div class="service-list">
        <div class="service-card" v-for="(s, i) in services" :key="i">
          <div class="s-left" :style="{ background: s.bg }">
            <span class="s-emoji">{{ s.emoji }}</span>
          </div>
          <div class="s-body">
            <div class="s-name">{{ s.name }}</div>
            <div class="s-desc">{{ s.desc }}</div>
          </div>
          <div class="s-tag">{{ s.tag }}</div>
        </div>
      </div>
    </section>

    <!-- 会员等级 -->
    <section class="section fade-in" style="animation-delay: 260ms;">
      <div class="section-title">
        <span class="bar"></span>
        会员等级体系
      </div>
      <div class="level-timeline">
        <div class="level-item" v-for="(l, i) in levels" :key="i" :class="{ active: i === levels.length - 1 }">
          <div class="l-dot"></div>
          <div class="l-card">
            <div class="l-head">
              <div class="l-name">
                <svg v-if="i === levels.length - 1" viewBox="0 0 24 24" width="16" height="16" fill="#FFB800">
                  <polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 17 5.5 21 7.5 13.5 2 9 9 9"></polygon>
                </svg>
                {{ l.name }}
              </div>
              <div class="l-cond">{{ l.cond }}</div>
            </div>
            <div class="l-perks">{{ l.perks }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="section fade-in" style="animation-delay: 320ms;">
      <div class="section-title">
        <span class="bar"></span>
        常见问题
      </div>
      <div class="faq-list">
        <div class="faq-item" v-for="(f, i) in faqs" :key="i" @click="toggleFaq(i)">
          <div class="faq-q">
            <span>{{ i + 1 }}. {{ f.q }}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" :class="{ open: faqOpen === i }">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <transition name="fade">
            <div class="faq-a" v-if="faqOpen === i">{{ f.a }}</div>
          </transition>
        </div>
      </div>
    </section>

    <div style="height: 120px;"></div>

    <!-- 底部开通条 -->
    <div class="vip-action-bar">
      <div class="act-info">
        <div class="act-price">
          <small>￥</small>99<small class="per">/年</small>
        </div>
        <div class="act-orig">原价 ￥299</div>
      </div>
      <button class="btn-open" @click="onOpenVip">立即开通 VIP</button>
    </div>

    <!-- 底部导航栏（固定，与首页保持一致） -->
    <nav class="tabbar">
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'home' }"
        @click="router.push('/')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"></path><path d="M9 22V12h6v10"></path></svg>
        <span>首页</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'pickup' }"
        @click="router.push('/orders?tab=pickup&guide=1')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>自提</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeFooter === 'orders' }"
        @click="router.push('/orders?guide=1')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <span>订单</span>
      </div>
      <div
        class="tab-item active"
        :class="{ active: activeFooter === 'vip' }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 3 22 7 12 22 2 7"></polygon><path d="M9 12h6"></path></svg>
        <span>VIP</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const activeFooter = computed(() => 'vip');
const faqOpen = ref(null);

const coreBenefits = [
  { name: '专享折扣', desc: '全场商品 9 折起', icon: '💰', bg: 'linear-gradient(135deg,#1677FF,#4096FF)' },
  { name: '满减券包', desc: '每月赠送 100 元券', icon: '🎟️', bg: 'linear-gradient(135deg,#FF7D00,#FF9A2E)' },
  { name: '优先配送', desc: '自提优先备货', icon: '🚚', bg: 'linear-gradient(135deg,#00B42A,#009F5A)' },
  { name: '专属客服', desc: 'VIP 1对1 服务', icon: '💬', bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { name: '生日好礼', desc: '生日当月神秘礼物', icon: '🎁', bg: 'linear-gradient(135deg,#F53F3F,#CB2634)' },
  { name: '积分加倍', desc: '下单积分 x2', icon: '⭐', bg: 'linear-gradient(135deg,#FFB800,#FA8C16)' },
];

const services = [
  { name: '今日下单 · 明日自提', desc: '24 小时内新鲜备货，品质保障', emoji: '🥬', bg: 'linear-gradient(135deg,#EFF5FF,#F0F7FF)', tag: '极速' },
  { name: '商品不满意包退换', desc: '签收 24 小时内无理由退换', emoji: '✅', bg: 'linear-gradient(135deg,#FFF4E5,#FFF7ED)', tag: '无忧' },
  { name: '源头直采 品质把控', desc: '每批商品严选检测，放心吃', emoji: '🍎', bg: 'linear-gradient(135deg,#E7F7EE,#F3FBF6)', tag: '安心' },
  { name: '邻里团购 超省预算', desc: '3 人即可成团，拼的多省的多', emoji: '👭', bg: 'linear-gradient(135deg,#F5F0FF,#FBF7FF)', tag: '省钱' },
];

const levels = [
  { name: '普通会员', cond: '注册即享', perks: '95 折优惠 · 生日 1 张 5 元券 · 标准客服' },
  { name: '黄金 VIP', cond: '年消费 满 500 元', perks: '92 折优惠 · 每月 50 元券包 · 优先备货 · 双倍积分' },
  { name: '钻石 VIP', cond: '开通 99 元 / 年', perks: '全场 9 折 · 每月 100 元券包 · 专属 1 对 1 客服 · 生日好礼 · 3 倍积分 · 无理由退换' },
];

const faqs = [
  { q: '如何开通好朋友 VIP？', a: '点击下方「立即开通 VIP」按钮，完成支付即可解锁钻石 VIP 全部权益，有效期 1 年（365 天）。' },
  { q: 'VIP 折扣可以叠加优惠券使用吗？', a: '可以的。系统会先计算 VIP 会员折扣价，再叠加可用的满减券，让您享受最大优惠。' },
  { q: '券包何时到账？', a: '开通成功后，券包立即到账（可在首页领券中心查看）；次月起每月 1 号自动发放当月券包。' },
  { q: '开通后可以退款吗？', a: '开通后 7 天内如果未使用任何 VIP 权益，可联系客服无理由退款；超过 7 天或已使用权益则不支持退款，敬请理解。' },
];

function toggleFaq(i) {
  faqOpen.value = faqOpen.value === i ? null : i;
}
function onOpenVip() {
  showToast('VIP 功能即将上线，敬请期待～');
}
</script>

<style scoped>
.vip {
  min-height: 100vh;
  background: #F6F8FB;
  padding-bottom: 30px;
  position: relative;
}

/* ===== HERO 渐变蓝 ===== */
.vip-hero {
  background: linear-gradient(180deg, #1677FF 0%, #4096FF 60%, #F6F8FB 100%);
  padding-top: env(safe-area-inset-top);
  color: #fff;
  position: relative;
}
.hero-inner {
  padding: 10px 14px 180px;
  position: relative;
  text-align: center;
}
.icon-btn {
  position: absolute; top: calc(10px + env(safe-area-inset-top)); left: 10px;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.22);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; z-index: 2;
}
.hero-crown {
  display: inline-flex; align-items: center; justify-content: center;
  width: 80px; height: 80px; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.30), rgba(255,255,255,0.05) 70%);
  margin: 22px 0 6px;
  color: #FFE58A;
  text-shadow: 0 4px 14px rgba(0,0,0,0.18);
  animation: crownFloat 2.4s ease infinite;
}
@keyframes crownFloat {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-5px); }
}
.hero-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255,229,138,0.22);
  color: #FFE58A;
  font-size: 11px; font-weight: 800; letter-spacing: 1px;
  border: 1px solid rgba(255,229,138,0.4);
}
.hero-title { font-size: 24px; font-weight: 900; margin: 10px 0 4px; letter-spacing: 1px; }
.hero-sub { font-size: 13px; opacity: 0.92; font-weight: 500; }

/* VIP 卡（悬浮在 HERO 底部） */
.vip-card {
  position: absolute;
  left: 14px; right: 14px;
  bottom: -150px;
  height: 170px;
  border-radius: 22px;
  padding: 18px;
  background: linear-gradient(135deg, #0F172A 0%, #1677FF 55%, #4096FF 100%);
  color: #fff;
  box-shadow: 0 20px 44px rgba(22,119,255,0.42);
  overflow: hidden;
  text-align: left;
}
.vip-card::after {
  content: "";
  position: absolute; right: -50px; top: -50px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(255,229,138,0.22), rgba(255,229,138,0) 70%);
}
.vip-card-top {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; z-index: 1;
}
.logo-big {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #FFE58A, #FFB800);
  color: #7A4700;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900;
  box-shadow: 0 6px 14px rgba(255,184,0,0.35);
}
.level-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 999px;
  background: linear-gradient(135deg, #FFE58A, #FFB800);
  color: #7A4700;
  font-size: 12px; font-weight: 800;
}
.vip-no {
  margin-top: 16px;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 16px; font-weight: 700; letter-spacing: 2px;
  color: rgba(255,255,255,0.96);
  position: relative; z-index: 1;
}
.vip-valid {
  margin-top: 4px;
  font-size: 11px; color: rgba(255,255,255,0.72);
  position: relative; z-index: 1;
}
.vip-card-bottom {
  position: absolute; left: 18px; right: 18px; bottom: 14px;
  font-size: 10px; color: rgba(255,255,255,0.68); letter-spacing: 0.5px;
  border-top: 1px dashed rgba(255,255,255,0.25);
  padding-top: 10px; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
}
.deco-circle {
  position: absolute; border-radius: 50%;
  border: 1.5px solid rgba(255,229,138,0.35);
}
.deco-circle.c1 { width: 110px; height: 110px; right: -20px; bottom: -40px; }
.deco-circle.c2 { width: 70px; height: 70px; right: 40px; bottom: 10px; border-color: rgba(255,255,255,0.2); }

/* ===== 数据概览 ===== */
.stats-row {
  margin: 160px 14px 0;
  background: #fff;
  border-radius: 18px;
  padding: 14px 8px;
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  box-shadow: 0 10px 24px rgba(15, 67, 148, 0.07);
}
.stat-item { text-align: center; padding: 4px 8px; }
.stat-num {
  font-size: 20px; font-weight: 900;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  letter-spacing: 0.3px;
}
.stat-label { font-size: 11px; color: #86909C; margin-top: 3px; }
.stat-divider { width: 1px; background: #F2F3F5; align-self: stretch; }

/* ===== Section 通用 ===== */
.section { margin: 16px 14px 0; }
.section-title {
  font-size: 17px; font-weight: 800; color: #1D2129;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
}
.section-title .bar {
  width: 3px; height: 16px; border-radius: 3px;
  background: linear-gradient(180deg, #1677FF, #4096FF);
}

/* 核心权益卡片 */
.benefit-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.benefit-card {
  background: #fff; border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 8px 18px rgba(15, 67, 148, 0.06);
}
.benefit-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 6px;
  color: #fff;
}
.benefit-name { font-size: 13px; font-weight: 700; color: #1D2129; }
.benefit-desc { font-size: 10px; color: #86909C; margin-top: 2px; line-height: 1.4; }

/* 专属服务列表 */
.service-list { display: flex; flex-direction: column; gap: 10px; }
.service-card {
  background: #fff; border-radius: 16px;
  padding: 12px;
  display: grid; grid-template-columns: 52px 1fr auto;
  gap: 12px; align-items: center;
  box-shadow: 0 8px 18px rgba(15, 67, 148, 0.06);
}
.s-left {
  width: 52px; height: 52px; border-radius: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 26px;
}
.s-name { font-size: 14px; font-weight: 700; color: #1D2129; }
.s-desc { font-size: 11px; color: #86909C; margin-top: 3px; line-height: 1.5; }
.s-tag {
  padding: 3px 10px; border-radius: 999px;
  background: linear-gradient(135deg, #EFF5FF, #F0F7FF);
  color: #1677FF; font-size: 11px; font-weight: 700;
  border: 1px solid #D6E6FB;
}

/* 会员等级时间线 */
.level-timeline {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 14px 12px 14px 24px;
  box-shadow: 0 8px 18px rgba(15, 67, 148, 0.06);
}
.level-timeline::before {
  content: "";
  position: absolute; left: 13px; top: 24px; bottom: 24px;
  width: 2px;
  background: linear-gradient(180deg, #D6E6FB, #1677FF);
  border-radius: 2px;
}
.level-item {
  position: relative;
  padding-bottom: 16px;
}
.level-item:last-child { padding-bottom: 0; }
.l-dot {
  position: absolute; left: -17px; top: 14px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #D6E6FB;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #D6E6FB;
}
.level-item.active .l-dot {
  background: linear-gradient(135deg, #1677FF, #4096FF);
  box-shadow: 0 0 0 3px rgba(22,119,255,0.22);
}
.l-card {
  background: #F6F8FB;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid transparent;
}
.level-item.active .l-card {
  background: linear-gradient(135deg, #EFF5FF 0%, #F0F7FF 100%);
  border-color: #D6E6FB;
  box-shadow: 0 6px 14px rgba(22,119,255,0.10);
}
.l-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.l-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 800; color: #1D2129;
}
.level-item.active .l-name { color: #1677FF; }
.l-cond {
  font-size: 11px; color: #86909C; font-weight: 500;
  padding: 2px 8px; border-radius: 999px;
  background: #fff;
}
.l-perks { font-size: 11px; color: #4E5969; margin-top: 6px; line-height: 1.6; }

/* FAQ */
.faq-list {
  background: #fff;
  border-radius: 16px;
  padding: 4px 12px;
  box-shadow: 0 8px 18px rgba(15, 67, 148, 0.06);
}
.faq-item { padding: 14px 0; border-bottom: 1px solid #F2F3F5; cursor: pointer; }
.faq-item:last-child { border-bottom: none; }
.faq-q {
  font-size: 13px; font-weight: 700; color: #1D2129;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.faq-q svg {
  color: #86909C;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}
.faq-q svg.open { transform: rotate(180deg); color: #1677FF; }
.faq-a {
  margin-top: 10px;
  font-size: 12px; color: #4E5969;
  line-height: 1.7;
  padding: 10px 12px;
  border-radius: 12px;
  background: #F6F8FB;
}

/* 开通底栏 */
.vip-action-bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff;
  border-top: 1px solid #F2F3F5;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom) + 56px);
  display: flex; align-items: center; justify-content: space-between;
  z-index: 70;
  box-shadow: 0 -4px 18px rgba(15, 67, 148, 0.06);
}
.act-info { display: flex; align-items: baseline; gap: 8px; }
.act-price {
  font-size: 26px; font-weight: 900;
  background: linear-gradient(135deg, #FF7D00, #FF4D4F);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1;
}
.act-price small { font-size: 13px; font-weight: 700; }
.act-price .per { font-size: 11px; font-weight: 500; color: #86909C; background: none; -webkit-text-fill-color: #86909C; }
.act-orig { font-size: 11px; color: #86909C; text-decoration: line-through; }
.btn-open {
  height: 44px; padding: 0 26px;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg, #FF7D00 0%, #FFB800 100%);
  color: #fff;
  font-size: 15px; font-weight: 800; letter-spacing: 0.5px;
  box-shadow: 0 8px 18px rgba(255,125,0,0.32);
}
.btn-open:active { transform: scale(0.97); }

/* 底部导航栏 */
.tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff; border-top: 1px solid #F2F3F5;
  z-index: 80; padding-bottom: env(safe-area-inset-bottom);
  display: grid; grid-template-columns: repeat(4, 1fr);
}
.tab-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 6px 0 4px; gap: 2px;
  color: #86909C; font-size: 11px; font-weight: 500;
  position: relative; cursor: pointer;
}
.tab-item.active { color: #1677FF; font-weight: 800; }
.tab-item.active::after {
  content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 22px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
}
.tab-item svg { width: 22px; height: 22px; }

/* 入场动画 */
.fade-in { animation: fadeIn 0.5s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fade-enter-active, .fade-leave-active { transition: all 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }
</style>
