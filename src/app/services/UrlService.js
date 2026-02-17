/* eslint-disable import/no-anonymous-default-export */
import { ApiService } from "./ApiService";
import { localStorageKey } from "app/constant/localStorageKey";

class UrlService {
    constructor() {
        this.auth_key = localStorage.getItem(localStorageKey.auth_key);
    }

    // GET /url-list - List with pagination
    getList(params) {
        return ApiService.get("url-list", this.auth_key, { params });
    }

    // POST /createUrl - Create with _id: "new", Update with _id: queryId
    saveUrl(formData) {
        return ApiService.postImage("createUrl", formData, this.auth_key);
    }

    // GET /url-page/:slug - Get single URL details for edit
    getDetail(slug) {
        return ApiService.get(`url-page/${slug}`, this.auth_key);
    }
}

export default new UrlService();
