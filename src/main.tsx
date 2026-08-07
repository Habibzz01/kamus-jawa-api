import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Shell } from "./components/Layout";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Test from "./pages/Test";
import Explore from "./pages/Explore";
import Terjemah from "./pages/Terjemah";
import Tingkatan from "./pages/Tingkatan";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "docs", element: <Docs /> },
      { path: "test", element: <Test /> },
      { path: "explore", element: <Explore /> },
      { path: "terjemah", element: <Terjemah /> },
      { path: "tingkatan", element: <Tingkatan /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
