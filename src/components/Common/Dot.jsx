import { styled } from "@mui/material/styles";

/**
 * Status indicator dot.
 * @type {StyledComponent<MUIStyledCommonProps<Theme>, JSX.IntrinsicElements[string], {}>}
 */
export const Dot = styled("div")(
  ({ color }) => {
    return `
  border-radius: 50%;
  background-color: ${color};
  width: 10px;
  height: 10px;
  display: inline-block;
`;
  },
);