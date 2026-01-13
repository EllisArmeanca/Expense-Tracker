// api/auth.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class AuthService {
  async register(userData) {
    const response = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Register($name: String!, $email: String!, $password: String!) {
            register(name: $name, email: $email, password: $password) {
              token
              user {
                id
                name
                email
                isAdmin
              }
            }
          }
        `,
        variables: userData
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const { token, user } = result.data.register;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    return { token, user };
  }

  async login(credentials) {
    const response = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
              user {
                id
                name
                email
                isAdmin
              }
            }
          }
        `,
        variables: credentials
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const { token, user } = result.data.login;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    return { token, user };
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // In a real app, you would decode the JWT to get user info, but for now,
    // we'll skip this or make a request to get the user data
    return null; // Placeholder - would need to make a GraphQL call to get user data
  }
}

export default new AuthService();