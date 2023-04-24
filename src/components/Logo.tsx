import logo from "../assets/logo.png";

type LogoProps = {
  width?: number | string;
};

export const Logo = ({ width }: LogoProps) => {
  return <img src={logo} alt="logo" width={width ?? "100px"} />;
};
