import React, { useState } from "react";
import moment from "moment";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ImageList,
  ImageListItem,
  Divider,
  ImageListItemBar,
  IconButton,
  Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SimCardIcon from "@mui/icons-material/SimCard";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ConstructionIcon from "@mui/icons-material/Construction";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InfoIcon from "@mui/icons-material/Info";
import { DropzoneArea } from "react-mui-dropzone";
import EditItemView from "./components/EditItemView";
import EditAttributesAccordion from "./components/EditAttributesAccordion";
import SelectField from "../common/components/SelectField";
import deviceCategories from "../common/util/deviceCategories";
import { useTranslation } from "../common/components/LocalizationProvider";
import useDeviceAttributes from "../common/attributes/useDeviceAttributes";
import { useAdministrator } from "../common/util/permissions";
import SettingsMenu from "./components/SettingsMenu";
import useCommonDeviceAttributes from "../common/attributes/useCommonDeviceAttributes";
import { useCatch } from "../reactHelper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  imageInstallation: {
    width: "auto",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      alignSelf: "center",
      width: theme.dimensions.popupMaxWidthMobile, //ajusta popup para mobile
    },
  },
}));

const DevicePage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [item, setItem] = useState();
  const images = [item];
  //const// deviceImages = item?.attributes?.deviceImage;
  const installationImages =
    item?.attributes?.imageInstallation1 ||
    item?.attributes?.imageInstallation2 ||
    item?.attributes?.imageInstallation3 ||
    item?.attributes?.imageInstallation4;

  /* ADICONA IMAGEM 1 DA INSTALAÇÃO */
  const handleFileInstallation1 = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/file/${item.uniqueId}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            imageInstallation1: await response.text(),
          },
        });
        toast.success("Imagem anexada com sucesso, é necessário salvar.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Nao foi possível anexar a imagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await response.text());
      }
    }
  });
  /* ADICONA IMAGEM 3 DA INSTALAÇÃO */
  const handleFileInstallation2 = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/file/${item.uniqueId}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            imageInstallation2: await response.text(),
          },
        });
        toast.success("Imagem anexada com sucesso, é necessário salvar.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Nao foi possível anexar a imagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await response.text());
      }
    }
  });
  /* ADICONA IMAGEM 3 DA INSTALAÇÃO */
  const handleFileInstallation3 = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/file/${item.uniqueId}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            imageInstallation3: await response.text(),
          },
        });
        toast.success("Imagem anexada com sucesso, é necessário salvar.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Nao foi possível anexar a imagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await response.text());
      }
    }
  });
  /* ADICONA IMAGEM 4 DA INSTALAÇÃO */
  const handleFileInstallation4 = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/file/${item.uniqueId}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            imageInstallation4: await response.text(),
          },
        });
        toast.success("Imagem anexada com sucesso, é necessário salvar.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Nao foi possível anexar a imagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await response.text());
      }
    }
  });

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            deviceImage: await response.text(),
          },
        });
        toast.success("Imagem anexada com sucesso, é necessário salvar.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Nao foi possível anexar a imagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        throw Error(await response.text());
      }
    }
  });

  const validate = () => item && item.name && item.uniqueId;

  return (
    <>
      <ToastContainer />
      <EditItemView
        endpoint="devices"
        item={item}
        setItem={setItem}
        validate={validate}
        menu={<SettingsMenu />}
        breadcrumbs={["settingsTitle", "sharedDevice"]}
      >
        {item && (
          <>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <NewReleasesIcon sx={{ marginRight: 1 }} />
                  {t("sharedRequired")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={item.name || ""}
                  onChange={(event) =>
                    setItem({ ...item, name: event.target.value })
                  }
                  label={t("sharedName")}
                />
                <TextField
                  value={item.uniqueId || ""}
                  onChange={(event) =>
                    setItem({ ...item, uniqueId: event.target.value })
                  }
                  label={t("deviceIdentifier")}
                  helperText={t("deviceIdentifierHelp")}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <DirectionsCarIcon sx={{ marginRight: 1 }} />
                  {t("sharedInfo")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={item.plate || ""}
                  onChange={(event) =>
                    setItem({ ...item, plate: event.target.value })
                  }
                  label={t("sharedPlate")}
                />
                <TextField
                  value={item.renavam || ""}
                  onChange={(event) =>
                    setItem({ ...item, renavam: event.target.value })
                  }
                  label={t("sharedRenavam")}
                />
                <TextField
                  value={item.yearModel || ""}
                  onChange={(event) =>
                    setItem({ ...item, yearModel: event.target.value })
                  }
                  label={t("sharedYearModel")}
                />
                <TextField
                  value={item.brandModelVersion || ""}
                  onChange={(event) =>
                    setItem({ ...item, brandModelVersion: event.target.value })
                  }
                  label={t("sharedBrandModelVersion")}
                />
                <TextField
                  value={item.speciesType || ""}
                  onChange={(event) =>
                    setItem({ ...item, speciesType: event.target.value })
                  }
                  label={t("sharedSpeciesType")}
                />
                <TextField
                  value={item.predominantColor || ""}
                  onChange={(event) =>
                    setItem({ ...item, predominantColor: event.target.value })
                  }
                  label={t("sharedPredominantColor")}
                />
                <FormControl>
                  <InputLabel>{t("sharedFuel")}</InputLabel>
                  <Select
                    label={t("sharedFuel")}
                    value={item.fuel || ""}
                    onChange={(event) =>
                      setItem({ ...item, fuel: event.target.value })
                    }
                  >
                    <MenuItem value="gasolina">{t("fuelGasolina")}</MenuItem>
                    <MenuItem value="flex">{t("fuelFlex")}</MenuItem>
                    <MenuItem value="diesel">{t("fuelDisel")}</MenuItem>
                    <MenuItem value="etanol">{t("fuelEtanol")}</MenuItem>
                    <MenuItem value="gnv">{t("fuelGnv")}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  value={item.chassis || ""}
                  onChange={(event) =>
                    setItem({ ...item, chassis: event.target.value })
                  }
                  label={t("sharedChassis")}
                />
                <TextField
                  value={item.motor || ""}
                  onChange={(event) =>
                    setItem({ ...item, motor: event.target.value })
                  }
                  label={t("sharedMotor")}
                />
                <TextField
                  value={item.city || ""}
                  onChange={(event) =>
                    setItem({ ...item, city: event.target.value })
                  }
                  label={t("sharedCity")}
                />
                <TextField
                  value={item.uf || ""}
                  onChange={(event) =>
                    setItem({ ...item, uf: event.target.value })
                  }
                  label={t("sharedUf")}
                />
                <TextField
                  value={item.comments || ""}
                  onChange={(event) =>
                    setItem({ ...item, comments: event.target.value })
                  }
                  label={t("sharedComments")}
                  multiline
                  rows={5}
                  variant="outlined"
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <ConstructionIcon sx={{ marginRight: 1 }} />
                  {t("sharedInfoInstall")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  label={t("sharedDateInstall")}
                  type="datetime-local"
                  value={
                    (item.dateInstall &&
                      moment(item.dateInstall)
                        .locale("en")
                        .format(moment.HTML5_FMT.DATETIME_LOCAL)) ||
                    moment()
                      .locale("en")
                      .format(moment.HTML5_FMT.DATETIME_LOCAL)
                  }
                  onChange={(event) =>
                    setItem({
                      ...item,
                      dateInstall: moment(
                        event.target.value,
                        moment.HTML5_FMT.DATETIME_LOCAL
                      )
                        .locale("en")
                        .format(),
                    })
                  }
                />
                <TextField
                  value={item.localInstall || ""}
                  onChange={(event) =>
                    setItem({ ...item, localInstall: event.target.value })
                  } /* sharedLocalInstall */
                  label={t("sharedLocalInstall")}
                />
                <TextField
                  value={item.technical || ""}
                  onChange={(event) =>
                    setItem({ ...item, technical: event.target.value })
                  } /* sharedTechnical */
                  label={t("sharedTechnical")}
                />
                <TextField
                  value={item.commentsInstall || ""}
                  onChange={(event) =>
                    setItem({ ...item, commentsInstall: event.target.value })
                  }
                  label={t("sharedComments")}
                  multiline
                  rows={5}
                  variant="outlined"
                />
                {item.id && (
                  <>
                    {!item?.attributes?.imageInstallation1 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="subtitle1"
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                            {t("attributeDeviceImageInstallation1")}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                          <DropzoneArea
                            dropzoneText={t("sharedDropzoneText")}
                            acceptedFiles={["image/*"]}
                            filesLimit={1}
                            onChange={handleFileInstallation1}
                            showAlerts={false}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}
                    {!item?.attributes?.imageInstallation2 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="subtitle1"
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                            {t("attributeDeviceImageInstallation2")}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                          <DropzoneArea
                            dropzoneText={t("sharedDropzoneText")}
                            acceptedFiles={["image/*"]}
                            filesLimit={1}
                            onChange={handleFileInstallation2}
                            showAlerts={false}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}
                    {!item?.attributes?.imageInstallation3 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="subtitle1"
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                            {t("attributeDeviceImageInstallation3")}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                          <DropzoneArea
                            dropzoneText={t("sharedDropzoneText")}
                            acceptedFiles={["image/*"]}
                            filesLimit={1}
                            onChange={handleFileInstallation3}
                            showAlerts={false}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}
                    {!item?.attributes?.imageInstallation4 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="subtitle1"
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                            {t("attributeDeviceImageInstallation4")}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                          <DropzoneArea
                            dropzoneText={t("sharedDropzoneText")}
                            acceptedFiles={["image/*"]}
                            filesLimit={1}
                            onChange={handleFileInstallation4}
                            showAlerts={false}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </>
                )}
                {installationImages && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant="subtitle1"
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <ImageIcon sx={{ marginRight: 1 }} />
                        {t("attributeDeviceImageInstallation")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                      <Box
                        className={classes.imageInstallation}
                        cols={2}
                        rowHeight={135}
                      >
                        <ImageList>
                          {item?.attributes?.imageInstallation1 && (
                            <>
                              <ImageListItem key={item?.id}>
                                <img
                                  srcSet={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation1}?w=64&h=64&fit=crop&auto=format&dpr=2 2x`}
                                  src={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation1}?w=64&h=64&fit=crop&auto=format&dpr=2 2x`}
                                  alt={item.name}
                                  loading="lazy"
                                />
                              </ImageListItem>
                              {/*   <IconButton
                                onClick={() =>
                                  shareImageViaWhatsApp(
                                    `/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation1}`
                                  )
                                }
                              >
                                <WhatsAppIcon />
                              </IconButton> */}
                            </>
                          )}
                          {item?.attributes?.imageInstallation2 && (
                            <ImageListItem key={item?.id}>
                              <img
                                srcSet={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation2}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation2}?w=248&fit=crop&auto=format`}
                                alt={item.name}
                                loading="lazy"
                              />
                            </ImageListItem>
                          )}
                          {item?.attributes?.imageInstallation3 && (
                            <ImageListItem key={item?.id}>
                              <img
                                srcSet={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation3}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation3}?w=248&fit=crop&auto=format`}
                                alt={item.name}
                                loading="lazy"
                              />
                            </ImageListItem>
                          )}
                          {item?.attributes?.imageInstallation4 && (
                            <>
                              <ImageListItem key={item?.id}>
                                <img
                                  srcSet={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation4}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                  src={`/api/media/installation/${item?.uniqueId}/${item?.attributes?.imageInstallation4}?w=248&fit=crop&auto=format`}
                                  alt={item?.name}
                                  loading="lazy"
                                />
                              </ImageListItem>
                            </>
                          )}
                        </ImageList>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <SimCardIcon sx={{ marginRight: 1 }} />
                  {t("sharedInfoSimCard")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={item.telefone || ""}
                  onChange={(event) =>
                    setItem({ ...item, telefone: event.target.value })
                  }
                  label={t("sharedInfoTelefone")}
                />
                <TextField
                  value={item.iccid || ""}
                  onChange={(event) =>
                    setItem({ ...item, iccid: event.target.value })
                  }
                  label={t("sharedInfoIccid")}
                />
                <TextField
                  value={item.franchise || ""}
                  onChange={(event) =>
                    setItem({ ...item, franchise: event.target.value })
                  }
                  label={t("sharedInfoFranchise")}
                />
                <TextField
                  value={item.apn || ""}
                  onChange={(event) =>
                    setItem({ ...item, apn: event.target.value })
                  }
                  label={t("sharedInfoApn")}
                />
                <TextField
                  value={item.apnLogin || ""}
                  onChange={(event) =>
                    setItem({ ...item, apnLogin: event.target.value })
                  }
                  label={t("sharedInfoApnLogin")}
                />
                <TextField
                  value={item.apnPassword || ""}
                  onChange={(event) =>
                    setItem({ ...item, apnPassword: event.target.value })
                  }
                  label={t("sharedInfoApnPassword")}
                />
                <FormControl>
                  <InputLabel>{t("sharedInfoOperator")}</InputLabel>
                  <Select
                    label={t("sharedInfoOperator")}
                    value={item.operator || ""}
                    onChange={(event) =>
                      setItem({ ...item, operator: event.target.value })
                    }
                  >
                    <MenuItem value="">{t("sharedInfoOperator")}</MenuItem>
                    <MenuItem value="algar">{t("sharedInfoAlgar")}</MenuItem>
                    <MenuItem value="claro">{t("sharedInfoClaro")}</MenuItem>
                    <MenuItem value="tim">{t("sharedInfoTim")}</MenuItem>
                    <MenuItem value="vivo">{t("sharedInfoVivo")}</MenuItem>
                    <MenuItem value="multioperadora">
                      {t("sharedInfoMultOperator")}
                    </MenuItem>
                    <MenuItem value="outra">{t("sharedInfoOutra")}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  value={item.responsibleCompany || ""}
                  onChange={(event) =>
                    setItem({ ...item, responsibleCompany: event.target.value })
                  }
                  label={t("sharedInfoResponsibleCompany")}
                />
                <TextField
                  value={item.contactCompany || ""}
                  onChange={(event) =>
                    setItem({ ...item, contactCompany: event.target.value })
                  }
                  label={t("sharedInfoContactCompany")}
                />
              </AccordionDetails>
            </Accordion>
            {/* FIM MOD */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <InfoIcon sx={{ marginRight: 1 }} />
                  {t("sharedExtra")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <SelectField
                  value={item.groupId || 0}
                  onChange={(event) =>
                    setItem({ ...item, groupId: Number(event.target.value) })
                  }
                  endpoint="/api/groups"
                  label={t("groupParent")}
                />
                <TextField
                  value={item.phone || ""}
                  onChange={(event) =>
                    setItem({ ...item, phone: event.target.value })
                  }
                  label={t("sharedPhone")}
                />
                <TextField
                  value={item.model || ""}
                  onChange={(event) =>
                    setItem({ ...item, model: event.target.value })
                  }
                  label={t("deviceModel")}
                />
                <TextField
                  value={item.contact || ""}
                  onChange={(event) =>
                    setItem({ ...item, contact: event.target.value })
                  }
                  label={t("deviceContact")}
                />
                <SelectField
                  value={item.category || "default"}
                  emptyValue={null}
                  onChange={(event) =>
                    setItem({ ...item, category: event.target.value })
                  }
                  data={deviceCategories.map((category) => ({
                    id: category,
                    name: t(
                      `category${category.replace(/^\w/, (c) =>
                        c.toUpperCase()
                      )}`
                    ),
                  }))}
                  label={t("deviceCategory")}
                />
                <SelectField
                  value={item.calendarId || 0}
                  onChange={(event) =>
                    setItem({ ...item, calendarId: Number(event.target.value) })
                  }
                  endpoint="/api/calendars"
                  label={t("sharedCalendar")}
                />
                <TextField
                  label={t("userExpirationTime")}
                  type="date"
                  value={
                    (item.expirationTime &&
                      moment(item.expirationTime)
                        .locale("en")
                        .format(moment.HTML5_FMT.DATE)) ||
                    "2099-01-01"
                  }
                  onChange={(e) =>
                    setItem({
                      ...item,
                      expirationTime: moment(
                        e.target.value,
                        moment.HTML5_FMT.DATE
                      )
                        .locale("en")
                        .format(),
                    })
                  }
                  disabled={!admin}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.disabled}
                      onChange={(event) =>
                        setItem({ ...item, disabled: event.target.checked })
                      }
                    />
                  }
                  label={t("sharedDisabled")}
                  disabled={!admin}
                />
              </AccordionDetails>
            </Accordion>
            {item.id && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="subtitle1"
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                    {t("attributeDeviceImage")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <DropzoneArea
                    dropzoneText={t("sharedDropzoneText")}
                    acceptedFiles={["image/*"]}
                    filesLimit={1}
                    onChange={handleFiles}
                    showAlerts={false}
                  />
                </AccordionDetails>
              </Accordion>
            )}
            <EditAttributesAccordion
              attributes={item.attributes}
              setAttributes={(attributes) => setItem({ ...item, attributes })}
              definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
            />
          </>
        )}
      </EditItemView>
    </>
  );
};

export default DevicePage;
