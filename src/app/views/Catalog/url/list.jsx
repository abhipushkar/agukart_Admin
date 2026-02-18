import React, { useState, useEffect, useCallback, useRef } from "react";
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
    TextField,
    InputAdornment,
    CircularProgress,
    Typography
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { exportToExcel } from "app/utils/excelExport";
import { Breadcrumb } from "app/components";
import styled from "@emotion/styled";
import ConfirmModal from "app/components/ConfirmModal";
import debounce from "lodash.debounce";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import UrlService from "app/services/UrlService";
import { localStorageKey } from "app/constant/localStorageKey";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

const StyledTableContainer = styled(TableContainer)({
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    "& .MuiTableCell-root": {
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0"
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
        backgroundColor: "#f9f9f9",
        fontWeight: "600",
        color: "#333"
    }
});

const CopyButton = styled(Button)({
    backgroundColor: "#1976d2",
    color: "white",
    padding: "6px 16px",
    fontSize: "14px",
    fontWeight: "500",
    textTransform: "none",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
    "&:hover": {
        backgroundColor: "#1565c0",
        boxShadow: "0 4px 8px rgba(25, 118, 210, 0.3)"
    },
    "& .MuiButton-startIcon": {
        marginRight: "8px"
    }
});

export default function List() {
    const [urlList, setUrlList] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState(null);
    const [route, setRoute] = useState(null);

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
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message || msg);
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
            const res = await UrlService.deleteUrl(id);
            if (res.status === 200) {
                toast.success(res.message);
                setUrlList(prev =>
                    prev.filter(item => item._id !== id)
                );
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Copied");
        }).catch(() => {
            toast.error("Failed to copy");
        });
    };

    const getUrlList = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: page + 1,
                limit: rowsPerPage
            };

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            const res = await UrlService.getList(params);
            console.log(res.data);
            if (res.status === 200) {
                const urls = res?.data?.data || [];
                const pagination = res?.data?.pagination || { total: urls.length };

                const myNewList = urls.map((item, index) => ({
                    "S.No": (page * rowsPerPage) + index + 1,
                    ...item
                }));

                // Prepare export data
                const xData = urls.map((item, index) => ({
                    "S.NO": (page * rowsPerPage) + index + 1,
                    "Name": item.name || "",
                    "Description": item.description || "",
                    "URL": item.link || ""
                }));

                setExcelData(xData);
                setUrlList(myNewList);
                setTotalCount(pagination.total || urls.length);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, rowsPerPage]);

    useEffect(() => {
        getUrlList();
    }, [getUrlList]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "30px"
                }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Home" }, { name: "URL List" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    <TextField
                        size="small"
                        type="text"
                        label="Search"
                        onChange={handleSearch}
                        value={search}
                        placeholder="Search..."
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                height: "38px"
                            },
                            "& .MuiFormLabel-root": {
                                top: "-7px"
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Link to={ROUTE_CONSTANT.catalog.url.add}>
                        <Button
                            variant="contained"
                            sx={{
                                whiteSpace: "nowrap",
                                minWidth: "120px",
                                backgroundColor: "#1976d2",
                                "&:hover": { backgroundColor: "#1565c0" }
                            }}
                        >
                            Add
                        </Button>
                    </Link>
                    <Button
                        onClick={() => exportToExcel(excelData, "URL_List")}
                        variant="contained"
                        sx={{
                            whiteSpace: "nowrap",
                            minWidth: "120px",
                            backgroundColor: "#1976d2",
                            "&:hover": { backgroundColor: "#1565c0" }
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            <StyledTableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>URL Copy</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: "center", py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {urlList?.length > 0 ? (
                                    urlList.map((row) => (
                                        <TableRow key={row._id || row.id}>
                                            <TableCell>{row["S.No"]}</TableCell>
                                            <TableCell>{row.name || ""}</TableCell>
                                            <TableCell>{row.description || ""}</TableCell>
                                            <TableCell>
                                                <CopyButton
                                                    variant="contained"
                                                    startIcon={<ContentCopyIcon />}
                                                    onClick={() => handleCopyToClipboard(row.file || "")}
                                                >
                                                    URL Copy
                                                </CopyButton>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={5}>
                                                    <IconButton
                                                        component={Link}
                                                        to={`${ROUTE_CONSTANT.catalog.url.edit}?id=${row._id || row.id}&slug=${row.slug}`}
                                                        sx={{ color: "#1976d2" }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDelete(row._id || row.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 3 }}>
                                            <Typography variant="body1" color="textSecondary">
                                                No data found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ mt: 2 }}
            />

            <ConfirmModal
                open={open}
                handleClose={handleClose}
                type={type}
                msg={msg}
            />
        </Container>
    );
}
