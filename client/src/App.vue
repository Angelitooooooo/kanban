<template>
  <v-app>
    <v-app-bar v-if="showAppBar" app color="#1976d2" dark fixed elevation="4">
      <v-app-bar-nav-icon v-if="isAdmin" @click="drawer = !drawer" class="nav-icon"></v-app-bar-nav-icon>
      
      <v-icon left size="28" class="logo-icon">mdi-view-grid</v-icon>
      <div class="app-title">Kanban System</div>
      
      <v-spacer></v-spacer>
      
      <div class="station-badge" v-if="userStation">
        <v-icon left size="18">mdi-map-marker</v-icon>
        <span>Station {{ userStation }}</span>
      </div>
      
      <v-divider vertical class="mx-3" light></v-divider>
      
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list class="account-menu-list">
          <div class="account-menu-header">
            <div class="user-avatar">
              <span class="user-initial">{{ userInitial }}</span>
            </div>
            <div class="user-details">
              <div class="user-name-display">{{ userName }}</div>
              <div class="user-role-badge" v-if="isAdmin">
                <v-icon size="12">mdi-shield-star</v-icon>
                <span>Administrator</span>
              </div>
              <div class="user-station-display" v-if="userStation">
                <v-icon size="12">mdi-map-marker</v-icon>
                <span>Station {{ userStation }}</span>
              </div>
            </div>
          </div>
          <v-divider class="menu-divider"></v-divider>
          <v-list-item @click="openAccountSettings" class="menu-item-custom">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Change Password</v-list-item-title>
          </v-list-item>
          <v-divider class="menu-divider"></v-divider>
          <v-list-item @click="logout" class="menu-item-custom menu-item-logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-if="showAppBar && isAdmin" v-model="drawer" app width="280" class="nav-drawer" elevation="0">
      <!-- Header Section -->
      <div class="nav-header">
        <div class="nav-header-content">
          <v-icon size="28" class="nav-header-icon">mdi-view-grid</v-icon>
          <span class="nav-header-title">Navigation</span>
        </div>
      </div>

      <!-- Main Navigation -->
      <div class="nav-section">
        <p class="nav-section-label">MENU</p>
        <v-list class="nav-list">
          <v-list-item v-if="isAdmin"  @click="goToStationOne" link class="nav-item" :class="{ 'nav-item-active': isStationOneRoute }" ripple>
            <v-list-item-icon class="nav-item-icon">
              <v-icon>mdi-clipboard-text-clock-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="nav-title">Station One</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="goToKanbans" link class="nav-item" :class="{ 'nav-item-active': isKanbansRoute }" ripple>
            <v-list-item-icon class="nav-item-icon">
              <v-icon>mdi-format-list-checks</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="nav-title">Station Two</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="goToAdmin" link class="nav-item" :class="{ 'nav-item-active': isAdminRoute }" ripple>
            <v-list-item-icon class="nav-item-icon">
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="nav-title">Admin Panel</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" @click="goToUsers" link class="nav-item" :class="{ 'nav-item-active': isUsersRoute }" ripple>
            <v-list-item-icon class="nav-item-icon">
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="nav-title">User Management</v-list-item-title>
          </v-list-item>

        </v-list>
      </div>

      <v-spacer></v-spacer>
    </v-navigation-drawer>

    <!-- Account Settings Dialog -->
    <v-dialog v-model="accountSettingsDialog" max-width="420" @keydown.enter="changePassword">
      <v-card class="settings-card" elevation="8">
        <!-- Header with Icon -->
        <div class="settings-header">
          <div class="settings-header-icon">
            <v-icon size="32">mdi-lock-reset</v-icon>
          </div>
          <div>
            <v-card-title class="settings-title">Change Password</v-card-title>
            <p class="settings-subtitle">Update your account password</p>
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-text class="settings-content">
          <v-form ref="passwordForm" @submit.prevent="changePassword">
            <!-- New Password Field -->
            <div class="form-group">
              <label class="field-label">New Password</label>
              <v-text-field
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Enter new password (min. 6 characters)"
                outlined
                dense
                prepend-inner-icon="mdi-lock-check"
                :append-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showNewPassword = !showNewPassword"
                class="custom-field"
                required
              ></v-text-field>
               <p class="field-helper" v-if="passwordForm.newPassword.length > 0">
                <v-icon small class="mr-1">mdi-information</v-icon>
                At least 6 characters required
              </p>
            </div>

            <!-- Confirm Password Field -->
            <div class="form-group">
              <label class="field-label">Confirm New Password</label>
              <v-text-field
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm new password"
                outlined
                dense
                prepend-inner-icon="mdi-lock-outline"
                :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showConfirmPassword = !showConfirmPassword"
                class="custom-field"
                required
              ></v-text-field>
              <p v-if="passwordForm.confirmPassword.length > 0" :class="passwordForm.newPassword === passwordForm.confirmPassword ? 'match-success' : 'match-error'">
                <v-icon small>{{ passwordForm.newPassword === passwordForm.confirmPassword ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                {{ passwordForm.newPassword === passwordForm.confirmPassword ? 'Passwords match' : 'Passwords do not match' }}
              </p>
            </div>

            <!-- Error Alert -->
            <v-alert
              v-if="passwordError"
              type="error"
              class="alert-custom mt-4"
              prominent
              text
              icon="mdi-alert-circle"
            >
              <div class="alert-title">Error</div>
              <div class="alert-text">{{ passwordError }}</div>
            </v-alert>

            <!-- Success Alert -->
            <v-alert
              v-if="passwordSuccess"
              type="success"
              class="alert-custom mt-4"
              prominent
              text
              icon="mdi-check-circle"
            >
              <div class="alert-title">Success</div>
              <div class="alert-text">Your password has been changed successfully!</div>
            </v-alert>
          </v-form>
        </v-card-text>

        <!-- Actions -->
        <v-divider></v-divider>
        <v-card-actions class="settings-actions">
          <v-spacer></v-spacer>
          <v-btn
            text
            color="gray"
            @click="accountSettingsDialog = false"
            class="btn-cancel"
          >
            Cancel
          </v-btn>
          <v-btn
            depressed
            :color="isPasswordFormValid ? 'primary' : 'error'"
            @click="changePassword"
            :loading="passwordLoading"
            :class="isPasswordFormValid ? 'btn-submit' : 'btn-submit-error'"
          >
            <v-icon left size="18">{{ isPasswordFormValid ? 'mdi-check' : 'mdi-close' }}</v-icon>
            Change Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    drawer: false,
    accountSettingsDialog: false,
    passwordLoading: false,
    passwordError: '',
    passwordSuccess: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordForm: {
      newPassword: '',
      confirmPassword: ''
    }
  }),

  computed: {
    showAppBar() {
      return this.$store.getters.isAuthenticated;
    },
    userName() {
      return this.$store.state.user?.username || 'User';
    },
    userInitial() {
      const name = this.$store.state.user?.username || 'U';
      return name.charAt(0).toUpperCase();
    },
    userStation() {
      return this.$store.state.user?.station || '';
    },
    isAdmin() {
      return this.$store.state.user?.isAdmin || false;
    },
    isKanbanRoute() {
      return this.$route.name === 'KanbanVuetifyView' || this.$route.path === '/kanban';
    },
    isAdminRoute() {
      return this.$route.name === 'AdminView' || this.$route.path === '/admin';
    },
    isStationOneRoute() {
      return this.$route.name === 'station-one' || this.$route.path === '/station-one';
    },
    isUsersRoute() {
      return this.$route.name === 'users' || this.$route.path === '/users';
    },
    isKanbansRoute() {
      return this.$route.name === 'kanbans' || this.$route.path === '/kanbans';
    },
    isPasswordFormValid() {
      const { newPassword, confirmPassword } = this.passwordForm;
      return (
        newPassword.length >= 6 &&
        confirmPassword.length >= 6 &&
        newPassword === confirmPassword
      );
    }
  },

  methods: {
    goToKanban() {
      this.$router.push('/kanban');
      this.drawer = false;
    },
    goToStationOne() {
      this.$router.push('/station-one');
      this.drawer = false;
    },
    goToAdmin() {
      this.$router.push('/admin');
      this.drawer = false;
    },
    goToUsers() {
      this.$router.push('/users');
      this.drawer = false;
    },
    goToKanbans() {
      this.$router.push('/kanban');
      this.drawer = false;
    },
    openAccountSettings() {
      this.accountSettingsDialog = true;
      this.passwordError = '';
      this.passwordSuccess = false;
      this.passwordForm = {
        newPassword: '',
        confirmPassword: ''
      };
    },
    async changePassword() {
      this.passwordError = '';
      this.passwordSuccess = false;

      // Validation
      if (!this.passwordForm.newPassword) {
        this.passwordError = 'New password is required';
        return;
      }
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'New password must be at least 6 characters';
        return;
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'Passwords do not match';
        return;
      }

      try {
        this.passwordLoading = true;
        // TODO: Implement API call to change password
        // const response = await api.post('/auth/change-password', {
        //   newPassword: this.passwordForm.newPassword
        // });
        
        // For now, show success message
        this.passwordSuccess = true;
        
        setTimeout(() => {
          this.accountSettingsDialog = false;
          this.passwordForm = {
            newPassword: '',
            confirmPassword: ''
          };
        }, 2000);
      } catch (error) {
        this.passwordError = error.response?.data?.message || 'Failed to change password';
      } finally {
        this.passwordLoading = false;
      }
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.app-title {
  font-family: 'Space Grotesk', 'Segoe UI', Tahoma, sans-serif;
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.8px;
  white-space: nowrap;
  background: linear-gradient(135deg, #ffffff, #f0f4f8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  margin-right: 8px;
}

.nav-icon::v-deep {
  transition: all 0.3s ease;
}

.nav-icon::v-deep:hover {
  transform: scale(1.1);
}

.station-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.station-badge:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.nav-drawer {
  background: #ffffff !important;
  border-right: 1px solid #e8ecf1 !important;
  overflow: hidden;
}

.nav-header {
  padding: 24px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-bottom: 1px solid #e0e5eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.nav-header-icon {
  color: #1976d2;
}

.nav-header-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  color: #1f2937;
}

.nav-section {
  padding: 16px 0;
}

.nav-section-label {
  padding: 0 16px;
  margin: 8px 0;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 1.2px;
  color: #9ca3af;
  text-transform: uppercase;
}

.nav-list {
  padding: 4px 8px;
  background: transparent !important;
}

.nav-item {
  margin: 2px 8px;
  padding: 12px 12px;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent !important;
  min-height: 44px;
  position: relative;
  overflow: visible;
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(25, 118, 210, 0.06)) !important;
}

