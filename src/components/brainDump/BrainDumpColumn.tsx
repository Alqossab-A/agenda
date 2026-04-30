import { FC } from 'react';
import { useApp } from '../../context/AppContext';
import { BrainDumpInput } from './BrainDumpInput';
import { BrainDumpItemCard } from './BrainDumpItem';

export const BrainDumpColumn: FC = () => {
    const { brainDump } = useApp();
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <BrainDumpInput />
        <div style={{ flex:1, overflowY:"auto" }}>
          {brainDump.length === 0 && (
            <p style={{ color:"#6b7280", fontSize:13, textAlign:"center", marginTop:32 }}>
              No items yet. Capture a thought!
            </p>
          )}
          {brainDump.map(item => <BrainDumpItemCard key={item.id} item={item} />)}
        </div>
      </div>
    );
  };