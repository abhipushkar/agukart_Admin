// GroupedAutocomplete.jsx
import React, { useState, useRef, forwardRef } from "react";
import {
    Autocomplete,
    TextField,
    Chip,
    Box,
    Typography,
    Menu,
    MenuItem,
    Checkbox,
    IconButton,
    InputAdornment,
    Paper,
    Popper,
} from "@mui/material";
import { ArrowDropDown, CancelRounded, Clear, ArrowRight } from "@mui/icons-material";

// Nested Menu Item Component (similar to your DropdownNestedMenuItem)
const NestedMenuItem = forwardRef((props, ref) => {
    const {
        parentMenuOpen,
        label,
        rightIcon = <ArrowRight style={{ fontSize: 16 }} />,
        keepOpen,
        children,
        customTheme,
        className,
        tabIndex: tabIndexProp,
        ContainerProps: ContainerPropsProp = {},
        rightAnchored,
        onSelectAttribute,
        attribute,
        isSelected,
        ...MenuItemProps
    } = props;

    const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp;

    const menuItemRef = React.useRef(null);
    React.useImperativeHandle(ref, () => menuItemRef.current);

    const containerRef = React.useRef(null);
    React.useImperativeHandle(containerRefProp, () => containerRef.current);

    const menuContainerRef = React.useRef(null);

    const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(false);

    const handleMouseEnter = (event) => {
        setIsSubMenuOpen(true);

        if (ContainerProps?.onMouseEnter) {
            ContainerProps.onMouseEnter(event);
        }
    };

    const handleMouseLeave = (event) => {
        setIsSubMenuOpen(false);

        if (ContainerProps?.onMouseLeave) {
            ContainerProps.onMouseLeave(event);
        }
    };

    const isSubmenuFocused = () => {
        const active = containerRef.current?.ownerDocument?.activeElement;

        for (const child of menuContainerRef.current?.children ?? []) {
            if (child === active) {
                return true;
            }
        }
        return false;
    };

    const handleFocus = (event) => {
        if (event.target === containerRef.current) {
            setIsSubMenuOpen(true);
        }

        if (ContainerProps?.onFocus) {
            ContainerProps.onFocus(event);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            return;
        }

        if (isSubmenuFocused()) {
            event.stopPropagation();
        }

        const active = containerRef.current?.ownerDocument?.activeElement;

        if (event.key === "ArrowLeft" && isSubmenuFocused()) {
            containerRef.current?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            event.target === containerRef.current &&
            event.target === active
        ) {
            const firstChild = menuContainerRef.current?.children[0];
            firstChild?.focus();
        }
    };

    const open = isSubMenuOpen && parentMenuOpen;

    let tabIndex;
    if (!props.disabled) {
        tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
    }

    return (
        <div
            {...ContainerProps}
            ref={containerRef}
            onFocus={handleFocus}
            tabIndex={tabIndex}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
        >
            <MenuItem
                {...MenuItemProps}
                data-open={!!open || undefined}
                className={className}
                ref={menuItemRef}
                keepOpen={keepOpen}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 220,
                    px: 1.5,
                    py: 1.2,              // 🔥 MORE HEIGHT
                    minHeight: 44,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    }
                }}
            >
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    {label}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {rightIcon}
                </Box>
            </MenuItem>
            <Menu
                hideBackdrop
                style={{ pointerEvents: "none" }}
                anchorEl={menuItemRef.current}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: rightAnchored ? "left" : "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: rightAnchored ? "right" : "left"
                }}
                open={!!open}
                autoFocus={false}
                disableAutoFocus
                disableEnforceFocus
                onClose={() => {
                    setIsSubMenuOpen(false);
                }}
                MenuListProps={{
                    sx: {
                        pointerEvents: "auto",
                        maxHeight: 300,           // 🔥 ADDED
                        overflowY: "auto",        // 🔥 ADDED
                    },
                    ref: menuContainerRef
                }}
                PaperProps={{
                    sx: {
                        maxHeight: 300,           // 🔥 ADDED
                        overflowY: "auto"
                    }
                }}
            >
                <div ref={menuContainerRef} style={{ pointerEvents: "auto" }}>
                    {children}
                </div>
            </Menu>
        </div>
    );
});

// Attribute Menu Item
const AttributeMenuItem = ({ attribute, onSelectAttribute, isSelected }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        onSelectAttribute(attribute);
    };

    return (
        <MenuItem
            onClick={handleClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: 200,
                px: 1,           // 🔥 reduce horizontal padding (8px)
                py: 0.5,         // 🔥 reduce vertical padding (4px)
                minHeight: 32,   // 🔥 compact row height
            }}
        >
            <Typography variant="body2">
                {attribute.name}
                {attribute.type && (
                    <Typography
                        component="span"
                        variant="caption"
                        sx={{
                            ml: 1,
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                        }}
                    >
                        ({attribute.type})
                    </Typography>
                )}
            </Typography>
            <Checkbox
                size="medium"
                checked={isSelected(attribute._id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onSelectAttribute(attribute)}
            />
        </MenuItem>
    );
};

