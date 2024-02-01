<!-- [公共]loading -->
<template>
  <div class="common-loading">
    <!-- 1.指示器 -->
    <ul class="indicator">
      <li class="indicator__line" v-for="item of 3" :key="item"></li>
    </ul>
    <!-- 2.进度文字 -->
    <div class="progress">已加载 {{ progress.toFixed(1) }}%</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ progress?: number }>(), { progress: 0 })
</script>

<style scoped>
.common-loading {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.indicator {
  display: flex;
}

.indicator__line {
  width: 4px;
  height: 22px;
  background-color: #e5b55c;
  transform-origin: center;
  animation: keyframes-line-height 0.35s ease-in-out infinite alternate;
  will-change: transform;
}
.indicator__line:nth-child(2) {
  margin-left: 6px;
  animation-delay: 0.1s;
}

.indicator__line:nth-child(3) {
  margin-left: 6px;
  animation-delay: 0.2s;
}

.progress {
  margin-top: 12px;
  font-size: 14px;
  color: #e5b55c;
}

@keyframes keyframes-line-height {
  from {
    transform: scaleY(1);
  }

  to {
    transform: scaleY(0.1);
  }
}
</style>
