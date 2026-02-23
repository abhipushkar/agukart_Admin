import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, ListItemText, Menu, MenuItem, TablePagination, TextField } from "@mui/material";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

const StyledTableRow = styled(TableRow)(({ isDragging, theme }) => ({
    backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
    '&:hover': {
        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)',
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
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut()
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
            try {
                const payload = statusData;
                const res = await ApiService.patch(`toggle/${statusData.id}`, payload, auth_key);
                if (res.status === 200) {
                    getShippingServiceList();
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, getShippingServiceList, statusData]);

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
                setLoading(true);
                const res = await ApiService.patch(
                    `set-default/${selectedService._id}`,
                    {},
                    auth_key
                );

                if (res.status === 200) {
                    handleOpen("success", { message: `${selectedService.name} set as default successfully` });
                    getShippingServiceList();
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            } finally {
                setLoading(false);
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
            setLoading(true);
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
        } finally {
            setLoading(false);
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
                <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
                    {loading && (
                        <LoadingOverlay>
                            <CircularProgress />
                        </LoadingOverlay>
                    )}
                    <Table
                        sx={{
                            width: "max-content",
                            minWidth: "100%",
                            ".MuiTableCell-root": {
                                padding: "12px 5px"
                            }
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell width="50px">Drag</TableCell>
                                <TableCell sortDirection={orderBy === "name" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "name"}
                                        direction={orderBy === "name" ? order : "asc"}
                                        onClick={() => handleRequestSort("name")}
                                    >
                                        Service Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "isActive" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "isActive"}
                                        direction={orderBy === "isActive" ? order : "asc"}
                                        onClick={() => handleRequestSort("isActive")}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" width="100px"></TableCell>
                                <TableCell width="300px">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="shipping-services">
                                {(provided) => (
                                    <TableBody
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
                                                        <StyledTableRow
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            isDragging={snapshot.isDragging}
                                                        >
                                                            <TableCell>
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
                                                            </TableCell>
                                                            <TableCell>{row.name}</TableCell>
                                                            <TableCell>
                                                                <Switch
                                                                    onClick={() => {
                                                                        handleOpen("serviceStatus", "Are you sure you want to change Delivery Service status?");
                                                                        setStatusData(() => ({ id: row?._id, isActive: !row.isActive }));
                                                                    }}
                                                                    checked={row.isActive}
                                                                    {...label}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
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
                                                            </TableCell>
                                                            <TableCell>
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
                                                            </TableCell>
                                                        </StyledTableRow>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No shipping services found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {provided.placeholder}
                                    </TableBody>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Table>
                </TableContainer>

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