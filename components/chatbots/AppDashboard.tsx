import { ReactNode } from "react";



export default function AppDashboard({ children }: { children: ReactNode }) {
  return (
   
          <div className="mx-auto xl:mx-auto mt-5 md:mx-7 py-3 px-3 md:px-1 max-w-[1240px]">
            {children}
          </div>
  );
}
