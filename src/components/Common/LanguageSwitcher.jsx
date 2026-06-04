import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip, Menu, MenuItem, Typography, Box } from '@mui/material';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    handleClose();
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <Box>
      <Tooltip title={currentLang.label}>
        <IconButton size="small" onClick={handleClick} sx={{ color: 'text.primary' }}>
          <Languages size={20} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={i18n.language === lang.code}
          >
            <Typography variant="body2">{lang.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
