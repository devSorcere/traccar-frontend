import CloseIcon from "@mui/icons-material/Close";
import {
  FormControlLabel,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import createFence from "../../resources/createFence.mp3";
import { formatSpeed } from "../util/formatter";
import { useTranslation } from "./LocalizationProvider";
import { useSelector } from "react-redux";
import { useDeviceReadonly } from "../util/permissions";
import BackdropLoading from "./BackdropLoading";

const AnchorGeofenceDialog = ({
  open,
  close,
  onResult,
  position,
  deviceId,
}) => {
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const user = useSelector((state) => state?.session?.user);
  const server = useSelector((state) => state.session.server);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const URLWHATSAPP = server?.attributes?.whatsAppServerInvoiceURL;

  const [blocked, setBlocked] = useState(false);
  const [diameter, setDiameter] = useState(50);
  const [colorAnchor, setColorAnchor] = useState("#FF0000");
  const [loading, setLoading] = useState(false);

  /* FUNÇÃO PARA HABILITAR OU NÃO O BLOQUEIO */
  const handleChangeIsBlocked = (event) => {
    setBlocked(event.target.checked);
  };
  /* FUNÇÃO PARA DEFINIR O DIAMETRO DA ANCORA */
  const handleChangeDiameter = (event) => {
    setDiameter(event.target.value);
  };
  /* FUNÇÃO PARA DEFINIR O DIAMETRO DA ANCORA */
  const handleChangeColor = (event) => {
    setColorAnchor(event.target.value);
  };

  /* FUNÇÃO PARA GERAR ANCORA */
  const handleCreateGeofenceAnchor = async () => {
    setLoading(true);
    try {
      const newItem = {
        name: `Alerta Maximo - ${device?.name}`,
        area: `CIRCLE(${position?.latitude} ${position?.longitude}, ${diameter})`,
        attributes: {
          deviceId: device?.id,
          isAnchor: true,
          isBlocked: blocked,
          color: colorAnchor,
        },
        description: "Alerta Maximo",
      };

      /* CRIA ANCORA */
      const response = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });


      if (response.ok) {
        const item = await response.json();

        /* VERIFICA SE BLOQUEI ESTÁ ATIVO E ATRIBUI notificação command */
        if (blocked) {
          /* CRIA COMANDO SALVO PARA BLOQUEAR AO SAIR DA ANCORA P/ATRIBUIR A NOTIFICAÇÃO */
          const commandsave = {
            description: `Bloqueio ANCORA - ${device?.name}`,
            type: "engineStop",
            attributes: { deviceId: device.id },
          };

          const createCommandSaveToAnchor = await fetch("/api/commands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commandsave),
          });

          const dataCommand = await createCommandSaveToAnchor.json();

          /* ATUALIZA DEVICE COM BLOQUEIO  */
          const responseDevice = await fetch(`/api/devices/${device?.id}`);

          const dataDevice = await responseDevice.json();

          const attDevice = {
            ...dataDevice,
            attributes: {
              ...dataDevice.attributes,
              lockOnExit: true,
              fence_id: item?.id,
              command_id: dataCommand?.id,
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
          /* ATUALIZA PERMISSÕES */
          const permissionResponseCommand = await fetch("/api/permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId: device?.id,
              commandId: dataCommand?.id,
            }),
          });
          if (!permissionResponseCommand.ok) {
            throw Error(await permissionResponseCommand.text());
          }

          /* CRIA NOTIFICAÇÃO PARA ANCORA COM BLOQUEIO */
          const newItemNotifications = {
            attributes: {},
            calendarId: 0,
            always: false,
            type: "geofenceExit",
            commandId: dataCommand?.id,
            notificators: "web,command,firebase",
          };
          const responseNotification = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItemNotifications),
          });
          if (responseNotification.ok) {
            /* ASSOCIA A NOTIFICAÇÃO AO USUARIO E DEVICE */
            const idNotify = await responseNotification.json();
            const permissionResponseNotify = await fetch("/api/permissions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deviceId: device?.id,
                notificationId: idNotify?.id,
              }),
            });
            if (!permissionResponseNotify.ok) {
              throw Error(await permissionResponseNotify.text());
            }
          }
        } else {
          /* CRIA NOTIFICAÇÃO PARA ANCORA  SEM BLOQUEIO */
          const newItemNotifications = {
            attributes: {},
            calendarId: 0,
            always: false,
            type: "geofenceExit",
            commandId: 0,
            notificators: "web,firebase",
          };
          const responseNotification = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItemNotifications),
          });

          /* ASSOCIA A NOTIFICAÇÃO AO USUARIO E DEVICE */
          const idNotify = await responseNotification.json();
          const permissionResponseNotify = await fetch("/api/permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId: device?.id,
              notificationId: idNotify?.id,
            }),
          });
          if (!permissionResponseNotify.ok) {
            throw Error(await permissionResponseNotify.text());
          }

          /* ATUALIZA DEVICE SEM BLOQUEIO */
          const responseDevice = await fetch(`/api/devices/${device?.id}`);
          const dataDevice = await responseDevice.json();
          const attDevice = {
            ...dataDevice,
            attributes: {
              ...dataDevice.attributes,
              lockOnExit: false,
              fence_id: item?.id,
              command_id: 0,
              notification_id: idNotify?.id,
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
        }
        /* ATRIBUI PERMISSÕES A ANCORA */
        const permissionResponse = await fetch("/api/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId: device?.id, geofenceId: item?.id }),
        });
        if (!permissionResponse.ok) {
          toast.error("Não foi possivel atribuir permissões à Âncora!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          throw Error(await permissionResponse.text());
        }
        const senMessageWHatsApp = async () => {
          const whatsAppNumber = user?.whatsApp;
          const userName = user?.name;
          const userEmail = user?.email;
          const ancoraName = item.name;
          const deviceName = device?.name;
          const message = `Usuário: ${userName}\nLogin: ${userEmail}\nCriou à Âncora: ${ancoraName}\npara o Dispositivo - ${deviceName}\nEm: ${moment().format(
            "DD/MM/YYYY HH:mm:ss"
          )} ⚓⚓⚠️⚠️`;

          try {
            const responseWhats = await fetch(
              `${URLWHATSAPP}/api/sendMessage`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  number: whatsAppNumber,
                  message: message,
                }),
              }
            );

            if (responseWhats.ok) {
              const responseText = await responseWhats.text();
         
            } else {
              console.log("Não foi possivel enviar mensagem", responseWhats);
            }
          } catch (error) {
            console.log(error);
          }
        };
        onResult(true);
        setLoading(false);
        navigate("/geofences");
        await senMessageWHatsApp();
        setTimeout(async () => {
          toast.success("Âncora criada com sucesso!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          await new Audio(createFence).play();
          navigate("/");
        }, 3000);
      } else {
        setLoading(false);
        throw Error(await response.text());
      }
    } catch (error) {
      setLoading(false);
      throw Error("Error ", error);
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
      >
        {loading && <BackdropLoading />}
        <DialogTitle id="alert-dialog-title" sx={{ m: 0, p: 2 }}>
          CRIAR ÂNCORA
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
        <DialogContent dividers>
          {position?.attributes?.motion === true && (
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "red",
                marginBottom: 2,
              }}
            >
              <strong>
                O VEÍCULO ESTÁ EM MOVIMENTO{" "}
                {` ${formatSpeed(
                  position?.speed || 0,
                  position?.attributes?.speedUnit || "kmh",
                  t
                )}`}
              </strong>
            </DialogContentText>
          )}

          {position?.protocol !== "osmand" &&
          position?.protocol !== undefined ? (
            <DialogContentText id="alert-dialog-description">
              Deseja criar uma âncora para o dispositivo{" "}
              <strong>{device?.name}</strong> ?
              <br /> O dispositivo será
              <strong> bloqueado </strong>
              ao sair da Âncora caso a função <strong> Bloquear </strong>
              esteja ativa.
            </DialogContentText>
          ) : (
            <DialogContentText id="alert-dialog-description">
              Deseja criar uma âncora para o dispositivo{" "}
              <strong>{device?.name}</strong> ?
            </DialogContentText>
          )}
          <DialogContent>
            {/* VERIFICA SE É TELEFONE E DESABILITA BOTAO PARA BLOQUEAR */}
            {(position?.protocol !== "osmand" ||
              position?.protocol === undefined) && (
              <Typography
                sx={{ mt: 2 }}
                color="text.secondary"
                display="block"
                variant="caption"
              >
                Habilita o bloqueio do veículo ao sair da Âncora.
                <br />
                <FormControlLabel
                  label="Bloquear"
                  control={
                    <Checkbox
                      color="error"
                      checked={blocked}
                      onChange={handleChangeIsBlocked}
                      disabled={user?.limitCommands}
                    />
                  }
                />
              </Typography>
            )}
            <Typography
              sx={{ mt: 2, pb: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            >
              Diâmetro da Âncora.
              <br />
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={diameter}
                onChange={handleChangeDiameter}
              >
                <FormControlLabel
                  value="50"
                  control={<Radio size="small" />}
                  label="50mt"
                />
                <FormControlLabel
                  value="100"
                  control={<Radio size="small" />}
                  label="100mt"
                />
                <FormControlLabel
                  value="300"
                  control={<Radio size="small" />}
                  label="300mt"
                />
                <FormControlLabel
                  value="500"
                  control={<Radio size="small" />}
                  label="500mt"
                />
              </RadioGroup>
            </Typography>
            <Typography
              color="text.secondary"
              display="block"
              variant="caption"
            >
              Côr Âncora.
            </Typography>
            <Input
              value={colorAnchor}
              onChange={handleChangeColor}
              variant="soft"
              type="color"
              size="lg"
              style={{ width: 50 }}
            />
          </DialogContent>
        </DialogContent>
        <DialogActions
          style={{ paddingBottom: 15, paddingRight: 20, paddingTop: 15 }}
        >
          <Button
            size="small"
            color="success"
            variant="contained"
            title="Criar Âncora"
            onClick={handleCreateGeofenceAnchor}
          >
            Criar Âncora
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AnchorGeofenceDialog;
