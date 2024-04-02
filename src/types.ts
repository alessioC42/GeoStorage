import type {LatLngTuple} from 'leaflet';

export enum StoryPointType {
    "markDown",
    "comment",
    "image",
    "fileURL",
    "url"
}

export type StoryPoint = {
    "latLngTuple": LatLngTuple,
    "title": string,
    "description": string, // markdown
    "story": {
        "history": {
            "type": StoryPointType,
            "title": string,
            "date": Date,
            "description": string,
        }[],
        "documents": {
            "url": string,
            "filename": string,
            "date": Date,
        }[]
    }
}

export interface OsmSearchResult {
    place_id: number;
    display_name: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
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
        city?: string;
        state?: string;
        "ISO3166-2-lvl4"?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
    }
}