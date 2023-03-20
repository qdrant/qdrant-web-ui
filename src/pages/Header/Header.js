import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../../logo.svg";

function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <img src={logo} alt="" style={{ width: "8rem" }} />
        <div className="buttons">
          <Link
            to="/collections"
            style={{ color: "white", textDecoration: "none" }}
          >
            <Button variant="contained" color="secondary">
              Collections
            </Button>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}
export default Header;
