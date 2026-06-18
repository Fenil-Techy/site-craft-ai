import { createContext } from "react";

type OnSaveContextType = {
  onSave: number | null;
  setOnSave: React.Dispatch<React.SetStateAction<number | null>>;
};

export const OnSaveContext = createContext<OnSaveContextType | null>(null);