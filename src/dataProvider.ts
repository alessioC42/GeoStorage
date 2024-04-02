import type {user} from "@/types";
import {type Ref, ref} from "vue";

export class DataProvider {
    private static instance: DataProvider;
    baseURL: string;
    userData = {
        fullname: ref<string>(""),
        email: ref<string>(""),
    }
    loggedIn: Ref<boolean> = ref(false);

    private constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    static getInstance(): DataProvider {
        if (!DataProvider.instance) {
            DataProvider.instance = new DataProvider('http://localhost:3000');
        }
        return DataProvider.instance;
    }

    fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const jwt = localStorage.getItem('jwt') ?? "";
        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${jwt}`
        };

        return fetch(url, options);
    }
    async isAuthenticated() : Promise<boolean> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/user`);
            this.loggedIn.value = response.status === 200;
            return this.loggedIn.value;
        } catch (e) {
            console.error(e);
            this.loggedIn.value = false;
            return false;
        }
    }

    async firstAuthCheck() : Promise<void> {
        if (await this.isAuthenticated()) {
            await this.getUserInformation();
        }
    }

    async authenticate(email: string, password: string) : Promise<[string, boolean]> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/login`, {
                body: JSON.stringify({"user": {"email": email, "password": password}}),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const statusText = await response.text();
            if (response.ok) {
                let success = response.status === 200;
                if (success) {
                    let json = JSON.parse(statusText);
                    localStorage.setItem('jwt', json.token);
                    this.loggedIn.value = success;
                    return ["Auth successful!", success];
                }
                return [statusText, success];
            } else {
                return [statusText, false];
            }
        } catch (e) {
            console.error(e);
            return ["An unexpected error occurred while authenticating the user!", false];
        }
    }

    async getUserInformation() : Promise<user | null> {
        try {
        const response = await this.fetch(`${this.baseURL}/api/user`);
        if (response.status == 200) {
            const result: user = await response.json();
            this.userData.fullname.value = result.fullname;
            this.userData.email.value = result.email;

            return result;
        } else {
            return null;
        }
        } catch (e) {
            this.userData.fullname.value = "";
            this.userData.email.value = "";
            return null;
        }
    }
}