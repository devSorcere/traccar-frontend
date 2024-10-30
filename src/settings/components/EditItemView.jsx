import React from "react";
import { useCatch, useEffectAsync } from "../../reactHelper";
import { useTranslation } from "../../common/components/LocalizationProvider";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../common/components/PageLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Typography,
  TextField,
} from "@mui/material";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    width: "100%",
    minWidth: "70%",
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-evenly",
    "& > *": {
      flexBasis: "33%",
    },
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
}));

const EditItemView = ({
  children,
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const t = useTranslation();

  const { id } = useParams();

  useEffectAsync(async () => {
    if (!item) {
      if (id) {
        const response = await fetch(`/api/${endpoint}/${id}`);
        if (response.ok) {
          setItem(await response.json());
        } else {
          throw Error(await response.text());
        }
      } else {
        setItem(defaultItem || {});
      }
    }
  }, [id, item, defaultItem]);

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }
    /* VERIFICA SE O CAMPO PLACA TEM MAIS DE 10 CARACTERES */
    if (item?.plate?.length > 10) {
      toast.error("O campo Placa é no máximo 10 caractéres!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    const response = await fetch(url, {
      method: !id ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      if (onItemSaved) {
        onItemSaved(await response.json());
      }
      navigate(-1);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <>
      <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
        <Container maxWidth="xs" className={classes.container}>
          {item ? (
            children
          ) : (
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography variant="subtitle1">
                  <Skeleton width="10em" />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={-i} width="100%">
                    <TextField />
                  </Skeleton>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
          <div className={classes.buttons}>
            <Button
              type="button"
              color="primary"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={!item}
            >
              {t("sharedCancel")}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={!item || !validate()}
            >
              {t("sharedSave")}
            </Button>
          </div>
          <ToastContainer />
        </Container>
      </PageLayout>
    </>
  );
};

export default EditItemView;
