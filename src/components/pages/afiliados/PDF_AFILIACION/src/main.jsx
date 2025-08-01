// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import SolicitudAfiliacion from './SolicitudAfiliacion'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <SolicitudAfiliacion />
//   </StrictMode>,
// )

import React from "react";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App";
import "./index.css"; // o el CSS global que uses


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
