import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { IconButton, InputAdornment, Popper, Stack, TextField, Typography} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';


export default function SearchBar() {

  return (
    <Stack width={500}>


      <TextField
        placeholder="Search text text text"
        variant="standard"
        sx={{
          width: "inherit"
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
              >
                <CloseIcon />
              </IconButton>

              <IconButton
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Stack> 
  );
}