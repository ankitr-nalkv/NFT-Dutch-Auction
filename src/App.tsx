import { useState } from "react";
import "./App.scss";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Portfolio from "./portfolio/portfolio";
import Home from "./Home/Home";
import Layout from "./Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/portfolio" element={<Portfolio />} />
          <Route index element={<Home />} />
          {/* <Route path="*" element={<NoPage />} /> */}
          {/* </Route> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
