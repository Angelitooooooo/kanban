<template>
  <v-container fluid class="user-view">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="32">mdi-account-group</v-icon>
        </div>
        <div>
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage system users and their permissions</p>
        </div>
      </div>
      <v-btn color="primary" depressed class="add-user-btn" @click="openAddUserDialog">
        <v-icon left>mdi-account-plus</v-icon>
        Add New User
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="stats-row">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <div class="stat-icon-wrapper stat-icon-primary">
            <v-icon size="28">mdi-account-multiple</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{{ totalUsers }}</div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <div class="stat-icon-wrapper stat-icon-success">
            <v-icon size="28">mdi-shield-account</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Administrators</div>
            <div class="stat-value">{{ adminCount }}</div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <div class="stat-icon-wrapper stat-icon-info">
            <v-icon size="28">mdi-account</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Regular Users</div>
            <div class="stat-value">{{ regularUserCount }}</div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <div class="stat-icon-wrapper stat-icon-warning">
            <v-icon size="28">mdi-map-marker-multiple</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Stations</div>
            <div class="stat-value">{{ uniqueStations }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Filter Section -->
    <v-card class="filter-card" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search users..."
              placeholder="Search by username or station"
              outlined
              dense
              clearable
              hide-details
              class="search-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterRole"
              :items="roleFilterOptions"
              label="Filter by Role"
              outlined
              dense
              clearable
              hide-details
              prepend-inner-icon="mdi-filter"
              class="filter-select"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterStation"
              :items="stationFilterOptions"
              label="Filter by Station"
              outlined
              dense
              clearable
              hide-details
              prepend-inner-icon="mdi-map-marker"
              class="filter-select"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Data Table -->
    <v-card class="users-table-card" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :search="search"
        :loading="loading"
        class="users-table"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100]
        }"
      >
        <!-- User Column with Avatar -->
        <template v-slot:[`item.username`]="{ item }">
          <div class="user-cell">
            <div class="user-avatar-small">
              <span class="user-initial-small">{{ getUserInitial(item.username) }}</span>
            </div>
            <span class="user-name-text">{{ item.username }}</span>
          </div>
        </template>

        <!-- Role Column with Badge -->
        <template v-slot:[`item.isAdmin`]="{ item }">
          <v-chip
            small
            :color="item.isAdmin ? 'primary' : 'grey'"
            :text-color="item.isAdmin ? 'white' : 'white'"
            class="role-chip"
          >
            <v-icon left small>{{ item.isAdmin ? 'mdi-shield-star' : 'mdi-account' }}</v-icon>
            {{ item.isAdmin ? 'Administrator' : 'User' }}
          </v-chip>
        </template>

        <!-- Station Column -->
        <template v-slot:[`item.station`]="{ item }">
          <div class="station-cell" v-if="item.station">
            <v-icon small color="#1976d2">mdi-map-marker</v-icon>
            <span>Station {{ item.station }}</span>
          </div>
          <span v-else class="no-data">—</span>
        </template>

        <!-- Data Set Column -->
        <template v-slot:[`item.data_set`]="{ item }">
          <v-chip small outlined color="primary" class="dataset-chip">
            {{ item.data_set || '40' }}
          </v-chip>
        </template>

        <!-- Created At Column -->
        <template v-slot:[`item.created_at`]="{ item }">
          <span class="date-text">{{ formatDate(item.created_at) }}</span>
        </template>

        <!-- Actions Column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="action-buttons">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                  @click="editUser(item)"
                >
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit User</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                  @click="confirmDeleteUser(item)"
                  :disabled="item.id === currentUserId"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>{{ item.id === currentUserId ? 'Cannot delete yourself' : 'Delete User' }}</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Loading State -->
        <template v-slot:loading>
          <div class="loading-container">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="loading-text">Loading users...</p>
          </div>
        </template>

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="no-data-container">
            <v-icon size="64" color="grey">mdi-account-off</v-icon>
            <p class="no-data-text">No users found</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="userDialog" max-width="500" persistent>
      <v-card class="user-dialog-card">
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon size="28">{{ editMode ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          </div>
          <div>
            <v-card-title class="dialog-title">{{ editMode ? 'Edit User' : 'Add New User' }}</v-card-title>
            <p class="dialog-subtitle">{{ editMode ? 'Update user information' : 'Create a new user account' }}</p>
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-text class="dialog-content">
          <v-form ref="userForm">
            <v-text-field
              v-model="userForm.username"
              label="Username"
              prepend-inner-icon="mdi-account"
              outlined
              dense
              required
              :rules="[v => !!v || 'Username is required']"
              class="form-field"
            ></v-text-field>

            <v-text-field
              v-model="userForm.password"
              label="Password"
              type="password"
              prepend-inner-icon="mdi-lock"
              outlined
              dense
              :required="!editMode"
              :rules="editMode ? [] : [v => !!v || 'Password is required']"
              :hint="editMode ? 'Leave blank to keep current password' : ''"
              persistent-hint
              class="form-field"
            ></v-text-field>

            <v-text-field
              v-model="userForm.station"
              label="Station"
              prepend-inner-icon="mdi-map-marker"
              outlined
              dense
              class="form-field"
            ></v-text-field>

            <v-checkbox
              v-model="userForm.isAdmin"
              label="Administrator privileges"
              color="primary"
              hide-details
              class="admin-checkbox"
            >
              <template v-slot:label>
                <div class="checkbox-label">
                  <v-icon left small>mdi-shield-star</v-icon>
                  <span>Administrator privileges</span>
                </div>
              </template>
            </v-checkbox>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeUserDialog" class="cancel-btn">
            Cancel
          </v-btn>
          <v-btn
            depressed
            color="primary"
            @click="saveUser"
            :loading="saving"
            class="save-btn"
          >
            <v-icon left small>mdi-content-save</v-icon>
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <v-icon size="48" color="error">mdi-alert-circle</v-icon>
        </div>
        <v-card-title class="delete-dialog-title">Confirm Delete</v-card-title>
        <v-card-text class="delete-dialog-text">
          Are you sure you want to delete user <strong>{{ userToDelete?.username }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions class="delete-dialog-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn depressed color="error" @click="deleteUser" :loading="deleting">
            <v-icon left small>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" top>
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'UserView',

  data: () => ({
    users: [],
    loading: false,
    search: '',
    filterRole: null,
    filterStation: null,
    userDialog: false,
    deleteDialog: false,
    editMode: false,
    saving: false,
    deleting: false,
    userToDelete: null,
    userForm: {
      id: null,
      username: '',
      password: '',
      isAdmin: false,
      station: '',
      data_set: '40'
    },
    headers: [
      { text: 'User', value: 'username', align: 'start' },
      { text: 'Role', value: 'isAdmin', align: 'center' },
      { text: 'Station', value: 'station', align: 'center' },
      { text: 'Created At', value: 'created_at', align: 'center' },
      { text: 'Actions', value: 'actions', align: 'center', sortable: false }
    ],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'success'
  }),

  computed: {
    currentUserId() {
      return this.$store.state.user?.id;
    },
    totalUsers() {
      return this.users.length;
    },
    adminCount() {
      return this.users.filter(u => u.isAdmin).length;
    },
    regularUserCount() {
      return this.users.filter(u => !u.isAdmin).length;
    },
    uniqueStations() {
      const stations = this.users.filter(u => u.station).map(u => u.station);
      return new Set(stations).size;
    },
    filteredUsers() {
      let filtered = this.users;

      if (this.filterRole !== null) {
        const isAdmin = this.filterRole === 'admin';
        filtered = filtered.filter(u => !!u.isAdmin === isAdmin);
      }

      if (this.filterStation) {
        filtered = filtered.filter(u => u.station === this.filterStation);
      }

      return filtered;
    },
    roleFilterOptions() {
      return [
        { text: 'All Roles', value: null },
        { text: 'Administrator', value: 'admin' },
        { text: 'Regular User', value: 'user' }
      ];
    },
    stationFilterOptions() {
      const stations = [...new Set(this.users.filter(u => u.station).map(u => u.station))];
      return [
        { text: 'All Stations', value: null },
        ...stations.map(s => ({ text: `Station ${s}`, value: s }))
      ];
    }
  },

  mounted() {
    this.loadUsers();
  },

  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        // TODO: Create backend endpoint GET /users
        const response = await api.get('/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error loading users:', error);
        this.showSnackbar('Failed to load users', 'error');
        // For demo purposes, use mock data if endpoint doesn't exist
        this.users = [];
      } finally {
        this.loading = false;
      }
    },

    openAddUserDialog() {
      this.editMode = false;
      this.userForm = {
        id: null,
        username: '',
        password: '',
        isAdmin: false,
        station: '',
        data_set: '40'
      };
      this.userDialog = true;
    },

    editUser(user) {
      this.editMode = true;
      this.userForm = {
        id: user.id,
        username: user.username,
        password: '',
        isAdmin: user.isAdmin,
        station: user.station || '',
        data_set: user.data_set || '40'
      };
      this.userDialog = true;
    },

    closeUserDialog() {
      this.userDialog = false;
      this.$refs.userForm?.reset();
    },

    async saveUser() {
      if (!this.$refs.userForm.validate()) {
        return;
      }

      this.saving = true;
      try {
        if (this.editMode) {
          // TODO: Create backend endpoint PUT /users/:id
          await api.put(`/users/${this.userForm.id}`, this.userForm);
          this.showSnackbar('User updated successfully', 'success');
        } else {
          // TODO: Create backend endpoint POST /users
          await api.post('/users', this.userForm);
          this.showSnackbar('User created successfully', 'success');
        }
        this.closeUserDialog();
        this.loadUsers();
      } catch (error) {
        console.error('Error saving user:', error);
        this.showSnackbar(error.response?.data?.message || 'Failed to save user', 'error');
      } finally {
        this.saving = false;
      }
    },

    confirmDeleteUser(user) {
      this.userToDelete = user;
      this.deleteDialog = true;
    },

    async deleteUser() {
      this.deleting = true;
      try {
        // TODO: Create backend endpoint DELETE /users/:id
        await api.delete(`/users/${this.userToDelete.id}`);
        this.showSnackbar('User deleted successfully', 'success');
        this.deleteDialog = false;
        this.loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
      } finally {
        this.deleting = false;
      }
    },

    getUserInitial(username) {
      return username ? username.charAt(0).toUpperCase() : 'U';
    },

    formatDate(dateString) {
      if (!dateString) return '—';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    showSnackbar(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
.user-view {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0;
  letter-spacing: 0.5px;
}

.page-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.add-user-btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
}

/* Stats Cards */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.stat-icon-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

/* Filter Card */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px !important;
}

.search-field,
.filter-select {
  font-family: 'DM Sans', sans-serif;
}

/* Users Table Card */
.users-table-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.users-table {
  font-family: 'DM Sans', sans-serif;
}

.users-table ::v-deep th {
  font-family: 'Space Grotesk', sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  color: #1f2937 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table ::v-deep td {
  padding: 16px !important;
}

/* User Cell with Avatar */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-initial-small {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
}

.user-name-text {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
}

/* Role Chip */
.role-chip {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}

/* Station Cell */
.station-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: #1f2937;
}

.no-data {
  color: #9ca3af;
  font-style: italic;
}

/* Dataset Chip */
.dataset-chip {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}

/* Date Text */
.date-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
}

.loading-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* No Data State */
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 12px;
}

.no-data-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
}

/* User Dialog */
.user-dialog-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.dialog-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
}

.dialog-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #1f2937;
  padding: 0 !important;
  letter-spacing: 0.3px;
}

.dialog-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.dialog-content {
  padding: 24px !important;
}

.form-field {
  margin-bottom: 16px;
  font-family: 'DM Sans', sans-serif;
}

.admin-checkbox {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
}

.dialog-actions {
  padding: 16px 24px !important;
  background: linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%);
}

.cancel-btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
}

.save-btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
}

/* Delete Dialog */
.delete-dialog-card {
  border-radius: 12px !important;
  text-align: center;
}

.delete-dialog-header {
  padding: 32px 24px 16px 24px;
}

.delete-dialog-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #1f2937;
  justify-content: center;
  padding: 8px 24px !important;
}

.delete-dialog-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #6b7280;
  padding: 16px 24px !important;
}

.delete-dialog-actions {
  padding: 16px 24px 24px 24px !important;
}
</style>
