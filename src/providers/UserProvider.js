import React, {
  createContext, useEffect, useState
} from 'react';

import { auth, generateUserDocument } from '../firebase';

export const UserContext = createContext({
  user: null,
  test: '3'
});

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [test, setTest] = useState(null)
  useEffect(() => {
    auth.onAuthStateChanged((userAuth) => {
      setUser(userAuth);
      setTest(4);
    });
  }, []);
  return (
    <UserContext.Provider value={{user, test}}>
      {children}
    </UserContext.Provider>
  );
};
export default UserProvider;
