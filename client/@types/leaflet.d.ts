import "react-leaflet";

declare module "react-leaflet" {
  export interface MapContainerProps {
    center: Array<number>;
    zoom: number;
    minZoom: number;
    maxZoom: number;
  }
  export interface TileLayerProps {
    opacity?: number;
  }

  export interface PolylineProps {
    color: string;
    weight: number;
  }

  export interface CircleProps {
    radius: number;
  }
}