// Dropdown Component (similar to your Dropdown)
const Dropdown = forwardRef(
    ({
        trigger,
        menu,
        keepOpen: keepOpenGlobal,
        isOpen: controlledIsOpen,
        onOpen: onControlledOpen,
        minWidth
    }, ref) => {
        const [isInternalOpen, setInternalOpen] = React.useState(null);

        const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isInternalOpen;

        let anchorRef = React.useRef(null);
        if (ref) {
            anchorRef = ref;
        }

        const handleOpen = (event) => {
            event.stopPropagation();

            if (menu.length) {
                if (onControlledOpen) {
                    onControlledOpen(event.currentTarget);
                } else {
                    setInternalOpen(event.currentTarget);
                }
            }
        };

        const handleClose = (event) => {
            event.stopPropagation();

            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            handleForceClose();
        };

        const handleForceClose = () => {
            if (onControlledOpen) {
                onControlledOpen(null);
            } else {
                setInternalOpen(null);
            }
        };

        const renderMenu = (menuItem, index) => {
            const { keepOpen: keepOpenLocal, ...props } = menuItem.props;

            let extraProps = {};
            if (props.menu) {
                extraProps = {
                    parentMenuOpen: !!isOpen
                };
            }

            return React.createElement(menuItem.type, {
                ...props,
                key: index,
                ...extraProps,
                onClick: (event) => {
                    event.stopPropagation();

                    if (!keepOpenGlobal && !keepOpenLocal) {
                        handleClose(event);
                    }

                    if (menuItem.props.onClick) {
                        menuItem.props.onClick(event);
                    }
                },
                children: props.menu ? React.Children.map(props.menu, renderMenu) : props.children
            });
        };

        return (
            <>
                {React.cloneElement(trigger, {
                    onClick: isOpen ? handleForceClose : handleOpen,
                    ref: anchorRef
                })}

                <Menu
                    PaperProps={{
                        sx: {
                            minWidth: minWidth ?? 0,
                            maxHeight: 400,
                            borderRadius: 2,
                            boxShadow: 3,
                            mt: 1
                        }
                    }} anchorEl={isOpen}
                    open={!!isOpen}
                    onClose={handleClose}
                >
                    {React.Children.map(menu, renderMenu)}
                </Menu>
            </>
        );
    }
);

