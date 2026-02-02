import { create } from 'zustand';
import { ApiService } from 'app/services/ApiService';
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { localStorageKey } from 'app/constant/localStorageKey';

// Default hidden columns - Image Badge is hidden by default
const DEFAULT_HIDDEN_COLUMNS = ['Image Badge'];

export const useProductStore = create((set, get) => ({
    // State
    products: [],
    filteredProducts: [],
    loading: false,
    actionLoading: false,
    pagination: {
        page: 0,
        rowsPerPage: 25,
        totalCount: 0
    },
    filters: {
        search: '',
        isSearched: false,
        status: 'all',
        category: '',
        sorting: {
            sortBy: 'createdAt',
            order: -1,
        },
        hiddenColumns: JSON.parse(localStorage.getItem(localStorageKey.productTable)) || DEFAULT_HIDDEN_COLUMNS
    },
    selection: {
        productIds: [],
        variationIds: [],
        totalProductCount: 0,
        totalVariationCount: 0
    },
    expandedRows: new Set(),

    showFeaturedOnly: false,

    allActiveCategories: [],

    setShowFeaturedOnly: (value) => {
        set({ showFeaturedOnly: value });
    },

    // Actions
    setLoading: (loading) => set({ loading }),
    setActionLoading: (actionLoading) => set({ actionLoading }),

    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }));

        if (filters.hiddenColumns !== undefined) {
            localStorage.setItem(localStorageKey.productTable, JSON.stringify(filters.hiddenColumns));
        }
    },

    // ... rest of the store remains the same
    setPagination: (pagination) => set(state => ({
        pagination: { ...state.pagination, ...pagination }
    })),

    setSelection: (selection) => set(state => ({
        selection: { ...state.selection, ...selection }
    })),

    // Expanded rows management
    toggleExpandedRow: (productId) => {
        set(state => {
            const newExpandedRows = new Set(state.expandedRows);
            if (newExpandedRows.has(productId)) {
                newExpandedRows.delete(productId);
            } else {
                newExpandedRows.add(productId);
            }
            return { expandedRows: newExpandedRows };
        });
    },

    fetchProductsFirstTime: async () => {
        get().setLoading(true);
        try {
            await get().fetchProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        } finally {
            get().setLoading(false);
        }
    },

    // Fetch products
    fetchProducts: async () => {
        const { filters, pagination, showFeaturedOnly } = get();

        try {
            const url = `${apiEndpoints.getProduct}?type=${filters.status}&category=${filters.category}&search=${filters.search.trim()}&featured=${showFeaturedOnly ? true : ''}&sort=${filters.sorting.sortBy ? JSON.stringify({
                [filters.sorting.sortBy]: filters.sorting.order,
            }) : ""}&page=${pagination.page + 1}&limit=${pagination.rowsPerPage}`;
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                set({
                    products: res.data.data,
                    filteredProducts: res.data.data,
                    pagination: { ...pagination, totalCount: res.data.data.length }
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    flattenArray: (data) => {
        let result = [];

        function recurse(items) {
            for (const item of items) {
                // Create a shallow copy of the item without the 'subs' key
                let { subs, ...itemWithoutSubs } = item;
                result.push(itemWithoutSubs);
                if (subs && subs.length > 0) {
                    recurse(subs);
                }
            }
        }

        recurse(data);
        return result;
    },

    getAllActiveCategories: async () => {
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(apiEndpoints.getAllActiveCategory, auth_key);
            if (res?.status === 200) {

                const flatArray = get().flattenArray(res?.data?.subCatgory);

                set({ allActiveCategories: flatArray });

                // setAllActiveCategory([
                //   { subs: [{ title: "All Product", subs: [], id: "" }, ...res?.data?.subCatgory] }
                // ]);
            }
        } catch (error) {
            throw new Error(error);
        }
    },

    // Search products
    searchProducts: async () => {
        const { filters, pagination, showFeaturedOnly, setFilters } = get();
        try {
            set({ actionLoading: true });
            const url = `${apiEndpoints.getProduct}?type=${filters.status}&category=${filters.category}&search=${filters.search.trim()}&featured=${showFeaturedOnly ? true : ''}&sort=${filters.sorting.sortBy ? JSON.stringify({
                [filters.sorting.sortBy]: filters.sorting.order,
            }) : ""}&page=${pagination.page + 1}&limit=${pagination.rowsPerPage}`;
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                if (filters.search.length > 0) setFilters({ isSearched: true })
                else setFilters({ isSearched: false })
                set({
                    products: res.data.data,
                    filteredProducts: res.data.data,
                    pagination: { ...pagination, page: 0, totalCount: res.data.data.length }
                });
            }
        } catch (e) {
            console.error('Error searching products:', e);
            throw e;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Toggle featured status
    toggleFeatured: async (productId, currentStatus) => {
        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = { _id: productId, featured: !currentStatus };

            const res = await ApiService.post(apiEndpoints.changeFeatureStatus, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return { success: true, message: res.data?.message };
            }
        } catch (error) {
            console.error('Error toggling featured status:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Update product field
    updateProductField: async (productId, fieldName, value) => {
        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = { [fieldName]: value, _id: productId };

            const res = await ApiService.post(apiEndpoints.updateProductByField, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating product field:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Update sort order
    updateSortOrder: async (productId, sortOrder) => {
        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = { sort_order: sortOrder, _id: productId };

            const res = await ApiService.post(apiEndpoints.updateSortOrderProduct, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating sort order:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Update badge
    updateBadge: async (productId, badge) => {
        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = { product_id: productId, badge };

            const res = await ApiService.post(apiEndpoints.changeProductBadge, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating badge:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Delete product
    deleteProduct: async (productId) => {
        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(`${apiEndpoints.deleteProduct}/${productId}`, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return { success: true, message: res.data?.message };
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Bulk actions
    bulkUpdateStatus: async (status, deleteStatus = false) => {
        const { selection } = get();

        if (selection.productIds.length === 0) return;

        set({ actionLoading: true });

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            let payload = { _id: selection.productIds };

            if (status === 'delete') {
                payload.delete = deleteStatus;
            } else if (status === 'draft') {
                payload.draft = deleteStatus;
            } else {
                payload.status = status;
            }

            const res = await ApiService.post(apiEndpoints.changeAllStatusProduct, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                get().clearSelection();
                return { success: true, message: res.data?.message };
            }
        } catch (error) {
            console.error('Error in bulk update:', error);
            throw error;
        } finally {
            set({ actionLoading: false });
        }
    },

    // Selection management
    clearSelection: () => set({
        selection: {
            productIds: [],
            variationIds: [],
            totalProductCount: 0,
            totalVariationCount: 0
        }
    }),

    toggleProductSelection: (productId, productData = []) => {
        set(state => {
            const newProductIds = state.selection.productIds.includes(productId)
                ? state.selection.productIds.filter(id => id !== productId)
                : [...state.selection.productIds, productId];

            const allVariationsSelected = productData.every(item =>
                newProductIds.includes(item._id)
            );

            const newVariationIds = allVariationsSelected
                ? [...state.selection.variationIds, productId].filter((v, i, a) => a.indexOf(v) === i)
                : state.selection.variationIds.filter(id => id !== productId);

            return {
                selection: {
                    ...state.selection,
                    productIds: newProductIds,
                    variationIds: newVariationIds
                }
            };
        });
    },

    toggleVariationSelection: (variationId, productIds) => {
        set(state => {
            if (state.selection.variationIds.includes(variationId)) {
                return {
                    selection: {
                        ...state.selection,
                        variationIds: state.selection.variationIds.filter(id => id !== variationId),
                        productIds: state.selection.productIds.filter(id => !productIds.includes(id))
                    }
                };
            } else {
                return {
                    selection: {
                        ...state.selection,
                        variationIds: [...state.selection.variationIds, variationId],
                        productIds: [...new Set([...state.selection.productIds, ...productIds])]
                    }
                };
            }
        });
    },

    selectAll: (products) => {
        const allProductIds = products
            .filter(product => product.type === 'product')
            .map(product => product._id)
            .concat(
                products
                    .filter(product => product.type === 'variations')
                    .flatMap(product => product.productData.map(item => item._id))
            );

        const allVariationIds = products
            .filter(product => product.type === 'variations')
            .map(product => product._id);

        set({
            selection: {
                productIds: allProductIds,
                variationIds: allVariationIds,
                totalProductCount: allProductIds.length,
                totalVariationCount: allVariationIds.length
            }
        });
    },

    deleteProductByAdmin: async (id) => {
        try {
            set(_ => ({ actionLoading: true }));
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            await ApiService.put(`${apiEndpoints.deleteByAdmin}/${id}`, {}, auth_key);
            await get().fetchProducts();
        } catch (e) {
            console.error('Error in deleteByAdmin:', e);
        } finally {
            set(_ => ({ actionLoading: false }))
        }
    },

    deselectAll: () => set({
        selection: {
            productIds: [],
            variationIds: [],
            totalProductCount: 0,
            totalVariationCount: 0
        }
    })
}));
