import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditItemView from "./components/EditItemView";
import EditAttributesAccordion from "./components/EditAttributesAccordion";
import { useTranslation } from "../common/components/LocalizationProvider";
import SettingsMenu from "./components/SettingsMenu";
import { DropzoneArea } from "react-mui-dropzone";
import { useCatch } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DriverPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.name && item.uniqueId;

  /* ADICONA IMAGEM DO MOTORISTA */
  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/drivers/${item.id}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            driverImage: await response.text(),
          },
        });
      } else {
        throw Error(await response.text());
      }
    }
  });

  return (
    <EditItemView
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedDriver"]}
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
              />
            </AccordionDetails>
          </Accordion>

          {item?.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <AddPhotoAlternateIcon sx={{ marginRight: 1 }} />
                  {t("attributeDriverImage")}
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
            definitions={{}}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DriverPage;
