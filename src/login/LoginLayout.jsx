import { Paper, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import backgroundImage from "../resources/images/bg.jpeg";
import LogoImage from "./LogoImage";
import WhatsAppButtomLogin from "../common/components/WhatsAppButtomLogin";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
  },

  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    boxShadow: "-2px 0px 16px rgba(0, 0, 0, 0.25)",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    background: theme.palette.primary.secondary,
    [theme.breakpoints.up("lg")]: {
      padding: theme.spacing(0, 0, 0, 0),
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: theme.spacing(52),
    padding: theme.spacing(4),
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 1)",
    opacity: 0.9,
    [theme.breakpoints.up("lg")]: {
      borderTopLeftRadius: "15px",
      borderBottomRightRadius: "15px",
    },
    [theme.breakpoints.down("lg")]: {
      borderTopLeftRadius: "15px",
      borderBottomRightRadius: "15px",
      marginTop: "3%",
    },
    [theme.breakpoints.down("sm")]: {
      borderTopLeftRadius: "15px",
      borderBottomRightRadius: "15px",
      marginTop: "3%",
      maxWidth: "85%",
    },
  },
}));

const LoginLayout = ({ logo, children }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {/* REMOVIDO LOGO DA SIDEBAR E ADICIONADO NO PAPER */}
        {!useMediaQuery(theme.breakpoints.down("lg"))}
      </div>
      <Paper className={classes.paper}>
        {/* REMOVIDO LOGO DO PAPER E ADICIONADO AO FORM */}
        {!useMediaQuery(theme.breakpoints.down("lg"))}
        <form className={classes.form}>
          {/* alterado aqui, inserido logo */}
          <LogoImage color={theme.palette.primary.main} LogoNovo={logo} />
          {children}
        </form>
        <WhatsAppButtomLogin />
      </Paper>
    </main>
  );
};

export default LoginLayout;
