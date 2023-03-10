import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

function Header() {
  return (
    <div className="Header flex">
      <img src={logo} alt="" className="logo" />
      <div className="links">
        <Link className="link" to="/">Home</Link>
        <Link className="link" to="/collections">Collections</Link>
        <Link className="link" to="/">About Us</Link>
      </div>
    </div>
  );
}

export default Header;
