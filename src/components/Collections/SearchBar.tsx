import SearchIcon from "@mui/icons-material/Search";

import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";

type InputWithIconProps = {
  value: string;
  setValue: (value: string) => void;
};

export function SearchBar({ value, setValue }: InputWithIconProps) {
  return (
    <Card sx={{ p: 2 }} elevation={2}>
      <OutlinedInput
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Collection"
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        }
        sx={{ maxWidth: 500 }}
      />
    </Card>
  );
}
