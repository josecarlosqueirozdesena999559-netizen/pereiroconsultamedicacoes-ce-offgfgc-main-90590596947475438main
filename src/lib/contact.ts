export const INFO_CONTACT_TEXT = 'Para mais informa\u00e7\u00f5es, fale conosco: 88 9904-6208';

export const formatContactInfo = (contact?: string | null) =>
  contact ? `${contact} - ${INFO_CONTACT_TEXT}` : INFO_CONTACT_TEXT;