import { useEffect } from "react";

export const useBottomSheet = (open: boolean) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { 
      document.body.style.overflow = ""; 
    };
  }, [open]);
};
