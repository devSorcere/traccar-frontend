import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  /* ADICIONADO NUMERO DO WHATSAPP COMO ATTRIBUTO NO SERVER */
  whatsAppNumberButtom: {
    name: t('serverNumberWhatsAppButtom'),
    type: 'string',
  },
  /* ADICIONADO MESSAGEM DO WHATSAPP COMO ATTRIBUTO NO SERVER */
  whatsAppMessageButtom: {
    name: t('serverMessageWhatsAppButtom'),
    type: 'string',
  },
  whatsAppServerInvoiceURL: {
    name: t('serverMessageWhatsAppInvoiceURL'),
    type: 'string',
  },
  whatsAppServerInvoiceCOMPANY: {
    name: t('whatsAppServerInvoiceCOMPANY'),
    type: 'string',
  },
  whatsAppServerInvoiceMSG: {
    name: t('serverMessageWhatsAppInvoiceMSG'),
    type: 'string',
  },
  whatsAppServerInvoicePIX: {
    name: t('serverMessageWhatsAppInvoicePIX'),
    type: 'string',
  },
  whatsAppServerInvoiceBANK: {
    name: t('serverMessageWhatsAppInvoiceBANK'),
    type: 'string',
  },
  attributeWaterMark: {
    name: t('attributeWaterMark'),
    type: 'string',
  },
  /*   title: {
      name: t('serverName'),
      type: 'string',
    },
    description: {
      name: t('serverDescription'),
      type: 'string',
    },
    logo: {
      name: t('serverLogo'),
      type: 'string',
    },
    logoInverted: {
      name: t('serverLogoInverted'),
      type: 'string',
    },
    colorPrimary: {
      name: t('serverColorPrimary'),
      type: 'string',
      subtype: 'color',
    },
    colorSecondary: {
      name: t('serverColorSecondary'),
      type: 'string',
      subtype: 'color',
    },
    disableChange: {
      name: t('serverChangeDisable'),
      type: 'boolean',
    },
    'ui.disableLoginLanguage': {
      name: t('attributeUiDisableLoginLanguage'),
      type: 'boolean',
    }, 
  darkMode: {
    name: t('settingsDarkMode'),
    type: 'boolean',
  },*/
}), [t]);
