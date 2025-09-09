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
import { useNavigate, useSearchParams } from "react-router-dom";
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

const names = ["Date", "Customer Name", "Product Name", "Amount"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const AffiliateUsers = () => {
    const [query, setQuery] = useSearchParams();
    const id = query.get("id");
    const [affiliateUser, setAffiliateUser] = useState([]);
    console.log(affiliateUser, "affiliateUser");
    const [excelData, setExcelData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [search, setSearch] = useState("");
    const [SearchList, setSearchList] = useState([]);
    const [personName, setPersonName] = useState(
        JSON.parse(localStorage.getItem(localStorageKey.affliateUserTable)) || []
    );


    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const handleChange = (event) => {
        const {
            target: { value }
        } = event;
        const setPerson = typeof value === "string" ? value.split(",") : value;
        setPersonName(setPerson);
        localStorage.setItem(localStorageKey.affliateUserTable, JSON.stringify(setPerson));
        if (setPerson.length <= 0) {
            localStorage.removeItem(localStorageKey.affliateUserTable);
        }
    };
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const getaffiliateUser = useCallback(async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.getAffiliateUserss}/${id}`, auth_key);
            if (res.status === 200) {
                console.log({ res });
                const myNewList = res?.data?.data?.map((e, i) => {
                    return { "S.No": i + 1, ...e };
                });

                const xData = myNewList.map((e, i) => {
                    let obj = {
                        "S.NO": i + 1,
                        "Date": new Date(e?.createdAt).toLocaleDateString(),
                        "Customer Name": e?.customer_name,
                        "Product Name": e?.product_name,
                        "Amount": e?.amount
                    };
                    return obj;
                });
                setExcelData(xData);
                setSearchList(myNewList);
                setAffiliateUser(myNewList);
            }
        } catch (error) {
            // handleOpen("error", error?.response?.data || error);
            console.log(error);
        }
    }, [auth_key]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const Container = styled("div")(({ theme }) => ({
        margin: "30px",
        [theme.breakpoints.down("sm")]: { margin: "16px" },
        "& .breadcrumb": {
            marginBottom: "30px",
            [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
        }
    }));

    const paginatedaffiliateUser = useMemo(() => {
        return rowsPerPage > 0
            ? affiliateUser.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : affiliateUser;
    }, [affiliateUser, page, rowsPerPage]);
    const filterHandler = () => {
        const filteredItems = SearchList.filter((item) =>
            item.customer_name.toLowerCase().includes(search.toLowerCase())
        ).sort((a, b) => {
            const aIndex = Math.min(
                a.customer_name.toLowerCase().indexOf(search.toLowerCase())
            );
            const bIndex = Math.min(
                b.customer_name.toLowerCase().indexOf(search.toLowerCase())
            );
            return aIndex - bIndex || a.customer_name.localeCompare(b.customer_name);
        });

        const filteredItemsWithSNo = filteredItems.map((item, index) => {
            return { ...item, "S.No": index + 1 };
        });
        setAffiliateUser(filteredItemsWithSNo);
    };

    const asyncFilter = async () => {
        await getaffiliateUser();
        await filterHandler();
    };

    useEffect(() => {
        if (search) {
            asyncFilter();
        } else {
            getaffiliateUser();
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
        ? [...paginatedaffiliateUser].sort((a, b) =>
            order === "asc"
                ? sortComparator(a, b, orderBy)
                : order === "desc"
                    ? sortComparator(b, a, orderBy)
                    : 0
        )
        : paginatedaffiliateUser;

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
                <Breadcrumb routeSegments={[{ name: "Monthly Reports", path: "" }, { name: "Affliate User" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
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
                            label="Search by customer name"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </Box>
                    <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
                        Export Affliate User
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
                                {!personName?.includes("Date") && (
                                    <TableCell sortDirection={orderBy === "craetedAt" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "craetedAt"}
                                            direction={orderBy === "craetedAt" ? order : "asc"}
                                            onClick={() => handleRequestSort("craetedAt")}
                                        >
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Customer Name") && (
                                    <TableCell sortDirection={orderBy === "name" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "customer_name"}
                                            direction={orderBy === "customer_name" ? order : "asc"}
                                            onClick={() => handleRequestSort("customer_name")}
                                        >
                                            Customer Name
                                        </TableSortLabel>
                                    </TableCell>
                                )}
                                {!personName?.includes("Product Name") && (
                                    <TableCell sortDirection={orderBy === "product_name" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "product_name"}
                                            direction={orderBy === "product_name" ? order : "asc"}
                                            onClick={() => handleRequestSort("product_name")}
                                        >
                                            Product Name
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                sortedRows?.length > 0 ? (sortedRows.map((row, i) => {
                                    return (
                                        <TableRow key={row._id}>
                                            <TableCell>{row["S.No"]}</TableCell>
                                            {!personName?.includes("Date") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>{new Date(row?.createdAt).toLocaleString()}</TableCell>
                                            )}
                                            {!personName?.includes("Customer Name") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>{row?.customer_name}</TableCell>
                                            )}
                                            {!personName?.includes("Product Name") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>
                                                    {row?.product_name.replace(/<\/?[^>]+(>|$)/g, "").length > 40
                                                        ? `${row?.product_name.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 40)}...`
                                                        : row?.product_name.replace(/<\/?[^>]+(>|$)/g, "")}
                                                </TableCell>
                                            )}
                                            {!personName?.includes("Amount") && (
                                                <TableCell sx={{ wordBreak: "break-word" }}>$ {row?.amount}</TableCell>
                                            )}
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
                    count={affiliateUser.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        </Box>
    );
};

export default AffiliateUsers;
