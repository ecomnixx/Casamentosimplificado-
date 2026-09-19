// Utility to generate valid Banco Central BRCode (Pix EMV payload) with CRC16
export function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload({
  key,
  name = 'CasamentoFacilitado',
  city = 'SAO PAULO',
  amount = 9.99,
  txid = '***',
}: {
  key: string;
  name?: string;
  city?: string;
  amount?: number;
  txid?: string;
}): string {
  // Format string fields
  const cleanKey = key.trim();
  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '';

  const formatField = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Merchant Account Info (tag 26)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const tag26 = formatField('26', `${gui}${keyField}`);

  // Merchant Category Code (tag 52)
  const tag52 = formatField('52', '0000');

  // Currency (tag 53) - 986 is BRL
  const tag53 = formatField('53', '986');

  // Amount (tag 54)
  const tag54 = formattedAmount ? formatField('54', formattedAmount) : '';

  // Country Code (tag 58)
  const tag58 = formatField('58', 'BR');

  // Merchant Name (tag 59)
  const tag59 = formatField('59', cleanName);

  // Merchant City (tag 60)
  const tag60 = formatField('60', cleanCity);

  // Additional Data (tag 62)
  const tag05 = formatField('05', txid);
  const tag62 = formatField('62', tag05);

  const payloadWithoutCRC = `000201${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;
  const crc = calculateCRC16(payloadWithoutCRC);

  return `${payloadWithoutCRC}${crc}`;
}
