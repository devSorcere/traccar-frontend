import { Paper, Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import Draggable from "react-draggable";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  /* GRID CRIADO PARA EXIBIR QTD E STATUS DE DISPOSITVOS  */
  deviceInfoHeader: {
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 6,
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      bottom: 69,
      left: 12,
      justifyContent: "center",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "row",
      position: "absolute",
      bottom: 58,
      left: 0,
      justifyContent: "center",
    },
  },
  deviceInfo: {
    pointerEvents: "auto",
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      bottom: 61,
      left: 12,
      justifyContent: "center",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "row",
      position: "absolute",
      bottom: 0,
      left: 12,
      justifyContent: "center",
    },
  },
  contentCardInfo: {
    display: "flex",
    flexDirection: "row",
  },
  cardInfo: {
    minWidth: 100 /* AUMENTA O TAMANHO DO CONTATDO DE VEÍCULOS DESKTOP */,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 1,
    flexDirection: "column",
    cursor: "pointer",
    borderRadius: 0,
    [theme.breakpoints.down("sm")]: {
      minWidth: 100,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      mb: 1,
      flexDirection: "column",
      cursor: "pointer",
      borderRadius: 0,
    },
  },
  iconButtomOnline: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 1,
    color: "green",
  },
  iconButtomOffline: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 1,
    color: "red",
  },
  iconButtomUnknow: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 1,
    color: "GrayText",
  },
  iconButtomAll: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 1,
    color: "orange",
  },

  tipografyOnline: {
    "&.MuiTypography-root": {
      color: "green",
      fontSize: 10,
    },
  },
  tipografyOffline: {
    "&.MuiTypography-root": {
      color: "red",
      fontSize: 10,
    },
  },
  tipografyUnknow: {
    "&.MuiTypography-root": {
      color: "GrayText",
      fontSize: 10,
    },
  },
  tipografyAll: {
    "&.MuiTypography-root": {
      color: "orange",
      fontSize: 10,
    },
  },
}));

const DevicesInfoDragable = () => {
  const classes = useStyles();
  const devices = useSelector((state) => state.devices.items);
  const deviceStatusCount = (status) =>
    Object.values(devices).filter((d) => d.status === status).length;

  return (
    <div className={classes.root}>
      <Draggable
        axis="both"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        grid={[50, 50]}
        scale={1}
        bounds="parent"
      >
        <div className={classes.deviceInfoHeader}>
          <div className={classes.contentCardInfo}>
            <Tooltip title="Conectado" placement="top">
              <Paper className={classes.cardInfo}>
                {deviceStatusCount("online")}
                <Typography classes={{ root: classes.tipografyOnline }}>
                  {" "}
                  Conectado
                </Typography>
              </Paper>
            </Tooltip>
            <Tooltip title="Desconectado" placement="top">
              <Paper className={classes.cardInfo}>
                {deviceStatusCount("offline")}
                <Typography classes={{ root: classes.tipografyOffline }}>
                  {" "}
                  Desconectado
                </Typography>
              </Paper>
            </Tooltip>
            <Tooltip title="Desconhecido" placement="top">
              <Paper className={classes.cardInfo}>
                {deviceStatusCount("unknown")}
                <Typography classes={{ root: classes.tipografyUnknow }}>
                  {" "}
                  Desconhecido
                </Typography>
              </Paper>
            </Tooltip>
            <Tooltip title="Todos" placement="top">
              <Paper className={classes.cardInfo}>
                {deviceStatusCount("online") +
                  deviceStatusCount("offline") +
                  deviceStatusCount("unknown")}
                <Typography classes={{ root: classes.tipografyAll }}>
                  {" "}
                  Todos
                </Typography>
              </Paper>
            </Tooltip>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default DevicesInfoDragable;
