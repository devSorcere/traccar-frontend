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
import createFence from "../../resources/createFence.mp3";
import { formatSpeed } from "../util/formatter";
import { useTranslation } from "./LocalizationProvider";
import BackdropLoading from "./BackdropLoading";
import removeFence from "../../resources/removeFence.mp3";

const StopResumeDialog = ({
  device,
  open,
  close,
  deviceId,
  onResult,
  position,
}) => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [loading, setLoading] = useState(false);

  /* FUNÇÃO PARA DESBLOQUEAR DIRETO NO POPUP */
  const handleResumeEngine = async () => {
    setLoading(true);
    const command = "engineResume";
    const response = await fetch("/api/commands/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: deviceId,
        type: command,
      }),
    });
    if (response?.status === 200) {
      toast.success("Comando enviado com Sucesso!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      await new Audio(createFence).play();
      navigate();
      onResult(true);
      setLoading(false);
    } else if (response?.status === 202) {
      toast.warning(
        `Comando enviado e está na fila de processamento, \nverifique o status do dispositivo! - ${device?.status}`,
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );
      navigate();
      onResult(true);
      setLoading(false);
    } else {
      toast.error(`Erro ao enviar o comando: ${response?.statusText}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      onResult(true);
      setLoading(false);
      throw Error(await response?.text());
    }
  };
  /* FUNÇÃO PARA BLOQUEAR DIRETO NO POPUP */
  const handleStopEngine = async () => {
    setLoading(true);
    const command = "engineStop";
    const response = await fetch("/api/commands/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: deviceId,
        type: command,
      }),
    });
    if (response?.status === 200) {
      toast.success("Comando enviado com Sucesso!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      await new Audio(removeFence).play();
      navigate();
      onResult(true);
      setLoading(false);
    } else if (response?.status === 202) {
      toast.warning(
        `Comando enviado e está na fila de processamento, \n O status do dispositivo está como:  ${device?.status}`,
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );
      navigate();
      onResult(true);
      setLoading(false);
    } else {
      toast.error(`Erro ao enviar o comando: ${response?.statusText}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      onResult(true);
      setLoading(false);
      throw Error(await response?.text());
    }
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
        position={position}
      >
        {loading && <BackdropLoading />}
        <DialogTitle id="alert-dialog-title" sx={{ mr: 3, p: 3 }}>
          BLOQUEAR / DESBLOQUEAR VEÍCULO <strong>{device?.name}</strong>{" "}
          <IconButton
            sx={{
              position: "absolute",
              right: 8,
              top: 14,
            }}
            onClick={close}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {device?.status !== "offline" &&
            position?.attributes?.motion === false && (
              <DialogContentText id="alert-dialog-description">
                Enviar comando de
                <strong> Bloqueio </strong>
                com veículo em
                <strong> Movimento</strong>
                <br />
                pode causar Acidentes!
              </DialogContentText>
            )}
          {device?.status === "offline" && (
            <DialogContentText id="alert-dialog-description">
              Seu Veículo está com
              <strong> STATUS OFFLINE, </strong>o comando ficará em fila e será
              enviado quando estiver
              <strong> ONLINE !</strong>
            </DialogContentText>
          )}
          {position?.attributes?.motion === true && (
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "red",
              }}
            >
              <strong>CUIDADO O VEÍCULO ESTÁ EM MOVIMENTO </strong>
              <strong style={{ paddingLeft: 5 }}>
                {" "}
                {` ${formatSpeed(
                  position?.speed || 0,
                  position?.attributes?.speedUnit || "kmh",
                  t
                )}`}
              </strong>
              <br />
              <br />
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions style={{ paddingBottom: 20, paddingRight: 20 }}>
          <Button
            size="small"
            color="success"
            variant="contained"
            title="Religar Motor"
            onClick={handleResumeEngine}
          >
            Desbloquear
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            title="Desligar Motor"
            onClick={handleStopEngine}
          >
            Bloquear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default StopResumeDialog;
