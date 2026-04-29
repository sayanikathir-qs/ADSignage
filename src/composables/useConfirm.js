import { reactive } from 'vue'

const state = reactive({
  open: false,
  title: '',
  message: '',
  detail: '',
  icon: 'mdi-delete-alert',
  iconColor: 'error',
  confirmText: 'Delete',
  confirmColor: 'error',
  cancelText: 'Cancel',
  loading: false,
  _resolve: null,
})

export function useConfirmState() {
  return state
}

export function useConfirm() {
  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      state.open = true
      state.title = options.title ?? 'Confirm Delete'
      state.message = options.message ?? 'Are you sure?'
      state.detail = options.detail ?? 'This action cannot be undone.'
      state.icon = options.icon ?? 'mdi-delete-alert'
      state.iconColor = options.iconColor ?? 'error'
      state.confirmText = options.confirmText ?? 'Delete'
      state.confirmColor = options.confirmColor ?? 'error'
      state.cancelText = options.cancelText ?? 'Cancel'
      state.loading = false
      state._resolve = resolve
    })
  }

  return { confirm }
}
