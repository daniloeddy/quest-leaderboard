'use client';
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html><body>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#1a2332',color:'white'}}>
        <div style={{textAlign:'center'}}>
          <h2>Something went wrong!</h2>
          <button onClick={reset} style={{padding:'8px 16px',background:'#0081FB',borderRadius:'8px',color:'white',border:'none',cursor:'pointer',marginTop:'16px'}}>Try again</button>
        </div>
      </div>
    </body></html>
  );
}
