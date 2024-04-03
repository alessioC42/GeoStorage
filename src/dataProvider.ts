import type {dbID, historyItem, remoteFile, storyPoint, user} from "@/types";
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
                    window.location.reload();
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

    async logout() : Promise<void> {
        await this.fetch(`${this.baseURL}/api/logout`, {method: 'POST'});
        localStorage.removeItem('jwt');
        window.location.reload();
    }

    async getUserInformation() : Promise<user | null> {
        try {
        const response = await this.fetch(`${this.baseURL}/api/user`);
        if (response.status == 200) {
            const result: user = (await response.json())["user"];
            this.userData.fullname.value = result.fullname;
            this.userData.email.value = result.email;
            this.userData.user_id.value = result._id;
            this.companyID = result.company_id;
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
        this.stories.value = [];
        this.stories.value = result;
        return result;
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
                //no await since it is loaded by reference
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

    async deleteStoryPoint(id: dbID): Promise<void> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${id}`, {
                method: 'DELETE'
            });
            if (response.status == 200) {
                //no await since it is loaded by reference
                this.getAllStories();
            }
        } catch (e) {
            console.error(e);
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

    async searchStoryPointsByDistanceRemote(coords: LatLngTuple): Promise<storyPoint[]> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/nearby?lat=${coords[0]}&lng=${coords[1]}`);
            if (response.status == 200) {
                return (await response.json())["storypoints"] as storyPoint[];
            } else {
                return [];
            }
        } catch (e) {
            console.error(e);
            return [];
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

    async getAllFiles(storyPoint: string): Promise<remoteFile[]> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyPoint}/files`);
            if (response.status == 200) {
                return (await response.json())["files"] as remoteFile[];
            } else {
                return [];
            }
        } catch (e) {
            return [];
        }
    }

    getFileBlob(): Promise<[Blob, string] | null> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';

            input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files ? target.files[0] : null;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const target = event.target as FileReader;
                        const result = target.result;
                        if (result) {
                            resolve([new Blob([new Uint8Array(result as ArrayBuffer)]), file.name]);
                        } else {
                            resolve(null);
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    resolve(null);
                }
            };

            input.click();
        });
    }

    async uploadFile(file: Blob, filename: string,storyPointID:string): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);

        const response = this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyPointID}/files?filename=${encodeURIComponent(filename)}`, {
            method: 'POST',
            body: formData,
        });
    }

    async downloadFile(url: string, filename: string): Promise<void> {
        try {
            const response = await this.fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
        }
    }

    async downloadStoryArchive(storyID: string): Promise<void> {
        try {
            await this.downloadFile(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyID}/files/archive`, "archive.zip")
        } catch (e) {
            console.error(e);
        }
    }

    async downloadStoryFile(storyID: string, fileID: string, filename: string) {
        try {
            await this.downloadFile(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyID}/files/${fileID}`, filename)
        } catch (e) {
            console.error(e)
        }
    }

    async deleteStoryFile(storyID: string, fileID: string) {
        try {
            await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyID}/files/${fileID}`, {
                method: "DELETE"
            })
        } catch (e) {
            console.error(e)
        }
    }

    async renameStoryFile(storyID: string, fileID: string, newName: string): Promise<void> {
        try {
            await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyID}/files/${fileID}/rename`, {
                method: "PUT",
                body: JSON.stringify({file: {filename: newName}}),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (e) {
            console.error(e)
        }
    }

    async getThumnnailBase64Image(storyID:string, fileID:string): Promise<string> {
        try {
            const response = await this.fetch(`${this.baseURL}/api/company/${this.companyID}/storypoints/${storyID}/files/${fileID}/thumbnail`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error(e);
            return window.location.origin+'/file.png';
        }
    }
}