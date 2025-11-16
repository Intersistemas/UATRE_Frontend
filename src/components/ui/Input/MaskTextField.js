import React from "react";
import { TextField } from "@mui/material";
import { IMaskMixin } from "react-imask";

export const MaskTextField = IMaskMixin(({ inputRef, ...props }) => (<TextField inputRef={inputRef} { ...props } />));
