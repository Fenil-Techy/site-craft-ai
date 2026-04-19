import { createContext } from "react";

type UserDetailContextType = {
    userDetail: AppUser | null; // replace with real type later
    setUserDetail: React.Dispatch<React.SetStateAction<AppUser | null>>;
  }
  
  const UserDetailContext = createContext<UserDetailContextType | null>(null)
export default UserDetailContext