import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SecurityIcon from "@mui/icons-material/Security";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import EditItemView from "./components/EditItemView";
import EditAttributesAccordion from "./components/EditAttributesAccordion";
import { useTranslation } from "../common/components/LocalizationProvider";
import useUserAttributes from "../common/attributes/useUserAttributes";
import { sessionActions } from "../store";
import SelectField from "../common/components/SelectField";
import SettingsMenu from "./components/SettingsMenu";
import useCommonUserAttributes from "../common/attributes/useCommonUserAttributes";
import {
  useAdministrator,
  useRestriction,
  useManager,
} from "../common/util/permissions";
import useQuery from "../common/util/useQuery";
import { useCatch } from "../reactHelper";
import useMapStyles from "../map/core/useMapStyles";
import { map } from "../map/core/MapView";
import { DropzoneArea } from "react-mui-dropzone";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const UserPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction("fixedEmail");

  const currentUser = useSelector((state) => state.session.user);
  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const openIdForced = useSelector((state) => state.session.server.openIdForce);

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const userAttributes = useUserAttributes(t);

  const { id } = useParams();
  const [item, setItem] = useState(
    id === currentUser.id.toString() ? currentUser : null
  );

  const [deleteEmail, setDeleteEmail] = useState();
  const [deleteFailed, setDeleteFailed] = useState(false);

  /* FUNÇÃO PARA SALVAR IMAGENS */
  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const file = files[0];
      const response = await fetch(`/api/users/file/${item?.id}/image`, {
        method: "POST",
        body: file,
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: { ...item.attributes, userImage: await response.text() },
        });
      } else {
        throw Error(await response.text());
      }
    }
  });

  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        navigate("/login");
        dispatch(sessionActions.updateUser(null));
      } else {
        throw Error(await response.text());
      }
    } else {
      setDeleteFailed(true);
    }
  });

  const query = useQuery();
  const [queryHandled, setQueryHandled] = useState(false);
  const attribute = query.get("attribute");
  useEffect(() => {
    if (!queryHandled && item && attribute) {
      if (!item.attributes.hasOwnProperty("attribute")) {
        const updatedAttributes = { ...item.attributes };
        updatedAttributes[attribute] = "";
        setItem({ ...item, attributes: updatedAttributes });
      }
      setQueryHandled(true);
    }
  }, [item, queryHandled, setQueryHandled, attribute]);

  const onItemSaved = (result) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result));
    }
  };

  const validate = () =>
    item && item.name && item.email && (item.id || item.password);
  return (
    <EditItemView
      endpoint="users"
      item={item}
      setItem={setItem}
      defaultItem={admin ? { deviceLimit: -1 } : {}}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUser"]}
    >
      {item && (
        <>
          <Accordion defaultExpanded={!attribute}>
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
                value={item.email || ""}
                onChange={(event) =>
                  setItem({ ...item, email: event.target.value })
                }
                label={t("userEmail")}
                disabled={fixedEmail}
              />
              {!openIdForced && (
                <TextField
                  type="password"
                  onChange={(event) =>
                    setItem({ ...item, password: event.target.value })
                  }
                  label={t("userPassword")}
                />
              )}
            </AccordionDetails>
          </Accordion>
          <div className={classes.details} style={{ paddingLeft: "16px", paddingRight: "16px" }}>
            <TextField
              value={item.url || ""}
              onChange={(event) =>
                setItem({ ...item, url: event.target.value })
              }
              label={`URL`}
            />
          </div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <SettingsSuggestIcon sx={{ marginRight: 1 }} />
                {t("sharedPreferences")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.phone || ""}
                onChange={(event) =>
                  setItem({ ...item, phone: event.target.value })
                }
                label={t("sharedPhone")}
              />
              <FormControl>
                <InputLabel>{t("mapDefault")}</InputLabel>
                <Select
                  label={t("mapDefault")}
                  value={item.map || "locationIqStreets"}
                  onChange={(e) => setItem({ ...item, map: e.target.value })}
                >
                  {mapStyles
                    .filter((style) => style.available)
                    .map((style) => (
                      <MenuItem key={style.id} value={style.id}>
                        <Typography component="span">{style.title}</Typography>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t("settingsCoordinateFormat")}</InputLabel>
                <Select
                  label={t("settingsCoordinateFormat")}
                  value={item.coordinateFormat || "dd"}
                  onChange={(event) =>
                    setItem({ ...item, coordinateFormat: event.target.value })
                  }
                >
                  <MenuItem value="dd">{t("sharedDecimalDegrees")}</MenuItem>
                  <MenuItem value="ddm">
                    {t("sharedDegreesDecimalMinutes")}
                  </MenuItem>
                  <MenuItem value="dms">
                    {t("sharedDegreesMinutesSeconds")}
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t("settingsSpeedUnit")}</InputLabel>
                <Select
                  label={t("settingsSpeedUnit")}
                  value={(item.attributes && item.attributes.speedUnit) || "kn"}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: {
                        ...item.attributes,
                        speedUnit: e.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="kn">{t("sharedKn")}</MenuItem>
                  <MenuItem value="kmh">{t("sharedKmh")}</MenuItem>
                  <MenuItem value="mph">{t("sharedMph")}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t("settingsDistanceUnit")}</InputLabel>
                <Select
                  label={t("settingsDistanceUnit")}
                  value={
                    (item.attributes && item.attributes.distanceUnit) || "km"
                  }
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: {
                        ...item.attributes,
                        distanceUnit: e.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="km">{t("sharedKm")}</MenuItem>
                  <MenuItem value="mi">{t("sharedMi")}</MenuItem>
                  <MenuItem value="nmi">{t("sharedNmi")}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t("settingsAltitudeUnit")}</InputLabel>
                <Select
                  label={t("settingsAltitudeUnit")}
                  value={
                    (item.attributes && item.attributes.altitudeUnit) || "m"
                  }
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: {
                        ...item.attributes,
                        altitudeUnit: e.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="m">{t("sharedMeters")}</MenuItem>
                  <MenuItem value="ft">{t("sharedFeet")}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t("settingsVolumeUnit")}</InputLabel>
                <Select
                  label={t("settingsVolumeUnit")}
                  value={
                    (item.attributes && item.attributes.volumeUnit) || "ltr"
                  }
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: {
                        ...item.attributes,
                        volumeUnit: e.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="ltr">{t("sharedLiter")}</MenuItem>
                  <MenuItem value="usGal">{t("sharedUsGallon")}</MenuItem>
                  <MenuItem value="impGal">{t("sharedImpGallon")}</MenuItem>
                </Select>
              </FormControl>
              <SelectField
                value={(item.attributes && item.attributes.timezone) || ""}
                emptyValue=""
                onChange={(e) =>
                  setItem({
                    ...item,
                    attributes: {
                      ...item.attributes,
                      timezone: e.target.value,
                    },
                  })
                }
                endpoint="/api/server/timezones"
                keyGetter={(it) => it}
                titleGetter={(it) => it}
                label={t("sharedTimezone")}
              />
              <TextField
                value={item.poiLayer || ""}
                onChange={(event) =>
                  setItem({ ...item, poiLayer: event.target.value })
                }
                label={t("mapPoiLayer")}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.twelveHourFormat}
                      onChange={(event) =>
                        setItem({
                          ...item,
                          twelveHourFormat: event.target.checked,
                        })
                      }
                    />
                  }
                  label={t("settingsTwelveHourFormat")}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <PersonIcon sx={{ marginRight: 1 }} />
                {t("sharedInfoUser")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.whatsApp || ""}
                onChange={(event) =>
                  setItem({ ...item, whatsApp: event.target.value })
                }
                label={t("sharedWhatsApp")}
                placeholder="Ex: 5513996200166"
              />
              <TextField
                value={item.company || ""}
                onChange={(event) =>
                  setItem({ ...item, company: event.target.value })
                }
                label={t("sharedCompany")}
              />
              <TextField
                value={item.rg || ""}
                onChange={(event) =>
                  setItem({ ...item, rg: event.target.value })
                }
                label={t("sharedRg")}
              />
              <FormControl>
                <InputLabel>{t("sharedTypeDocument")}</InputLabel>
                <Select
                  label={t("sharedTypeDocument")}
                  value={item.documentType || ""}
                  onChange={(event) =>
                    setItem({ ...item, documentType: event.target.value })
                  }
                >
                  <MenuItem value="cnh">{t("sharedTypeCnh")}</MenuItem>
                  <MenuItem value="carteiraDeIdentidade">
                    {t("sharedTypeIdentityCard")}
                  </MenuItem>
                  <MenuItem value="passaporte">
                    {t("sharedTypePassaport")}
                  </MenuItem>
                  <MenuItem value="carteiraDeTrabalho">
                    {t("sharedTypeWorkCard")}
                  </MenuItem>
                  <MenuItem value="tituloEleitor">
                    {t("sharedTypeVoterIdCard")}
                  </MenuItem>
                  <MenuItem value="certificadoMilitar">
                    {t("sharedTypeMilitaryCertificate")}
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                value={item.cpf || ""}
                onChange={(event) =>
                  setItem({ ...item, cpf: event.target.value })
                }
                label={t("sharedCpf")}
              />
              <TextField
                value={item.motherName || ""}
                onChange={(event) =>
                  setItem({ ...item, motherName: event.target.value })
                }
                label={t("sharedMotherName")}
              />
              <TextField
                value={item.fatherName || ""}
                onChange={(event) =>
                  setItem({ ...item, fatherName: event.target.value })
                }
                label={t("sharedFatherName")}
              />
              <TextField
                value={item.stateRegistration || ""}
                onChange={(event) =>
                  setItem({ ...item, stateRegistration: event.target.value })
                }
                label={t("sharedStateRegistration")}
              />
              <TextField
                value={item.municipalRegistration || ""}
                onChange={(event) =>
                  setItem({
                    ...item,
                    municipalRegistration: event.target.value,
                  })
                }
                label={t("sharedMunicipalRegistration")}
              />
              <TextField
                value={item.address || ""}
                onChange={(event) =>
                  setItem({ ...item, address: event.target.value })
                }
                label={t("sharedAddress")}
              />
              <TextField
                value={item.addressNumber || ""}
                onChange={(event) =>
                  setItem({ ...item, addressNumber: event.target.value })
                }
                label={t("sharedAddressNumber")}
              />
              <TextField
                value={item.complement || ""}
                onChange={(event) =>
                  setItem({ ...item, complement: event.target.value })
                }
                label={t("sharedComplement")}
              />
              <TextField
                value={item.postalCode || ""}
                onChange={(event) =>
                  setItem({ ...item, postalCode: event.target.value })
                }
                label={t("sharedPostalCode")}
              />
              <TextField
                value={item.province || ""}
                onChange={(event) =>
                  setItem({ ...item, province: event.target.value })
                }
                label={t("sharedProvince")}
              />
              <TextField
                value={item.city || ""}
                onChange={(event) =>
                  setItem({ ...item, city: event.target.value })
                }
                label={t("sharedCity")}
              />
              <TextField
                value={item.state || ""}
                onChange={(event) =>
                  setItem({ ...item, state: event.target.value })
                }
                label={t("sharedUf")}
              />
              <TextField
                value={item.sex || ""}
                onChange={(event) =>
                  setItem({ ...item, sex: event.target.value })
                }
                label={t("sharedSex")}
              />
              <TextField
                value={item.contactName || ""}
                onChange={(event) =>
                  setItem({ ...item, contactName: event.target.value })
                }
                label={t("sharedContactName")}
              />
              <TextField
                value={item.contactPhone || ""}
                onChange={(event) =>
                  setItem({ ...item, contactPhone: event.target.value })
                }
                label={t("sharedContactPhone")}
              />
              <TextField
                value={item.kinship || ""}
                onChange={(event) =>
                  setItem({ ...item, kinship: event.target.value })
                }
                label={t("sharedKinship")}
              />
              <TextField
                value={item.invoiceDate || ""}
                onChange={(event) =>
                  setItem({ ...item, invoiceDate: event.target.value })
                }
                label={t("userInvoiceDate")}
              />
              <FormControl>
                <InputLabel>{t("userCoin")}</InputLabel>
                <Select
                  label={t("userCoin")}
                  value={item?.coin}
                  onChange={(event) =>
                    setItem({
                      ...item,
                      coin: event.target?.value,
                    })
                  }
                // defaultValue="" // Adicione esta linha para definir o valor padrão
                >
                  <MenuItem value="">{t("userCoin")}</MenuItem>
                  <MenuItem value="R$">{t("userCoinTypeR$")}</MenuItem>
                  <MenuItem value="USD">{t("userCoinTypeUSD")}</MenuItem>
                  <MenuItem value="EUR">{t("userCoinTypeEUR")}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                value={item.amount || ""}
                onChange={(event) =>
                  setItem({ ...item, amount: event.target.value })
                }
                label={t("userAmountInvoice")}
              />
              <TextField
                label={t("sharedDateOfBirth")}
                type="date"
                value={
                  (item.dateOfBirth &&
                    moment(item.dateOfBirth)
                      .locale("en")
                      .format(moment.HTML5_FMT.DATE)) ||
                  "2000-01-01"
                }
                onChange={(e) =>
                  setItem({
                    ...item,
                    dateOfBirth: moment(e.target.value, moment.HTML5_FMT.DATE)
                      .locale("en")
                      .format(),
                  })
                }
              />
              <TextField
                value={item.userComments || ""}
                onChange={(event) =>
                  setItem({ ...item, userComments: event.target.value })
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
                <LocationOnIcon sx={{ marginRight: 1 }} />
                {t("sharedLocation")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                type="number"
                value={item.latitude || 0}
                onChange={(event) =>
                  setItem({ ...item, latitude: Number(event.target.value) })
                }
                label={t("positionLatitude")}
              />
              <TextField
                type="number"
                value={item.longitude || 0}
                onChange={(event) =>
                  setItem({ ...item, longitude: Number(event.target.value) })
                }
                label={t("positionLongitude")}
              />
              <TextField
                type="number"
                value={item.zoom || 0}
                onChange={(event) =>
                  setItem({ ...item, zoom: Number(event.target.value) })
                }
                label={t("serverZoom")}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  const { lng, lat } = map.getCenter();
                  setItem({
                    ...item,
                    latitude: Number(lat.toFixed(6)),
                    longitude: Number(lng.toFixed(6)),
                    zoom: Number(map.getZoom().toFixed(1)),
                  });
                }}
              >
                {t("mapCurrentLocation")}
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <SecurityIcon sx={{ marginRight: 1 }} />
                {t("sharedPermissions")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
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
                disabled={!manager}
              />
              <TextField
                type="number"
                value={item.deviceLimit || 1}
                onChange={(e) =>
                  setItem({ ...item, deviceLimit: Number(e.target.value) })
                }
                label={t("userDeviceLimit")}
                disabled={!admin}
              />
              <TextField
                type="number"
                value={item.userLimit || 1}
                onChange={(e) =>
                  setItem({ ...item, userLimit: Number(e.target.value) })
                }
                label={t("userUserLimit")}
                disabled={!admin}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.disabled}
                      onChange={(e) =>
                        setItem({ ...item, disabled: e.target.checked })
                      }
                    />
                  }
                  label={t("sharedDisabled")}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.administrator}
                      onChange={(e) =>
                        setItem({ ...item, administrator: e.target.checked })
                      }
                    />
                  }
                  label={t("userAdmin")}
                  disabled={!admin}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.readonly}
                      onChange={(e) =>
                        setItem({ ...item, readonly: e.target.checked })
                      }
                    />
                  }
                  label={t("serverReadonly")}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.deviceReadonly}
                      onChange={(e) =>
                        setItem({ ...item, deviceReadonly: e.target.checked })
                      }
                    />
                  }
                  label={t("userDeviceReadonly")}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.limitCommands}
                      onChange={(e) =>
                        setItem({ ...item, limitCommands: e.target.checked })
                      }
                    />
                  }
                  label={t("userLimitCommands")}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.disableReports}
                      onChange={(e) =>
                        setItem({ ...item, disableReports: e.target.checked })
                      }
                    />
                  }
                  label={t("userDisableReports")}
                  disabled={!manager}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.fixedEmail}
                      onChange={(e) =>
                        setItem({ ...item, fixedEmail: e.target.checked })
                      }
                    />
                  }
                  label={t("userFixedEmail")}
                  disabled={!manager}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          {!admin && manager && item.id && (
            <>
              {(
                (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant="subtitle1"
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                        {t("attributeUserImage")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                      <DropzoneArea
                        dropzoneText={t("sharedDropzoneText")}
                        filesLimit={1}
                        onChange={handleFiles}
                        showAlerts={false}
                      />
                    </AccordionDetails>
                  </Accordion>
                )
              )}

            </>
          )}
          {admin && manager && item.id && (
            <>
              {(
                (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant="subtitle1"
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                        {t("attributeUserImage")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                      <DropzoneArea
                        dropzoneText={t("sharedDropzoneText")}
                        filesLimit={1}
                        onChange={handleFiles}
                        showAlerts={false}
                      />
                    </AccordionDetails>
                  </Accordion>
                )
              )}

            </>
          )}
          {/* {manager && (
            <>
              {admin && (
                item?.id && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant="subtitle1"
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                        {t("attributeUserImage")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                      <DropzoneArea
                        dropzoneText={t("sharedDropzoneText")}
                        filesLimit={1}
                        onChange={handleFiles}
                        showAlerts={false}
                      />
                    </AccordionDetails>
                  </Accordion>
                )
              )}

            </>
          )} */}

          <EditAttributesAccordion
            attribute={attribute}
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonUserAttributes, ...userAttributes }}
            focusAttribute={attribute}
          />
          {registrationEnabled && item.id === currentUser.id && !manager && item.userLimit < 0 && item.deviceLimit < 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="error">
                  {t("userDeleteAccount")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={deleteEmail}
                  onChange={(event) => setDeleteEmail(event.target.value)}
                  label={t("userEmail")}
                  error={deleteFailed}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                >
                  {t("userDeleteAccount")}
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </EditItemView>
  );
};

export default UserPage;
