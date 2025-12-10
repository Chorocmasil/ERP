import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState('Project Manager');
  
  // Hardcoded managers list matching the mock data
  const managers = ['Project Manager', '최성욱', '신승연', '유효열', '하승민'];

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, managers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
