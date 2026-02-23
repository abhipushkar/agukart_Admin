import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, TablePagination, TextField } from "@mui/material";
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
                setRowsPerPage(prev => prev - 1);
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

            // Add sorting parameters if needed
            if (orderBy && order !== "none") {
                params.sortBy = orderBy;
                params.sortOrder = order;
            }

            const res = await ApiService.get("get-delivery-service", auth_key, { params });
            if (res.status === 200) {
                const services = res?.data?.data || [];
                const total = services.length;

                const myNewList = services.map((e, i) => {
                    return { "S.No": (page * rowsPerPage) + i + 1, ...e };
                });
                console.log(myNewList)
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
    console.log(allServices)
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
                                <TableCell sortDirection={orderBy === "S.No" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "S.No"}
                                        direction={orderBy === "S.No" ? order : "asc"}
                                        onClick={() => handleRequestSort("S.No")}
                                    >
                                        S.No
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "title" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "title"}
                                        direction={orderBy === "title" ? order : "asc"}
                                        onClick={() => handleRequestSort("title")}
                                    >
                                        Service Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "status" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "status"}
                                        direction={orderBy === "status" ? order : "asc"}
                                        onClick={() => handleRequestSort("status")}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allServices.length > 0 ? (
                                allServices.map((row) => {
                                    return (
                                        <TableRow key={row._id}>
                                            <TableCell>{row["S.No"]}</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    onClick={() => {
                                                        handleOpen("serviceStatus", "Are you sure you change Delivery Service status?");
                                                        setStatusData(() => ({ id: row?._id, isActive: !row.isActive }));
                                                    }}
                                                    checked={row.isActive}
                                                    {...label}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => navigate(`${ROUTE_CONSTANT.shippingService.add}?id=${row._id}`)}
                                                >
                                                    <Icon color="primary">edit</Icon>
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        handleOpen("serviceDelete", `Are you sure you want to delete ${row.name}?`);
                                                        setServiceId(row._id || row.id);
                                                    }}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No shipping services found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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