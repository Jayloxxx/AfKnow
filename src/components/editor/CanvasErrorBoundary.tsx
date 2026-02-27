import { Component, type ReactNode, type ErrorInfo } from 'react';

interface State { error: Error | null }

export default class CanvasErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('🔴 EditorCanvas CRASH:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component:', info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0000', color: '#ff4444', fontFamily: 'monospace', fontSize: 14, padding: 40, textAlign: 'left', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>EditorCanvas CRASH</div>
          <div style={{ fontSize: 14, color: '#ff8888', maxWidth: 700, wordBreak: 'break-all' }}>{this.state.error.message}</div>
          <pre style={{ fontSize: 10, color: '#ff6666', maxWidth: 700, wordBreak: 'break-all', whiteSpace: 'pre-wrap', background: '#2a0000', padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>{this.state.error.stack}</pre>
          <button onClick={() => this.setState({ error: null })} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
