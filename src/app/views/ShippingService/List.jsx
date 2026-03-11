import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, ListItemText, Menu, MenuItem, TablePagination, TextField } from "@mui/material";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    IconButton,
    Card,
    CircularProgress
} from "@mui/material";
import React from "react";
import Switch from "@mui/material/Switch";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { toast } from "react-toastify";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import debounce from "lodash.debounce";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

const LoadingOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10
});

const StyledCard = styled(Card)(({ isDragging, theme }) => ({
    backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : theme.palette.background.paper,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
    marginBottom: '8px',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)',
    },
    '& .drag-handle': {
        cursor: 'grab',
        opacity: 0.3,
        transition: 'opacity 0.2s ease',
        '&:active': {
            cursor: 'grabbing',
        },
    },
    '&:hover .drag-handle': {
        opacity: 0.7,
    },
}));

// Shared grid template for aligning header and rows exactly like a table
const listGridTemplate = "60px 1.5fr 1.5fr 1fr 1fr 1.5fr";

const ShippingServiceList = () => {
    const label = { inputProps: { "aria-label": "Switch demo" } };
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [page, setPage] = useState(0);
    const [allServices, setAllServices] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [order, setOrder] = useState("none");
    const [orderBy, setOrderBy] = useState(null);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [statusData, setStatusData] = useState({});
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [serviceId, setServiceId] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    const navigate = useNavigate();
    const debounceRef = useRef();

    // Initialize debounce
    useEffect(() => {
        debounceRef.current = debounce((searchValue) => {
            setDebouncedSearch(searchValue);
            setPage(0);
        }, 500);

        return () => {
            debounceRef.current?.cancel();
        };
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        debounceRef.current(value);
    };

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login)
    };

    const handleOpen = (type, msg) => {
        setMsg(typeof msg === "string" ? msg : msg?.message);
        setOpen(true);
        setType(type);

        if (msg?.response?.status === 401) {
            logOut();
        }
    };

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleDelete = async (id) => {
        try {
            const res = await ApiService.delete(`delete-delivery-service/${id}`, auth_key);
            if (res.status === 200) {
                toast.success(res.message);
                setAllServices(prev =>
                    prev.filter(item => item._id !== id)
                );
                setTotalCount(prev => prev - 1);
                setServiceId("");
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const getShippingServiceList = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: page + 1,
                limit: rowsPerPage
            };

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            if (orderBy && order !== "none") {
                params.sortBy = orderBy;
                params.sortOrder = order;
            }

            const res = await ApiService.get("get-delivery-service", auth_key, { params });
            if (res.status === 200) {
                const services = res?.data?.data || [];
                const total = res?.data?.total || services.length;

                const myNewList = services.map((e, i) => {
                    return {
                        id: e._id, // Required for @hello-pangea/dnd
                        ...e,
                        "S.No": (page * rowsPerPage) + i + 1,
                        sortOrder: e.sortOrder || i + 1
                    };
                });
                setAllServices(myNewList);
                setTotalCount(total);
            }
        } catch (error) {
            handleOpen("error", error);
        } finally {
            setLoading(false);
        }
    }, [auth_key, page, rowsPerPage, debouncedSearch, orderBy, order]);

    useEffect(() => {
        getShippingServiceList();
    }, [getShippingServiceList]);

    const handleStatusChange = useCallback(async () => {
        if (statusData) {
            if (statusData.isDefault) {
                handleOpen("error", "Cannot make default service inactive");
                return;
            }
            try {
                const payload = statusData;
                const res = await ApiService.patch(`toggle/${statusData.id}`, payload, auth_key);
                if (res.status === 200) {
                    setAllServices(prev =>
                        prev.map(item =>
                            item._id === statusData.id ? { ...item, isActive: statusData.isActive } : item
                        )
                    );
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, statusData]);

    const handleRequestSort = (property) => {
        let newOrder;
        if (orderBy !== property) {
            newOrder = "asc";
        } else {
            newOrder = order === "asc" ? "desc" : order === "desc" ? "none" : "asc";
        }
        setOrder(newOrder);
        setOrderBy(newOrder === "none" ? null : property);
    };

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedService(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedService(null);
    };

    const handleSetDefault = async () => {
        if (selectedService) {
            try {
                const res = await ApiService.patch(
                    `set-default/${selectedService._id}`,
                    {},
                    auth_key
                );

                if (res.status === 200) {
                    handleOpen("success", { message: `${selectedService.name} set as default successfully` });
                    setAllServices(prev =>
                        prev.map(item => ({
                            ...item,
                            isDefault: item._id === selectedService._id
                        }))
                    );
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            } finally {
                handleMenuClose();
            }
        }
    };

    // Drag and drop handler using @hello-pangea/dnd
    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        // Reorder the list
        const reorderedServices = Array.from(allServices);
        const [removed] = reorderedServices.splice(sourceIndex, 1);
        reorderedServices.splice(destinationIndex, 0, removed);

        // Update sortOrder based on new position
        const updatedServices = reorderedServices.map((service, index) => ({
            ...service,
            sortOrder: index + 1,
            "S.No": index + 1
        }));

        // Update UI immediately
        setAllServices(updatedServices);

        // Call API to update sort order
        try {
            const payload = {
                services: updatedServices.map((service) => ({
                    id: service._id,
                    sortOrder: service.sortOrder
                }))
            };

            const res = await ApiService.post('update-delivery-sort', payload, auth_key);

            if (res.status !== 200) {
                // Revert on error
                getShippingServiceList();
            }
        } catch (error) {
            console.error('Failed to update sort order:', error);
            // Revert on error
            getShippingServiceList();
        }
    };

    return (
        <Container>
            <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Shipping", path: "" }, { name: "Shipping Service List" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    <Box>
                        <TextField
                            size="small"
                            label="Search"
                            onChange={handleSearch}
                            value={search}
                            type="text"
                        />
                    </Box>
                    <Button onClick={() => navigate(ROUTE_CONSTANT.shippingService.add)} variant="contained">
                        Add Shipping Service
                    </Button>
                </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Box
                        sx={{
                            paddingLeft: 2,
                            paddingRight: 2,
                            paddingBottom: 2,
                            minWidth: 800,
                        }}
                    >
                        {loading && (
                            <LoadingOverlay>
                                <CircularProgress />
                            </LoadingOverlay>
                        )}

                        {/* Custom Table Header */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: listGridTemplate,
                                gap: 2,
                                padding: "12px 16px",
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                fontWeight: 600,
                                color: 'text.secondary',
                                mb: 2
                            }}
                        >
                            <Box>Drag</Box>
                            <Box>Service Name</Box>
                            <Box>Title</Box>
                            <Box>Status</Box>
                            <Box></Box>
                            <Box>Action</Box>
                        </Box>

                        <Droppable droppableId="shipping-services">
                            {(provided) => (
                                <Box
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {allServices.length > 0 ? (
                                        allServices.map((row, index) => (
                                            <Draggable
                                                key={row.id || row._id}
                                                draggableId={row.id || row._id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <StyledCard
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        isDragging={snapshot.isDragging}
                                                        elevation={0}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'grid',
                                                                gridTemplateColumns: listGridTemplate,
                                                                gap: 2,
                                                                alignItems: 'center',
                                                                padding: "12px 16px",
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <IconButton
                                                                    className="drag-handle"
                                                                    size="small"
                                                                    {...provided.dragHandleProps}
                                                                    sx={{
                                                                        p: 0.5,
                                                                        '&:active': {
                                                                            cursor: 'grabbing',
                                                                        },
                                                                    }}
                                                                >
                                                                    <DragIndicatorIcon
                                                                        sx={{
                                                                            color: 'text.secondary',
                                                                            fontSize: '1.2rem'
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            </Box>
                                                            <Box sx={{ fontWeight: 500 }}>{row.name}</Box>
                                                            <Box sx={{ color: 'text.secondary' }}>{row.title || ""}</Box>
                                                            <Box>
                                                                <Switch
                                                                    onClick={() => {
                                                                        if (row.isDefault) {
                                                                            handleOpen("error", "Cannot make default service inactive!");
                                                                            return;
                                                                        }
                                                                        handleOpen("serviceStatus", "Are you sure you want to change Delivery Service status?");
                                                                        setStatusData(() => ({ id: row?._id, isActive: !row.isActive }));
                                                                    }}
                                                                    checked={row.isActive}
                                                                    {...label}
                                                                />
                                                            </Box>
                                                            <Box>
                                                                {row.isDefault && (
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        size="small"
                                                                        disableRipple
                                                                        sx={{
                                                                            minWidth: 'auto',
                                                                            px: 1.5,
                                                                            py: 0.5,
                                                                            fontSize: '0.75rem',
                                                                            cursor: 'default',
                                                                            '&:hover': {
                                                                                backgroundColor: 'primary.main',
                                                                                boxShadow: 'none'
                                                                            }
                                                                        }}
                                                                    >
                                                                        Default
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                                        <IconButton
                                                                            onClick={() => navigate(`${ROUTE_CONSTANT.shippingService.add}?id=${row._id}`)}
                                                                            size="small"
                                                                        >
                                                                            <Icon color="primary" fontSize="small">edit</Icon>
                                                                        </IconButton>
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                handleOpen("serviceDelete", `Are you sure you want to delete ${row.name}?`);
                                                                                setServiceId(row._id || row.id);
                                                                            }}
                                                                            color="error"
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                    <IconButton
                                                                        onClick={(e) => handleMenuClick(e, row)}
                                                                        size="small"
                                                                        aria-controls="service-menu"
                                                                        aria-haspopup="true"
                                                                    >
                                                                        <MoreVertIcon fontSize="small" />
                                                                    </IconButton>

                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </StyledCard>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                            No Delivery Services Available
                                        </Box>
                                    )}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </Box>
                </DragDropContext>

                {/* Menu for MoreVertIcon */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: 0.5,
                            minWidth: 180,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    <MenuItem
                        onClick={handleSetDefault}
                        disabled={selectedService?.isDefault}
                        sx={{
                            py: 1,
                            px: 2
                        }}
                    >
                        <ListItemText
                            primary={selectedService?.isDefault ? "Default Service" : "Set as Default"}
                            primaryTypographyProps={{
                                fontSize: '0.9rem',
                                color: selectedService?.isDefault ? 'text.secondary' : 'text.primary'
                            }}
                        />
                    </MenuItem>
                </Menu>

                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <ConfirmModal
                open={open}
                handleClose={handleClose}
                type={type}
                msg={msg}
                handleStatusChange={handleStatusChange}
                handleDelete={() => handleDelete(serviceId)}
            />
        </Container>
    );
};

export default ShippingServiceList;