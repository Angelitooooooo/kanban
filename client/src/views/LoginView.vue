<template>
  <v-container fluid fill-height class="pa-0" style=" min-height: 100vh;">
    <v-row align="center" justify="center" class="ma-0" style="min-height: 100vh;">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3" class="d-flex align-center justify-center">
        <v-card elevation="12" class="pa-6" style="width: 100%; max-width: 400px; border-radius: 18px;">
          <v-card-title class="justify-center">
            <span class="text-h5 font-weight-bold">Kanban Login</span>
          </v-card-title>
          <v-form @submit.prevent="handleLogin" class="d-flex flex-column" lazy-validation>
            <v-text-field
              v-model="form.username"
              label="Username or Email"
              prepend-inner-icon="mdi-account"
              outlined
              dense
              color="primary"
              :disabled="isLoading"
              required
              class="mb-3"
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              outlined
              dense
              color="primary"
              :disabled="isLoading"
              required
              class="mb-2"
            />
            <v-checkbox
              v-model="form.remember"
              label="Remember me"
              color="primary"
              class="mb-2"
              :disabled="isLoading"
            />
            <v-btn
              :loading="isLoading"
              :disabled="isLoading"
              color="primary"
              type="submit"
              block
              large
              class="mb-2 mt-2"
            >
              Login
            </v-btn>
            <v-alert v-if="error" type="error" dense outlined class="mb-2">
              {{ error }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: '',
        remember: false
      },
      isLoading: false,
      error: null,
      showPassword: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = null
      if (!this.form.username || !this.form.password) {
        this.error = 'Please enter both username and password'
        return
      }
      this.isLoading = true
      try {
        const response = await api.post('/auth/login', {
          username: this.form.username,
          password: this.form.password
        })

        const { data } = response
        console.log('Login successful:', data)

        // Store user info in Vuex
        this.$store.dispatch('login', {
          username: data.user.username,
          userId: data.user.id,
          isAdmin: data.user.isAdmin,
          data_set: data.user.data_set,
          station: data.user.station,
          remember: this.form.remember
        })

        // Redirect based on admin status
        if (data.user.isAdmin) {
          this.$router.push('/admin')
        } else {
          this.$router.push('/kanban')
        }
      } catch (error) {
        if (error.response?.data?.error) {
          this.error = error.response.data.error
        } else if (error.response?.data?.errors) {
          this.error = error.response.data.errors.join(', ')
        } else {
          this.error = 'Login failed. Please try again.'
        }
        console.error('Login error:', error)
      } finally {
        this.isLoading = false
      }
    }
  },
  mounted() {
    // If already logged in, redirect to /kanban
    // if (this.$store.getters.isAuthenticated) {
    //   this.$router.replace('/kanban')
    // }
  }
}
</script>
