import React from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const DropdownMenu = ({ onEdit, onCopy, onSetDefault, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-controls="dropdown-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); onEdit(); }}>Edit Template</MenuItem>
        <MenuItem onClick={() => { handleClose(); onCopy(); }}>Copy to a New Template</MenuItem>
        <MenuItem onClick={() => { handleClose(); onSetDefault(); }}>Set as Default Template</MenuItem>
        <MenuItem onClick={() => { handleClose(); onDelete(); }}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default DropdownMenu;