.nav-item-active::before {
  height: 100%;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, #1976d2, #1565c0);
  border-radius: 0 2px 2px 0;
  transition: height 0.25s ease;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.06), rgba(25, 118, 210, 0.03)) !important;
}

.nav-item:hover::before {
  height: 100%;
}

.nav-item-icon {
  color: #1976d2 !important;
  transition: all 0.25s ease !important;
}

.nav-item:hover .nav-item-icon {
  transform: translateX(2px);
}

.nav-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  color: #1f2937;
  letter-spacing: 0.2px;
  transition: color 0.25s ease;
}

.nav-item:hover .nav-title {
  color: #1976d2;
  font-weight: 600;
}

.nav-item-active .nav-title {
  color: #1976d2;
  font-weight: 700;
}

.nav-item-active .nav-item-icon {
  color: #1976d2 !important;
}

.nav-footer {
  padding-bottom: 16px;
}

.nav-divider {
  margin: 12px 16px !important;
}

.nav-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 8px;
}

.user-icon {
  color: #9ca3af;
}

.user-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.85rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-logout:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(239, 68, 68, 0.03)) !important;
}

.nav-logout:hover .nav-item-icon {
  color: #ef4444 !important;
}

.nav-logout:hover .nav-title {
  color: #ef4444;
}

