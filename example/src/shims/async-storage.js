const memoryStore = {};

const AsyncStorage = {
  getItem: async (key) => {
    return Object.prototype.hasOwnProperty.call(memoryStore, key)
      ? memoryStore[key]
      : null;
  },
  setItem: async (key, value) => {
    memoryStore[key] = String(value);
  },
  removeItem: async (key) => {
    delete memoryStore[key];
  },
  clear: async () => {
    Object.keys(memoryStore).forEach(k => {
      delete memoryStore[k];
    });
  },
};

export default AsyncStorage;
