import type {dbID, historyItem, storyPoint, user} from "@/types";
import {type Ref, ref} from "vue";
import type {LatLngTuple} from "leaflet";

export class DataProvider {
    private static instance: DataProvider;
    baseURL: string;
    userData = {
        fullname: ref<string>(""),
        email: ref<string>(""),
        user_id: ref<string>(""),
    };
    companyID: string = "";
    loggedIn: Ref<boolean> = ref(false);
    stories: Ref<storyPoint[]> = ref([]);

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
            await this.getAllStories();
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
            const result: user = (await response.json())["user"];
            this.userData.fullname.value = result.fullname;
            this.userData.email.value = result.email;
            this.userData.user_id.value = result.id;
            this.companyID = result.company_id;
            console.log(result.company_id);
            return result;
        } else {
            return null;
        }
        } catch (e) {
            this.userData.fullname.value = "";
            this.userData.email.value = "";
            this.userData.user_id.value = "";
            return null;
        }
    }

    async getAllStories() : Promise<storyPoint[]> {
        let response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints`);
        let result: storyPoint[] = (await response.json())["storypoints"];
        this.stories.value = result;
        console.log(result);
        return result;
    }

    async createStoryPoint(coords: LatLngTuple, title: string, description: string): Promise<string | null> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints`, {
                body: JSON.stringify({"storypoint": {title, description, coords} }),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status == 201) {
                //now await
                this.getAllStories();
                //(await response.json())["storypoint_id"]
                return null;
            } else {
                return response.text();
            }
        } catch (e) {
            console.error(e);
            return "an unexpected error occurred while creating the story point!";
        }
    }

    async searchStoryPointsRemote(query: string): Promise<storyPoint[]> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/search?q=${query}`);
            if (response.status == 200) {
                return (await response.json())["storypoints"];
            } else {
                return [];
            }
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getEntireStoryPoint(id: string): Promise<storyPoint | null> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${id}`);
            if (response.status == 200) {
                return (await response.json())["storypoint"] as storyPoint;
            } else {
                return null;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateStoryPoint(id: dbID, {title, description, history}: {title: string, description: string, history: historyItem[]}): Promise<void> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${id}`, {
                method: 'PUT',
                body: JSON.stringify({storypoint: {title, description, history}}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
}