import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    currentBatchKey: 'KBN1',
    batchCounter: 1
  },
  getters: {
    isAuthenticated: state => !!(state.user && state.user.username),
    isAdmin: state => !!(state.user && state.user.isAdmin),
    getUser: state => state.user,
    getCurrentBatchKey: state => state.currentBatchKey,
    getBatchCount: state => state.batchCounter
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    logout(state) {
      state.user = null
    },
    createNewBatch(state) {
      state.batchCounter++
      state.currentBatchKey = `KBN${state.batchCounter}`
    },
    setCurrentBatch(state, batchKey) {
      state.currentBatchKey = batchKey
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('logout')
    },
    createNewBatch({ commit }) {
      commit('createNewBatch')
    },
    setCurrentBatch({ commit }, batchKey) {
      commit('setCurrentBatch', batchKey)
    }
  },
  plugins: [createPersistedState({
    key: 'kanban-user',
    paths: ['user']
  })]
})
