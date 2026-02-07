import React from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const DropdownMenu = ({
  isAdmin,
  onEdit,
  onCopy,
  onSetDefault,
  onDelete,
  productCount
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDeleteDisabled = productCount > 0;

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
        {!isAdmin && <MenuItem onClick={() => { handleClose(); onEdit(); }}>Edit Template</MenuItem>}
        <MenuItem onClick={() => { handleClose(); onCopy(); }}>Copy to a New Template</MenuItem>
        {!isAdmin && <MenuItem onClick={() => { handleClose(); onSetDefault(); }}>Set as Default Template</MenuItem>}
        {!isAdmin && (
          <Tooltip
            title={isDeleteDisabled ? `This shipping template is used in ${productCount} products. You cannot delete it.` : ""}
            placement="left"
          >
            <span>
              <MenuItem
                onClick={() => {
                  handleClose();
                  if (!isDeleteDisabled) {
                    onDelete();
                  }
                }}
                disabled={isDeleteDisabled}
                style={isDeleteDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                Delete
              </MenuItem>
            </span>
          </Tooltip>
        )}
      </Menu>
    </div>
  );
};

export default DropdownMenu;
