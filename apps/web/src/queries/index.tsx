// Imports
// ========================================================

// Config
// ========================================================
const API_URL = import.meta.env.VITE_API_URL;

// Exports
// ========================================================
export const USERS = {
  /**
   * List
   */
  list: async () => {
    return fetch(`${API_URL}/users`).then((res) => res.json());
  },
  /**
   * Create
   * @param data 
   * @returns 
   */
  create: async (data: { [key: string]: any }) => {
    console.log({ data });
    return fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Read
   */
  read: async (userId: string) => {
    return fetch(`${API_URL}/users/${userId}`).then((res) => res.json());
  },
  /**
   * Update
   * @param data 
   * @returns 
   */
  update: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/users/${data?.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Delete
   */
  delete: async (userId: string) => {
    if (!userId) return;
    return fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};

export const TODOS = {
  /**
   * List
   */
  list: async () => {
    return fetch(`${API_URL}/todos`).then((res) => res.json());
  },
  /**
   * Create
   * @param data 
   * @returns 
   */
  create: async (data: { [key: string]: any }) => {
    console.log({ data });
    return fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Read
   */
  read: async (todoId: string) => {
    if (!todoId) return;
    return fetch(`${API_URL}/todos/${todoId}`).then((res) => res.json());
  },
  /**
   * Update
   * @param data 
   * @returns 
   */
  update: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/todos/${data?.todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Delete
   */
  delete: async (todoId: string) => {
    if (!todoId) return;
    return fetch(`${API_URL}/todos/${todoId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};

export const USER_TODOS = {
  /**
   * List
   */
  list: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/users/${data.userId}/todos`).then((res) => res.json());
  },
  /**
   * Create
   * @param data 
   * @returns 
   */
  create: async (data: { [key: string]: any }) => {
    console.log({ data });
    return fetch(`${API_URL}/users/${data?.userId}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Read
   */
  read: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/users/${data?.userId}/todos/${data?.todoId}`).then((res) => res.json());
  },
  /**
   * Update
   * @param data 
   * @returns 
   */
  update: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/users/${data?.userId}/todos/${data?.todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  /**
   * Delete
   */
  delete: async (data: { [key: string]: any }) => {
    return fetch(`${API_URL}/users/${data?.userId}/todos/${data?.todoId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};