import { useCallback, useMemo, useState, useEffect } from "react";

// import { matchSorter } from "match-sorter";
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
    ListItem,
    Typography
} from "@mui/material";
import { Icon } from "@mui/material";
import Switch from "@mui/material/Switch";
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MonthRange } from "app/data/Index";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ClearIcon from "@mui/icons-material/Clear";

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

const names = ["Affiliate User Name","Total Amount","Amount"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [search, setSearch] = useState("");
    const [SearchList, setSearchList] = useState([]);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [personName, setPersonName] = useState(
        JSON.parse(localStorage.getItem(localStorageKey.monthlyReportTable)) || []
    );
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const currentDate = dayjs();
    const [year, setYear] = useState(currentDate.year());
    const [month, setMonth] = useState(currentDate.format("MM"));
    console.log(selectedDate, "selectedDate");
    console.log(year, month, "hhhh");

    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const handleChange = (event) => {
        const {
            target: { value }
        } = event;
        const setPerson = typeof value === "string" ? value.split(",") : value;
        setPersonName(setPerson);
        localStorage.setItem(localStorageKey.monthlyReportTable, JSON.stringify(setPerson));
        if (setPerson.length <= 0) {
            localStorage.removeItem(localStorageKey.monthlyReportTable);
        }
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

    const getmonthlyReports = useCallback(async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.getmonthlyReports}?year=${year}&month=${month}`, auth_key);
            if (res.status === 200) {
                console.log({ res });
                const myNewList = res?.data?.data?.map((e, i) => {
                    return { "S.No": i + 1, ...e };
                });

                const xData = myNewList.map((e, i) => {
                    let obj = {
                        "S.NO": i + 1,
                        "Affiliate User Name": e?.name,
                        "Amount": e?.amount
                    };
                    return obj;
                });
                setExcelData(xData);
                setSearchList(myNewList);
                setMonthlyReports(myNewList);
            }
        } catch (error) {
            // handleOpen("error", error?.response?.data || error);
            console.log(error);
        }
    }, [auth_key, year, month]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const paginatedmonthlyReports = useMemo(() => {
        return rowsPerPage > 0
            ? monthlyReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : monthlyReports;
    }, [monthlyReports, page, rowsPerPage]);
    const filterHandler = () => {
        const filteredItems = SearchList.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        ).sort((a, b) => {
            const aIndex = Math.min(
                a.name.toLowerCase().indexOf(search.toLowerCase())
            );
            const bIndex = Math.min(
                b.name.toLowerCase().indexOf(search.toLowerCase())
            );
            return aIndex - bIndex || a.name.localeCompare(b.name);
        });

        const filteredItemsWithSNo = filteredItems.map((item, index) => {
            return { ...item, "S.No": index + 1 };
        });
        setMonthlyReports(filteredItemsWithSNo);
    };

    const asyncFilter = async () => {
        await getmonthlyReports();
        await filterHandler();
    };

    useEffect(() => {
        if (search) {
            asyncFilter();
        } else {
            getmonthlyReports();
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
        ? [...paginatedmonthlyReports].sort((a, b) =>
            order === "asc"
                ? sortComparator(a, b, orderBy)
                : order === "desc"
                    ? sortComparator(b, a, orderBy)
                    : 0
        )
        : paginatedmonthlyReports;

    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        setYear(newValue.year());
        setMonth(newValue.format("MM"));
    };

    const handleFilter = () => {
        getmonthlyReports();
    }

    const handleClear = () => {
        setSelectedDate(dayjs());
        setYear(dayjs().year());
        setMonth(dayjs().format("MM"));
        getmonthlyReports();
    };

    return (
        <Box sx={{ margin: "30px" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 2
                }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Affiliate User", path: "" }, { name: "Monthly Reports" }]} />

            </Box>
            <Box sx={{ display: 'block', width: '100%' }}>
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ position: "relative", }}>
                                <DatePicker
                                    sx={{ position: 'relative' }}
                                    views={["year", "month"]}
                                    label="Year and Month"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                                {selectedDate && (
                                    <IconButton
                                        onClick={handleClear}
                                        sx={{
                                            position: "absolute",
                                            right: "26px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </LocalizationProvider>
                    </Box>
                    <Box>
                        <Button onClick={handleFilter} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
                            Filter
                        </Button>
                    </Box>
                    <Box>
                        <FormControl
                            sx={{
                                width: 235,
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
                            label="Search by affiliate user name"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </Box>
                    <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
                        Export Monthly Reports
                    </Button>
                </Box>
            </Box>
            <Box>
                <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
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
                                {!personName?.includes("Affiliate User Name") && (
                                    <TableCell sortDirection={orderBy === "name" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "name"}
                                            direction={orderBy === "name" ? order : "asc"}
                                            onClick={() => handleRequestSort("name")}
                                        >
                                            Affiliate User Name
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Total Amount") && (
                                    <TableCell sortDirection={orderBy === "totalAmount" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "totalAmount"}
                                            direction={orderBy === "totalAmount" ? order : "asc"}
                                            onClick={() => handleRequestSort("totalAmount")}
                                        >
                                            Total Amount
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Amount") && (
                                    <TableCell sortDirection={orderBy === "amount" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "amount"}
                                            direction={orderBy === "amount" ? order : "asc"}
                                            onClick={() => handleRequestSort("amount")}
                                        >
                                            Amount
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                sortedRows?.length > 0 ? (sortedRows.map((row, i) => {
                                    return (
                                        <TableRow key={row._id}>
                                            <TableCell>{row["S.No"]}</TableCell>
                                            {!personName?.includes("Affiliate User Name") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>{row?.name}</TableCell>
                                            )}
                                            {!personName?.includes("Total Amount") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>$ {row?.totalAmount}</TableCell>
                                            )}
                                            {!personName?.includes("Amount") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>$ {row?.amount} ({row?.affiliate_commission} % Commission) </TableCell>
                                            )}
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => navigate(`${ROUTE_CONSTANT.affiliateUser.monthlyReports.affiliateUsers}?id=${row._id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                                            No data found
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 75, 100]}
                    component="div"
                    count={monthlyReports.length}
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
            />
        </Box>
    );
};

export default List;
