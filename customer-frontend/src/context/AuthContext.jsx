import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('grocery_selected_role') || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('grocery_user');

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });


  // =============================
  // SELECT ROLE
  useEffect(() => {
    const validateToken = async () => {
      const savedUser = localStorage.getItem('grocery_user');

      if (!savedUser) {
        return;
      }

      try {
        const userData = JSON.parse(savedUser);

        if (!userData.token) {
          return;
        }

        const response = await fetch(
          'http://localhost:5000/api/auth/me',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userData.token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          localStorage.removeItem('grocery_user');
          localStorage.removeItem('grocery_selected_role');

          setUser(null);
          setSelectedRole(null);

          return;
        }

        const updatedUser = {
          ...userData,
          ...data.user,
          token: userData.token
        };

        setUser(updatedUser);

        localStorage.setItem(
          'grocery_user',
          JSON.stringify(updatedUser)
        );

      } catch (error) {
        console.error('Token validation failed:', error);

        localStorage.removeItem('grocery_user');
        localStorage.removeItem('grocery_selected_role');

        setUser(null);
        setSelectedRole(null);
      }
    };

    validateToken();
  }, []);

  // =============================
  const selectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('grocery_selected_role', role);
  };


  // =============================
  // CLEAR ROLE
  // =============================
  const clearRole = () => {
    setSelectedRole(null);
    localStorage.removeItem('grocery_selected_role');
  };


  // =============================
  // LOGIN
  // =============================
  const login = (userData, token = null) => {

    const userObj = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'customer',
      token: token || userData.token
    };

    setUser(userObj);
    setSelectedRole(userObj.role);

    localStorage.setItem(
      'grocery_user',
      JSON.stringify(userObj)
    );

    localStorage.setItem(
      'grocery_selected_role',
      userObj.role
    );
  };


  // =============================
  // LOGOUT
  // =============================
  const logout = () => {
    setUser(null);
    setSelectedRole(null);

    localStorage.removeItem('grocery_user');
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        selectedRole,
        isAuthenticated: !!user,
        selectRole,
        clearRole,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);