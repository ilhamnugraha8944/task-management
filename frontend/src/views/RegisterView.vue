<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const passwordVisible = ref(false)
const wasSubmitted = ref(false)
const isReady = ref(false)

function submitLogin(event) {
  wasSubmitted.value = true
  isReady.value = false

  if (!event.currentTarget.checkValidity()) return

  isReady.value = true
}
</script>

<template>
  <main class="login-page">
    <div class="container-fluid min-vh-100 p-0">
      <div class="row g-0 min-vh-100">
        <aside class="col-lg-5 login-aside d-none d-lg-flex" aria-label="Tentang aplikasi">
          <div class="login-aside__content">
            <!-- <p class="login-aside__brand">Task Management</p> -->
            <h1>Task Management System</h1>
          </div>
        </aside>

        <section class="col-lg-7 d-flex align-items-center justify-content-center login-content">
          <div class="login-form-wrap w-100">
            <p class="login-mobile-brand d-lg-none">Task Management</p>
            <p class="login-kicker">Welcome</p>
            <h2>Get started</h2>
            <p class="login-description">Buat akun baru</p>

            <form
              class="mt-4"
              :class="{ 'was-validated': wasSubmitted }"
              novalidate
              @submit.prevent="submitLogin"
            >
              <div class="mb-3">
                <label class="form-label" for="email">Email</label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  class="form-control form-control-lg"
                  type="email"
                  name="email"
                  autocomplete="email"
                  placeholder="nama@contoh.com"
                  required
                />
                <div class="invalid-feedback">Masukkan alamat email yang valid.</div>
              </div>

              <div class="mb-3">
                <label class="form-label" for="password">Kata sandi</label>
                <div class="input-group input-group-lg">
                  <input
                    id="password"
                    v-model="form.password"
                    class="form-control"
                    :type="passwordVisible ? 'text' : 'password'"
                    name="password"
                    autocomplete="current-password"
                    placeholder="Masukkan kata sandi"
                    minlength="8"
                    required
                  />
                  <button
                    class="btn btn-outline-secondary password-toggle"
                    type="button"
                    :aria-label="passwordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                    @click="passwordVisible = !passwordVisible"
                  >
                    {{ passwordVisible ? 'Sembunyikan' : 'Tampilkan' }}
                  </button>
                  <div class="invalid-feedback">Kata sandi minimal terdiri dari 8 karakter.</div>
                </div>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div class="form-check">
                  <input id="remember" v-model="form.remember" class="form-check-input" type="checkbox" />
                </div>
              </div>

              <button class="btn btn-primary btn-lg w-100 login-submit" type="submit">Masuk</button>

              <div v-if="isReady" class="alert alert-success mt-3 mb-0" role="status">
                register
              </div>
            </form>

            <p class="login-register mb-0 mt-4">
              Sudah punya akun? <router-link :to="{ name: 'login' }">Login</router-link>
            </p>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