.nav-user-card {
  display: none;
}

/* Account Menu Dropdown Styling */
.account-menu-list {
  padding: 0 !important;
  min-width: 260px;
}

.account-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-bottom: 1px solid #e0e5eb;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
  border: 2px solid white;
}

.user-initial {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  text-transform: uppercase;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.user-name-display {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1f2937;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(25, 118, 210, 0.08));
  border-radius: 12px;
  width: fit-content;
  margin-bottom: 2px;
}

.user-role-badge span {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.7rem;
  color: #1976d2;
  letter-spacing: 0.3px;
}

.user-role-badge ::v-deep .v-icon {
  color: #1976d2;
}

.user-station-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  width: fit-content;
}

.user-station-display ::v-deep .v-icon {
  color: #9ca3af;
}

.menu-divider {
  margin: 0 !important;
}

.menu-item-custom {
  padding: 12px 16px !important;
  transition: all 0.2s ease;
}

.menu-item-custom:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.06), rgba(25, 118, 210, 0.03)) !important;
}

.menu-item-custom ::v-deep .v-list-item__icon {
  margin-right: 12px !important;
  color: #1976d2 !important;
}

.menu-item-custom ::v-deep .v-list-item__title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  color: #1f2937;
}

.menu-item-logout:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(239, 68, 68, 0.03)) !important;
}

