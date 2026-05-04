// frontend/src/stores/signature.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SignatureContext {
  from: 'package' | 'traditional'
  customerId?: number        // 組合包使用時
  selectedPackageId?: string
  selectedServiceIds?: number[]
  notes?: string
  gifts?: any[]
  // 傳統服務使用時
  memberId?: number
  preselectServiceId?: number
  serviceNotes?: string
}

export const useSignatureStore = defineStore('signature', () => {
  const pendingContext = ref<SignatureContext | null>(null)
  const signatureResult = ref<string | null>(null)

  function startSignature(context: SignatureContext) {
    pendingContext.value = context
    signatureResult.value = null
  }

  function completeSignature(dataURL: string) {
    signatureResult.value = dataURL
  }

  function cancelSignature() {
    pendingContext.value = null
    signatureResult.value = null
  }

  function getResultAndClear() {
    const result = signatureResult.value
    const context = pendingContext.value
    signatureResult.value = null
    pendingContext.value = null
    return { context, signature: result }
  }

  return { pendingContext, signatureResult, startSignature, completeSignature, cancelSignature, getResultAndClear }
})