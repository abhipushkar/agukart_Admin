import {create} from 'zustand';
import {ApiService} from 'app/services/ApiService';
import {apiEndpoints} from 'app/constant/apiEndpoints';
import {localStorageKey} from 'app/constant/localStorageKey';

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
        status: 'all',
        category: '',
        hiddenColumns: JSON.parse(localStorage.getItem(localStorageKey.productTable)) || []
    },
    selection: {
        productIds: [],
        variationIds: [],
        totalProductCount: 0,
        totalVariationCount: 0
    },
    expandedRows: new Set(),

    // Actions
    setLoading: (loading) => set({loading}),
    setActionLoading: (actionLoading) => set({actionLoading}),

    setFilters: (filters) => {
        set(state => ({
            filters: {...state.filters, ...filters}
        }));

        if (filters.hiddenColumns !== undefined) {
            localStorage.setItem(localStorageKey.productTable, JSON.stringify(filters.hiddenColumns));
        }
    },

    setPagination: (pagination) => set(state => ({
        pagination: {...state.pagination, ...pagination}
    })),

    setSelection: (selection) => set(state => ({
        selection: {...state.selection, ...selection}
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
            return {expandedRows: newExpandedRows};
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
        const {filters, pagination} = get();

        try {
            const url = `${apiEndpoints.getProduct}?type=${filters.status}&category=${filters.category}`;
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                set({
                    products: res.data.data,
                    filteredProducts: res.data.data,
                    pagination: {...pagination, totalCount: res.data.data.length}
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Search products
    searchProducts: () => {
        const {products, filters} = get();

        if (!filters.search.trim()) {
            set({filteredProducts: products});
            return;
        }

        const searchTerm = filters.search.trim().toLowerCase();
        const filtered = products.filter((product) => {
            const matchesMainProduct =
                product?.product_title?.toLowerCase().includes(searchTerm) ||
                product?.sku_code?.toLowerCase().includes(searchTerm) ||
                product?.seller_sku?.toLowerCase().includes(searchTerm) ||
                product?._id?.toLowerCase().includes(searchTerm);

            const matchesVariants = product.productData?.some(variant =>
                variant.sku_code?.toLowerCase().includes(searchTerm)
            );

            return matchesMainProduct || matchesVariants;
        });

        set({
            filteredProducts: filtered.length > 0 ? filtered : ['No Product Found'],
            pagination: {...get().pagination, page: 0}
        });
    },

    // Toggle featured status
    toggleFeatured: async (productId, currentStatus) => {
        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = {_id: productId, featured: !currentStatus};

            const res = await ApiService.post(apiEndpoints.changeFeatureStatus, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return {success: true, message: res.data?.message};
            }
        } catch (error) {
            console.error('Error toggling featured status:', error);
            throw error;
        } finally {
            set({actionLoading: false});
        }
    },

    // Update product field
    updateProductField: async (productId, fieldName, value) => {
        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = {[fieldName]: value, _id: productId};

            const res = await ApiService.post(apiEndpoints.updateProductByField, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return {success: true};
            }
        } catch (error) {
            console.error('Error updating product field:', error);
            throw error;
        } finally {
            set({actionLoading: false});
        }
    },

    // Update sort order
    updateSortOrder: async (productId, sortOrder) => {
        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = {sort_order: sortOrder, _id: productId};

            const res = await ApiService.post(apiEndpoints.updateSortOrderProduct, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return {success: true};
            }
        } catch (error) {
            console.error('Error updating sort order:', error);
            throw error;
        } finally {
            set({actionLoading: false});
        }
    },

    // Update badge
    updateBadge: async (productId, badge) => {
        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const payload = {product_id: productId, badge};

            const res = await ApiService.post(apiEndpoints.changeProductBadge, payload, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return {success: true};
            }
        } catch (error) {
            console.error('Error updating badge:', error);
            throw error;
        } finally {
            set({actionLoading: false});
        }
    },

    // Delete product
    deleteProduct: async (productId) => {
        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.get(`${apiEndpoints.deleteProduct}/${productId}`, auth_key);

            if (res.status === 200) {
                await get().fetchProducts();
                return {success: true, message: res.data?.message};
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        } finally {
            set({actionLoading: false});
        }
    },

    // Bulk actions
    bulkUpdateStatus: async (status, deleteStatus = false) => {
        const {selection} = get();

        if (selection.productIds.length === 0) return;

        set({actionLoading: true});

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            let payload = {_id: selection.productIds};

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
                return {success: true, message: res.data?.message};
            }
        } catch (error) {
            console.error('Error in bulk update:', error);
            throw error;
        } finally {
            set({actionLoading: false});
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

    deselectAll: () => set({
        selection: {
            productIds: [],
            variationIds: [],
            totalProductCount: 0,
            totalVariationCount: 0
        }
    })
}));