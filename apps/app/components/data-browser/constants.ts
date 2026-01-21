/**
 * Shared constants for DataGrid layout dimensions.
 * Used by both the actual grid and skeleton loading states.
 */

// Cell dimensions
export const CELL_HEIGHT = 40; // h-10 = 2.5rem = 40px
export const CELL_PADDING_X = 12; // px-3 = 0.75rem = 12px
export const CELL_PADDING_Y = 8; // py-2 = 0.5rem = 8px
export const CELL_MAX_WIDTH = 300; // max-w-[300px]

// Row number column
export const ROW_NUMBER_WIDTH = 48; // w-12 = 3rem = 48px

// Header dimensions
export const HEADER_PADDING_X = 12; // px-3
export const HEADER_PADDING_Y = 8; // py-2

// Skeleton loading
export const SKELETON_ROWS = 10;
export const SKELETON_TEXT_HEIGHT = 16; // h-4 = 1rem = 16px

// Tailwind class equivalents for reference
export const CELL_CLASSES = {
  height: 'h-10',
  paddingX: 'px-3',
  paddingY: 'py-2',
  maxWidth: 'max-w-[300px]',
} as const;

export const ROW_NUMBER_CLASSES = {
  width: 'w-12',
  paddingX: 'px-3',
  paddingY: 'py-2',
} as const;

/**
 * Estimate skeleton width (in pixels) based on column type.
 * Returns a realistic width for the skeleton based on typical content.
 */
export function getSkeletonWidthForType(
  type: string,
  maxLength: number | null,
): number {
  const normalizedType = type.toLowerCase();

  // Boolean types - very short (true/false)
  if (normalizedType === 'boolean' || normalizedType === 'bool') {
    return 40;
  }

  // UUID - always 36 characters
  if (normalizedType === 'uuid') {
    return 220;
  }

  // Small integers
  if (
    normalizedType === 'smallint' ||
    normalizedType === 'int2' ||
    normalizedType === 'smallserial'
  ) {
    return 50;
  }

  // Regular integers
  if (
    normalizedType === 'integer' ||
    normalizedType === 'int' ||
    normalizedType === 'int4' ||
    normalizedType === 'serial'
  ) {
    return 70;
  }

  // Big integers
  if (
    normalizedType === 'bigint' ||
    normalizedType === 'int8' ||
    normalizedType === 'bigserial'
  ) {
    return 100;
  }

  // Decimal/Numeric - depends on precision but typically medium
  if (
    normalizedType.startsWith('numeric') ||
    normalizedType.startsWith('decimal') ||
    normalizedType === 'real' ||
    normalizedType === 'float4' ||
    normalizedType === 'double precision' ||
    normalizedType === 'float8' ||
    normalizedType === 'money'
  ) {
    return 90;
  }

  // Date/Time types
  if (normalizedType === 'date') {
    return 85; // YYYY-MM-DD
  }
  if (normalizedType === 'time' || normalizedType.startsWith('time ')) {
    return 70; // HH:MM:SS
  }
  if (
    normalizedType === 'timestamp' ||
    normalizedType.startsWith('timestamp')
  ) {
    return 150; // YYYY-MM-DD HH:MM:SS
  }
  if (normalizedType === 'interval') {
    return 100;
  }

  // Character types - use maxLength if available
  if (
    normalizedType === 'char' ||
    normalizedType === 'character' ||
    normalizedType === 'bpchar'
  ) {
    if (maxLength && maxLength <= 10) return 60;
    if (maxLength && maxLength <= 50) return 120;
    return 150;
  }

  if (
    normalizedType === 'varchar' ||
    normalizedType === 'character varying' ||
    normalizedType === 'text'
  ) {
    if (maxLength && maxLength <= 20) return 100;
    if (maxLength && maxLength <= 100) return 160;
    return 200; // Longer text, will be truncated anyway
  }

  // JSON types - typically medium to long
  if (normalizedType === 'json' || normalizedType === 'jsonb') {
    return 180;
  }

  // Array types
  if (normalizedType.endsWith('[]') || normalizedType.startsWith('_')) {
    return 150;
  }

  // Enum types - typically short
  if (normalizedType.startsWith('enum')) {
    return 80;
  }

  // Network types
  if (
    normalizedType === 'inet' ||
    normalizedType === 'cidr' ||
    normalizedType === 'macaddr'
  ) {
    return 120;
  }

  // Default fallback - medium width
  return 120;
}

/**
 * Get skeleton width as a percentage (0-100) for use in table cells.
 * Adds some variation based on row index for visual interest.
 */
export function getSkeletonWidthPercent(
  type: string,
  maxLength: number | null,
  rowIndex: number,
): number {
  const baseWidth = getSkeletonWidthForType(type, maxLength);
  // Convert to percentage of max cell width, with some variation per row
  const basePercent = Math.min((baseWidth / CELL_MAX_WIDTH) * 100, 95);
  // Add ±10% variation based on row index
  const variation = ((rowIndex * 7) % 21) - 10;
  return Math.max(30, Math.min(95, basePercent + variation));
}
