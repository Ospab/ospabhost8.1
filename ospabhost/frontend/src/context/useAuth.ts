import { useContext } from 'react';
import AuthContext from './authcontext';

const useAuth = () => useContext(AuthContext);

export default useAuth;
