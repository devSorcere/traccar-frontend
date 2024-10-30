import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    pointerEvents: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    cursor: "pointer",
    width: 40,
    height: 40,
    right: 6,
    bottom: "8%",
    borderRadius: "50%",
    color: "white",
    backgroundColor: "green",
    "&:hover": {
      opacity: 0.8,
    },
    [theme.breakpoints.up("md")]: {
      right: 6,
      bottom: "8%",
    },
    [theme.breakpoints.down("sm")]: {
      right: "9%",
      bottom: "23%",
    },
  },
}));

const WhatsAppButtom = () => {
  const classes = useStyles();
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const getServerInfo = async () => {
    const response = await fetch("/api/server");
    if (response.ok) {
      const whats = await response.json();
      setNumber(whats?.attributes?.whatsAppNumberButtom);
      setMessage(whats?.attributes?.whatsAppMessageButtom);
    }
  };
  useEffect(() => {
    getServerInfo();
  }, []);
  return (
    <div className={classes.root}>
      <IconButton
        className={classes.root}
        component="a"
        target="_blank"
        href={`https://wa.me/${number}?text=${message}`}
        disabled={!number || !message}
      >
        <WhatsAppIcon fontSize="medium" />
      </IconButton>
    </div>
  );
};

export default WhatsAppButtom;
