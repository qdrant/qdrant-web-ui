import { styled } from '@mui/material/styles';
import { alpha, Table, TableBody, TableHead } from '@mui/material';

const SPACING = '16px';

/**
 * @description
 * This component is a styled version of MUI Table component.
 * It has a gap between rows.
 *
 * @example
 *
 * import { TableWithGaps, TableHeadWithGaps, TableBodyWithGaps } from "./TableWithGaps";
 *
 * <TableWithGaps>
 *   <TableHeadWithGaps>
 *     <TableRow>
 *       <TableCell>...</TableCell>
 *       <TableCell>...</TableCell>
 *     </TableRow>
 *   </TableHeadWithGaps>
 *   <TableBodyWithGaps>
 *     <TableRow>
 *       <TableCell>...</TableCell>
 *       <TableCell>...</TableCell>
 *     </TableRow>
 *   </TableBodyWithGaps>
 * </TableWithGaps>
 *
 * @typedef {import("@mui/material").Theme} Theme
 * @type {StyledComponent<PropsOf<OverridableComponent<TableTypeMap>> & MUIStyledCommonProps<Theme>, {}, {}>}
 */
export const TableWithGaps = styled(Table)`
  min-width: 650px;
  border-spacing: 0 ${SPACING};
  border-collapse: separate;
`;

/**
 * @description
 * This component is a styled version of MUI TableHead component.
 * Use it inside TableWithGaps component.
 * @typedef {import("@mui/material").Theme} Theme
 * @type {StyledComponent<PropsOf<OverridableComponent<TableHeadTypeMap>> & MUIStyledCommonProps<Theme>, {}, {}>}
 */
export const TableHeadWithGaps = styled(TableHead)(
  ({ theme }) => `
  border-spacing: 0 ${SPACING};
  border-collapse: separate;
  & th {
    background-color: ${alpha(theme.palette.primary.main, 0.05)};
    border-bottom: 0;
    &:first-of-type {
      border-top-left-radius: ${theme.shape.borderRadius}px;
      border-bottom-left-radius: ${theme.shape.borderRadius}px;
    }
    &:last-of-type {
      border-top-right-radius: ${theme.shape.borderRadius}px;
      border-bottom-right-radius: ${theme.shape.borderRadius}px;
    }
  }
`
);

/**
 * @description
 * This component is a styled version of MUI TableBody component.
 * Use it inside TableWithGaps component.
 * @typedef {import("@mui/material").Theme} Theme
 * @type {StyledComponent<PropsOf<OverridableComponent<TableBodyTypeMap>> & MUIStyledCommonProps<Theme>, {}, {}>}
 */
export const TableBodyWithGaps = styled(TableBody)(({ theme }) => {
  const borderStyle = theme.palette.mode === 'dark' ? 0 : theme.palette.divider + ' solid 1px';
  return `
  border-spacing: 0 ${SPACING};
  border-collapse: separate;
  & tr {
    background-image: ${
      theme.palette.mode === 'dark' ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))' : 'none'
    };
  }
  & td {
    border-bottom: none;
    border-top: ${borderStyle};
    border-bottom: ${borderStyle};
    &:first-of-type {
      border-top-left-radius: ${theme.shape.borderRadius}px;
      border-bottom-left-radius: ${theme.shape.borderRadius}px;
      border-left: ${borderStyle};
    }
    &:last-of-type {
      border-top-right-radius: ${theme.shape.borderRadius}px;
      border-bottom-right-radius: ${theme.shape.borderRadius}px;
      border-right: ${borderStyle};
    }
  }
`;
});
