import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SoulChat } from './pages/SoulChat';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SoulChat />} />
      </Routes>
    </BrowserRouter>
  );
}
