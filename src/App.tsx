import { ThreeColumnLayout } from './components/layout/ThreeColumnLayout';
import { AppProvider } from './context/AppContext';

export default function App(): JSX.Element {
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  return (
    <AppProvider>
      <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#111827", color:"#f9fafb", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflow:"hidden" }}>
        <header style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:48, borderBottom:"1px solid #1f2937", background:"#0f172a" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:24, height:24, background:"#4f46e5", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>S</div>
            <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>Sunflow</span>
          </div>
          <span style={{ fontSize:13, color:"#6b7280" }}>{today}</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#22c55e" }} />
            <span style={{ fontSize:11, color:"#4b5563" }}>Local mode — API not connected</span>
          </div>
        </header>
        <ThreeColumnLayout />
      </div>
    </AppProvider>
  );};