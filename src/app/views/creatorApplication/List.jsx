import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    TableSortLabel,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Avatar,
    Typography,
    Stack,
    Tooltip
} from "@mui/material";
import { Icon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { exportToExcel } from "app/utils/excelExport";
import { Breadcrumb } from "app/components";
import styled from "@emotion/styled";
import ConfirmModal from "app/components/ConfirmModal";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import {
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Language as LanguageIcon
} from "@mui/icons-material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const names = ["Full Name", "Email", "Brand", "Country", "Category", "Status"];

const label = { inputProps: { "aria-label": "Switch demo" } };

// Mock data for initial development
const mockApplications = [
    {
        _id: "1",
        fullName: "John Doe",
        email: "john.doe@example.com",
        brand: "John's Jewelry",
        number: "+91 9876543210",
        number2: "+91 9876543211",
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        addressLine1: "123, Main Street",
        addressLine2: "Andheri East",
        zipCode: "400093",
        productCategory: "Jewelry",
        productDescription: "Handmade silver jewelry with unique designs inspired by nature.",
        socialLinks: [
            { platform: "instagram", url: "https://instagram.com/johnsjewelry" },
            { platform: "website", url: "https://johnsjewelry.com" }
        ],
        status: "pending",
        createdAt: "2024-01-15T10:30:00Z",
        countryCode: "in"
    },
    {
        _id: "2",
        fullName: "Jane Smith",
        email: "jane.smith@example.com",
        brand: "Smith Home Decor",
        number: "+91 8765432109",
        number2: "",
        country: "India",
        state: "Karnataka",
        city: "Bangalore",
        addressLine1: "456, Brigade Road",
        addressLine2: "",
        zipCode: "560001",
        productCategory: "Home Decor",
        productDescription: "Eco-friendly home decor items made from sustainable materials.",
        socialLinks: [
            { platform: "pinterest", url: "https://pinterest.com/smithhomedecor" }
        ],
        status: "approved",
        createdAt: "2024-01-10T14:20:00Z",
        countryCode: "in"
    },
    {
        _id: "3",
        fullName: "Robert Wilson",
        email: "robert.wilson@example.com",
        brand: "Vintage Treasures",
        number: "+91 7654321098",
        number2: "+91 7654321097",
        country: "India",
        state: "Tamil Nadu",
        city: "Chennai",
        addressLine1: "789, ECR Road",
        addressLine2: "Besant Nagar",
        zipCode: "600090",
        productCategory: "Vintage",
        productDescription: "Rare vintage collectibles and antiques from the 19th century.",
        socialLinks: [
            { platform: "facebook", url: "https://facebook.com/vintagetreasures" },
            { platform: "website", url: "https://vintagetreasures.com" }
        ],
        status: "rejected",
        createdAt: "2024-01-05T09:15:00Z",
        countryCode: "in"
    },
    {
        _id: "4",
        fullName: "Emily Davis",
        email: "emily.davis@example.com",
        brand: "Canvas & Art",
        number: "+91 6543210987",
        number2: "",
        country: "India",
        state: "Delhi",
        city: "New Delhi",
        addressLine1: "101, Connaught Place",
        addressLine2: "",
        zipCode: "110001",
        productCategory: "Art",
        productDescription: "Original paintings and digital art prints with unique styles.",
        socialLinks: [
            { platform: "instagram", url: "https://instagram.com/canvasandart" },
            { platform: "youtube", url: "https://youtube.com/canvasandart" }
        ],
        status: "pending",
        createdAt: "2024-01-20T16:45:00Z",
        countryCode: "in"
    },
    {
        _id: "5",
        fullName: "Michael Brown",
        email: "michael.brown@example.com",
        brand: "WoodCraft Studio",
        number: "+91 5432109876",
        number2: "+91 5432109875",
        country: "India",
        state: "Kerala",
        city: "Kochi",
        addressLine1: "234, Marine Drive",
        addressLine2: "",
        zipCode: "682031",
        productCategory: "Woodworking",
        productDescription: "Handcrafted wooden furniture and decorative items.",
        socialLinks: [
            { platform: "instagram", url: "https://instagram.com/woodcraftstudio" },
            { platform: "pinterest", url: "https://pinterest.com/woodcraftstudio" },
            { platform: "website", url: "https://woodcraftstudio.com" }
        ],
        status: "approved",
        createdAt: "2024-01-18T11:00:00Z",
        countryCode: "in"
    }
];

const List = () => {
    const [applicationList, setApplicationList] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [search, setSearch] = useState("");
    const [SearchList, setSearchList] = useState([]);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [personName, setPersonName] = useState(
        JSON.parse(localStorage.getItem(localStorageKey.applicationColumns)) || []
    );

    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const handleChange = (event) => {
        const {
            target: { value }
        } = event;
        const setPerson = typeof value === "string" ? value.split(",") : value;
        setPersonName(setPerson);
        localStorage.setItem(localStorageKey.applicationColumns, JSON.stringify(setPerson));
        if (setPerson.length <= 0) {
            localStorage.removeItem(localStorageKey.applicationColumns);
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
    };

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message);
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
        setSelectedId(null);
    };

    // Fetch applications - using mock data for now
    const getApplicationList = useCallback(async () => {
        try {
            // Simulate API call with mock data
            // Uncomment below when API is ready
            // const res = await ApiService.get(apiEndpoints.getApplications, auth_key);
            // if (res.status === 200) {
            //   const data = res?.data?.applications || [];

            // Using mock data
            const data = mockApplications;

            const myNewList = data.map((e, i) => {
                return { "S.No": i + 1, ...e };
            });

            const xData = myNewList.map((e, i) => ({
                "S.NO": i + 1,
                "Full Name": e.fullName || "",
                "Email": e.email || "",
                "Brand": e.brand || "",
                "Country": e.country || "",
                "Category": e.productCategory || "",
                "Status": e.status || ""
            }));

            setExcelData(xData);
            setSearchList(myNewList);
            setApplicationList(myNewList);
        } catch (error) {
            console.log(error);
            handleOpen("error", error?.response?.data || error);
        }
    }, [auth_key]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleStatusChange = useCallback(async (id, status) => {
        try {
            // Simulate API call
            // const payload = { applicationId: id, status };
            // const res = await ApiService.post(apiEndpoints.updateApplicationStatus, payload, auth_key);
            // if (res.status === 200) {
            //   getApplicationList();
            //   toast.success("Application status updated successfully");
            // }

            // Mock update
            setApplicationList(prev =>
                prev.map(item =>
                    item._id === id ? { ...item, status } : item
                )
            );
            setSearchList(prev =>
                prev.map(item =>
                    item._id === id ? { ...item, status } : item
                )
            );
            toast.success(`Application ${status} successfully`);
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    }, [auth_key, getApplicationList]);

    const Container = styled("div")(({ theme }) => ({
        margin: "30px",
        [theme.breakpoints.down("sm")]: { margin: "16px" },
        "& .breadcrumb": {
            marginBottom: "30px",
            [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
        }
    }));

    const paginatedList = useMemo(() => {
        return rowsPerPage > 0
            ? applicationList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : applicationList;
    }, [applicationList, page, rowsPerPage]);

    const filterHandler = () => {
        const searchLower = search.toLowerCase();
        const filteredItems = SearchList.filter((item) =>
            item.fullName?.toLowerCase().includes(searchLower) ||
            item.email?.toLowerCase().includes(searchLower) ||
            item.brand?.toLowerCase().includes(searchLower) ||
            item.productCategory?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower)
        );

        const filteredItemsWithSNo = filteredItems.map((item, index) => {
            return { ...item, "S.No": index + 1 };
        });
        setApplicationList(filteredItemsWithSNo);
    };

    const asyncFilter = async () => {
        await getApplicationList();
        await filterHandler();
    };

    useEffect(() => {
        if (search) {
            asyncFilter();
        } else {
            getApplicationList();
        }
    }, [search]);

    const [order, setOrder] = useState("none");
    const [orderBy, setOrderBy] = useState(null);

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

    const sortComparator = (a, b, orderBy) => {
        if (typeof a[orderBy] === "string" && typeof b[orderBy] === "string") {
            return a[orderBy].localeCompare(b[orderBy]);
        }
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    const sortedRows = orderBy
        ? [...paginatedList].sort((a, b) =>
            order === "asc"
                ? sortComparator(a, b, orderBy)
                : order === "desc"
                    ? sortComparator(b, a, orderBy)
                    : 0
        )
        : paginatedList;

    const formatDateTime = (dateInput) => {
        if (!dateInput) return "";
        const date = new Date(dateInput);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours() % 12 || 12;
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = date.getHours() >= 12 ? "PM" : "AM";
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const getStatusChip = (status) => {
        switch (status) {
            case "approved":
                return <Chip
                    label="Approved"
                    size="small"
                    sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }}
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                />;
            case "rejected":
                return <Chip
                    label="Rejected"
                    size="small"
                    sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600 }}
                    icon={<CancelIcon sx={{ fontSize: 16 }} />}
                />;
            default:
                return <Chip
                    label="Pending"
                    size="small"
                    sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }}
                    icon={<PendingIcon sx={{ fontSize: 16 }} />}
                />;
        }
    };

    return (
        <Box sx={{ margin: "30px" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 2,
                    flexWrap: "wrap",
                    gap: 2
                }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Applications", path: "" }, { name: "Creator Applications" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"} flexWrap={"wrap"}>
                    <Box>
                        <FormControl
                            sx={{
                                width: 300,
                                "& .MuiOutlinedInput-root": {
                                    height: "38px"
                                },
                                "& .MuiFormLabel-root": {
                                    top: "-7px"
                                }
                            }}
                        >
                            <InputLabel id="demo-multiple-checkbox-label">Preference: Columns hidden</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={personName}
                                onChange={handleChange}
                                input={<OutlinedInput label="Preference: 8 columns hidden" />}
                                renderValue={(selected) => selected.join(", ")}
                                MenuProps={MenuProps}
                            >
                                {names.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={personName.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box>
                        <TextField
                            size="small"
                            type="text"
                            label="Search..."
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            sx={{ minWidth: 200 }}
                        />
                    </Box>
                    {/* <Button
                        onClick={() => exportToExcel(excelData)}
                        variant="contained"
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        Export Report
                    </Button> */}
                </Box>
            </Box>

            <Box>
                <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
                    <Table
                        sx={{
                            width: "max-content",
                            minWidth: "100%",
                            ".MuiTableCell-root": {
                                padding: "12px 8px"
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
                                {!personName?.includes("Full Name") && (
                                    <TableCell sortDirection={orderBy === "fullName" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "fullName"}
                                            direction={orderBy === "fullName" ? order : "asc"}
                                            onClick={() => handleRequestSort("fullName")}
                                        >
                                            Full Name
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Email") && (
                                    <TableCell sortDirection={orderBy === "email" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "email"}
                                            direction={orderBy === "email" ? order : "asc"}
                                            onClick={() => handleRequestSort("email")}
                                        >
                                            Email
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Brand") && (
                                    <TableCell sortDirection={orderBy === "brand" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "brand"}
                                            direction={orderBy === "brand" ? order : "asc"}
                                            onClick={() => handleRequestSort("brand")}
                                        >
                                            Brand
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Country") && (
                                    <TableCell sortDirection={orderBy === "country" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "country"}
                                            direction={orderBy === "country" ? order : "asc"}
                                            onClick={() => handleRequestSort("country")}
                                        >
                                            Country
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Category") && (
                                    <TableCell sortDirection={orderBy === "productCategory" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "productCategory"}
                                            direction={orderBy === "productCategory" ? order : "asc"}
                                            onClick={() => handleRequestSort("productCategory")}
                                        >
                                            Category
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {/* {!personName?.includes("Status") && (
                                    <TableCell sortDirection={orderBy === "status" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "status"}
                                            direction={orderBy === "status" ? order : "asc"}
                                            onClick={() => handleRequestSort("status")}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
                                )} */}
                                <TableCell>Contact</TableCell>
                                {/* <TableCell>Action</TableCell> */}
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedRows.length > 0 ? (
                                sortedRows.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row["S.No"]}</TableCell>
                                        {!personName?.includes("Full Name") && (
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    {/* <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2" }}>
                                                        {row.fullName?.charAt(0).toUpperCase() || "U"}
                                                    </Avatar> */}
                                                    <Typography>{capitalizeFirstLetter(row.fullName)}</Typography>
                                                </Box>
                                            </TableCell>
                                        )}
                                        {!personName?.includes("Email") && (
                                            <TableCell sx={{ wordBreak: "break-word" }}>{row.email}</TableCell>
                                        )}
                                        {!personName?.includes("Brand") && (
                                            <TableCell sx={{ wordBreak: "break-word" }}>
                                                {capitalizeFirstLetter(row.brand)}
                                            </TableCell>
                                        )}
                                        {!personName?.includes("Country") && (
                                            <TableCell>{row.country}</TableCell>
                                        )}
                                        {!personName?.includes("Category") && (
                                            <TableCell>{row.productCategory}</TableCell>
                                        )}
                                        {/* {!personName?.includes("Status") && (
                                            <TableCell>{getStatusChip(row.status)}</TableCell>
                                        )} */}
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                {row.number && (
                                                    <Tooltip title={row.number}>
                                                        <IconButton size="small">
                                                            <PhoneIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title={row.email}>
                                                    <IconButton size="small">
                                                        <EmailIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {row.socialLinks?.length > 0 && (
                                                    <Tooltip title="Social Links">
                                                        <IconButton size="small">
                                                            <LanguageIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        {/* <TableCell>
                                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(`${ROUTE_CONSTANT.applications.view}?id=${row._id}`)
                                                    }
                                                    sx={{ color: "#1976d2" }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                {row.status === "pending" && (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleStatusChange(row._id, "approved")}
                                                            sx={{ color: "#2e7d32" }}
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleStatusChange(row._id, "rejected")}
                                                            sx={{ color: "#c62828" }}
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell> */}
                                        <TableCell>
                                            <IconButton
                                                onClick={() =>
                                                    navigate(`${ROUTE_CONSTANT.creatorApplication.view}?id=${row._id}`)
                                                }
                                            >
                                                <Icon>visibility</Icon>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} sx={{ textAlign: "center", py: 4 }}>
                                        <Typography color="text.secondary">No applications found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 75, 100]}
                    component="div"
                    count={applicationList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <ConfirmModal
                open={open}
                handleClose={handleClose}
                // handleDelete={handleDelete}
                type={type}
                msg={msg}
                handleStatusChange={handleStatusChange}
            />
        </Box>
    );
};

export default List;