.menu-item-logout:hover ::v-deep .v-list-item__icon {
  color: #ef4444 !important;
}

.menu-item-logout:hover ::v-deep .v-list-item__title {
  color: #ef4444;
}

/* Account Settings Dialog Styling */
.settings-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

.settings-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 28px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-bottom: 1px solid #e0e5eb;
}

.settings-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.settings-header-icon ::v-deep i {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  color: #1f2937;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1.2;
}

.settings-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 4px 0 0 0;
  padding: 0;
}

.settings-content {
  padding: 28px 24px !important;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1f2937;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.custom-field ::v-deep .v-input__prepend-inner {
  margin-right: 8px !important;
  color: #9ca3af !important;
}

.custom-field ::v-deep .v-field--focused .v-input__prepend-inner {
  color: #1976d2 !important;
}

.custom-field ::v-deep .v-input__append-outer {
  margin-left: 0 !important;
  color: #9ca3af !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-field ::v-deep .v-input__append-outer:hover {
  color: #1976d2 !important;
}

.custom-field ::v-deep .v-input__append-outer .v-icon {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.custom-field ::v-deep .v-input__append-outer:hover .v-icon {
  opacity: 1;
}

.custom-field ::v-deep input {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
}

.custom-field ::v-deep input::placeholder {
  color: #d1d5db;
  font-weight: 400;
}

.custom-field ::v-deep .v-field {
  border-radius: 8px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.custom-field ::v-deep .v-field:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%) !important;
}

.custom-field ::v-deep .v-field--focused {
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%) !important;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
}

.field-helper {
  display: flex;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 6px 0 0 0;
  padding: 0;
}

.match-success {
  display: flex;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #10b981;
  margin: 6px 0 0 0;
  padding: 0;
  font-weight: 500;
}

.match-success ::v-deep i {
  margin-right: 4px;
}

.match-error {
  display: flex;
  align-items: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #ef4444;
  margin: 6px 0 0 0;
  padding: 0;
  font-weight: 500;
}

.match-error ::v-deep i {
  margin-right: 4px;
}

.alert-custom {
  border-radius: 8px !important;
  padding: 12px 16px !important;
}

.alert-custom ::v-deep.v-alert--type-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-left: 4px solid #ef4444 !important;
}

.alert-custom ::v-deep.v-alert--type-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%) !important;
  border-left: 4px solid #10b981 !important;
}

.alert-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.alert-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
}

.settings-actions {
  padding: 16px 24px !important;
  background: linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%);
  border-top: 1px solid #e0e5eb;
  gap: 8px;
}

.btn-cancel {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
}

.btn-cancel:hover {
  background: rgba(107, 114, 128, 0.08) !important;
}

.btn-submit {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 8px 20px !important;
}

.btn-submit:hover {
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
  transform: translateY(-2px);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit ::v-deep .v-btn__loader {
  color: white;
}

.btn-submit ::v-deep i {
  margin-right: 4px !important;
}

.btn-submit-error {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 8px 20px !important;
}

.btn-submit-error:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
  transform: translateY(-2px);
}

.btn-submit-error:active {
  transform: translateY(0);
}

.btn-submit-error ::v-deep .v-btn__loader {
  color: white;
}

.btn-submit-error ::v-deep i {
  margin-right: 4px !important;
}
</style>


