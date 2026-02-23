/* eslint-disable import/no-anonymous-default-export */
import { ApiService } from "./ApiService";
import { localStorageKey } from "app/constant/localStorageKey";

class ShippingService {
    constructor() {
        this.auth_key = localStorage.getItem(localStorageKey.auth_key);
    }

    // GET all delivery services
    getList() {
        return ApiService.get("get-delivery-service", this.auth_key);
    }

    // GET active delivery services
    getActiveList() {
        return ApiService.get("active-delivery-services", this.auth_key);
    }

    // GET single delivery service (edit mode)
    getDetail(id) {
        return ApiService.get(`delivery-service/${id}`, this.auth_key);
    }

    // CREATE delivery service (multipart)
    create(formData) {
        return ApiService.postImage(
            "add-delivery-service",
            formData,
            this.auth_key
        );
    }


    // DELETE (soft delete)
    delete(id) {
        return ApiService.delete(
            `delete-delivery-service/${id}`,
            this.auth_key
        );
    }

    // TOGGLE active status
    toggleStatus(id) {
        return ApiService.patch(
            `toggle-delivery-service/${id}`,
            {},
            this.auth_key
        );
    }
}

export default new ShippingService();