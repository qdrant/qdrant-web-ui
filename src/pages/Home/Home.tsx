import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components";
import Toolbar from "@mui/material/Toolbar";
import { Box } from "@mui/material";
import * as S from "./Home.styles";

export function Home() {
  const [open, setOpen] = useState(true);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <S.AppBar position="fixed" open={open}>
        <Toolbar></Toolbar>
      </S.AppBar>
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <S.Main
        open={open}
        style={{
          overflow: "hidden",
        }}
      >
        <S.DrawerHeader />
        <Outlet />
      </S.Main>
    </Box>
  );
}
