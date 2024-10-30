import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import removeFence from "../../resources/removeFence.mp3";
import { useDeviceReadonly } from "../util/permissions";
import BackdropLoading from "./BackdropLoading";

const RemoveAnchorGeofenceDialog = ({
  open,
  close,
  onResult,
  anchorId,
  notificationId,
  commandId,
  device,
}) => {
  const navigate = useNavigate();
  const deviceReadonly = useDeviceReadonly();
  const [loading, setLoading] = useState(false);

  const handleDeleteGetGeofence = async () => {
    setLoading(true);
    /* REMOVE ANCORA */
    if (anchorId) {
      const response = await fetch(`/api/geofences/${anchorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onResult(true);
      } else {
        // new Audio(errorAlarme).play();
        throw Error(await response.text());
      }
    }
    /* REMOVE NOTIFICAÇÃO */
    if (notificationId) {
      const responseNotification = await fetch(
        `/api/notifications/${notificationId}`,
        { method: "DELETE" }
      );
      if (responseNotification.ok) {
        onResult(true);
      } else {
        throw Error(await responseNotification.text());
      }
    }
    /* REMOVE COMMANDO*/
    if (commandId) {
      const responseCommand = await fetch(`/api/commands/${commandId}`, {
        method: "DELETE",
      });
      if (responseCommand.ok) {
        onResult(true);
      } else {
        throw Error(await responseCommand.text());
      }
    }

    /* ATUALIZA DEVICE */
    const responseDevice = await fetch(`/api/devices/${device?.id}`);
    const dataDevice = await responseDevice.json();
    const attDevice = {
      ...dataDevice,
      attributes: {
        ...dataDevice.attributes,
        lockOnExit: false,
        fence_id: 0,
        command_id: 0,
        notification_id: 0,
      },
    };

    /* 
          verifica se usuario tem permissão de atualizar decice
          caso sim, chama função de atualizar, caso nao passa para criar a cerca
          */
    if (!deviceReadonly) {
      const updateDevice = await fetch(`/api/devices/${device?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attDevice),
      });
      if (!updateDevice.ok) {
        toast.error("Não foi possivel atualizar o dispositivo!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await updateDevice.text());
      }
    }

    onResult(true);
    navigate("/geofences");
    setTimeout(async () => {
      toast.success("Ancora desativada com sucesso!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      await new Audio(removeFence).play();
      navigate("/");
    }, 3000);
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        open={open}
        onClose={close}
      >
        {loading && <BackdropLoading />}
        <DialogTitle id="alert-dialog-title" sx={{ m: 0, p: 2 }}>
          DESATIVAR ÂNCORA
          <IconButton
            sx={{ position: "absolute", right: 8, top: 14 }}
            onClick={close}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
            Deseja desativar a âncora para o dispositivo{" "}
            <strong>{device?.name}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{ paddingBottom: 15, paddingRight: 20, paddingTop: 15 }}
        >
          <Button
            size="small"
            color="secondary"
            variant="contained"
            title="Cancelar"
            onClick={close}
          >
            Cancelar
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            title="Remover Âncora"
            onClick={handleDeleteGetGeofence}
          >
            Desativar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default RemoveAnchorGeofenceDialog;
