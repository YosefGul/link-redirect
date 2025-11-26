import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
  margin?: number;
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  size: 300,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  margin: 1,
};

/**
 * Generate QR code as data URL (PNG)
 */
export async function generateQRCode(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: opts.size,
      errorCorrectionLevel: opts.errorCorrectionLevel,
      color: opts.color,
      margin: opts.margin,
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width: opts.size,
      errorCorrectionLevel: opts.errorCorrectionLevel,
      color: opts.color,
      margin: opts.margin,
    });
    
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Generate QR code as buffer (for download)
 */
export async function generateQRCodeBuffer(
  url: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const buffer = await QRCode.toBuffer(url, {
      width: opts.size,
      errorCorrectionLevel: opts.errorCorrectionLevel,
      color: opts.color,
      margin: opts.margin,
    });
    
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Generate QR code with custom styling
 */
export async function generateStyledQRCode(
  url: string,
  options: QRCodeOptions & { format?: 'png' | 'svg' } = {}
): Promise<string | Buffer> {
  const { format = 'png', ...qrOptions } = options;
  
  if (format === 'svg') {
    return await generateQRCodeSVG(url, qrOptions);
  }
  
  if (format === 'png') {
    return await generateQRCode(url, qrOptions);
  }
  
  throw new Error('Invalid format. Use "png" or "svg"');
}