// Main GroupedAutocomplete Component
const GroupedAutocomplete = ({
    groups = [],
    options = [],
    value = [],
    onChange,
    placeholder = "Select Attributes",
    label = "Attributes",
    limitTags = 4,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textFieldRef = useRef(null);

    // Group options by groupId
    const groupedOptions = React.useMemo(() => {
        const groupsMap = new Map();

        // Initialize groups
        groups.forEach(group => {
            groupsMap.set(group._id, {
                ...group,
                attributes: []
            });
        });

        // Add attributes to their respective groups
        options.forEach(option => {
            const groupId = option.groupId;
            if (groupsMap.has(groupId)) {
                groupsMap.get(groupId).attributes.push(option);
            } else {
                // Handle ungrouped attributes
                if (!groupsMap.has('ungrouped')) {
                    groupsMap.set('ungrouped', {
                        _id: 'ungrouped',
                        name: 'Other Attributes',
                        order: 999,
                        attributes: []
                    });
                }
                groupsMap.get('ungrouped').attributes.push(option);
            }
        });

        // Convert to array and sort by order
        return Array.from(groupsMap.values())
            .filter(group => group.attributes.length > 0)
            .sort((a, b) => (a.order || 999) - (b.order || 999));
    }, [groups, options]);

    const isAttributeSelected = (attributeId) => {
        return value.some(v => v._id === attributeId);
    };

    const handleAttributeToggle = (attribute) => {
        const isSelected = isAttributeSelected(attribute._id);
        let newValue;

        if (isSelected) {
            newValue = value.filter(v => v._id !== attribute._id);
        } else {
            newValue = [...value, attribute];
        }

        onChange(newValue);
    };

    const handleRemoveChip = (attributeId) => {
        const newValue = value.filter(v => v._id !== attributeId);
        onChange(newValue);
    };

    const renderChips = () => {
        return (
            <>{value.length > 0 ? (
                // When dropdown is open OR focused, show all chips
                (dropdownOpen || isFocused) ? (
                    // Show all chips
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                        {value.map((item) => (
                            <Chip
                                key={item._id}
                                label={item.name}
                                size="medium"
                                onDelete={(e) => {
                                    e.stopPropagation();
                                    handleRemoveChip(item._id);
                                }}
                                deleteIcon={<CancelRounded fontSize="small" />}
                            />
                        ))}
                    </Box>
                ) : (
                    // Show truncated chips (first 4 + remaining count)
                    value.length > 4 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                            {value.slice(0, 4).map((item) => (
                                <Chip
                                    key={item._id}
                                    label={item.name}
                                    size="medium"
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        handleRemoveChip(item._id);
                                    }}
                                    deleteIcon={<CancelRounded fontSize="small" />}
                                />
                            ))}
                            <Typography>
                                +{value.length - 4} more
                            </Typography>
                        </Box>
                    ) : (
                        // Show all chips when count is 4 or less
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                            {value.map((item) => (
                                <Chip
                                    key={item._id}
                                    label={item.name}
                                    size="medium"
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        handleRemoveChip(item._id);
                                    }}
                                    deleteIcon={<CancelRounded fontSize="small" />}
                                />
                            ))}
                        </Box>
                    )
                )
            ) : (
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.disabled',
                        ml: 0.5
                    }}
                >
                    {placeholder}
                </Typography>
            )}</>
        )
    };

    const handleSelectAllInGroup = (group) => {
        console.log("handleSelectAllInGroup called", group);
        const groupAttributeIds = group.attributes.map(attr => attr._id);
        const allSelected = group.attributes.every(attr => isAttributeSelected(attr._id));
        console.log("allSelected:", allSelected);
        console.log("Current value:", value);
        console.log("Group attribute IDs:", groupAttributeIds);

        if (allSelected) {
            // Deselect all attributes in this group
            const newValue = value.filter(v => !groupAttributeIds.includes(v._id));
            console.log("Deselecting all, newValue:", newValue);
            onChange(newValue);
        } else {
            // Select all attributes in this group
            const attributesToAdd = group.attributes.filter(attr => !isAttributeSelected(attr._id));
            console.log("Adding attributes:", attributesToAdd);
            console.log("New value:", [...value, ...attributesToAdd]);
            onChange([...value, ...attributesToAdd]);
        }
    };

    const buildMenu = (groupsList) => {
        if (!groupsList?.length) {
            return [];
        }

        return groupsList.map((group) => {
            const attributes = group.attributes || [];

            if (!attributes.length) {
                return null;
            }

            // Check if all attributes in this group are selected
            const allSelected = attributes.length > 0 && attributes.every(attr => isAttributeSelected(attr._id));
            const someSelected = attributes.some(attr => isAttributeSelected(attr._id));

            // Create Select All option - Use Box instead of MenuItem to prevent menu closing
            const selectAllMenuItem = (
                <Box
                    key={`${group._id}-select-all`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllInGroup(group);
                    }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: 200,
                        px: 1,
                        py: 0.5,
                        minHeight: 32,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'action.hover',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.selected',
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            size="medium"
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleSelectAllInGroup(group)}
                        />
                        <Typography variant="body2" fontWeight="medium">
                            {someSelected && !allSelected ? 'Select All' : (allSelected ? 'Unselect All' : 'Select All')}
                        </Typography>
                    </Box>
                </Box>
            );

            // Create nested menu with attributes
            const attributeMenuItems = attributes.map((attribute) => (
                <AttributeMenuItem
                    key={attribute._id}
                    attribute={attribute}
                    onSelectAttribute={handleAttributeToggle}
                    isSelected={isAttributeSelected}
                />
            ));

            return (
                <NestedMenuItem
                    key={group._id}
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                                {group.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ({attributes.length})
                            </Typography>
                        </Box>
                    }
                    rightIcon={<ArrowRight style={{ fontSize: 18 }} />}
                    menu={[selectAllMenuItem, ...attributeMenuItems]}
                >
                    {selectAllMenuItem}
                    {attributeMenuItems}
                </NestedMenuItem>
            );
        }).filter(Boolean);
    };

    const menuItems = buildMenu(groupedOptions);

    // Trigger component
    const trigger = (
        <TextField
            ref={textFieldRef}
            fullWidth
            label={label}
            placeholder={placeholder}
            value=""
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            focused={dropdownOpen}
            InputProps={{
                readOnly: true,

                // 🔥 MAIN CONTENT (NOT using InputAdornment for layout)
                startAdornment: (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1,
                            width: '100%',
                            minHeight: '32px',
                        }}
                    >
                        {renderChips()}
                    </Box>
                ),

                // 🔥 RIGHT SIDE ALWAYS FIXED
                endAdornment: (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            ml: 'auto',          // 🔥 force right
                            gap: 0.5,
                            pl: 1
                        }}
                    >
                        {value.length > 0 && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        )}

                        <IconButton size="small">
                            <ArrowDropDown />
                        </IconButton>
                    </Box>
                ),

                // 🔥 IMPORTANT: keep input alive but invisible
                sx: {
                    alignItems: 'flex-start',

                    '& .MuiInputBase-input': {
                        width: 0,
                        opacity: 0,
                        padding: 0,
                    },
                }
            }}
            sx={{
                "& .MuiInputBase-root": {
                    minHeight: "52px",
                    height: "auto",
                    cursor: "pointer",

                    display: "flex",
                    alignItems: "flex-start",   // 🔥 allows vertical growth
                    flexWrap: "wrap",

                    padding: "6px 8px",
                }
            }}
        />
    );

    return (
        <Dropdown
            trigger={trigger}
            menu={menuItems}
            minWidth={250}
            isOpen={dropdownOpen}
            onOpen={setDropdownOpen}
        />
    );
};

export default GroupedAutocomplete;