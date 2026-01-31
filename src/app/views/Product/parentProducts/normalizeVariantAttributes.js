/**
 * Helper functions for normalizing and deduplicating variant attributes
 */

/**
 * Normalizes variant list by deduplicating attributes based on attribute_value
 * Keeps the first occurrence and discards duplicates
 */
export const normalizeVariantList = (variantList) => {
    if (!variantList || !Array.isArray(variantList)) return [];

    return variantList.map(variant => {
        if (!variant.variant_attribute || !Array.isArray(variant.variant_attribute)) {
            return variant;
        }

        // Create a map to track unique attribute values
        const seen = new Map();
        const uniqueAttributes = [];

        // Sort attributes first by sort_order, then by _id
        const sortedAttributes = [...variant.variant_attribute].sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
                return a.sort_order - b.sort_order;
            }
            return a._id.localeCompare(b._id);
        });

        // Deduplicate by attribute_value, keeping the first occurrence
        sortedAttributes.forEach(attr => {
            const key = attr.attribute_value.trim().toLowerCase();
            if (!seen.has(key)) {
                seen.set(key, true);
                uniqueAttributes.push(attr);
            }
        });

        return {
            ...variant,
            variant_attribute: uniqueAttributes
        };
    });
};

/**
 * Gets attribute object by ID from a normalized variant
 */
export const getAttributeById = (variant, attributeId) => {
    if (!variant || !variant.variant_attribute || !attributeId) return null;
    return variant.variant_attribute.find(attr => attr._id === attributeId) || null;
};

/**
 * Gets attribute objects by IDs from a normalized variant
 */
export const getAttributesByIds = (variant, attributeIds) => {
    if (!variant || !variant.variant_attribute || !Array.isArray(attributeIds)) return [];

    const attributeMap = new Map(variant.variant_attribute.map(attr => [attr._id, attr]));
    return attributeIds.map(id => attributeMap.get(id)).filter(Boolean);
};

/**
 * Generates a unique key for a combination
 */
export const generateCombinationKey = (combination) => {
    if (!combination) return '';

    return Object.keys(combination)
        .sort()
        .map(key => combination[key]._id || combination[key])
        .join('_');
};

/**
 * Converts Innervariations object from ID-based to full objects
 */
export const expandInnervariations = (innervariations, variants) => {
    if (!innervariations || !variants) return {};

    const result = {};
    const variantMap = new Map(variants.map(v => [v.variant_name, v]));

    Object.entries(innervariations).forEach(([variantName, attributeIds]) => {
        const variant = variantMap.get(variantName);
        if (variant && Array.isArray(attributeIds)) {
            result[variantName] = getAttributesByIds(variant, attributeIds);
        }
    });

    return result;
};

/**
 * Converts full objects back to ID-based Innervariations
 */
export const compressInnervariations = (expandedInnervariations) => {
    if (!expandedInnervariations) return {};

    const result = {};
    Object.entries(expandedInnervariations).forEach(([variantName, attributes]) => {
        if (Array.isArray(attributes)) {
            result[variantName] = attributes.map(attr => attr._id);
        }
    });

    return result;
};
