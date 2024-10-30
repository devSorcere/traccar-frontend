import React, { useEffect, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { makeStyles } from '@mui/styles';
import { useAttributePreference } from '../common/util/preferences';
import { map } from './core/MapView';

const useStyles = makeStyles(() => ({
  customControl: {
    /* Personalize o estilo do controle */
    color: '#000',
    backgroundColor: '#fff',
    minWidth: 80,
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 5,
    /* Posicione o controle no canto inferior direito */
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
}));

const MapScale = () => {
  const classes = useStyles();
  const distanceUnit = useAttributePreference('distanceUnit');

  const control = useMemo(() => new maplibregl.ScaleControl(), []);

  useEffect(() => {
    // Certifique-se de que o mapa esteja inicializado antes de adicionar o controle
    if (map && map.loaded()) {
      // Defina as opções do controle
      const options = {
        maxWidth: 150, // Largura máxima do controle
        unit: distanceUnit === 'mi' ? 'imperial' : distanceUnit === 'nmi' ? 'nautical' : 'metric',
      };
      map.addControl(control, options);
    }
  }, [control, distanceUnit]);

  // Renderize o controle com a classe de estilo personalizado
  return (
    <div className={classes.customControl}>
      {distanceUnit}
    </div>
  );
};

export default MapScale;
