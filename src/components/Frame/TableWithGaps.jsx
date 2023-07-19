import { styled } from "@mui/material/styles";
import {
  alpha,
  Table,
  TableBody,
  TableHead,
} from "@mui/material";

const SPACING = '16px';
const BORDER_RADIUS = '8px';

/**
 * @description
 * This component is a styled version of MUI Table component.
 * It has a gap between rows and columns.
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
      border-top-left-radius: ${BORDER_RADIUS};
      border-bottom-left-radius: ${BORDER_RADIUS};
    }
    &:last-of-type {
      border-top-right-radius: ${BORDER_RADIUS};
      border-bottom-right-radius: ${BORDER_RADIUS};
    }
  }
`,
);

/**
 * @description
 * This component is a styled version of MUI TableBody component.
 * Use it inside TableWithGaps component.
 * @typedef {import("@mui/material").Theme} Theme
 * @type {StyledComponent<PropsOf<OverridableComponent<TableBodyTypeMap>> & MUIStyledCommonProps<Theme>, {}, {}>}
 */
export const TableBodyWithGaps = styled(TableBody)(
  ({ theme }) => `
  border-spacing: 0 ${SPACING};
  border-collapse: separate;

  & td {
    border-bottom: none;
    border-top: ${theme.palette.divider} solid 1px;
    border-bottom: ${theme.palette.divider} solid 1px;
    &:first-of-type {
      border-top-left-radius: ${BORDER_RADIUS};
      border-bottom-left-radius: ${BORDER_RADIUS};
      border-left: ${theme.palette.divider} solid 1px;
    }
    &:last-of-type {
      border-top-right-radius: ${BORDER_RADIUS};
      border-bottom-right-radius: ${BORDER_RADIUS};
      border-right: ${theme.palette.divider} solid 1px;
    }
  }
`,
);
