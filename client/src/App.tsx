import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./routes/home/Home";
import Document from "./routes/document/Document";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={< Home />} />
        <Route path="documents" >
          <Route path=":id" element={< Document />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
