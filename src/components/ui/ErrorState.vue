<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>

<template>
  <div role="alert" class="flex flex-col items-center gap-4 px-page py-16 text-center">
    <p class="text-lg">{{ t('common.error') }}</p>
    <button type="button" class="btn-outline" @click="$emit('retry')">{{ t('common.retry') }}</button>
  </div>
</template>
