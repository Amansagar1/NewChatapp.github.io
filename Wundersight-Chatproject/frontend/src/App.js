import React from 'react'
import { Routes, Route, BrowserRouter} from "react-router-dom";
import Register from './Register';
import Chat from './Chat';


function App() {
  return (
    <div className="App">
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Register/>} />
      <Route path='/chat' element={<Chat/>} />
    </Routes>
    
    </BrowserRouter>
        </div>
  )
}

export default App


