import { WidgetContainer } from "@/components/WidgetContainer";
import "@/index.css";

export default function App() {
  return (
    <div className="w-[350px] h-[500px] shadow-2xl rounded-2xl overflow-hidden bg-white border">
      <WidgetContainer />
    </div>
  );
}
