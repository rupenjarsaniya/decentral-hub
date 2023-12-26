import s from "./index.module.scss";
import { Sidebar } from "../../App/Sidebar";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function MainLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={s.root}>
        <div className={s.sidebar}>
          <Sidebar />
        </div>
        <div className={s.underline} />
        <div className={s.children}>{children}</div>
      </div>
    </QueryClientProvider>
  );
}
