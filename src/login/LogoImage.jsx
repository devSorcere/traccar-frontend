import React from "react";
import { makeStyles } from "@mui/styles";
import Logo from "../resources/images/logo.png";

const useStyles = makeStyles(() => ({
  image: {
    alignSelf: "center",
    maxWidth: "300px",
    maxHeight: "300px",
    width: "auto",
    height: "auto",
    paddingBottom: 0 /* alterado aqui */,
  },
}));
{/* <img src={`/api/media/user/${user?.id}/${user?.attributes?.userImage}`} alt="" className="position-fixed" style={{ width: "300px", height: "300px", position: "fixed", top: "12px", left: "440px" }} /> */ }
const LogoImage = ({ LogoNovo = Logo }) => {
  const classes = useStyles();
  return <img className={classes.image} src={LogoNovo} alt="" />;
};

export default LogoImage;
