import React, { useState } from 'react';
import moment from 'moment';
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
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DropzoneArea } from 'react-mui-dropzone';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DevicePage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [item, setItem] = useState();

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: files[0],
      });
      if (response.ok) {
        setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
      } else {
        throw Error(await response.text());
      }
    }
  });

  const validate = () => item && item.name && item.uniqueId;

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                helperText={t('deviceIdentifierHelp')}
              />
            </AccordionDetails>
          </Accordion>
          {/* MOD */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedInfo')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>

              <TextField
                value={item.plate || ''}
                onChange={(event) => setItem({ ...item, plate: event.target.value })}
                label={t('sharedPlate')}
              />
              <TextField
                value={item.renavam || ''}
                onChange={(event) => setItem({ ...item, renavam: event.target.value })}
                label={t('sharedRenavam')}
              />
              <TextField
                value={item.yearModel || ''}
                onChange={(event) => setItem({ ...item, yearModel: event.target.value })}
                label={t('sharedYearModel')}
              />
              <TextField
                value={item.brandModelVersion || ''}
                onChange={(event) => setItem({ ...item, brandModelVersion: event.target.value })}
                label={t('sharedBrandModelVersion')}
              />
              <TextField
                value={item.speciesType || ''}
                onChange={(event) => setItem({ ...item, speciesType: event.target.value })}
                label={t('sharedSpeciesType')}
              />
              <TextField
                value={item.predominantColor || ''}
                onChange={(event) => setItem({ ...item, predominantColor: event.target.value })}
                label={t('sharedPredominantColor')}
              />
              <FormControl>
                <InputLabel>{t('sharedFuel')}</InputLabel>
                <Select
                  label={t('sharedFuel')}
                  value={item.fuel || ''}
                  onChange={(event) => setItem({ ...item, fuel: event.target.value })}
                >
                  <MenuItem value="gasolina">{t('fuelGasolina')}</MenuItem>
                  <MenuItem value="flex">{t('fuelFlex')}</MenuItem>
                  <MenuItem value="diesel">{t('fuelDisel')}</MenuItem>
                  <MenuItem value="etanol">{t('fuelEtanol')}</MenuItem>
                  <MenuItem value="gnv">{t('fuelGnv')}</MenuItem>
                </Select>
              </FormControl>
              {/*   <TextField
                value={item.fuel || ''}
                onChange={(event) => setItem({ ...item, fuel: event.target.value })}
                label={t('sharedFuel')}
              /> */}
              <TextField
                value={item.chassis || ''}
                onChange={(event) => setItem({ ...item, chassis: event.target.value })}
                label={t('sharedChassis')}
              />
              <TextField
                value={item.motor || ''}
                onChange={(event) => setItem({ ...item, motor: event.target.value })}
                label={t('sharedMotor')}
              />
              <TextField
                value={item.city || ''}
                onChange={(event) => setItem({ ...item, city: event.target.value })}
                label={t('sharedCity')}
              />
              <TextField
                value={item.uf || ''}
                onChange={(event) => setItem({ ...item, uf: event.target.value })}
                label={t('sharedUf')}
              />
              <TextField
                value={item.comments || ''}
                onChange={(event) => setItem({ ...item, comments: event.target.value })}
                label={t('sharedComments')}
                multiline
                rows={5}
                variant="outlined"
              />

            </AccordionDetails>
          </Accordion>

          <Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('sharedInfoInstall')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  label={t('sharedDateInstall')}
                  type="datetime-local"
                  value={(item.dateInstall && moment(item.dateInstall).locale('en').format(moment.HTML5_FMT.DATETIME_LOCAL))}
                  onChange={(event) => setItem({ ...item, dateInstall: moment(event.target.value, moment.HTML5_FMT.DATETIME_LOCAL).locale('en').format() })}
                />
                <TextField
                  value={item.localInstall || ''}
                  onChange={(event) => setItem({ ...item, localInstall: event.target.value })} /* sharedLocalInstall */
                  label={t('sharedLocalInstall')}
                />
                <TextField
                  value={item.technical || ''}
                  onChange={(event) => setItem({ ...item, technical: event.target.value })} /* sharedTechnical */
                  label={t('sharedTechnical')}
                />
              </AccordionDetails>
            </Accordion>
            {/* FIM MOD */}
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId || 0}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
              <TextField
                value={item.phone || ''}
                onChange={(event) => setItem({ ...item, phone: event.target.value })}
                label={t('sharedPhone')}
              />
              <TextField
                value={item.model || ''}
                onChange={(event) => setItem({ ...item, model: event.target.value })}
                label={t('deviceModel')}
              />
              <TextField
                value={item.contact || ''}
                onChange={(event) => setItem({ ...item, contact: event.target.value })}
                label={t('deviceContact')}
              />
              <SelectField
                value={item.category || 'default'}
                emptyValue={null}
                onChange={(event) => setItem({ ...item, category: event.target.value })}
                data={deviceCategories.map((category) => ({
                  id: category,
                  name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                }))}
                label={t('deviceCategory')}
              />
              <SelectField
                value={item.calendarId || 0}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
              <TextField
                label={t('userExpirationTime')}
                type="date"
                value={(item.expirationTime && moment(item.expirationTime).locale('en').format(moment.HTML5_FMT.DATE)) || '2099-01-01'}
                onChange={(e) => setItem({ ...item, expirationTime: moment(e.target.value, moment.HTML5_FMT.DATE).locale('en').format() })}
                disabled={!admin}
              />
              <FormControlLabel
                control={<Checkbox checked={item.disabled} onChange={(event) => setItem({ ...item, disabled: event.target.checked })} />}
                label={t('sharedDisabled')}
                disabled={!admin}
              />
            </AccordionDetails>
          </Accordion>
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('attributeDeviceImage')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <DropzoneArea
                  dropzoneText={t('sharedDropzoneText')}
                  acceptedFiles={['image/*']}
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
  );
};

export default DevicePage;
