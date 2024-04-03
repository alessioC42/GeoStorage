import type {LatLngTuple} from 'leaflet';

export type dbID = string;
export type unixTimestamp = number;

export type storyPoint = {
    coords: LatLngTuple,
    title: string,
    description: string,
    history: historyItem[],
    files: [],
    company_id: dbID,
    created_by: dbID,
    id: dbID,
}

export type historyItem = {
    created_at: unixTimestamp,
    user_id: dbID,
    user_fullname: string,
    text: string,
    edited: boolean,
}

export type user = {
    id: dbID,
    fullname: string,
    email: string,
    company_id: dbID,
}

export type company = {
    created_at: unixTimestamp,
    name: string,
    description: string,
    user_ids: dbID[],
    storypoint_ids: dbID[],
}

export interface OsmSearchResult {
    place_id: number;
    display_name: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    town?: string;
    category: string;
    type: string;
    place_rank: number;
    importance: number;
    address?: {
        house_number?: string;
        historic?: string;
        road?: string;
        hamlet?: string;
        suburb?: string;
        town?: string;
        city?: string;
        state?: string;
        "ISO3166-2-lvl4"?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
    }
}