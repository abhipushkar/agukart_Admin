import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import {
    Box,
    Button,
    CircularProgress,
    Icon,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    TextField,
    Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import Switch from "@mui/material/Switch";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

// Dummy data for demonstration
export const dummyManagers = [
    {
        _id: "1",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        createdAt: "2023-05-15T10:30:00Z",
        status: true,
        designation: "Senior Manager"
    },
    {
        _id: "2",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1 (555) 987-6543",
        createdAt: "2023-06-20T14:45:00Z",
        status: true,
        designation: "Operations Manager"
    },
    {
        _id: "3",
        name: "Michael Brown",
        email: "michael.b@example.com",
        phone: "+1 (555) 456-7890",
        createdAt: "2023-07-10T09:15:00Z",
        status: false,
        designation: "Sales Manager"
    },
    {
        _id: "4",
        name: "Emily Davis",
        email: "emily.d@example.com",
        phone: "+1 (555) 234-5678",
        createdAt: "2023-08-05T16:20:00Z",
        status: true,
        designation: "HR Manager"
    },
    {
        _id: "5",
        name: "David Wilson",
        email: "david.w@example.com",
        phone: "+1 (555) 876-5432",
        createdAt: "2023-09-12T11:30:00Z",
        status: true,
        designation: "Finance Manager"
    },
    {
        _id: "6",
        name: "Jennifer Lee",
        email: "jennifer.l@example.com",
        phone: "+1 (555) 345-6789",
        createdAt: "2023-10-18T13:45:00Z",
        status: false,
        designation: "Marketing Manager"
    },
    {
        _id: "7",
        name: "Robert Taylor",
        email: "robert.t@example.com",
        phone: "+1 (555) 765-4321",
        createdAt: "2023-11-22T15:10:00Z",
        status: true,
        designation: "IT Manager"
    },
    {
        _id: "8",
        name: "Amanda Clark",
        email: "amanda.c@example.com",
        phone: "+1 (555) 543-2109",
        createdAt: "2023-12-05T08:55:00Z",
        status: true,
        designation: "Customer Service Manager"
    }
];

const ManagerList = () => {
    const navigate = useNavigate();
    const [managerList, setManagerList] = useState([]);
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState("none");
    const [orderBy, setOrderBy] = useState(null);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [statusData, setStatusData] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingRows, setLoadingRows] = useState({});
    const [confirmAction, setConfirmAction] = useState(null);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Load dummy data on component mount
    useEffect(() => {
        setLoading(true);
        // Simulate API loading delay
        const timer = setTimeout(() => {
            const managersWithSerial = dummyManagers.map((manager, index) => {
                return { "S.No": index + 1, ...manager };
            });
            setManagerList(managersWithSerial);
            setFilteredManagers(managersWithSerial);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Filter managers based on search input
    useEffect(() => {
        if (search) {
            const filtered = managerList.filter(manager =>
                manager.name.toLowerCase().includes(search.toLowerCase()) ||
                manager.email.toLowerCase().includes(search.toLowerCase()) ||
                manager.phone.includes(search) ||
                manager.designation.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredManagers(filtered);
        } else {
            setFilteredManagers(managerList);
        }
    }, [search, managerList]);

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        setRoute(ROUTE_CONSTANT.login)
    };

    const handleOpen = (type, msg, onConfirm = null) => {
        setMsg(msg?.message || msg);
        setOpen(true);
        setType(type);
        setConfirmAction(() => onConfirm); // Store the confirm action
    };

    const handleClose = () => {
        setOpen(false);
        setConfirmAction(null);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        handleClose();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = useCallback(async (managerId, newStatus) => {
        try {
            // Update local state to reflect the change
            setManagerList(prev =>
                prev.map(manager =>
                    manager._id === managerId
                        ? { ...manager, status: newStatus }
                        : manager
                )
            );

            // In a real app, you would make an API call here:
            // const payload = { id: managerId, status: newStatus };
            // const res = await ApiService.post(apiEndpoints.changeManagerStatus, payload, auth_key);

            handleOpen("success", `Manager status updated to ${newStatus ? 'Active' : 'Inactive'}`);
        } catch (error) {
            handleOpen("error", error);
        }
    }, []);

    const getNestedValue = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);

    const sortComparator = (a, b, orderBy) => {
        const valueA = getNestedValue(a, orderBy);
        const valueB = getNestedValue(b, orderBy);

        if (valueA === undefined || valueB === undefined) {
            return 0;
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
            return valueA.localeCompare(valueB);
        }
        if (valueB < valueA) {
            return -1;
        }
        if (valueB > valueA) {
            return 1;
        }
        return 0;
    };

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

    const sortedRows = orderBy
        ? [...filteredManagers].sort((a, b) =>
            order === "asc"
                ? sortComparator(a, b, orderBy)
                : order === "desc"
                    ? sortComparator(b, a, orderBy)
                    : 0
        )
        : filteredManagers;

    const handleEditManager = (managerId) => {
        navigate(`${ROUTE_CONSTANT.manager.add}?id=${managerId}`);
    };

    const handleAddManager = () => {
        navigate(ROUTE_CONSTANT.manager.add);
    };

    const handleSwitchChange = (managerId, currentStatus) => {
        const newStatus = !currentStatus;
        setStatusData({ id: managerId, status: newStatus });
        handleOpen(
            "managerStatus",
            `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this manager?`,
            () => handleStatusChange(managerId, newStatus)
        );
    };

    return (
        <Container>
            <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Manager", path: "" }, { name: "Manager List" }]} />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <TextField
                        size="small"
                        label="Search managers..."
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        type="text"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddManager}
                    >
                        Add Manager
                    </Button>
                </Box>
            </Box>

            <Box>
                <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
                    <Table
                        sx={{
                            width: 'auto',
                            minWidth: {
                                xl: '100%',
                                lg: '100%',
                                md: 'max-content',
                                sm: 'max-content',
                                xs: 'max-content'
                            },
                            maxWidth: {
                                xl: 'max-content',
                                lg: 'max-content',
                                md: 'auto',
                                sm: 'auto',
                                xs: 'auto'
                            },
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
                                <TableCell sortDirection={orderBy === "name" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "name"}
                                        direction={orderBy === "name" ? order : "asc"}
                                        onClick={() => handleRequestSort("name")}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "email" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "email"}
                                        direction={orderBy === "email" ? order : "asc"}
                                        onClick={() => handleRequestSort("email")}
                                    >
                                        Email
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "phone" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "phone"}
                                        direction={orderBy === "phone" ? order : "asc"}
                                        onClick={() => handleRequestSort("phone")}
                                    >
                                        Phone
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sortDirection={orderBy === "createdAt" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "createdAt"}
                                        direction={orderBy === "createdAt" ? order : "asc"}
                                        onClick={() => handleRequestSort("createdAt")}
                                    >
                                        Created At
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexDirection: "column",
                                                padding: "48px",
                                                width: "100%",
                                                minHeight: "200px",
                                            }}
                                        >
                                            <CircularProgress size={40} />
                                            <Typography variant="body2" sx={{ mt: 2 }}>
                                                Loading managers...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : sortedRows?.length > 0 ? (
                                (rowsPerPage > 0
                                        ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : sortedRows
                                ).map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row["S.No"]}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.phone}</TableCell>
                                        <TableCell>
                                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={row.status}
                                                onChange={() => handleSwitchChange(row._id, row.status)}
                                            />
                                            <Typography variant="caption" display="block">
                                                {row.status ? 'Active' : 'Inactive'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleEditManager(row._id)}
                                                title="Edit Manager"
                                            >
                                                <Icon color="primary">edit</Icon>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell align="center" colSpan={7}>
                                        <Typography fontSize={15} fontWeight="bold" my={2}>
                                            No Managers Found
                                        </Typography>
                                        {search && (
                                            <Typography variant="body2" color="textSecondary">
                                                Try adjusting your search terms
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredManagers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Managers per page:"
                />
            </Box>
            <ConfirmModal
                open={open}
                handleClose={handleClose}
                handleConfirm={handleConfirm}
                type={type}
                msg={msg}
            />
        </Container>
    );
};

export default ManagerList;