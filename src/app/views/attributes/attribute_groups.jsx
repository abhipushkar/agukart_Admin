import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Breadcrumbs,
    Link,
    CircularProgress,
    Divider,
    Stack,
    TablePagination,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from "@mui/material";
import {
    Add as AddIcon,
    Home as HomeIcon,
    List as ListIcon,
    Apps as AppsIcon,
    DragIndicator as DragIndicatorIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    FormatListBulleted as FormatListBulletedIcon,
    Delete as DeleteIcon
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ROUTE_CONSTANT } from "../../constant/routeContanst";
import { ApiService } from "../../services/ApiService";
import ConfirmModal from "../../components/ConfirmModal";
import debounce from "lodash.debounce";
import { localStorageKey } from "app/constant/localStorageKey";
import { set } from "lodash";

// Reorder function for drag and drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order based on new position
    return result.map((item, index) => ({
        ...item,
        order: index + 1
    }));
};

// Helper function to ensure all items have proper IDs
const ensureIds = (items) => {
    return items.map((item, index) => ({
        ...item,
        id: item.id || item._id || `temp-${Date.now()}-${index}`,
        order: item.order || index + 1
    }));
};


const AttributeGroups = () => {
    // State management
    const [groups, setGroups] = useState([]);
    const [displayGroups, setDisplayGroups] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuGroup, setMenuGroup] = useState(null);

    // Edit Dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editGroupName, setEditGroupName] = useState("");
    const [editGroupId, setEditGroupId] = useState(null);

    // Add this to your existing state declarations
    const [isAddMode, setIsAddMode] = useState(false);

    // Reordering State
    const [hasOrderChanges, setHasOrderChanges] = useState(false);
    const [pendingReorderData, setPendingReorderData] = useState([]);

    // UI state
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: "",
        msg: "",
        onConfirm: null
    });

    // Refs
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

    // Handle search with debouncing
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        debounceRef.current(value);
    };

    // Fetch attribute groups
    // Fetch attribute groups
    const fetchAttributeGroups = useCallback(async () => {
        setLoading(true);
        setErrors(null);
        try {
            const accessToken = localStorage.getItem(localStorageKey.auth_key);

            // Build query parameters
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
            });

            if (debouncedSearch.trim()) {
                params.append('search', debouncedSearch.trim());
            }

            const url = `attribute-group?${params.toString()}`;
            const response = await ApiService.get(url, accessToken);

            if (response?.data?.success) {
                const groupsData = response.data.data || [];
                const pagination = response.data.pagination || {};

                // Ensure all groups have proper IDs and order
                const groupsWithIds = ensureIds(groupsData);
                // Sort by order field
                const sortedGroups = [...groupsWithIds].sort((a, b) => (a.order || 0) - (b.order || 0));

                setGroups(sortedGroups);
                setDisplayGroups(sortedGroups);
                setTotalCount(pagination.total || groupsData.length || 0);
            } else {
                setErrors(response?.data?.message || "Failed to fetch attribute groups");
                setGroups([]);
                setDisplayGroups([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error("Error fetching attribute groups:", error);
            setErrors(error.response?.data?.message || "Error fetching attribute groups");
            setGroups([]);
            setDisplayGroups([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, rowsPerPage]);

    // Fetch data when dependencies change
    useEffect(() => {
        fetchAttributeGroups();
    }, [fetchAttributeGroups]);


    // Drag and Drop Handler
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const { source, destination } = result;

        // Get current displayed groups (paginated view)
        const currentDisplayGroups = [...displayGroups];

        // Reorder the displayed groups
        const reorderedDisplayGroups = reorder(
            currentDisplayGroups,
            source.index,
            destination.index
        );

        setDisplayGroups(reorderedDisplayGroups);

        // Also update the main groups array with the new order
        const updatedGroups = [...groups];

        // Find the indices of the moved items in the main groups array
        const movedGroupId = currentDisplayGroups[source.index]._id || currentDisplayGroups[source.index].id;
        const targetGroupId = currentDisplayGroups[destination.index]._id || currentDisplayGroups[destination.index].id;

        const oldMainIndex = updatedGroups.findIndex(g => (g._id || g.id) === movedGroupId);
        const newMainIndex = updatedGroups.findIndex(g => (g._id || g.id) === targetGroupId);

        if (oldMainIndex !== -1 && newMainIndex !== -1) {
            const reorderedMainGroups = reorder(updatedGroups, oldMainIndex, newMainIndex);
            setGroups(reorderedMainGroups);

            // Prepare reorder data for ALL groups in the current display order
            const reorderPayload = reorderedDisplayGroups.map((group, index) => ({
                _id: group._id || group.id,
                order: index + 1
            }));

            setPendingReorderData(reorderPayload);
            setHasOrderChanges(true);
        }
    };


    // Handle reorder save
    const handleSaveReorder = async () => {
        if (!pendingReorderData.length) return;

        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem(localStorageKey.auth_key);
            const response = await ApiService.post('attribute-group/reorder', pendingReorderData, accessToken);

            if (response.data.success) {
                showConfirmModal("success", "Order updated successfully!");
                setHasOrderChanges(false);
                setPendingReorderData([]);
                // Refresh the list to get updated data
                await fetchAttributeGroups();
            } else {
                showConfirmModal("error", response.data.message || "Failed to update order");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            showConfirmModal("error", error.response?.data?.message || "Error updating order");
        } finally {
            setApiLoading(false);
        }
    };

    // Menu handlers
    const handleMenuOpen = (event, group) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuGroup(group);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuGroup(null);
    };

    // Edit name handlers
    const handleEditNameClick = () => {
        if (menuGroup) {
            setIsAddMode(false);
            setEditGroupId(menuGroup._id || menuGroup.id);
            setEditGroupName(menuGroup.name);
            setEditDialogOpen(true);
        }
        handleMenuClose();
    };

    const handleEditNameSave = async () => {
        if (!editGroupName.trim()) {
            setErrors("Group name cannot be empty");
            return;
        }

        setApiLoading(true);
        setErrors(null);
        try {
            const accessToken = localStorage.getItem(localStorageKey.auth_key);

            // Prepare payload
            const payload = {
                name: editGroupName,
                order: isAddMode ? groups.length + 1 : undefined
            };

            // Add _id for edit case
            if (!isAddMode && editGroupId) {
                payload._id = editGroupId;
            }

            const response = await ApiService.post("create-attribute-group", payload, accessToken);

            if (response.data.success) {
                await fetchAttributeGroups();
                showConfirmModal("success", isAddMode ? "Group created successfully!" : "Group name updated successfully!");
                setEditDialogOpen(false);
                setEditGroupId(null);
                setEditGroupName("");
                setIsAddMode(false);
            } else {
                setErrors(response.data.message || (isAddMode ? "Failed to create group" : "Failed to update group name"));
            }
        } catch (error) {
            console.error("Error saving group:", error);
            setErrors(error.response?.data?.message || (isAddMode ? "Error creating group" : "Error updating group name"));
        } finally {
            setApiLoading(false);
        }
    };

    // Attributes list handler
    const handleAttributesListClick = () => {
        if (menuGroup) {
            const groupId = menuGroup._id || menuGroup.id;
            navigate(`${ROUTE_CONSTANT.catalog.attribute.list}?groupId=${groupId}`);
        }
        handleMenuClose();
    };

    // Delete handler
    const handleDeleteClick = () => {
        if (menuGroup) {
            showConfirmModal(
                "warning",
                `Are you sure you want to delete the group "${menuGroup.name}"? This will also delete all attributes in this group.`,
                handleDeleteConfirm
            );
        }
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (!menuGroup) return;

        setApiLoading(true);
        try {
            const groupId = menuGroup._id || menuGroup.id;
            const accessToken = localStorage.getItem(localStorageKey.auth_key);

            const response = await ApiService.delete(
                `delete-attribute-group/${groupId}`,
                accessToken
            );

            if (response.data.success) {
                await fetchAttributeGroups();
                showConfirmModal("success", "Group deleted successfully!");
            } else {
                showConfirmModal("error", response.data.message || "Failed to delete group");
            }
        } catch (error) {
            console.error("Error deleting group:", error);
            showConfirmModal("error", error.response?.data?.message || "Error deleting group");
        } finally {
            setApiLoading(false);
            setMenuGroup(null);
        }
    };

    // Add new group
    const handleAddGroup = () => {
        setIsAddMode(true);
        setEditGroupId(null);
        setEditGroupName("");
        setEditDialogOpen(true);
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Confirm modal handlers
    const showConfirmModal = (type, msg, onConfirm) => {
        setConfirmModal({
            open: true,
            type,
            msg,
            onConfirm
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            type: "",
            msg: "",
            onConfirm: null
        });
    };

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        closeConfirmModal();
    };

    if (loading && groups.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 3, px: 10 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Attributes
                </Link>
                <Typography color="text.primary">Attribute Groups</Typography>
            </Breadcrumbs>

            <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                </Stack>
                <Divider />
                <Box sx={{ ml: "24px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Dashboard
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">Attribute Groups</Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        size="small"
                        label="Search Groups"
                        value={search}
                        onChange={handleSearch}
                        disabled={apiLoading}
                        placeholder="Search by name..."
                        sx={{ minWidth: 250 }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddGroup}
                        disabled={apiLoading}
                    >
                        Add Group
                    </Button>
                </Box>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ position: 'relative' }}>
                <TableContainer
                    sx={{
                        paddingLeft: 2,
                        paddingRight: 2,
                        opacity: loading ? 0.6 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                    component={Paper}
                >
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '100px' }}>Drag</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell sx={{ width: '100px' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <Droppable droppableId="attributeGroups" type="attributeGroups">
                                {(provided) => (
                                    <TableBody
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {displayGroups.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    {loading ? 'Loading groups...' : 'No attribute groups found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayGroups.map((group, index) => {
                                                const groupId = group._id || group.id;
                                                return (
                                                    <Draggable
                                                        key={groupId}
                                                        draggableId={groupId.toString()}
                                                        index={index}
                                                        isDragDisabled={apiLoading}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <TableRow
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'inherit',
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <IconButton
                                                                        {...provided.dragHandleProps}
                                                                        size="small"
                                                                        sx={{ cursor: 'grab' }}
                                                                        disabled={apiLoading}
                                                                    >
                                                                        <DragIndicatorIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                                <TableCell>{group.name}</TableCell>
                                                                <TableCell>
                                                                    <IconButton
                                                                        onClick={(e) => handleMenuOpen(e, group)}
                                                                        disabled={apiLoading}
                                                                        size="small"
                                                                    >
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </Draggable>
                                                );
                                            })
                                        )}
                                        {provided.placeholder}
                                    </TableBody>
                                )}
                            </Droppable>
                        </Table>
                    </DragDropContext>
                </TableContainer>
                <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} my={2}>
                    {hasOrderChanges && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveReorder}
                            disabled={apiLoading}
                            startIcon={apiLoading ? <CircularProgress size={20} /> : null}
                        >
                            Update Order
                        </Button>
                    )}
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        disabled={loading || apiLoading}
                        sx={{ ml: "auto" }}
                    />
                </Box>
            </Box>

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditNameClick}>
                    <EditIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    Edit Name
                </MenuItem>
                <MenuItem onClick={handleAttributesListClick}>
                    <FormatListBulletedIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    Attributes List
                </MenuItem>
                {/* <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem> */}
            </Menu>


            {/* Add/Edit Group Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setIsAddMode(false);
                    setEditGroupId(null);
                    setEditGroupName("");
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{isAddMode ? 'Add New Group' : 'Edit Group Name'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        variant="outlined"
                        value={editGroupName}
                        onChange={(e) => { setEditGroupName(e.target.value); setErrors(null); }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleEditNameSave();
                            }
                        }}
                        helperText={errors}
                        error={Boolean(errors)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditDialogOpen(false);
                        setIsAddMode(false);
                        setEditGroupId(null);
                        setEditGroupName("");
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={handleEditNameSave} variant="contained" color="primary">
                        {isAddMode ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                handleClose={closeConfirmModal}
                onConfirm={handleConfirm}
                type={confirmModal.type}
                msg={confirmModal.msg}
            />
        </Box>
    );
};

export default AttributeGroups;