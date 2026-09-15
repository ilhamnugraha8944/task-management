<template>
  <div class="material-suggestion">
    <select
      :id="id"
      ref="select"
      :required="required"
      :aria-label="label"
      @invalid.prevent="showInvalid"
    ></select>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import $ from 'jquery'
import installSelect2 from 'select2'
import 'select2/dist/css/select2.min.css'

if (!$.fn.select2) installSelect2(window, $)

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  allowNew: { type: Boolean, default: true },
  required: Boolean,
})
const emit = defineEmits(['update:modelValue', 'change'])
const select = ref(null)
let widget
let dialog

function syncOptions() {
  if (!widget) return
  const values = [...new Set([...props.options, props.modelValue].filter(Boolean))]
  widget.empty().append(new Option('', ''))
  for (const value of values) widget.append(new Option(value, value))
  widget.val(props.modelValue).trigger('change.select2')
}

function showInvalid() {
  widget.next().find('[role="combobox"]').attr('aria-invalid', 'true')
  if (!dialog.querySelector('.select2-container--open')) widget.select2('open')
}

function closeDropdown() {
  widget?.select2('close')
}

onMounted(() => {
  dialog = select.value.closest('dialog')
  widget = $(select.value)
  syncOptions()
  widget.select2({
    width: '100%',
    dropdownParent: $(dialog),
    tags: props.allowNew,
    allowClear: true,
    placeholder: 'Pilih atau ketik...',
    language: {
      noResults: () => 'Tidak ada pilihan',
      searching: () => 'Mencari...',
    },
    createTag: ({ term }) => {
      const value = term.trim()
      return value ? { id: value, text: value } : null
    },
  })
  widget
    .next()
    .find('[role="combobox"]')
    .removeAttr('aria-labelledby')
    .attr({
      'aria-label': props.label,
      'aria-required': String(props.required),
    })
  widget.on('change.material', () => {
    const value = widget.val() || ''
    widget.next().find('[role="combobox"]').removeAttr('aria-invalid')
    emit('update:modelValue', value)
    emit('change', value)
  })
  widget.on('select2:open.material', () => {
    const search = dialog.querySelector('.select2-search__field')
    search?.setAttribute('aria-label', `Cari ${props.label}`)
    search?.focus()
  })
  dialog.addEventListener('close', closeDropdown)
})

watch(() => [props.options, props.modelValue], syncOptions, { deep: true })

onBeforeUnmount(() => {
  dialog?.removeEventListener('close', closeDropdown)
  widget?.off('.material').select2('destroy')
})
</script>

<style>
.material-suggestion {
  min-width: 0;
  height: 41px;
}

.material-suggestion .select2-container {
  width: 100% !important;
  font: inherit;
}

.material-suggestion .select2-selection--single {
  height: 41px;
  border: 1px solid var(--tm-border);
  border-radius: 4px;
  background: #fff;
}

.material-suggestion .select2-selection__rendered {
  padding-left: 8px;
  color: var(--tm-ink) !important;
  line-height: 39px !important;
}

.material-suggestion .select2-selection__placeholder {
  color: var(--tm-muted) !important;
}

.material-suggestion .select2-selection__arrow {
  height: 39px !important;
}

.material-suggestion .select2-selection__clear {
  margin-right: 6px;
  color: var(--tm-primary-dark);
}

.material-suggestion .select2-selection:focus,
.material-suggestion .select2-container--open .select2-selection {
  border-color: var(--tm-primary);
  outline: none;
  box-shadow: 0 0 0 0.2rem rgb(208 0 0 / 13%);
}

.sheet-dialog .select2-dropdown {
  overflow: hidden;
  border-color: var(--tm-border);
  border-radius: 4px;
  color: var(--tm-ink);
  font: inherit;
  box-shadow: 0 6px 16px rgb(48 35 38 / 12%);
}

.sheet-dialog .select2-search--dropdown {
  padding: 8px;
}

.sheet-dialog .select2-search--dropdown .select2-search__field {
  height: 35px;
  padding: 6px 8px;
  border: 1px solid var(--tm-border);
  border-radius: 4px;
  color: var(--tm-ink);
  font: inherit;
}

.sheet-dialog .select2-search__field:focus {
  border-color: var(--tm-primary);
  outline: none;
}

.sheet-dialog .select2-results__option {
  padding: 8px;
}

.sheet-dialog .select2-results__option[aria-selected='true'] {
  color: var(--tm-primary-dark);
  background: var(--tm-primary-soft);
}

.sheet-dialog .select2-results__option--highlighted[aria-selected] {
  color: #fff;
  background: var(--tm-primary);
}
</style>
