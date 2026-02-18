/* eslint-disable import/no-anonymous-default-export */
import { ApiService } from "./ApiService";
import { localStorageKey } from "app/constant/localStorageKey";

class UrlService {
    constructor() {
        this.auth_key = localStorage.getItem(localStorageKey.auth_key);
    }

    // GET /url-list - List with pagination
    getList(params) {
        const query = new URLSearchParams(params).toString();
        return ApiService.get(`url-list?${query}`, this.auth_key);
    }

    // POST /createUrl - Create with _id: "new", Update with _id: queryId
    saveUrl(formData) {
        return ApiService.postImage("createUrl", formData, this.auth_key);
    }

    // PUT update existing url
    editUrl(payload, id) {
        return ApiService.put(`url-resource/${id}`, payload, this.auth_key);
    }

    // GET /url-page/:slug - Get single URL details for edit
    getDetail(id) {
        return ApiService.get(`url-page-by-id/${id}`, this.auth_key);
    }

    //DELETE
    deleteUrl(id) {
        return ApiService.delete(`delete-url/${id}`, this.auth_key);
    }
}

export default new UrlService();
