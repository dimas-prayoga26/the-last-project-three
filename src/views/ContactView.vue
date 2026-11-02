<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/ui/PageHeader.vue'
import { ApiError, apiPost } from '@/lib/api'
import { useSiteStore } from '@/stores/site'
import type { ContactMessageInput } from '@/types/api'

type Field = 'name' | 'email' | 'phone' | 'subject' | 'message'

const { t } = useI18n()
const route = useRoute()
const site = useSiteStore()
const contact = computed(() => site.studio?.contact ?? null)

const emptyForm = (): ContactMessageInput => ({ name: '', email: '', phone: '', subject: '', message: '', website: '' })
/** A link such as "Collaborate with …" can suggest the subject (?subject=), read once on arrival. */
const suggestedSubject = typeof route.query.subject === 'string' ? route.query.subject.slice(0, 150) : ''
const form = reactive<ContactMessageInput>({ ...emptyForm(), subject: suggestedSubject })
const fieldErrors = ref<Partial<Record<Field, boolean>>>({})
const status = ref<'idle' | 'sending' | 'sent' | 'failed' | 'rate-limited'>('idle')

const fields: { name: Field; type: string; autocomplete: string; required: boolean }[] = [
  { name: 'name', type: 'text', autocomplete: 'name', required: true },
  { name: 'email', type: 'email', autocomplete: 'email', required: true },
  { name: 'phone', type: 'tel', autocomplete: 'tel', required: false },
  { name: 'subject', type: 'text', autocomplete: 'off', required: false },
]

function validate(): boolean {
  fieldErrors.value = {
    name: form.name.trim() === '',
    email: !/^\S+@\S+\.\S+$/.test(form.email.trim()),
    message: form.message.trim() === '',
  }

  return !Object.values(fieldErrors.value).some(Boolean)
}

async function submit(): Promise<void> {
  if (!validate()) {
    return
  }

  status.value = 'sending'

  try {
    await apiPost('/contact-messages', form)
    Object.assign(form, emptyForm())
    status.value = 'sent'
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      fieldErrors.value = Object.fromEntries(Object.keys(error.errors).map((field) => [field, true]))
      status.value = 'idle'
    } else {
      status.value = error instanceof ApiError && error.status === 429 ? 'rate-limited' : 'failed'
    }
  }
}

const whatsappUrl = computed(() => (contact.value?.whatsapp ? `https://wa.me/${contact.value.whatsapp.replace(/\D/g, '')}` : null))

useHead({
  title: () => t('contact.title'),
  meta: [{ name: 'description', content: () => t('contact.intro') }],
})
</script>

<template>
  <div>
    <PageHeader :eyebrow="t('nav.studio')" :title="t('contact.title')" :intro="t('contact.intro')" :shapes="['T-right', 'L', 'P-rot', 'T']" />

    <div class="grid grid-cols-1 gap-unit px-page lg:grid-cols-2">
      <!-- Contact details as tiles -->
      <dl class="grid grid-cols-1 content-start gap-unit sm:grid-cols-2">
        <div v-if="contact?.email" class="flex min-h-40 flex-col justify-between gap-6 bg-grey-tint p-unit">
          <dt class="eyebrow">{{ t('contact.email') }}</dt>
          <dd class="text-xl break-all md:text-2xl"><a :href="`mailto:${contact.email}`" class="link-underline">{{ contact.email }}</a></dd>
        </div>
        <div v-if="contact?.phone" class="flex min-h-40 flex-col justify-between gap-6 bg-grey-tint p-unit">
          <dt class="eyebrow">{{ t('contact.phone') }}</dt>
          <dd class="text-xl md:text-2xl"><a :href="`tel:${contact.phone.replace(/\s+/g, '')}`" class="link-underline">{{ contact.phone }}</a></dd>
        </div>
        <div v-if="whatsappUrl" class="flex min-h-40 flex-col justify-between gap-6 bg-grey-tint p-unit">
          <dt class="eyebrow">{{ t('contact.whatsapp') }}</dt>
          <dd class="text-xl md:text-2xl">
            <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="link-underline">{{ contact?.whatsapp }} <span aria-hidden="true">↗</span></a>
          </dd>
        </div>
        <div v-if="contact?.office_hours" class="flex min-h-40 flex-col justify-between gap-6 bg-grey-tint p-unit">
          <dt class="eyebrow">{{ t('contact.hours') }}</dt>
          <dd class="text-xl md:text-2xl">{{ contact.office_hours }}</dd>
        </div>
        <div v-if="contact?.address" class="flex min-h-40 flex-col justify-between gap-6 bg-black p-unit text-white sm:col-span-2">
          <dt class="text-sm text-white/70">{{ t('contact.address') }}</dt>
          <dd class="flex flex-wrap items-end justify-between gap-4">
            <span class="text-2xl whitespace-pre-line md:text-3xl">{{ contact.address }}</span>
            <a v-if="contact.map_url" :href="contact.map_url" target="_blank" rel="noopener noreferrer" class="link-underline text-sm">
              {{ t('contact.openMap') }} <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
      </dl>

      <!-- Form -->
      <section class="flex flex-col gap-8 border border-black p-unit md:p-10" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" class="text-3xl md:text-4xl">{{ t('contact.form.title') }}</h2>

        <div v-if="status === 'sent'" role="status" class="flex flex-col items-start gap-6">
          <p class="text-lg">{{ t('contact.form.success') }}</p>
          <button type="button" class="btn-outline" @click="status = 'idle'">{{ t('contact.form.sendAnother') }}</button>
        </div>

        <form v-else novalidate class="flex flex-col gap-6" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div v-for="field in fields" :key="field.name" class="flex flex-col gap-2">
              <label :for="`contact-${field.name}`" class="field-label">{{ t(`contact.form.${field.name}`) }}</label>
              <input
                :id="`contact-${field.name}`"
                v-model="form[field.name]"
                :type="field.type"
                :name="field.name"
                :autocomplete="field.autocomplete"
                :required="field.required"
                :aria-invalid="fieldErrors[field.name] ? 'true' : undefined"
                :aria-describedby="fieldErrors[field.name] ? `contact-${field.name}-error` : undefined"
                class="field-input"
              />
              <p v-if="fieldErrors[field.name]" :id="`contact-${field.name}-error`" class="text-sm">{{ t(`contact.errors.${field.name}`) }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="contact-message" class="field-label">{{ t('contact.form.message') }}</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="6"
              required
              :aria-invalid="fieldErrors.message ? 'true' : undefined"
              :aria-describedby="fieldErrors.message ? 'contact-message-error' : undefined"
              class="field-input resize-y"
            />
            <p v-if="fieldErrors.message" id="contact-message-error" class="text-sm">{{ t('contact.errors.message') }}</p>
          </div>

          <!-- Honeypot: hidden from people, filled in by bots. -->
          <div class="hidden" aria-hidden="true">
            <label for="contact-website">Website</label>
            <input id="contact-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
          </div>

          <p v-if="status === 'failed' || status === 'rate-limited'" role="alert" class="text-lg">
            {{ status === 'rate-limited' ? t('contact.form.rateLimited') : t('contact.form.error') }}
          </p>

          <div>
            <button type="submit" class="btn-primary" :disabled="status === 'sending'">
              {{ status === 'sending' ? t('contact.form.sending') : t('contact.form.submit') }}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
