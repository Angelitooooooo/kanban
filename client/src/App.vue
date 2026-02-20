<template>
  <v-app>
    <!-- <v-app-bar v-if="showAppBar" app color="primary" dark>
      <div class="app-title">Kanban System</div>
    </v-app-bar> -->
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  computed: {
    showAppBar() {
      return this.$store.getters.isAuthenticated;
    }
  },

  data: () => ({
    //
  }),
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

.app-title {
  font-family: 'Poppins', 'Segoe UI', Tahoma, sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
  max-width: 100%;
}
</style>


