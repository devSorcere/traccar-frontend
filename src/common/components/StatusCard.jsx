import AnchorIcon from "@mui/icons-material/Anchor";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ListIcon from "@mui/icons-material/List";
import RouteIcon from "@mui/icons-material/Route";
import StreetviewIcon from "@mui/icons-material/Streetview";
import ShareIcon from "@mui/icons-material/Share";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCatch, useCatchCallback, useEffectAsync } from "../../reactHelper";
import { devicesActions } from "../../store";
import usePositionAttributes from "../attributes/usePositionAttributes";
import { useDeviceReadonly } from "../util/permissions";
import { useAttributePreference } from "../util/preferences";
import AnchorGeofenceDialog from "./AnchorGeofenceDialog";
import { useTranslation } from "./LocalizationProvider";
import PositionValue from "./PositionValue";
import RemoveAnchorGeofenceDialog from "./RemoveAnchorGeofenceDialog";
import RemoveDialog from "./RemoveDialog";
import StopResumeDialog from "./StopResumeDialog";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: "10px 0px",
    display: "flex",
    pointerEvents: "auto",
    height: "250px"
    // width: theme?.dimensions.popupMaxWidth,
    // [theme.breakpoints.down("md")]: {
    //   width: theme.dimensions.popupMaxWidthMobile, //ajusta popup para mobile
    // },
  },
  media: {
    // height: theme?.dimensions.popupImageHeight,
    width: "40%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  mediaButton: {
    color: theme?.palette?.colors?.white,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme?.spacing(1, 1, 0, 2),
  },
  content: {
    // width: "100%",
    paddingTop: theme?.spacing(1),
    paddingBottom: theme?.spacing(1),
  },
  negative: {
    color: theme.palette.error.main,
  },
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  table: {
    "& .MuiTableCell-sizeSmall": {
      paddingLeft: 0,
      paddingRight: 5,
    },
  },
  cell: {
    borderBottom: "none",
  },
  actions: {
    justifyContent: "space-between",
    flexDirection: "column"
  },
  infoHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  infoHeaderRight: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    opacity: "0"
  },
  status: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  online: {
    width: "12px",
    height: "12px",
    backgroundColor: "green",
    borderRadius: "100%"

  },
  offline: {
    width: "12px",
    height: "12px",
    backgroundColor: "red",
    borderRadius: "100%"
  },
  root: ({ desktopPadding }) => ({
    width: "65%",
    minWidth: "40%",
    pointerEvents: "none",
    position: "fixed",
    zIndex: 5,
    left: "50%",
    [theme?.breakpoints.up("md")]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme?.spacing(3),
    },
    [theme?.breakpoints.down("md")]: {
      left: "50%",
      width: "100%",
      bottom: `calc(${theme?.spacing(13)} + ${theme?.dimensions.bottomBarHeight
        }px)`,
    },
    transform: "translateX(-50%)",
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
}) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const userReadonly = useDeviceReadonly();
  const user = useSelector((state) => state?.session?.user);
  const device = useSelector((state) => state.devices.items[deviceId]);
  console.log({ device })
  console.log({ position })

  const fence = useSelector((state) => state.geofences.items);

  const deviceStatusCountAnchor = (isAnchor, deviceId) =>
    Object.values(fence).filter(
      (d) =>
        d.attributes?.isAnchor === isAnchor &&
        d.attributes?.deviceId === deviceId
    ).length;

  const deviceAnchorCount = deviceStatusCountAnchor(true, device?.id || null);
  const deviceNonAnchorCount = deviceStatusCountAnchor(
    false,
    device?.id || null
  );

  // Inicializa o estado anchorId com uma string vazia
  const [anchorId, setAnchorId] = useState("");

  useEffect(() => {
    // Função para encontrar o ID da cerca âncora para o dispositivo atual
    const findAnchorId = (isAnchor, deviceId) => {
      const anchors = Object.values(fence).filter(
        (d) =>
          d.attributes?.isAnchor === isAnchor &&
          d.attributes?.deviceId === deviceId
      );
      if (anchors.length > 0) {
        // Retorna o ID da primeira cerca com status de âncora para o dispositivo
        return anchors[0].id;
      }
      return ""; // Retorna uma string vazia caso não encontre nenhuma cerca correspondente
    };
    // Encontra o ID da cerca âncora para o dispositivo atual
    const deviceAnchorId = findAnchorId(true, device?.id || null);
    setAnchorId(deviceAnchorId); // Atualiza o estado anchorId com o ID da cerca âncora
  }, [device, fence, position]); // Executa sempre que device ou fence mudar

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    "positionItems",
    "speed,address,totalDistance,course"
  );

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);
  const [anchorCustomer, setAnchorCustomer] = useState(false);
  const [deletAnchorCustomer, setDeleteAnchorCustomer] = useState(false);
  const [stopResume, setStopResume] = useState(false);
  const [commandId, setCommandId] = useState("");
  const [notificationId, setNotificationdId] = useState("");
  const [isAnchor, setIsAnchor] = useState(false);

  /*  CHAMA POPUP PARA CRIAR ANCORA */
  const handleCreateGeofenceAnchor = useCatch(async () => {
    setAnchorCustomer(true);
  });
  /*  CHAMA POPUP PARA REMOVER ANCORA */
  const handleDeleteGeofenceAnchor = useCatch(async () => {
    setDeleteAnchorCustomer(true);
  });
  /* VERIFICA SE EXISTE NOTIFICAÇÃO PARA O DISPOSITIVO E ENVIA 
  RemoveAnchorGeofenceDialog
  */
  useEffectAsync(async () => {
    const verifyNotificationsDevice = async () => {
      const verifyNotifications = await fetch(
        `/api/notifications/?deviceId=${device?.id}`
      );
      if (verifyNotifications.ok) {
        const data = await verifyNotifications.json();
        if (data[0]?.id !== undefined) {
          setNotificationdId(data[0]?.id);
        } else {
          setNotificationdId("");
        }
      }
    };
    verifyNotificationsDevice();
    return () => { };
  }, [device, fence]);

  /* VERIFICA SE EXISTE COMANDO ATRIBUIDO 
  PARA O DISPOSITIVO E ENVIA 
  RemoveAnchorGeofenceDialog
  */
  useEffectAsync(async () => {
    const verifyCommandsDevice = async () => {
      const verifyCommands = await fetch(
        `/api/commands/send/?deviceId=${device?.id}`
      );
      if (verifyCommands.ok) {
        const data = await verifyCommands.json();
        if (data[0]?.id !== undefined) {
          setCommandId(data[0]?.id);
        } else {
          setCommandId("");
        }
      }
    };
    verifyCommandsDevice();
    return () => { };
  }, [device]);

  /* INSERIDO FUNÇÃO PARA BLOQUEIO PELO CARD */
  const handleStopResumeEngine = useCatchCallback(async () => {
    setStopResume(true);
  }, [navigate, position]);
  /* REMOVE ANCORA  NATIVO TRACCAR */
  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });
  /* CRIA ANCORA NATIVA DO TRACCAR */
  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: "",
      area: `CIRCLE (${position?.latitude} ${position?.longitude}, 50)`,
    };
    const response = await fetch("/api/geofences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: position?.deviceId,
          geofenceId: item?.id,
        }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);
  const [items, setItems] = useState([]);
  useEffectAsync(async () => {
    // setLoading(true);
    try {
      const response = await fetch("/api/drivers");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      // setLoading(false);
    }
  }, []);


  //    case 'driverUniqueId':
  // return drivers.length > 0 ? drivers.filter(driver => driver.uniqueId === value).length > 0 ? drivers.filter(driver => driver.uniqueId === value)[0].name : "" : "";
  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable handle={`.${classes.media}, .${classes.header}`}>
            <Card elevation={1} className={classes.card}>
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title="Menu">
                  <IconButton
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title={t("reportReplay")}>
                  <IconButton
                    onClick={() => navigate("/replay")}
                    disabled={disableActions || !position}
                  >
                    <RouteIcon />
                  </IconButton>
                </Tooltip> */}

                {/* ICONE DE ANCORA */}
                {deviceAnchorCount > 0 && position && (
                  <Tooltip title="Âncora Ativada">
                    <IconButton
                      onClick={() =>
                        handleDeleteGeofenceAnchor(
                          commandId,
                          notificationId,
                          fence.id
                        )
                      }
                      disabled={disableActions || user?.readonly || !position}
                    >
                      <AnchorIcon color="error" />
                    </IconButton>
                  </Tooltip>
                )}
                {deviceAnchorCount <= 0 && position && (
                  <Tooltip title="Criar Âncora">
                    <IconButton
                      onClick={handleCreateGeofenceAnchor}
                      disabled={disableActions || user?.readonly || !position}
                    >
                      <AnchorIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {/* ICONE DE DESBLOQUEIO */}
                {position?.protocol !== "osmand" && (
                  <Tooltip title="Bloquear / Desbloquear Veículo">
                    <IconButton
                      onClick={handleStopResumeEngine}
                      disabled={
                        disableActions ||
                        user?.limitCommands ||
                        position?.protocol === "osmand" ||
                        position?.protocol === undefined
                      }
                    >
                      {position?.attributes?.event === "jt" ||
                        position?.attributes?.blocked === true ||
                        position?.attributes?.out1 === true ? (
                        <LockIcon color="error" />
                      ) : position?.protocol === "osmand" ? (
                        <LockOpenIcon />
                      ) : (
                        <LockOpenIcon
                          color={`${user?.limitCommands ? "" : "success"}`}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t("linkGoogleMaps")}>
                  <IconButton
                    component="a"
                    target="_blank"
                    href={`https://www.google.com/maps/search/?api=1&query=${position?.latitude}%2C${position?.longitude}`}
                    color="success"
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("linkStreetView")}>
                  <IconButton
                    component="a"
                    target="_blank"
                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position?.latitude}%2C${position?.longitude}&heading=${position?.course}`}
                    color="info"
                  >
                    <StreetviewIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
              {/* Device Image */}
              {deviceImage ?
                (
                  <CardMedia
                    className={classes.media}
                    image={`/api/media/${device?.uniqueId}/${deviceImage}`}
                  >
                    <IconButton
                      size="small"
                      onClick={onClose}
                      onTouchStart={onClose}
                    >
                      <CloseIcon
                        fontSize="small"
                        className={classes.mediaButton}
                      />
                    </IconButton>
                  </CardMedia>
                ) :
                (
                  <div className={classes.header}>
                    {/* <Typography variant="body2" color="textSecondary">
                    {device.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton> */}
                  </div>
                )}
              {/* Device Info */}
              {position && (
                <CardContent className={classes.content}>
                  <div className={classes.infoHeader}>
                    <div>
                      {device.name}
                    </div>
                    <div className={classes.status}>
                      <span className={device.status == "online" ? classes.online : classes.offline}></span>
                      <span>{device.status}</span>
                    </div>
                  </div>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      <StatusRow
                        key={"address"}
                        name={
                          positionAttributes?.hasOwnProperty("address")
                            ? positionAttributes["address"]?.name
                            : "address"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("address") ? "address" : null
                            }
                            attribute={
                              position.hasOwnProperty("address") ? null : "address"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"lastUpdate"}
                        name={
                          positionAttributes?.hasOwnProperty("lastUpdate")
                            ? positionAttributes["lastUpdate"]?.name
                            : "lastUpdate"
                        }
                        content={convertDate(device.lastUpdate)}
                      />
                      <StatusRow
                        key={"ignition"}
                        name={
                          positionAttributes?.hasOwnProperty("ignition")
                            ? positionAttributes["ignition"]?.name
                            : "ignition"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("ignition") ? "ignition" : null
                            }
                            attribute={
                              position.hasOwnProperty("ignition") ? null : "ignition"
                            }
                          />
                        }
                      />
                      {/*
                      <StatusRow
                        key={"motion"}
                        name={
                          positionAttributes?.hasOwnProperty("motion")
                            ? positionAttributes["motion"]?.name
                            : "motion"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("motion") ? "motion" : null
                            }
                            attribute={
                              position.hasOwnProperty("motion") ? null : "motion"
                            }
                          />
                        }
                      /> */}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <div className={classes.infoHeader}>
                    <div>
                      {t("sharedAttributes")}
                    </div>
                  </div>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      <StatusRow
                        key={"RSSI"}
                        name={
                          positionAttributes?.hasOwnProperty("RSSI")
                            ? positionAttributes["RSSI"]?.name
                            : "RSSI"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("sat") ? "sat" : null
                            }
                            attribute={
                              position.hasOwnProperty("sat") ? null : "sat"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Blocked"}
                        name={
                          positionAttributes?.hasOwnProperty("Blocked")
                            ? positionAttributes["Blocked"]?.name
                            : "Blocked"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("blocked") ? "blocked" : null
                            }
                            attribute={
                              position.hasOwnProperty("blocked") ? null : "blocked"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Charge"}
                        name={
                          positionAttributes?.hasOwnProperty("Charge")
                            ? positionAttributes["Charge"]?.name
                            : "Charge"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("charge") ? "charge" : null
                            }
                            attribute={
                              position.hasOwnProperty("charge") ? null : "charge"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Protoocol"}
                        name={
                          positionAttributes?.hasOwnProperty("Protoocol")
                            ? positionAttributes["Protoocol"]?.name
                            : "Protoocol"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("protocol") ? "protocol" : null
                            }
                            attribute={
                              position.hasOwnProperty("protocol") ? null : "protocol"
                            }
                          />
                        }
                      />
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <div className={classes.infoHeader} style={{ opacity: 0 }}>
                    <div>
                      {t("sharedAttributes")}
                    </div>
                  </div>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      <StatusRow
                        key={"Battery"}
                        name={
                          positionAttributes?.hasOwnProperty("Battery")
                            ? positionAttributes["Battery"]?.name
                            : "Battery"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("batteryLevel") ? "batteryLevel" : null
                            }
                            attribute={
                              position.hasOwnProperty("batteryLevel") ? null : "batteryLevel"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Satellites"}
                        name={
                          positionAttributes?.hasOwnProperty("Satellites")
                            ? positionAttributes["Satellites"]?.name
                            : "Satellites"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("satellites") ? "satellites" : null
                            }
                            attribute={
                              position.hasOwnProperty("satellites") ? null : "satellites"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Speed"}
                        name={
                          positionAttributes?.hasOwnProperty("Speed")
                            ? positionAttributes["Speed"]?.name
                            : "Speed"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("speed") ? "speed" : null
                            }
                            attribute={
                              position.hasOwnProperty("speed") ? null : "speed"
                            }
                          />
                        }
                      />
                      <StatusRow
                        key={"Valid"}
                        name={
                          positionAttributes?.hasOwnProperty("Valid")
                            ? positionAttributes["Valid"]?.name
                            : "Valid"
                        }
                        content={
                          <PositionValue
                            drivers={items}
                            position={position}
                            property={
                              position.hasOwnProperty("valid") ? "valid" : null
                            }
                            attribute={
                              position.hasOwnProperty("valid") ? null : "valid"
                            }
                          />
                        }
                      />
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              {/* Bottom Toolbar */}

            </Card>
          </Draggable>
        )}
      </div >
      {position && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate(`/position/${position?.id}`)}>
            <Typography color="secondary">{t("sharedShowDetails")}</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/settings/device/${deviceId}`)}
            disabled={disableActions || deviceReadonly}
          >
            <Typography color="blue">{t("sharedEditDevices")}</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => setRemoving(true)}
            disabled={disableActions || deviceReadonly}
          >
            <Typography className={classes.negative}>
              {t("sharedRemoveDevices")}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/settings/device/${deviceId}/command`)}
          >
            <Typography
              color="blue"
              disabled={disableActions}
              className={classes.negative}
            >
              {t("deviceCommand")}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleGeofence}>
            {t("sharedCreateGeofence")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position?.latitude},${position?.longitude}`}
          >
            {t("linkAppleMaps")}
          </MenuItem>
        </Menu>
      )
      }
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
      {/* COMPONENTE PARA DESBLOQUEIO PELO CARD */}
      <StopResumeDialog
        open={stopResume}
        close={() => setStopResume(false)}
        endpoint="devices"
        deviceId={deviceId}
        device={device}
        position={position}
        onResult={() => setStopResume(false)}
      />
      {/* COMPONENTE PARA CRIAR ANCORA */}
      <AnchorGeofenceDialog
        open={anchorCustomer}
        close={() => setAnchorCustomer(false)}
        endpoint="devices"
        device={device}
        deviceId={deviceId}
        position={position}
        onResult={() => setAnchorCustomer(false)}
      />
      {/* COMPONENTE REMOVER ANCORA */}
      <RemoveAnchorGeofenceDialog
        open={deletAnchorCustomer}
        close={() => setDeleteAnchorCustomer(false)}
        endpoint="devices"
        device={device}
        anchorId={anchorId}
        commandId={commandId}
        notificationId={notificationId}
        position={position}
        onResult={() => setDeleteAnchorCustomer(false)}
      />
      <ToastContainer />
    </>
  );
};

export default StatusCard;

function convertDate(date) {
  const newDate = new Date(date)
  const formattedDate = newDate.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  return formattedDate;

}
